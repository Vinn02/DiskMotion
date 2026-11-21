# DiskMotion — Disk Scheduling Algorithm Visualizer

**DiskMotion** adalah platform pembelajaran interaktif berbasis web yang dirancang untuk memvisualisasikan cara kerja algoritma penjadwalan disk (_Disk Scheduling Algorithms_) pada sistem operasi. Aplikasi ini dibuat untuk memenuhi tugas akhir mata kuliah **Sistem Operasi**, dengan tujuan membantu mahasiswa maupun pengguna umum memahami pergerakan _read/write head_ secara visual, terstruktur, dan menyenangkan.

---

## Fitur Utama

- **Interactive Disk Scheduling Visualizer:** Simulasi grafik pergerakan _disk head_ secara visual dan dinamis berdasarkan skenario yang dimasukkan.
- **Custom Input Parameter:** Pengguna dapat mengatur sendiri posisi awal _head_, jumlah total _track_ (silinder), serta daftar antrean _request_ I/O.
- **Dukungan 4 Algoritma Utama:**
  - **FCFS** (_First-Come, First-Served_)
  - **SSTF** (_Shortest Seek Time First_)
  - **SCAN** (_Elevator Algorithm_)
  - **C-SCAN** (_Circular SCAN_)
- **Step-by-Step Execution Tracking:** Pelacakan urutan perpindahan _head_ langkah demi langkah lengkap dengan perhitungan total _seek time_ / jarak perpindahan silinder.
- **Algorithm Comparison:** Ringkasan dan perbandingan performa seluruh algoritma pada dataset antrean yang sama untuk melihat algoritma mana yang paling efisien.
- **Interactive Mini-Game:** Permainan edukatif untuk menguji dan melatih pemahaman konsep penjadwalan disk sekaligus sebagai sarana hiburan interaktif.

---

## Tech Stack & Library

- **Frontend Framework:** React
- **Build Tool:** Vite
- **Bahasa Pemrograman:** JavaScript (ES6+), HTML5, CSS3
- **Routing:** `react-router-dom`

---

## Prasyarat Instalasi

Sebelum menjalankan proyek ini di komputer lokal, pastikan kamu sudah menginstal:

- [Node.js](https://nodejs.org/) (disarankan versi 18 LTS atau lebih baru)
- `npm` (sudah otomatis terinstal bersama Node.js)

---

## Cara Instalasi

Ikuti langkah-langkah berikut untuk mengunduh dan menjalankan **DiskMotion** di komputer lokalmu:

1. **Clone repositori ini:**

   ```bash
   git clone [https://github.com/Vinn02/DiskMotion.git](https://github.com/Vinn02/DiskMotion.git)

   ```

2. **Masuk ke direktori DiskMotion**

   ```bash
   cd DiskMotion

   ```

3. **Install seluruh Dependensi**

   ```bash
   npm install

   ```

4. **Jalankan server**

   ```bash
   npm run dev

   ```

5. **Buka aplikasi di browser**
   buka tautan local yang muncul di terminal (umumnya http://localhost:5173)

---

## Anggota Kelompok

_Format: Nama Lengkap (NPM) Username GitHub_

- **Kevin Pratama Putra Hamdani (257006111003) Vinn02**
- **Salman Alfarisy Isnurdian (257006111031) salmann29**
- **Tisya Natasya Harviana (257006111035) tisyanatasyah**
- **Muhammad Yusuf Iskandar (257006111054) suffaja**
- **Muhammad Rafi Abdullah (257006111055) Rafiabdullah**
- **Nathanael Firla Putra Lumbantobing (257006111075) Nathan07222**
