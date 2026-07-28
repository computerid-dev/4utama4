# EchoNote — Sosial Media (project publik)

Ini project **user-facing** — yang kamu deploy dan bagikan linknya ke publik.
Pengelolaan (accept/reject, moderasi, dll) ada di project terpisah: **Admin** (privat, jangan dibagikan).
Keduanya pakai Firebase project yang sama (`echonoteein`) supaya datanya nyambung.

## Fitur

- **Auth manual** — daftar/login dengan sistem admin accept/reject + Mode Auto (dikontrol dari Admin)
- **Profil publik** — edit profil, upload avatar, follow/unfollow
- **Chat real-time** — 1-on-1, lewat Firebase Realtime Database
- **Feed** — post teks/foto/video, like, komentar
- **Anti-scrape dasar** — `middleware.js` blokir tool scraping/clone yang dikenal

## Struktur

```
/api
  register.js, login.js, status.js, setup-profile.js   → auth
  me.js, profile.js, edit-profile.js, upload-avatar.js, follow.js, follow-status.js, logout.js → profil
  firebase-token.js                                      → jembatan sesi ke Firebase Auth (buat RTDB)
  chat/ (id.js, list.js, send.js)                        → chat
  feed/ (create.js, list.js, like.js, comment.js, comments.js) → feed
/lib
  firebaseAdmin.js, helpers.js
/public
  index.html, daftar/, login/, pending/, set-up_account/, echonote-home/, akun/, profil/, chat/
  firebase-init.js  → config client SDK (Auth, RTDB, Storage)
  manifest.json, sw.js, offline.html → PWA
middleware.js       → anti-scrape (Edge Middleware)
```

## Cara deploy

1. **Service Account Firebase** (project `echonoteein`): Firebase Console → ⚙️ Project settings → Service accounts → Generate new private key. Jangan commit file ini.

2. Push ke GitHub, import ke [vercel.com](https://vercel.com/new) sebagai project **EchoNote** (terpisah dari Admin).

3. Set Environment Variables di Vercel:

   | Key | Value |
   |---|---|
   | `FIREBASE_PROJECT_ID` | dari service account JSON |
   | `FIREBASE_CLIENT_EMAIL` | dari service account JSON |
   | `FIREBASE_PRIVATE_KEY` | dari service account JSON (paste apa adanya, termasuk `\n`) |
   | `FIREBASE_DATABASE_URL` | URL Realtime Database (Firebase Console → Realtime Database) |
   | `FIREBASE_STORAGE_BUCKET` | `echonoteein.firebasestorage.app` |

   Project ini **tidak butuh** `ADMIN_SECRET` — itu cuma dipakai di project Admin.

4. Sebelum deploy, isi juga `databaseURL` di `public/firebase-init.js` (baris `databaseURL: "..."`) dengan URL Realtime Database yang sama.

5. Aktifkan **Firestore**, **Realtime Database**, dan **Storage** di Firebase Console kalau belum. Publish rules:
   - Realtime Database → tab Rules → paste isi `firebase-database-rules.json`
   - Storage → tab Rules → paste isi `firebase-storage-rules.txt`

6. Deploy.

## Alur auth

- **Daftar** → Mode Auto **ON**: langsung diterima → `/set-up_account`. **OFF**: masuk antrean → `/pending` (refresh manual) → di-accept/reject dari **project Admin**.
- **Masuk** → Mode Auto **ON**: dicocokkan langsung. **OFF**: semua percobaan masuk antrean, direview dari Admin.
- **Ditolak** → boleh daftar ulang dari awal.

## ⚠️ Keamanan (penting)

Sesuai permintaan, **password disimpan & ditampilkan apa adanya (plaintext)** di dashboard Admin
supaya gampang dicocokkan. Ini pertukaran yang disengaja, tapi risikonya nyata: kalau database
atau dashboard Admin bocor, semua password user bocor mentah. Jaga akses ke project Admin
seketat mungkin, dan pertimbangkan minta user tidak memakai ulang password dari akun lain.

## Chat — catatan privasi

Chat **tidak bisa diakses lewat dashboard Admin** (fitur itu memang tidak dibuat di sana). Tapi ini
bukan enkripsi end-to-end sungguhan — siapa pun dengan akses Firebase Console project ini masih
bisa buka Realtime Database secara langsung dan baca isinya. Privasinya terjaga selama akses ke
Firebase Console dibatasi hanya untukmu.

## Anti-scrape/anti-clone

`middleware.js` blokir User-Agent tool scraping/clone yang dikenal (curl, wget, HTTrack, web2zip,
dst) + honeypot link tersembunyi (`/__trap`) + `robots.txt` disallow semua. Tool web2pwa/web2apk
(PWABuilder, Median, GoNative, dst) tetap bisa akses normal karena pakai WebView mirip browser biasa.

**Catatan jujur:** ini memperberat, bukan menghilangkan total kemungkinan di-scrape. Scraper custom
dengan browser asli & User-Agent disamarkan tetap bisa nembus — tidak ada sistem anti-scrape yang
100% kebal di platform manapun.
