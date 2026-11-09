# LI ELECTRIC — lielectric.cn

Static B2B export website for **Jinhua Li Electric Trading Co., Ltd.** — electric motorcycles,
e-bicycles and LiFePO4 lithium battery packs, supplied factory-direct to overseas dealers and
distributors.

Plain HTML / CSS / JavaScript. No build step. Published on GitHub Pages with the custom
domain **lielectric.cn**.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Homepage, plus the hash-routed shop (`#/products`, `#/product/…`, `#/cart`, `#/about`, `#/contact`) |
| `products.html` | Catalog index for all 20 models |
| `products/*.html` | One page per model (`em02`, `lw12100` … `lwmt2`) |
| `about.html` | Company profile, factory and certifications |
| `contact.html` | Inquiry page, WhatsApp / email / bank details |
| `pay.html` | B2B page for proforma-invoice deposit and balance payment |
| `404.html` | Custom not-found page (served by GitHub Pages automatically) |
| `images/`, `videos/` | Product photography and video assets |
| `CNAME` | Custom domain record — single line `lielectric.cn` |
| `sitemap.xml` | 25 URLs, all on `https://lielectric.cn/` |
| `robots.txt` | Allows all crawlers, points to the sitemap |
| `google291edc07881979c7.html` | Google Search Console verification — **do not delete** |

## Cart and online payment

- The cart lives in `localStorage` under the key `li_cart`.
- Product pages hand a model code to the cart via `localStorage.pendingAdd` (with
  `?add=MODEL` as fallback) when the customer clicks **Order Sample**.
- The cart view computes the total, and renders **PayPal Buttons** (Live environment)
  inside `#paypal-button-container` once the PayPal JS SDK has loaded. If the SDK cannot be
  reached, the container shows a short fallback note instead of staying blank.
- Bank transfer (T/T) details stay visible on the cart page for wholesale orders.
- `pay.html` remains the entry point for deposit / balance payments against a PI.
  The PayPal **secret key is never stored in this repository** — only the public client ID
  appears in the page.

## Deploying

1. Commit and push to `main`; GitHub Pages rebuilds automatically.
2. Settings → Pages → Custom domain is `lielectric.cn`; `www.lielectric.cn` 301-redirects to
   the apex domain.
3. Keep `CNAME`, `sitemap.xml`, `robots.txt` and the Search Console verification file at the
   repository root.

## Domain and SEO conventions

- Every `canonical`, `og:url` and sitemap entry uses `https://lielectric.cn/…` (apex, not `www`).
- New pages must be added to `sitemap.xml` and must carry their own canonical tag.
- CSS uses design tokens at the top of each page's `<style>` block (`--black:#0D0D0D`,
  `--green:#C6FF00`, `--bg:#F7F7F5` …).

## Contact

- Sales: `sales@lielectric.cn` · WhatsApp / phone: +86 189 6797 3377
- Tel: +86-579-82360077
- Address: NO.183 4th floor, Jinou Road, Dongxiao Street, Jindong District, Jinhua City, Zhejiang, China
