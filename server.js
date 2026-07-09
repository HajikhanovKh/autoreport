import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

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

// 2. POST - Yeni şirkət əlavə etmək VƏ YA Mövcud VÖEN-i yeniləmək (AĞILLI METOD)
app.post('/api/companies', async (req, res) => {
    const { voen, comp_name, comp_director_name, comp_adress, pstatus, data_info_date } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // İlk öncə bazada bu VÖEN-in olub olmadığını yoxlayırıq
        const [existing] = await connection.execute('SELECT id FROM voen_info WHERE voen = ?', [voen]);
        
        if (existing.length > 0) {
            // Əgər eyni VÖEN artıq varsa -> Məlumatları ÜZƏRİNƏ YAZIRIQ (UPDATE)
            const updateQuery = `
                UPDATE voen_info 
                SET comp_name = ?, comp_director_name = ?, comp_adress = ?, pstatus = ?, data_info_date = ? 
                WHERE voen = ?
            `;
            await connection.execute(updateQuery, [comp_name, comp_director_name, comp_adress, pstatus, data_info_date, voen]);
            return res.json({ success: true, updated: true, message: 'Məlumatlar mövcud VÖEN üzərinə yazıldı!' });
        } else {
            // Əgər bu VÖEN bazada yoxdursa -> YENİ SƏTİR YARADIRIQ (INSERT)
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
