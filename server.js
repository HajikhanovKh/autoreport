import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

// 🔥 Sürətli JSON ötürülməsi üçün yaddaş limitini artırırıq
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));

const dbConfig = process.env.MYSQL_URL || {
    host: 'ballast.proxy.rlwy.net',
    port: 55966,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway'
};

// 🔥 OPTİMALLAŞDIRILMIŞ YÜNGÜL WORD SƏNƏD GENERASİYA ENDPOINT-İ
app.post('/api/companies/analyze-and-zip', async (req, res) => {
    try {
        const { filteredRows, targetPeriodText } = req.body;

        if (!filteredRows || filteredRows.length === 0) {
            return res.status(400).json({ error: 'Süzgəclənmiş sətir məlumatı serverə çatmadı!' });
        }

        // Şablon birbaşa GitHub-dan server operativ yaddaşına çəkilir
        const template_url = "https://raw.githubusercontent.com/HajikhanovKh/autoreport/refs/heads/main/Sablon.docx";
        const templateResponse = await axios.get(template_url, { responseType: 'arraybuffer' });
        const templateBuffer = templateResponse.data;

        const zipOutput = new JSZip();
        let summary = {};
        let generatedCount = 0;

        // Server yalnız localda süzülmüş hazır sətirlər üzərində dövr edir (Sürət maksimumdur)
        for (let i = 0; m < filteredRows.length; m++) {
            const item = filteredRows[m];
            
            const rayon = item.rayon;
            const gbNo = item.gbNo;
            const firmaAdi = item.firmaAdi;
            const invoysVal = item.invoysVal;
            const valyuta = item.valyuta;
            const borcVal = item.borcVal;
            const idx = item.idx;

            if (!summary[rayon]) summary[rayon] = { count: 0, currencies: {} };
            summary[rayon].count += 1;

            if (!summary[rayon].currencies[valyuta]) {
                summary[rayon].currencies[valyuta] = { invoys: 0, borc: 0 };
            }
            summary[rayon].currencies[valyuta].invoys += invoysVal;
            summary[rayon].currencies[valyuta].borc += borcVal;

            try {
                generatedCount++;
                const docZip = new PizZip(templateBuffer);
                const doc = new Docxtemplater(docZip, { paragraphLoop: true, linebreaks: true });

                doc.setData({
                    period: targetPeriodText,
                    rayon: rayon,
                    gb: gbNo,
                    firma: firmaAdi,
                    invoys: invoysVal.toFixed(2),
                    valyuta: valyuta,
                    borc: borcVal.toFixed(2)
                });

                doc.render();
                const out = doc.getZip().generate({ type: "nodebuffer" });

                const cleanFirma = firmaAdi.replace(/[/\\?%*:|"<>\s]+/g, '_');
                const cleanGB = gbNo.replace(/[/\\?%*:|"<>\s]+/g, '_');
                
                const fileName = `${cleanFirma}_${cleanGB}_idx_${idx}.docx`;
                zipOutput.file(fileName, out);
            } catch (cellErr) {
                continue;
            }
        }

        let bodyText = "";
        for (const r in summary) {
            let currencyDetails = [];
            for (const curr in summary[r].currencies) {
                const inv = summary[r].currencies[curr].invoys.toFixed(2);
                const brc = summary[r].currencies[curr].borc.toFixed(2);
                currencyDetails.push(`İnvoys üzrə ${inv} ${curr} məbləğdən ${brc} ${curr} borc var`);
            }
            bodyText += `"${r}" (A sütunu) üzrə ${summary[r].count} sətir tapıldı. ${currencyDetails.join(", ")}.\n`;
        }

        zipOutput.file("______ANALIZ_NETICESI______.txt", bodyText);

        const zipBuffer = await zipOutput.generateAsync({ type: "nodebuffer", compression: "STORE" });

        res.setHeader('Access-Control-Expose-Headers', 'X-Generated-Count');
        res.setHeader('X-Generated-Count', generatedCount);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=Ferdi_Hesabatlar.zip');
        
        return res.send(zipBuffer);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server emal xətası: ' + err.message });
    }
});

// GET, POST, DELETE Baza funksiyaları tam qorunur
app.get('/api/companies', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM voen_info');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); } finally { if (connection) await connection.end(); }
});

app.post('/api/companies', async (req, res) => {
    const { voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [existing] = await connection.execute('SELECT id FROM voen_info WHERE voen = ?', [voen]);
        if (existing.length > 0) {
            await connection.execute('UPDATE voen_info SET comp_name=?, comp_director_name=?, comp_adress=?, pstatus=?, data_info_date=? WHERE voen=?', [comp_name, comp_director_name, comp_adress, pstatus, data_info_date, voen]);
            return res.json({ success: true, updated: true });
        } else {
            await connection.execute('INSERT INTO voen_info (voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date) VALUES (?, ?, ?, ?, ?, ?)', [voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date]);
            return res.json({ success: true, updated: false });
        }
    } catch (err) { res.status(500).json({ error: err.message }); } finally { if (connection) await connection.end(); }
});

app.delete('/api/companies/:id', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM voen_info WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); } finally { if (connection) await connection.end(); }
});

app.listen(port, () => {
    console.log(`Server running smoothly on port ${port}...`);
});
