import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000; // Railway portu avtomatik təyin edir [cite: 180]

// CORS tənzimləməsini genişləndirərək bütün kənar sorğulara (Webflow daxil) tam icazə veririk [cite: 310]
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Brauzer bloklamasının qarşısını almaq üçün başlıqları (headers) əllə də rəsmiləşdiririk [cite: 310]
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());

// Railway mühitində daxili keçidi (MYSQL_URL), lokalda isə xarici proxy məlumatlarını oxuyur [cite: 247, 248]
const dbConfig = process.env.MYSQL_URL || {
    host: 'shuttle.proxy.rlwy.net',
    port: 47240,
    user: 'root',
    password: 'EkyWKEWfaarOVqBFEGPFhCQNVSnRrPtG',
    database: 'railway'
};

// Şirkətləri gətirən API endpointi [cite: 24, 134]
app.get('/api/companies', async (req, res) => {
    let connection;
    try {
        // Hər müraciət gələndə yeni daxili bağlantı açılır [cite: 173]
        connection = await mysql.createConnection(dbConfig);
        
        // Sənin təyin etdiyin "voen_info" cədvəlindən məlumatları çəkirik [cite: 253, 254]
        const [rows] = await connection.execute('SELECT * FROM voen_info');
        
        // Məlumatları uğurla Webflow-a göndəririk [cite: 40]
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
        // İşimiz bitən kimi xətti dərhal qatlayırıq ki, PROTOCOL_CONNECTION_LOST verməsin [cite: 173, 174]
        if (connection) {
            await connection.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Server ${port} portunda aktivdir...`);
});
