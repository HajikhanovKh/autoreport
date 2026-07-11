import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import PizZip from 'pizzip';
import Docxtemplating from 'docxtemplating';
import JSZip from 'jszip';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

// Multer sazlaması: Faylları server diskində yox, operativ yaddasda (Buffer) müvəqqəti saxlayırıq
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

// Excel-dəki "12.04.2026" tipli tarixləri rüb və aylara parçalayan köməkçi funksiya
function parseExcelDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.toString().trim().split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(month) || isNaN(year)) return null;

    let rub = "";
    if (month >= 1 && month <= 3) rub = "I rüb";
    else if (month >= 4 && month <= 6) rub = "II rüb";
    else if (month >= 7 && month <= 9) rub = "III rüb";
    else if (month >= 10 && month <= 12) rub = "IV rüb";

    const monthsAz = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", 
        "İyul", "Avqust", "Sentyabr", "Oktabr", "Noyabr", "Dekabr"
    ];
    const monthName = monthsAz[month - 1] || "";

    return { day, month: monthName, year: year.toString(), rub };
}

// =========================================================================
// 🔥 YENİ: SERVER SƏVİYYƏSİNDƏ EXCEL ANALİZ VƏ WORD ZIP ENDİRMƏ ENDPOINT-İ
// =========================================================================
app.post('/api/companies/analyze-and-zip', upload.single('excelFile'), async (req, res) => {
    try {
        const { filterType, targetPeriod, targetYear } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Excel faylı server tərəfindən qəbul edilmədi!' });
        }

        // 1. Gələn Excel faylının buffer datasını oxuyuruq
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 2. GitHub-dakı rəsmi Sablon.docx faylını asinxron olaraq serverə çəkirik
        const template_url = "https://raw.githubusercontent.com/HajikhanovKh/autoreport/refs/heads/main/Sablon.docx";
        const templateResponse = await axios.get(template_url, { responseType: 'arraybuffer' });
        const templateBuffer = templateResponse.data;

        const zipOutput = new JSZip();
        let summary = {};
        let generatedCount = 0;
        let targetPeriodText = `${targetPeriod} ${targetYear}`;

        // 3. Excel sətirlərini dövrə salıb süzgəcləyirik
        for (let i = 0; i < excelData.length; i++) {
            const row = excelData[i];
            if (!row || row.length < 7) continue;

            const rayon = row[0];       
            const gbNo = row[1];
            const tarixStr = row[2];    
            const firmaAdi = row[3];
            const invoysVal = parseFloat(row[4]);
            const valyuta = row[5] ? row[5].toString().trim().toUpperCase() : "AZN";
            const borcVal = parseFloat(row[6]);

            if (!rayon || !tarixStr) continue;

            const dateInfo = parseExcelDate(tarixStr);
            if (!dateInfo) continue;

            let isMatch = false;
            if (filterType === "rub" && dateInfo.rub === targetPeriod && dateInfo.year === targetYear) isMatch = true;
            if (filterType === "ay" && dateInfo.month === targetPeriod && dateInfo.year === targetYear) isMatch = true;
            if (filterType === "tarix" && tarixStr === targetPeriod && dateInfo.year === targetYear) isMatch = true;

            if (isMatch) {
                // Ekranda göstəriləcək cəmləmə (Summary) statistikası
                if (!summary[rayon]) {
                    summary[rayon] = { count: 0, currencies: {} };
                }
                summary[rayon].count += 1;

                if (!summary[rayon].currencies[valyuta]) {
                    summary[rayon].currencies[valyuta] = { invoys: 0, borc: 0 };
                }
                summary[rayon].currencies[valyuta].invoys += isNaN(invoysVal) ? 0 : invoysVal;
                summary[rayon].currencies[valyuta].borc += isNaN(borcVal) ? 0 : borcVal;

                // Fərdi Word Sənədinin yaradılması
                generatedCount++;
                const docZip = new PizZip(templateBuffer);
                const doc = new Docxtemplating(docZip, { paragraphLoop: true, linebreaks: true });

                const inv = isNaN(invoysVal) ? "0.00" : invoysVal.toFixed(2);
                const brc = isNaN(borcVal) ? "0.00" : borcVal.toFixed(2);
                
                const singleReportText = `"${rayon}" (A sütunu) üzrə məlumat tapıldı. İnvoys üzrə ${inv} ${valyuta} məbləğdən ${brc} ${valyuta} borc var.`;

                doc.setData({
                    period: targetPeriodText,
                    report: singleReportText
                });

                doc.render();
                const out = doc.getZip().generate({ type: "nodebuffer" });

                const cleanFirma = (firmaAdi || "Anonim_Firma").toString().trim().replace(/\s+/g, '');
                const cleanGB = (gbNo || "Sənədsiz").toString().trim();
                const fileName = `${cleanFirma}${cleanGB}.docx`;

                // Faylı ZIP arxivinin içinə əlavə edirik
                zipOutput.file(fileName, out);
            }
        }

        if (generatedCount === 0) {
            return res.status(400).json({ error: 'Seçilmiş tarix dövrünə uyğun sətir tapılmadı!' });
        }

        // 4. Analiz mətninin formatlanması
        let bodyText = "";
        for (const rayon in summary) {
            let currencyDetails = [];
            for (const curr in summary[rayon].currencies) {
                const inv = summary[rayon].currencies[curr].invoys.toFixed(2);
                const brc = summary[rayon].currencies[curr].borc.toFixed(2);
                currencyDetails.push(`İnvoys üzrə ${inv} ${curr} məbləğdən ${brc} ${curr} borc var`);
            }
            const currencyStr = currencyDetails.join(", ");
            bodyText += `"${rayon}" (A sütunu) üzrə ${summary[rayon].count} sətir tapıldı. ${currencyStr}.\n`;
        }

        // Bütün sənədləri yekun ZIP faylına arxivləyirik
        const zipBuffer = await zipOutput.generateAsync({ type: "nodebuffer" });

        // Təhlükəsizlik və Azərbaycan şriftlərinin ötürülməsi üçün Response Başlıqları (Headers)
        res.setHeader('Access-Control-Expose-Headers', 'X-Analysis-Result, X-Generated-Count');
        res.setHeader('X-Analysis-Result', Buffer.from(bodyText).toString('base64')); // Mətni Base64 edirik xəta verməsin
        res.setHeader('X-Generated-Count', generatedCount);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=Ferdi_Hesabatlar.zip');
        
        return res.send(zipBuffer);

    } catch (err) {
        console.error("Server daxili hesabat xətası:", err);
        return res.status(500).json({ error: 'Server daxili emal xətası: ' + err.message });
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

// 2. POST - Yeni şirkət əlavə etmək VƏ YA Mövcud VÖEN-i yeniləmək
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
