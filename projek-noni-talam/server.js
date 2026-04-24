const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// 1. Sambungan ke PostgreSQL (pgAdmin)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'studio_noni_talam',
    password: 'KATA_LALUAN_POSTGRES_ANDA', // <--- TUKAR KEPADA PASSWORD pgAdmin ANDA
    port: 5432,
});

app.use(express.json());
app.use(express.static('public')); // Folder untuk simpan fail HTML anda

// 2. API untuk ambil semua slot (Untuk dipaparkan di Admin Page)
app.get('/api/slots', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM slots ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/save-booking', async (req, res) => {
    const { name, email, phone, package, date, time, paymentMethod } = req.body;
    const receiptNo = 'STN-' + Date.now(); // Jana no resit ringkas

    try {
        const query = `
            INSERT INTO bookings (name, email, phone, package, booking_date, booking_time, payment_method, receipt_no)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`;
        
        const values = [name, email, phone, package, date, time, paymentMethod, receiptNo];
        await pool.query(query, values);

        res.json({ success: true, receiptNo: receiptNo });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message); // Ini yang hantar teks "relation..." tadi
    }
});

// 4. Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`--- SERVER STUDIO NONI TALAM AKTIF ---`);
    console.log(`Akses di: http://localhost:${PORT}`);
});