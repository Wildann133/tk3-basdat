# Design & UI Requirements (TikTakTuk)

Dokumen ini memuat detail panduan standar desain dan antarmuka (*UI/UX Guidelines*) untuk aplikasi **TikTakTuk** berdasarkan spesifikasi pengerjaan `TK03`. Panduan ini dirancang agar anggota tim dapat dengan mudah melanjutkan pengerjaan proyek tanpa merusak komposisi desain (*Neo-Brutalism*) yang telah ditetapkan sebelumnya.

---

## 1. Konsep Estetika: *Neo-Brutalism*
Aplikasi menggunakan gaya *Neo-Brutalism* yang memukau. Ciri khas utama dari antarmuka ini meliputi:
- **Garis batas yang tebal** (`border-2`, `border-4`, selalu berwarna *Solid Black* / `#000`).
- **Bayangan kotak tajam** (*hard shadows*, tanpa blur). Contoh penerapannya pada Tailwind: `shadow-[4px_4px_0_0_#000]` atau `shadow-[8px_8px_0_0_#000]`.
- **Backgrounds** kontras yang tidak menggunakan gradasi (kuning, merah, ungu solid).
- Mengurangi penggunaan sudut membulat secara agresif (kartu biasanya memiliki membulat kecil seperti `rounded-lg` atau `rounded-2xl` dengan garis yang kaku).

---

## 2. Palet Warna (Color System)
Konfigurasi *Root* Tailwind dalam `globals.css` telah diatur sesuai tema:
- **Primary**: `#ffdb33` (Kuning pekat) — Digunakan untuk elemen utama seperti Card highlight, atau banner header.
- **Secondary**: `#000` (Hitam solid) — Digunakan untuk elemen pembeda tebal.
- **Accent**: `#fae583` (Kuning pastel) — Digunakan untuk latar *Card* sorotan yang lebih lembut.
- **Destructive**: `#e63946` (Merah Retro) — Digunakan untuk error, notifikasi penting, peringatan hapus.
- **Background Utama**: Putih Polos (`#fff`) / Abu-abu (`#f5f5f5`)

---

## 3. Sistem Tipografi (Typography)
Seluruh font diimpor dari *Google Fonts* secara otomatis melalui file `layout.tsx`. Harap pastikan *font-family* yang tepat digunakan.
1. **Archivo Black** (`font-head`): Digunakan khusus untuk Judul utama (H1, H2, Title Card), dan *Hero Statement*. Font ini sangat tebal.
2. **Space Grotesk** (`font-sans`): Digunakan untuk seluruh paragraf, teks tombol, dan deskripsi isi (*body-text*).

*Catatan: Pastikan untuk menggunakan utility seperti `tracking-widest` atau `uppercase` untuk mempertegas gaya neo-brutalism untuk header minor.*

---

## 4. RetroUI Components
Seluruh folder `components/retroui/` memuat *wrapper* komponen siap pakai (Button, Input, Card). Dilarang merancang *Button*, *Input*, dan kotak *Card* manual dari tag `<button>` jika bukan untuk kustomisasi yang terlampau jauh.
- `<Button variant="default">` -> Menampilkan tombol cerah dengan pinggiran ganda.
- `<Input>` -> Berlatar transparan (bawaan RetroUI), dan untuk menempatkan _border_ gelap, wajib menambahkan `className="bg-white border-2 border-black"`.
- `<Card>` -> Semua kartu UI harus disematkan `border-4 border-black` dan shadow pekat. Jangan gunakan `.shadow-md` bawaan Tailwind.

---

## 5. Tata Letak (Layouting)
### Bento Grid Layout
Semua halaman **Dashboards** (Admin, Organizer, Customer) dan **Profile** menganut konfigurasi **Bento Grid**.
- Gunakan tag `grid grid-cols-1 md:grid-cols-3` atau sejenisnya.
- Elemen *Card* diizinkan merenggang ganda dengan menggunakan elemen seperti `col-span-2` atau `row-span-2` untuk menonjolkan fitur prioritas.

---

## 6. Autentikasi dan *Session Routing*
Aplikasi tidak lagi menggunakan simulasi peran via format URL (`?role=...`).
Pemeriksaan hak akses peran ditarik langsung dari **Server Cookies** menggunakan Next.js Server Actions. 
- Berkas utama terletak di `lib/auth.ts`.
- Impor fungsi `getSession()` pada seluruh komponen SSR (Server-Side Rendering) untuk melakukan validasi apakah navigasi menu untuk *Admin*, *Organizer*, atau *Customer* yang harus dimunculkan.
- Seluruh Data Tiruan (*Dummy*) dapat dipanggil dari `lib/dummyData.ts`.

> **Semoga sukses menyelesaikan TIKTAKTUK Fase Kedua (TK04)!** Jangan ragu menelusuri struktur file utama di `/frontend` untuk menjadikan panduan ini sebagai rujukan kode.
