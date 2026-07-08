import express from 'express';
import mysql from 'mysql2/promise'; // Sürətli və asinxron qoşulma üçün promise istifadə edirik
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Bazaya qoşulma məlumatları
const dbConfig = {
    host: 'shuttle.proxy.rlwy.net',
    port: 47240,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway'
};

// Şirkətləri gətirən API endpointi
app.get('/api/companies', async (req, res) => {
    let connection;
    try {
        // Hər müraciət gələndə təzə bağlantı açılır
        connection = await mysql.createConnection(dbConfig);
        
        // Diqqət: Burada hələ də 'example' cədvəli çağırılır
        const [rows] = await connection.execute('SELECT * FROM example');
        
        // Məlumatları uğurla geri qaytarırıq
        res.json(rows);
    } catch (err) {
        console.error("--- DATABASE ERROR LOG START ---");
        console.error("Xəta kodu:", err.code);
        console.error("Xəta mesajı:", err.message);
        console.error("--- DATABASE ERROR LOG END ---");
        
        res.status(500).json({ 
            error: 'Baza xətası baş verdi', 
            details: err.message,
            code: err.code 
        });
    } finally {
        // İŞMİZ BİTDİ! Xəttin passiv qalıb qopmaması üçün bağlantını mütləq dərhal bağlayırıq
        if (connection) {
            await connection.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Server ${port} portunda aktivdir...`);
});
