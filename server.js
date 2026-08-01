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



// ==========================================

// CƏDVƏLLƏRİN AVTOMATİK YARADILMASI (UĞURLU QURAŞDIRMA ÜÇÜN)

// ==========================================

async function initializeTables() {

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        await connection.execute(`

            CREATE TABLE IF NOT EXISTS mesulsexs (

                id INT AUTO_INCREMENT PRIMARY KEY,

                leaderperson VARCHAR(255),

                leadername VARCHAR(255),

                secondperson VARCHAR(255),

                phone VARCHAR(50)

            )

        `);

        await connection.execute(`

            CREATE TABLE IF NOT EXISTS bildirisler (

                id INT AUTO_INCREMENT PRIMARY KEY,

                gomruk_orqani VARCHAR(255),

                firma VARCHAR(255),

                voen VARCHAR(50),

                tarix_yazilma VARCHAR(50),

                tarix_borcdovru VARCHAR(100),

                melumat TEXT,

                bildiris_nomresi VARCHAR(100) DEFAULT ''

            )

        `);

        console.log("Cədvəllər uğurla yoxlanıldı/yaradıldı.");

    } catch (err) {

        console.error("Cədvəl yaratma xətası:", err);

    } finally {

        if (connection) await connection.end();

    }

}

initializeTables();



// ==========================================

// ƏSAS API-LƏR (ZİP GENERATION)

// ==========================================

app.post('/api/companies/generate-docs', async (req, res) => {

    let connection;

    try {

        const { selectedFirms } = req.body;



        if (!selectedFirms || !Array.isArray(selectedFirms) || selectedFirms.length === 0) {

            return res.status(400).json({ error: 'Məlumat serverə çatmadı!' });

        }



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

                const docSablonZip = new PizZip(sablonBuffer);

                const docSablon = new Docxtemplater(docSablonZip, { paragraphLoop: true, linebreaks: true });

                docSablon.render({

                    unvan: firm.unvan,

                    firma: firm.firma,

                    voen: firm.voen,

                    tarix: firm.tarixEsas,

                    leaderperson: signers.leaderperson,

                    leadername: signers.leadername,

                    secondperson: signers.secondperson,

                    phone: signers.phone

                });

                const outSablon = docSablon.getZip().generate({ type: "nodebuffer" });

                zipOutput.file(`${safeName}_esas.docx`, outSablon);



                const docQosmaZip = new PizZip(qosmaBuffer);

                const docQosma = new Docxtemplater(docQosmaZip, { paragraphLoop: true, linebreaks: true });

                docQosma.render({

                    soyadiadi: firm.soyadiadi,

                    voen: firm.voen,

                    gb: firm.gb,

                    borc: firm.borc,

                    tarix: firm.tarixQosma,

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

// İMZALAYAN ŞƏXSLƏR (mesulsexs) API-ləri

// ==========================================

app.get('/api/mesulsexs', async (req, res) => {

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute('SELECT * FROM mesulsexs ORDER BY id ASC LIMIT 1');

        res.json(rows);

    } catch (err) { res.status(500).json({ error: err.message }); } 

    finally { if (connection) await connection.end(); }

});



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

    } catch (err) { res.status(500).json({ error: err.message }); } 

    finally { if (connection) await connection.end(); }

});



app.put('/api/mesulsexs/:id', async (req, res) => {

    const { id } = req.params;

    const { leaderperson, leadername, secondperson, phone } = req.body;

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        await connection.execute('UPDATE mesulsexs SET leaderperson = ?, leadername = ?, secondperson = ?, phone = ? WHERE id = ?',

            [leaderperson, leadername, secondperson, phone, id]

        );

        res.json({ id, leaderperson, leadername, secondperson, phone });

    } catch (err) { res.status(500).json({ error: err.message }); } 

    finally { if (connection) await connection.end(); }

});



// ==========================================

// 🔥 YENİ: BİLDİRİŞLƏR (bildirisler) API-ləri

// ==========================================



// ZIP yaranarkən toplu əlavə etmək üçün

app.post('/api/bildirisler/bulk', async (req, res) => {

    const { bildirisler } = req.body;

    if (!bildirisler || bildirisler.length === 0) return res.json({ success: true });

    

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        for (const b of bildirisler) {

            const val1 = b.gomruk_orqani || "";

            const val2 = b.firma || "";

            const val3 = b.voen || "";

            const val4 = b.tarix_yazilma || "";

            const val5 = b.tarix_borcdovru || "";

            const val6 = b.melumat || "";



            await connection.execute(

                'INSERT INTO bildirisler (gomruk_orqani, firma, voen, tarix_yazilma, tarix_borcdovru, melumat, bildiris_nomresi) VALUES (?, ?, ?, ?, ?, ?, ?)',

                [val1, val2, val3, val4, val5, val6, '']

            );

        }

        res.json({ success: true });

    } catch (err) {

        console.error('Bildirisler bulk xətası:', err);

        res.status(500).json({ error: err.message });

    } finally {

        if (connection) await connection.end();

    }

});



// 🔥 YENİ: Bütün bildirişləri gətirmək (Analiz bölməsində yoxlamaq üçün)

app.get('/api/bildirisler', async (req, res) => {

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute("SELECT * FROM bildirisler");

        res.json(rows);

    } catch (err) {

        res.status(500).json({ error: err.message });

    } finally {

        if (connection) await connection.end();

    }

});



// Nömrəsi olmayanları (boş olanları) gətir (Modal cədvəl üçün)

app.get('/api/bildirisler/missing', async (req, res) => {

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute("SELECT * FROM bildirisler WHERE bildiris_nomresi = '' OR bildiris_nomresi IS NULL");

        res.json(rows);

    } catch (err) {

        res.status(500).json({ error: err.message });

    } finally {

        if (connection) await connection.end();

    }

});



// Bildiriş nömrəsini yeniləyib yadda saxlamaq

app.put('/api/bildirisler/:id', async (req, res) => {

    const { bildiris_nomresi } = req.body;

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        await connection.execute('UPDATE bildirisler SET bildiris_nomresi = ? WHERE id = ?', [bildiris_nomresi, req.params.id]);

        res.json({ success: true });

    } catch (err) {

        res.status(500).json({ error: err.message });

    } finally {

        if (connection) await connection.end();

    }

});



// Bildiriş qeydini silmək

app.delete('/api/bildirisler/:id', async (req, res) => {

    let connection;

    try {

        connection = await mysql.createConnection(dbConfig);

        await connection.execute('DELETE FROM bildirisler WHERE id = ?', [req.params.id]);

        res.json({ success: true });

    } catch (err) {

        res.status(500).json({ error: err.message });

    } finally {

        if (connection) await connection.end();

    }

});



app.listen(port, () => console.log(`Server aktivdir... Port: ${port}`));

