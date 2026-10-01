# Deploy

Undangan berjalan sebagai **satu proses Node**: `wedding-api` mode production
menyajikan API, frontend, dan pratinjau link WhatsApp sekaligus. Proses ini
dijalankan sebagai service systemd milik user (tanpa `sudo`).

| | Lokasi |
|---|---|
| Rilis yang berjalan | `~/apps/wedding-invitation/` (`frontend/` dan `api/`) |
| Pengaturan production | `~/.config/wedding-invitation/production.env` (izin 600) |
| Password admin production | `~/.config/wedding-invitation/admin-password` (izin 600) |
| Service | `~/.config/systemd/user/wedding-invitation.service` |

## Deploy / update

```bash
./deploy/deploy.sh
```

Satu perintah ini menjalankan semua langkah berikut:
1. Build frontend dan backend.
2. Migrasi database.
3. Menyalin rilis ke `~/apps/wedding-invitation/`.
4. Me-restart service.
5. Mengecek `/ready`.

Jalankan ulang setiap kali ada perubahan. Pada run pertama, skrip membuat
`production.env` dengan `JWT_SECRET` acak. File itu tidak pernah ditimpa, jadi
edit langsung kalau perlu mengubah pengaturan, lalu jalankan `deploy.sh` lagi.

Alamat undangan: `http://<IP-server>:3000/wedding/<slug>?to=<NamaTamu>`

## Operasional

```bash
systemctl --user status wedding-invitation       # status
journalctl --user -u wedding-invitation -f       # log langsung
systemctl --user restart wedding-invitation      # restart
systemctl --user stop wedding-invitation         # hentikan
```

Agar service tetap jalan setelah user logout atau server reboot (perlu sekali `sudo`):

```bash
sudo loginctl enable-linger $USER
```

**Admin.** Password admin production ada di file `admin-password` di atas.
Untuk mengganti password atau menambah admin:

```bash
cd wedding-api
set -a; . ~/.config/wedding-invitation/production.env; set +a
ADMIN_USERNAME=admin ADMIN_PASSWORD='password-baru-minimal-12-karakter' npm run create-admin
```

**Backup database** (contoh harian dengan cron):

```bash
pg_dump "$DATABASE_URL" -Fc -f ~/backups/wedding-$(date +%F).dump
```

## Pindah ke VPS dengan domain dan HTTPS

1. Pasang Node 20+, PostgreSQL dan Nginx. Buat role dan database
   (lihat [wedding-api/README.md](../wedding-api/README.md#4-postgresql-setup)).
2. Clone repo, lalu jalankan:
   ```bash
   DATABASE_URL=postgresql://wedding:…@localhost:5432/wedding \
   HOST=127.0.0.1 TRUST_PROXY=1 CORS_ORIGIN=https://undangan.domain-anda.com \
   ./deploy/deploy.sh
   ```
3. Pasang [nginx.conf.example](nginx.conf.example) (ganti nama domainnya), lalu
   aktifkan HTTPS dengan `sudo certbot --nginx -d undangan.domain-anda.com`.
4. Aktifkan linger (lihat di atas), lalu buat admin dengan `npm run create-admin`.

Pratinjau WhatsApp baru bisa dicoba setelah undangan bisa diakses dari internet,
karena server WhatsApp tidak bisa menjangkau alamat lokal.
