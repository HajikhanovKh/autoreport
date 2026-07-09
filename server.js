import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// CORS daxilində DELETE metoduna rəsmi icazə veririk
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json());

const dbConfig = process.env.MYSQL_URL || {
    host: 'ballast.proxy.rlwy.net',
    port: 55966,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway'
};

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

// 2. POST - Yeni şirkət əlavə etmək
app.post('/api/companies', async (req, res) => {
    const { voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const query = `
            INSERT INTO voen_info (voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(query, [voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date]);
        res.json({ success: true, message: 'Məlumat yazıldı!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.end();
    }
});

// 🔴 3. DELETE - Şirkəti ID parametrinə görə bazadan tamamilə silmək
app.delete('/api/companies/:id', async (req, res) => {
    const companyId = req.params.id;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Gələn ID-yə əsasən cədvəldən rəsmi silmə sorğusu icra edirik
        const [result] = await connection.execute('DELETE FROM voen_info WHERE id = ?', [companyId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Xəta: Silinmək istənən məlumat bazada tapılmadı!' });
        }
        
        res.json({ success: true, message: 'Məlumat bazadan uğurla silindi!' });
    } catch (err) {
        res.status(500).json({ error: 'Baza silinmə xətası: ' + err.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.listen(port, () => {
    console.log(`Server ${port} portunda tam aktivdir...`);
});
