# birdost.github.io · Tekinify Studios

Tekinify Studios bağımsız oyun stüdyosunun web sitesi: https://birdost.github.io

## İçerik

| Yol | Ne işe yarar |
| --- | --- |
| `index.html`, `assets/` | Tekinify ana sayfası (TR/EN, oyunlar, öne çıkan oyun, iletişim) |
| `cv/` | Ahmet Tekin'in CV sitesi: https://birdost.github.io/cv/ |
| `gariplig/gizlilik.html` | Garip Lig gizlilik politikası. **Google Play'deki bağlantı bu adrese gidiyor, adını ve yerini değiştirme.** |
| `app-ads.txt` | AdMob reklam doğrulama dosyası. **Silme ve taşıma; Google Play'deki geliştirici web sitesi adresinin kökünde durmalı.** |

## Ana sayfayı düzenleme

- Metinler `index.html` içinde. Her metnin Türkçesi `data-tr`, İngilizcesi `data-en` ile işaretli.
- Yeni oyun eklemek için "Oyunlar" bölümündeki `<article class="card ...">` bloklarından birini kopyala ve bilgileri değiştir. Görselleri `assets/img/games/` klasörüne koy (`oyun-icon.webp` ve dikey ekran görüntüleri `oyun-1.webp`, `oyun-2.webp`, `oyun-3.webp`).
- Puan ve indirme sayıları elle yazıldı (Ekim 2026 itibarıyla). Google Play'de değiştikçe güncelle.
- Giriş bölümündeki telefonda dönen ekran görüntüleri `phone-*.webp` dosyaları. Sırası `assets/js/site.js` içindeki `ORDER` listesinde.

## Yayın

Site GitHub Pages ile `main` dalından yayınlanır. `main`'e gönderilen her değişiklik bir iki dakika içinde siteye yansır.

Fontlar SIL Open Font License 1.1 ile lisanslıdır (`assets/fonts/LICENSE-*.txt`). İkonlar: [Lucide](https://lucide.dev) (ISC) ve [Simple Icons](https://simpleicons.org) (CC0).
