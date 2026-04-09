const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
const port = 3000;

// --- KONFIGURASI DATABASE ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Studio Noni Talam',
    password: '612944', 
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) return console.error('❌ Gagal sambung DB:', err.message);
    console.log('✅ SAMBUNGAN POSTGRESQL BERJAYA!');
    release();
});

app.use(express.json());
app.use(express.static('public'));

// --- API AMBIL & AUTO-GENERATE SLOT ---
// --- CARI BAHAGIAN INI DALAM server.js ---
app.get('/api/slots', async (req, res) => {
    const { tarikh } = req.query;
    
    if (!tarikh) return res.status(400).send("Tarikh diperlukan");

    try {
        // 1. Cuba ambil data dari database
        const resSlots = await pool.query('SELECT * FROM slots WHERE tarikh = $1 ORDER BY masa ASC', [tarikh]);

        // 2. Kalau database KOSONG untuk tarikh tu, kita buatkan (Auto-Generate)
        if (resSlots.rows.length === 0) {
            console.log(`Sistem sedang menjana slot untuk: ${tarikh}`);
            
            const hariNama = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"][new Date(tarikh).getDay()];
            const senaraiMasa = ['10:00:00', '11:00:00', '14:00:00', '16:00:00', '18:00:00'];

            for (let m of senaraiMasa) {
                await pool.query(
                    'INSERT INTO slots (hari, masa, status, tarikh) VALUES ($1, $2, $3, $4)',
                    [hariNama, m, 'BUKA', tarikh]
                );
            }

            // Ambil balik data yang baru lepas kita INSERT tadi
            const dataBaru = await pool.query('SELECT * FROM slots WHERE tarikh = $1 ORDER BY masa ASC', [tarikh]);
            return res.json(dataBaru.rows);
        }

        // 3. Kalau data memang dah ada, terus hantar ke website
        res.json(resSlots.rows);

    } catch (err) {
        console.error("Ralat Database:", err.message);
        res.status(500).json({ error: "Masalah teknikal pada database" });
    }
});

// --- API UPDATE STATUS ---
app.post('/api/update-slot', async (req, res) => {
    const { id, status } = req.body;
    try {
        const statusBaru = status === 'BUKA' ? 'PENUH' : 'BUKA';
        await pool.query('UPDATE slots SET status = $1 WHERE id = $2', [statusBaru, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- API SAVE BOOKING ---
app.post('/api/save-booking', async (req, res) => {
    const { package, name, phone, email, day, time, date, price, paymentMethod } = req.body;
    try {
        const receiptNo = "NT-" + Math.floor(Math.random() * 900000 + 100000);
        await pool.query(
            'INSERT INTO bookings (package, name, phone, email, day, time, date, price, payment_method, receipt_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [package, name, phone, email, day, time, date, price, paymentMethod, receiptNo]
        );
        res.json({ success: true, receiptNo });
    } catch (err) {
        console.error("Error saving booking:", err);
        res.status(500).send(err.message);
    }
});

// --- API GET BOOKINGS FOR ADMIN ---
app.get('/api/bookings', async (req, res) => {
    const { date } = req.query;
    try {
        let query = 'SELECT * FROM bookings';
        let params = [];
        if (date) {
            query += ' WHERE date = $1';
            params = [date];
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`--- SERVER STUDIO NONI TALAM AKTIF ---`);
    console.log(`Akses di: http://localhost:${port}/admin.html`);
});