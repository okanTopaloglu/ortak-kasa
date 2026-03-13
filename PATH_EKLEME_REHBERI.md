# Windows'ta PATH'e Nasıl Eklenir?

PATH, Windows'un komut satırında programları bulması için kullandığı klasör listesidir.

---

## Yöntem 1: Arayüz ile (Kolay)

1. **Windows tuşu + R** → `sysdm.cpl` yazıp Enter
2. **Gelişmiş** sekmesi → **Ortam Değişkenleri**
3. **Kullanıcı değişkenleri** bölümünde **Path** satırını seç → **Düzenle**
4. **Yeni** → Eklenecek klasör yolunu yaz (örn: `C:\Program Files\PostgreSQL\16\bin`)
5. **Tamam** ile kapat

---

## Yöntem 2: PowerShell ile

```powershell
# Mevcut Path'e ekle (oturum için geçici)
$env:Path += ";C:\Klasor\bin"

# Kalıcı ekleme (Kullanıcı PATH'ine)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Klasor\bin", "User")
```

---

## OrtakKasa İçin Gerekli Değil

SQLite kullandığınız için **PostgreSQL veya PATH ayarı gerekmez**. Veritabanı `apps/api/prisma/dev.db` dosyasında tutulur.

---

## PostgreSQL (İleride Gerekirse)

PostgreSQL zip/portable kurduysanız, `bin` klasörünü PATH'e ekleyin:

```
C:\PostgreSQL\16\bin
```

veya

```
C:\Program Files\PostgreSQL\16\bin
```
