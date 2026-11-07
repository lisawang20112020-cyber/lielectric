# AURELLE storefront

Static jewellery store, three languages (English / 中文 / Español), built for GitHub Pages
or any plain web host. No build step is needed to publish — upload the whole folder.

## Publish

1. Upload everything in this folder to the repository root (keep `CNAME`, `.nojekyll`,
   `robots.txt`, `sitemap.xml`).
2. GitHub → Settings → Pages → Custom domain: `aurelle.com.cn`, then tick Enforce HTTPS.
3. DNS: `aurelle.com.cn` needs A records to GitHub Pages (185.199.108.153, .109.153,
   .110.153, .111.153) or a CNAME if you switch the canonical to `www.aurelle.com.cn`.
4. In Google Search Console add the domain property and submit
   `https://aurelle.com.cn/sitemap.xml`.

## Change the domain

The canonical / hreflang / sitemap URLs all come from one constant. Edit `BASE` in
`build/content.py` (and `baseUrl` in `assets/js/config.js`), then run:

    python build/build_site.py

## Products, prices, copy

`build/content.py` holds the six products (code, USD price, specs and copy in three
languages); `build/ui.py` holds interface wording. Re-run `build/build_site.py` after edits.
Images live in `assets/img/products/<code>/` — `cover.jpg` plus `g1…g8.jpg`.

## Payments

`assets/js/config.js`:

- `payments.mode = "payment-link"` (current default): the order is captured and the shop
  emails a secure payment link / invoice. No card data touches the site.
- `payments.mode = "paypal"` + `paypalClientId`: PayPal Smart Buttons appear on the
  confirmation page and the bag total is charged (cards are accepted through PayPal too).
  Get the client ID at developer.paypal.com → Apps & Credentials (Live).
- `payments.mode = "paypal-me"` + `paypalMeHandle`: a PayPal.me link with the amount
  prefilled — no client ID needed, quickest way to start taking money online.
- `payments.mode = "stripe"` + `stripePaymentLink`: a fixed-price Payment Link. A Stripe
  Payment Link carries ONE price, so it only matches the bag when the customer buys that
  exact set; for a real cart total Stripe Checkout needs a small server function
  (Cloudflare Worker / Vercel) because this site is static.
- `bank`: the offline T/T account shown at checkout (same accounts as LI ELECTRIC).

Orders are stored in the customer's browser (`aurelle.orders.v1`) and are sent to
sales@lielectric.cn by the "Send order by email" / WhatsApp buttons on the confirmation
page. There is no server, so nothing is stored remotely — connect a form service or a
payment gateway when you want automatic order capture. With PayPal in live mode you also
receive the payment and the payer details in the PayPal dashboard.
