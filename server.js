const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Webflow-un bu API-a müraciət edə bilməsi üçün CORS-u aktiv edirik
app.use(cors());
app.use(express.json());

// Railway MySQL bazasına qoşulma tənzimləmələri
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

// Məlumatları bazadan çəkən API endpointi
app.get('/api/companies', (req, res) => {
    // dbeaver-da olan cədvəlinin adını "example" yerinə yaza bilərsən
    const query = 'SELECT * FROM example'; 
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Baza xətası baş verdi' });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server ${port} portunda işləyir...`);
});
