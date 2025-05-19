# Auto Test for AI Chatbot (Hyperjump)

## Deskripsi Proyek

Proyek ini berisi skrip otomatisasi untuk melakukan pengujian fungsional pada chatbot AI Hyperjump. Skrip menggunakan Node.js dan Puppeteer untuk berinteraksi dengan antarmuka web chatbot, mengirimkan serangkaian pertanyaan input yang didefinisikan dalam file Excel, menangkap respons bot, dan membandingkannya dengan contoh jawaban yang diharapkan.

Tujuan utama adalah untuk memastikan chatbot merespons secara akurat dan konsisten terhadap berbagai skenario pengujian.

## Fitur Utama

*   Membaca kasus uji dari file `test-cases.xlsx`.
    *   Pertanyaan input diambil dari Kolom E.
    *   Contoh jawaban yang diharapkan (untuk referensi) diambil dari Kolom G.
*   Menggunakan Puppeteer untuk mengotomatiskan interaksi browser dengan chatbot.
*   Menvalidasi respons bot terhadap contoh jawaban (saat ini menggunakan logika `includes` secara case-insensitive).
*   Menghasilkan laporan hasil pengujian dalam beberapa format:
    *   Tabel ringkas di konsol.
    *   File teks (`.txt`) detail.
    *   File JSON (`.json`).
    *   File Excel (`.xlsx`).
*   Hasil pengujian disimpan dalam direktori `output/` dengan timestamp.

## Prasyarat

Sebelum menjalankan skrip, pastikan Anda memiliki:

*   [Node.js](https://nodejs.org/) (direkomendasikan versi LTS terbaru)
*   npm (biasanya terinstal bersama Node.js)
*   Browser Google Chrome atau Chromium (digunakan oleh Puppeteer)

## Instalasi

1.  **Clone Repositori (jika belum):**
    ```bash
    git clone https://github.com/amripangestu/auto-test-for-ai-chatbot.git
    cd auto-test-for-ai-chatbot
    ```

2.  **Instal Dependensi:**
    Dari direktori root proyek, jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan (seperti Puppeteer, xlsx, cli-table3):
    ```bash
    npm install
    ```

## Struktur File `test-cases.xlsx`

File `test-cases.xlsx` adalah sumber utama untuk kasus uji Anda. Pastikan file ini memiliki struktur berikut pada sheet pertama:

*   **Kolom E**: Berisi pertanyaan input yang akan dikirimkan ke chatbot.
*   **Kolom G**: Berisi "Sample Expected Answer" atau contoh jawaban yang diharapkan dari chatbot sebagai referensi. *Catatan: Logika validasi saat ini memeriksa apakah respons bot mengandung teks dari kolom ini.*

Baris kosong pada Kolom E akan diabaikan.

## Menjalankan Skrip Pengujian

Untuk menjalankan skrip pengujian, navigasikan ke direktori root proyek di terminal Anda dan jalankan:

```bash
node chatbot-test.js
```

Skrip akan:
1.  Membaca `test-cases.xlsx`.
2.  Membuka browser dan berinteraksi dengan chatbot.
3.  Menampilkan hasil di konsol secara real-time.
4.  Menyimpan file laporan di direktori `output/`.

## Output Hasil Pengujian

Setelah eksekusi selesai, Anda akan menemukan file-file berikut di dalam direktori `output/` (dengan nama file yang menyertakan timestamp):

*   `test_results_YYYY-MM-DDTHH-MM-SS-MSZ.txt`: Laporan teks detail.
*   `test_results_YYYY-MM-DDTHH-MM-SS-MSZ.json`: Laporan dalam format JSON.
*   `test_results_YYYY-MM-DDTHH-MM-SS-MSZ.xlsx`: Laporan dalam format Excel.

## Pengembangan Selanjutnya (Ide)

*   Implementasi perbandingan yang lebih canggih (misalnya, menggunakan pencocokan kata kunci dari kolom tambahan di Excel atau integrasi dengan AI untuk similarity checking).
*   Menambahkan kemampuan untuk mengambil screenshot pada saat terjadi kegagalan.
*   Integrasi dengan sistem CI/CD.

## Kontribusi

Jika Anda ingin berkontribusi, silakan fork repositori ini dan buat pull request. Untuk perubahan besar, silakan buka issue terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.

---

*README ini dibuat untuk proyek chatbot testing Hyperjump.*
