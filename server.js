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
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT'] }));

const dbConfig = process.env.MYSQL_URL || {
    host: 'ballast.proxy.rlwy.net',
    port: 55966,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway'
};

app.post('/api/companies/generate-docs', async (req, res) => {
    let connection;
    try {
        const { selectedFirms } = req.body;

        if (!selectedFirms || !Array.isArray(selectedFirms) || selectedFirms.length === 0) {
            return res.status(400).json({ error: 'Məlumat serverə çatmadı!' });
        }

        // 🔥 İMZALAYAN ŞƏXSLƏRİ BAZADAN ÇƏKİRİK 🔥
        let signers = { leaderperson: "", leadername: "", secondperson: "", phone: "" };
        try {
            connection = await mysql.createConnection(dbConfig);
            const [rows] = await connection.execute('SELECT * FROM mesulsexs ORDER BY id ASC LIMIT 1');
            if (rows.length > 0) {
                signers = rows[0];
            }
        } catch (dbErr) {
            console.error("Mesulsexs çəkilərkən xəta:", dbErr);
        } finally {
            if (connection) await connection.end();
        }

        const sablon_url = "https://raw.githubusercontent.com/HajikhanovKh/autoreport/refs/heads/main/sablon.docx";
        const qosma_url = "https://raw.githubusercontent.com/HajikhanovKh/autoreport/refs/heads/main/sablonqosma.docx";
        
        const [sablonRes, qosmaRes] = await Promise.all([
            axios.get(sablon_url, { responseType: 'arraybuffer' }),
            axios.get(qosma_url, { responseType: 'arraybuffer' })
        ]);

        const sablonBuffer = sablonRes.data;
        const qosmaBuffer = qosmaRes.data;

        const zipOutput = new JSZip();
        let generatedCount = 0;

        for (let i = 0; i < selectedFirms.length; i++) {
            const firm = selectedFirms[i];
            const safeName = firm.safeFirmaAdi || firm.firma.replace(/[/\\?%*:|"<>\s]+/g, '_').substring(0, 30);

            try {
                // 1. ƏSAS ŞABLON (sablon.docx)
                const docSablonZip = new PizZip(sablonBuffer);
                const docSablon = new Docxtemplater(docSablonZip, { paragraphLoop: true, linebreaks: true });
                docSablon.render({
                    unvan: firm.unvan,
                    firma: firm.firma,
                    voen: firm.voen,
                    tarix: firm.tarixEsas,
                    // Şablonda istifadə etmək üçün imzalayanları da göndəririk
                    leaderperson: signers.leaderperson,
                    leadername: signers.leadername,
                    secondperson: signers.secondperson,
                    phone: signers.phone
                });
                const outSablon = docSablon.getZip().generate({ type: "nodebuffer" });
                zipOutput.file(`${safeName}_esas.docx`, outSablon);

                // 2. QOŞMA ŞABLON (sablonqosma.docx)
                const docQosmaZip = new PizZip(qosmaBuffer);
                const docQosma = new Docxtemplater(docQosmaZip, { paragraphLoop: true, linebreaks: true });
                docQosma.render({
                    soyadiadi: firm.soyadiadi,
                    voen: firm.voen,
                    gb: firm.gb,
                    borc: firm.borc,
                    tarix: firm.tarixQosma,
                    // Qosmada da istifadə edilərsə deyə
                    leaderperson: signers.leaderperson,
                    leadername: signers.leadername,
                    secondperson: signers.secondperson,
                    phone: signers.phone
                });
                const outQosma = docQosma.getZip().generate({ type: "nodebuffer" });
                zipOutput.file(`${safeName}_qosma.docx`, outQosma);

                generatedCount += 2;
            } catch (docErr) {
                console.error(`Sənəd yaratma xətası (${firm.firma}):`, docErr);
                continue;
            }
        }

        const zipBuffer = await zipOutput.generateAsync({ type: "nodebuffer", compression: "STORE" });

        res.setHeader('Access-Control-Expose-Headers', 'X-Generated-Count');
        res.setHeader('X-Generated-Count', generatedCount);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=Senedler_Hesabati.zip');
        
        return res.send(zipBuffer);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server emal xətası: ' + err.message });
    }
});


app.get('/api/companies', async (req, res) => {
    let connection;
    try { 
        connection = await mysql.createConnection(dbConfig); 
        const [rows] = await connection.execute('SELECT * FROM voen_info'); 
        res.json(rows); 
    } catch (err) { res.status(500).json({ error: err.message }); } 
    finally { if (connection) await connection.end(); }
});

app.post('/api/companies', async (req, res) => {
    const { voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date } = req.body;
    let connection;
    try { 
        connection = await mysql.createConnection(dbConfig); 
        const [existing] = await connection.execute('SELECT id FROM voen_info WHERE voen = ?', [voen]);
        if (existing.length > 0) { 
            await connection.execute('UPDATE voen_info SET comp_name=?, comp_director_name=?, comp_adress=?, pstatus=?, data_info_date=? WHERE voen=?', [comp_name, comp_director_name, comp_adress, pstatus, data_info_date, voen]); 
            return res.json({ success: true }); 
        } else { 
            await connection.execute('INSERT INTO voen_info (voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date) VALUES (?, ?, ?, ?, ?, ?)', [voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date]); 
            return res.json({ success: true }); 
        }
    } catch (err) { res.status(500).json({ error: err.message }); } 
    finally { if (connection) await connection.end(); }
});

app.delete('/api/companies/:id', async (req, res) => {
    let connection;
    try { 
        connection = await mysql.createConnection(dbConfig); 
        await connection.execute('DELETE FROM voen_info WHERE id = ?', [req.params.id]); 
        res.json({ success: true }); 
    } catch (err) { res.status(500).json({ error: err.message }); } 
    finally { if (connection) await connection.end(); }
});

// ==========================================
// 🔥 YENİ: İMZALAYAN ŞƏXSLƏR (mesulsexs) MySQL API-ləri
// ==========================================

// 1. Məlumatları Gətirmək (GET)
app.get('/api/mesulsexs', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM mesulsexs ORDER BY id ASC LIMIT 1');
        res.json(rows);
    } catch (err) {
        console.error('Mesulsexs GET xətası:', err);
        res.status(500).json({ error: 'Server xətası baş verdi' });
    } finally {
        if (connection) await connection.end();
    }
});

// 2. İlk Dəfə Məlumat Yaratmaq (POST)
app.post('/api/mesulsexs', async (req, res) => {
    const { leaderperson, leadername, secondperson, phone } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO mesulsexs (leaderperson, leadername, secondperson, phone) VALUES (?, ?, ?, ?)',
            [leaderperson, leadername, secondperson, phone]
        );
        res.status(201).json({ id: result.insertId, leaderperson, leadername, secondperson, phone });
    } catch (err) {
        console.error('Mesulsexs POST xətası:', err);
        res.status(500).json({ error: 'Məlumatı yadda saxlamaq mümkün olmadı' });
    } finally {
        if (connection) await connection.end();
    }
});

// 3. Mövcud Məlumatı Yeniləmək (PUT)
app.put('/api/mesulsexs/:id', async (req, res) => {
    const { id } = req.params;
    const { leaderperson, leadername, secondperson, phone } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE mesulsexs SET leaderperson = ?, leadername = ?, secondperson = ?, phone = ? WHERE id = ?',
            [leaderperson, leadername, secondperson, phone, id]
        );
        res.json({ id, leaderperson, leadername, secondperson, phone });
    } catch (err) {
        console.error('Mesulsexs PUT xətası:', err);
        res.status(500).json({ error: 'Məlumatı yeniləmək mümkün olmadı' });
    } finally {
        if (connection) await connection.end();
    }
});

app.listen(port, () => console.log(`Server aktivdir... Port: ${port}`));
