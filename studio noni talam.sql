-- 1. Buang semua rujukan lama dengan paksa (CASCADE)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS slots CASCADE;

-- 2. Bina semula jadual 'slots' yang baru dan bersih
CREATE TABLE slots (
    id SERIAL PRIMARY KEY,
    tarikh DATE NOT NULL,
    masa TIME NOT NULL,
    hari VARCHAR(20),
    status VARCHAR(10) DEFAULT 'BUKA'
);

-- 3. Jadual untuk simpan booking pelanggan
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    package VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    day VARCHAR(20),
    time TIME NOT NULL,
    date DATE NOT NULL,
    price INTEGER NOT NULL,
    payment_method VARCHAR(50),
    receipt_no VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);