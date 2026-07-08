import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Railway MySQL hovuzu (pool)
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Şirkətləri gətirən API endpointi
app.get('/api/companies', (req, res) => {
    const query = 'SELECT * FROM example'; // DBeaver-da cədvəl adın fərqlidirsə, "example"-ı dəyiş
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Baza xətası baş verdi' });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server ${port} portunda aktivdir...`);
});
