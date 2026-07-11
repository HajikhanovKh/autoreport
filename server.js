import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json());

const dbConfig = process.env.MYSQL_URL || {
    host: 'ballast.proxy.rlwy.net',
    port: 55966,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway'
};

function parseExcelDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.toString().trim().split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(month) || isNaN(year)) return null;

    let rub = "i rüb";
    if (month >= 4 && month <= 6) rub = "ii rüb";
    else if (month >= 7 && month <= 9) rub = "iii rüb";
    else if (month >= 10 && month <= 12) rub = "iv rüb";

    const monthsAz = [
        "yanvar", "fevral", "mart", "aprel", "may", "iyun", 
        "iyul", "avqust", "sentyabr", "oktabr", "noyabr", "dekabr"
    ];
    return { day, month: monthsAz[month - 1] || "", year: year.toString().trim(), rub };
}

// 🔥 UNİKAL ADLANDIRMA MEXANİZMLİ GÜCLÜ SERVER ENDPOINT-İ
app.post('/api/companies/analyze-and-zip', upload.single('excelFile'), async (req, res) => {
    try {
        let { filterType, targetPeriod, targetYear } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Excel faylı qəbul edilmədi!' });
        }

        filterType = filterType ? filterType.trim().toLowerCase() : "";
        targetPeriod = targetPeriod ? targetPeriod.trim().toLowerCase() : "";
        targetYear = targetYear ? targetYear.trim() : "";

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        const template_url = "https://raw.githubusercontent.com/HajikhanovKh/autoreport/refs/heads/main/Sablon.docx";
        const templateResponse = await axios.get(template_url, { responseType: 'arraybuffer' });
        const templateBuffer = templateResponse.data;

        const zipOutput = new JSZip();
        let summary = {};
        let generatedCount = 0;
        let targetPeriodText = `${req.body.targetPeriod} ${targetYear}`;

        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            if (!row || row.length < 7) continue;

            const rayon = row[0] ? row[0].toString().trim() : "";       
            const gbNo = row[1] ? row[1].toString().trim() : "";         
            const tarixStr = row[2] ? row[2].toString().trim() : "";     
            const firmaAdi = row[3] ? row[3].toString().trim() : "";     
            const invoysVal = parseFloat(row[4]);                             
            const valyuta = row[5] ? row[5].toString().trim().toUpperCase() : "AZN"; 
            const borcVal = parseFloat(row[6]);                               

            if (!rayon || !tarixStr) continue;

            const dateInfo = parseExcelDate(tarixStr);
            if (!dateInfo) continue;

            let isMatch = false;
            if (filterType === "rub" && dateInfo.rub === targetPeriod && dateInfo.year === targetYear) isMatch = true;
            if (filterType === "ay" && dateInfo.month === targetPeriod && dateInfo.year === targetYear) isMatch = true;
            if (filterType === "tarix" && tarixStr.toLowerCase() === targetPeriod && dateInfo.year === targetYear) isMatch = true;

            if (isMatch) {
                if (!summary[rayon]) {
                    summary[rayon] = { count: 0, currencies: {} };
                }
                summary[rayon].count += 1;

                if (!summary[rayon].currencies[valyuta]) {
                    summary[rayon].currencies[valyuta] = { invoys: 0, borc: 0 };
                }
                summary[rayon].currencies[valyuta].invoys += isNaN(invoysVal) ? 0 : invoysVal;
                summary[rayon].currencies[valyuta].borc += isNaN(borcVal) ? 0 : borcVal;

                generatedCount++;
                const docZip = new PizZip(templateBuffer);
                const doc = new Docxtemplater(docZip, { paragraphLoop: true, linebreaks: true });

                const invText = isNaN(invoysVal) ? "0.00" : invoysVal.toFixed(2);
                const brcText = isNaN(borcVal) ? "0.00" : borcVal.toFixed(2);
                
                doc.setData({
                    period: targetPeriodText,
                    rayon: rayon,
                    gb: gbNo,
                    firma: firmaAdi,
                    invoys: invText,
                    valyuta: valyuta,
                    borc: brcText
                });

                doc.render();
                const out = doc.getZip().generate({ type: "nodebuffer" });

                const cleanFirma = (firmaAdi || "Anonim_Firma").toString().trim().replace(/[/\\?%*:|"<>\s]+/g, '_');
                const cleanGB = (gbNo || "Sənədsiz").toString().trim().replace(/[/\\?%*:|"<>\s]+/g, '_');
                
                // 🔥 SƏNƏDLƏRİN ÜZƏRİNƏ YAZILMAMASI ÜÇÜN i (SIRA NÖMRƏSİ) ƏLAVƏ EDİLDİ (12800 FAYLIN HAMISI GƏLƏCƏK)
                const fileName = `${cleanFirma}_${cleanGB}_sira_${i}.docx`;

                zipOutput.file(fileName, out);
            }
        }

        if (generatedCount === 0) {
            return res.status(400).json({ error: 'Seçilmiş tarix dövrünə uyğun sətir tapılmadı!' });
        }

        let bodyText = "";
        for (const rayon in summary) {
            let currencyDetails = [];
            for (const curr in summary[rayon].currencies) {
                const inv = summary[rayon].currencies[curr].invoys.toFixed(2);
                const brc = summary[rayon].currencies[curr].borc.toFixed(2);
                currencyDetails.push(`İnvoys üzrə ${inv} ${curr} məbləğdən ${brc} ${curr} borc var`);
            }
            bodyText += `"${rayon}" (A sütunu) üzrə ${summary[rayon].count} sətir tapıldı. ${currencyDetails.join(", ")}.\n`;
        }

        const zipBuffer = await zipOutput.generateAsync({ type: "nodebuffer" });

        res.setHeader('Access-Control-Expose-Headers', 'X-Analysis-Result, X-Generated-Count');
        res.setHeader('X-Analysis-Result', Buffer.from(bodyText).toString('base64')); 
        res.setHeader('X-Generated-Count', generatedCount);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=Ferdi_Hesabatlar.zip');
        
        return res.send(zipBuffer);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server daxili xətası: ' + err.message });
    }
});

// 1. GET - Şirkətləri siyahılamaq
app.get('/api/companies', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM voen_info');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.end();
    }
});

// 2. POST - Yeni şirket elave etmek VƏ YA Mövcud VÖEN-i yeniləmək
app.post('/api/companies', async (req, res) => {
    const { voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [existing] = await connection.execute('SELECT id FROM voen_info WHERE voen = ?', [voen]);
        
        if (existing.length > 0) {
            const updateQuery = `
                UPDATE voen_info 
                SET comp_name = ?, comp_director_name = ?, comp_adress = ?, pstatus = ?, data_info_date = ? 
                WHERE voen = ?
            `;
            await connection.execute(updateQuery, [comp_name, comp_director_name, comp_adress, pstatus, data_info_date, voen]);
            return res.json({ success: true, updated: true, message: 'Məlumatlar mövcud VÖEN üzərinə yazıldı!' });
        } else {
            const insertQuery = `
                INSERT INTO voen_info (voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(insertQuery, [voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date]);
            return res.json({ success: true, updated: false, message: 'Yeni məlumat uğurla yazıldı!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Baza əməliyyat xətası: ' + err.message });
    } finally {
        if (connection) await connection.end();
    }
});

// 3. DELETE - Şirkəti silmək
app.delete('/api/companies/:id', async (req, res) => {
    const companyId = req.params.id;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute('DELETE FROM voen_info WHERE id = ?', [companyId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Məlumat tapılmadı!' });
        }
        res.json({ success: true, message: 'Məlumat silindi!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.listen(port, () => {
    console.log(`Server ${port} portunda tam aktivdir...`);
});
