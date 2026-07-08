import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Birbaşa sənin Public MySQL məlumatlarınla hovuz yaradırıq
const pool = mysql.createPool({
    host: 'shuttle.proxy.rlwy.net',
    port: 47240,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Genişləndirilmiş xəta loqlama funksiyası
app.get('/api/companies', (req, res) => {
    // Diqqət: Burada hələ də 'example' cədvəli çağırılır
    const query = 'SELECT * FROM example'; 
    
    pool.query(query, (err, results) => {
        if (err) {
            // Bu sətr xətanın bütün detallarını Railway terminalına (Logs) yazdıracaq
            console.error("--- DATABASE ERROR LOG START ---");
            console.error("Xəta kodu:", err.code);
            console.error("Xəta mesajı:", err.message);
            console.error(err);
            console.error("--- DATABASE ERROR LOG END ---");
            
            // Xətanın mesajını birbaşa brauzerdə görmək üçün JSON olaraq qaytarırıq
            return res.status(500).json({ 
                error: 'Baza xətası baş verdi', 
                details: err.message,
                code: err.code 
            });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server ${port} portunda aktivdir...`);
});
