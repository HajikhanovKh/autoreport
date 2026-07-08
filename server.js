import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000; // Railway portu avtomatik təyin edir

app.use(cors());
app.use(express.json());

// Railway mühitində daxili keçidi (MYSQL_URL), lokalda isə xarici proxy-ni oxuyur
const dbConfig = process.env.MYSQL_URL || {
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
        // Hər müraciət gələndə yeni daxili bağlantı açılır
        connection = await mysql.createConnection(dbConfig);
        
        // Sənin təyin etdiyin "voen_info" cədvəlindən məlumatları çəkirik
        const [rows] = await connection.execute('SELECT * FROM voen_info');
        
        // Məlumatları Webflow-a göndəririk
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
        // İşimiz bitən kimi xətti dərhal qatlayırıq ki, PROTOCOL_CONNECTION_LOST verməsin
        if (connection) {
            await connection.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Server ${port} portunda aktivdir...`);
});
