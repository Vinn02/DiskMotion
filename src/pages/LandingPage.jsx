import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <>
      <section id="home">
        <p>Belajar sistem operasi dengan cara yang lebih seru</p>
        <h1>
          DiskMotion
          <br />
          Visualizer
        </h1>
        <p>
          Pelajari algoritma disk scheduling dengan visualisasi yang mudah
          dipahami. Kenali FCFS, SSTF, SCAN, dan C-SCAN melalui materi dan
          simulasi interaktif.
        </p>
        <p>
          <Link to="/visualisasi">Mulai Simulasi</Link>
          {" | "}
          <Link to="/minigame">Mini Game</Link>
        </p>
        <p>
          <a href="#fitur">Jelajahi DiskMotion ↓</a>
        </p>
      </section>

      <section id="fitur">
        <p>Fitur</p>
        <h2>Belajar sambil melihat prosesnya</h2>
        <p>
          Semua yang kamu butuhkan untuk mengenal ekosistem disk scheduling
          secara komprehensif.
        </p>
        <div>
          <article>
            <h3>Visualisasi Interaktif</h3>
            <p>
              Ikuti pergerakan head dari satu track ke track lain dengan urutan
              yang mudah dipahami.
            </p>
          </article>
          <article>
            <h3>Perbandingan Algoritma</h3>
            <p>
              Pelajari perbedaan cara kerja FCFS, SSTF, SCAN, dan C-SCAN pada
              antrean yang sama.
            </p>
          </article>
          <article>
            <h3>Simulasi Interaktif</h3>
            <p>
              Atur skenario dan amati bagaimana strategi penjadwalan
              memengaruhi urutan layanan.
            </p>
          </article>
          <article>
            <h3>Analisis Performa</h3>
            <p>
              Kenali seek time, total perpindahan head, serta dampak urutan
              request terhadap hasil.
            </p>
          </article>
          <article>
            <h3>Belajar Bertahap</h3>
            <p>
              Mulai dari konsep dasar, lalu lanjutkan dengan algoritma dan
              tantangan mini game.
            </p>
          </article>
          <article>
            <h3>Konsep Sistem Operasi</h3>
            <p>
              Hubungkan konsep disk scheduling dengan cara sistem operasi
              mengelola request I/O.
            </p>
          </article>
        </div>
      </section>

      <section id="tentang">
        <p>Tentang</p>
        <h2>Apa Itu Disk Scheduling?</h2>
        <p>
          Disk scheduling adalah mekanisme sistem operasi untuk menentukan
          urutan layanan permintaan input/output pada disk. Dengan strategi
          yang tepat, pergerakan read/write head dapat dipahami dan
          dibandingkan dengan lebih mudah.
        </p>
        <div>
          <article>
            <h3>Seek Time</h3>
            <p>
              Waktu yang dibutuhkan head untuk berpindah menuju track tujuan.
              Perpindahan yang lebih singkat berarti request dilayani dengan
              lebih cepat.
            </p>
          </article>
          <article>
            <h3>Total Head Movement</h3>
            <p>
              Jumlah seluruh jarak perpindahan head selama melayani request.
              Metrik ini membantu membandingkan hasil tiap algoritma.
            </p>
          </article>
          <article>
            <h3>Throughput</h3>
            <p>
              Jumlah request yang berhasil dilayani dalam suatu periode.
              Penjadwalan yang baik membantu menjaga layanan tetap efisien.
            </p>
          </article>
        </div>
      </section>

      <section id="algoritma">
        <p>Algoritma</p>
        <h2>Algoritma Utama yang Dipelajari</h2>
        <p>Kenali perbedaan karakteristik dan cara kerja setiap algoritma.</p>
        <div>
          <article>
            <h3>FCFS</h3>
            <h4>First-Come, First-Served</h4>
            <p>
              Melayani request sesuai urutan kedatangannya. Sederhana dan adil,
              tetapi perjalanan head bisa menjadi panjang.
            </p>
            <p>Urutan kedatangan</p>
          </article>
          <article>
            <h3>SSTF</h3>
            <h4>Shortest Seek Time First</h4>
            <p>
              Memilih request terdekat dari posisi head saat ini. Perpindahan
              dapat lebih singkat, tetapi request jauh bisa menunggu.
            </p>
            <p>Request terdekat</p>
          </article>
          <article>
            <h3>SCAN</h3>
            <h4>Elevator Algorithm</h4>
            <p>
              Head bergerak ke satu arah sambil melayani request, lalu berbalik
              arah seperti elevator.
            </p>
            <p>Bolak-balik</p>
          </article>
          <article>
            <h3>C-SCAN</h3>
            <h4>Circular SCAN</h4>
            <p>
              Melayani request hanya dalam satu arah. Setelah mencapai ujung,
              head kembali ke awal untuk memulai putaran berikutnya.
            </p>
            <p>Satu arah</p>
          </article>
        </div>
      </section>

      <section id="faq">
        <h2>Sering Ditanyakan?</h2>
        <details open>
          <summary>Apa itu Disk Motion Visualizer?</summary>
          <p>
            DiskMotion adalah media belajar untuk mengenal algoritma disk
            scheduling dan konsep sistem operasi melalui materi, visualisasi,
            dan mini game.
          </p>
        </details>
        <details>
          <summary>Algoritma apa saja yang dibahas?</summary>
          <p>
            Kamu dapat mempelajari FCFS, SSTF, SCAN, dan C-SCAN beserta
            perbedaan cara masing-masing melayani antrean request.
          </p>
        </details>
        <details>
          <summary>Bagaimana cara menggunakan halaman simulasi?</summary>
          <p>
            Pilih Mulai Simulasi untuk membuka halaman visualisasi. Halaman
            tersebut menjadi tempat untuk mencoba konsep penjadwalan disk.
          </p>
        </details>
        <details>
          <summary>Apa itu Total Head Movement dan Seek Time?</summary>
          <p>
            Seek time adalah waktu perpindahan head menuju track, sedangkan
            total head movement menjumlahkan jarak perpindahan head selama
            melayani request.
          </p>
        </details>
        <details>
          <summary>Algoritma mana yang paling bagus?</summary>
          <p>
            Tidak ada satu algoritma yang selalu terbaik. Hasilnya bergantung
            pada posisi awal head, urutan request, dan kebutuhan sistem.
          </p>
        </details>
      </section>

      <section id="tim">
        <p>Tim</p>
        <h2>Tim Pengembang</h2>
        <p>DiskMotion dikembangkan sebagai proyek pembelajaran bersama.</p>
        <div>
          <article>
            <h3>Kevin Pratama Putra Hamdani</h3>
            <p>Anggota 1</p>
          </article>
          <article>
            <h3>Salman Alfarisy Isnurdian</h3>
            <p>Anggota 2</p>
          </article>
          <article>
            <h3>Tisya Natasya Harviana</h3>
            <p>Anggota 3</p>
          </article>
          <article>
            <h3>Muhammad Yusuf Iskandar</h3>
            <p>Anggota 4</p>
          </article>
          <article>
            <h3>Muhammad Rafi Abdullah</h3>
            <p>Anggota 5</p>
          </article>
          <article>
            <h3>Nathanael Firla Putra Lumbantobing</h3>
            <p>Anggota 6</p>
          </article>
        </div>
      </section>

      <footer>
        <h2>
          DiskMotion
          <br />
          Visualizer
        </h2>
        <p>
          Interaktif Disk Scheduling Simulator &amp; Learning Hub untuk
          memahami pergerakan Operating System.
        </p>
        <nav aria-label="Navigasi footer">
          <a href="#fitur">Fitur</a>
          {" | "}
          <a href="#algoritma">Algoritma</a>
          {" | "}
          <a href="#faq">FAQ</a>
          {" | "}
          <Link to="/visualisasi">Simulasi</Link>
        </nav>
        <p>© 2025 DiskMotion Visualizer</p>
        <a href="#home">Kembali ke atas ↑</a>
      </footer>
    </>
  );
}

export default LandingPage;
