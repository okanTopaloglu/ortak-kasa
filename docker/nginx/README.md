# Nginx Konfigürasyonu

## HTTP (Geliştirme)

Varsayılan `nginx.conf` HTTP üzerinden çalışır.

## SSL (Produksiyon)

1. `nginx-ssl.conf` dosyasında `DOMAIN` değerini domain adınızla değiştirin.
2. LetsEncrypt sertifikası oluşturun:
   ```bash
   docker run -it --rm -v $(pwd)/certs:/etc/letsencrypt -p 80:80 certbot/certbot certonly --standalone -d yourdomain.com
   ```
3. `docker-compose.yml` içinde nginx volumes'a certs ekleyin:
   ```yaml
   volumes:
     - ./docker/nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
     - ./certs:/etc/letsencrypt:ro
   ```
4. Nginx'i yeniden başlatın.
