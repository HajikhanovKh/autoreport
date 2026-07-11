import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

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

// 🔥 SÜTÜN DƏYİŞƏNLƏRİNİ QÜSURSUZ DÖVR EDƏN YENİLƏNMİŞ ENDPOINT
app.post('/api/companies/analyze-and-zip', async (req, res) => {
    try {
        const { filteredRows, targetPeriodText } = req.body;

        if (!filteredRows || !Array.isArray(filteredRows)) {
            return res.status(400).json({ error: 'Məlumat serverə çatmadı!' });
        }

        const template_url = "https://raw.githubusercontent.com/HajikhanovKh/autoreport/refs/heads/main/Sablon.docx";
        const templateResponse = await axios.get(template_url, { responseType: 'arraybuffer' });
        const templateBuffer = templateResponse.data;

        const zipOutput = new JSZip();
        let summary = {};
        let generatedCount = 0;

        // 🔥 DÖVR DƏYİŞƏNİ 'm' OLARAQ DÜZƏLDİLDİ
        for (let m = 0; m < filteredRows.length; m++) {
            const item = filteredRows[m];
            
            const rayon = item.rayon;
            if (!summary[rayon]) summary[rayon] = { count: 0, currencies: {} };
            summary[rayon].count += 1;

            if (!summary[rayon].currencies[item.valyuta]) {
                summary[rayon].currencies[item.valyuta] = { invoys: 0, borc: 0 };
            }
            summary[rayon].currencies[item.valyuta].invoys += item.invoysVal;
            summary[rayon].currencies[item.valyuta].borc += item.borcVal;

            try {
                generatedCount++;
                const docZip = new PizZip(templateBuffer);
                const doc = new Docxtemplater(docZip, { paragraphLoop: true, linebreaks: true });

                doc.setData({
                    period: targetPeriodText,
                    rayon: item.rayon,
                    gb: item.gbNo,
                    firma: item.firmaAdi,
                    invoys: item.invoysVal.toFixed(2),
                    valyuta: item.valyuta,
                    borc: item.borcVal.toFixed(2)
                });

                doc.render();
                const out = doc.getZip().generate({ type: "nodebuffer" });
                
                const cleanFirma = item.firmaAdi.replace(/[/\\?%*:|"<>\s]+/g, '_');
                const cleanGB = item.gbNo.replace(/[/\\?%*:|"<>\s]+/g, '_');
                
                zipOutput.file(`${cleanFirma}_${cleanGB}_idx_${item.idx}.docx`, out);
            } catch (cellErr) {
                continue;
            }
        }

        let bodyText = "";
        for (const r in summary) {
            let cDetails = [];
            for (const curr in summary[r].currencies) {
                cDetails.push(`İnvoys: ${summary[r].currencies[curr].invoys.toFixed(2)} ${curr}, Borc: ${summary[r].currencies[curr].borc.toFixed(2)} ${curr}`);
            }
            bodyText += `"${r}" üzrə ${summary[r].count} sətir tapıldı. ${cDetails.join(", ")}.\n`;
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

// ... GET, POST, DELETE metodları olduğu kimi qalır
app.get('/api/companies', async (req, res) => {
    let connection;
    try { connection = await mysql.createConnection(dbConfig); const [rows] = await connection.execute('SELECT * FROM voen_info'); res.json(rows); } 
    catch (err) { res.status(500).json({ error: err.message }); } finally { if (connection) await connection.end(); }
});

app.post('/api/companies', async (req, res) => {
    const { voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date } = req.body;
    let connection;
    try { connection = await mysql.createConnection(dbConfig); const [existing] = await connection.execute('SELECT id FROM voen_info WHERE voen = ?', [voen]);
        if (existing.length > 0) { await connection.execute('UPDATE voen_info SET comp_name=?, comp_director_name=?, comp_adress=?, pstatus=?, data_info_date=? WHERE voen=?', [comp_name, comp_director_name, comp_adress, pstatus, data_info_date, voen]); return res.json({ success: true }); } 
        else { await connection.execute('INSERT INTO voen_info (voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date) VALUES (?, ?, ?, ?, ?, ?)', [voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date]); return res.json({ success: true }); }
    } catch (err) { res.status(500).json({ error: err.message }); } finally { if (connection) await connection.end(); }
});

app.delete('/api/companies/:id', async (req, res) => {
    let connection;
    try { connection = await mysql.createConnection(dbConfig); await connection.execute('DELETE FROM voen_info WHERE id = ?', [req.params.id]); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); } finally { if (connection) await connection.end(); }
});

app.listen(port, () => console.log(`Server aktivdir...`));
