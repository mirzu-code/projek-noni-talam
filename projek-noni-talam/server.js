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

// 3. API untuk "Tap" (Tukar status buka/penuh)
app.post('/api/toggle-slot/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Semak status semasa dahulu
        const checkResult = await pool.query('SELECT status FROM slots WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) return res.status(404).send('Slot tidak wujud');

        const currentStatus = checkResult.rows[0].status;
        const newStatus = currentStatus === 'buka' ? 'penuh' : 'buka';

        // Update status baru dalam database
        await pool.query('UPDATE slots SET status = $1 WHERE id = $2', [newStatus, id]);
        
        res.json({ message: 'Status berjaya ditukar!', newStatus });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4. Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`--- SERVER STUDIO NONI TALAM AKTIF ---`);
    console.log(`Akses di: http://localhost:${PORT}`);
});