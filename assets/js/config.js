/* AURELLE storefront configuration.
   Everything an owner may need to change lives here. No other file needs editing. */

window.AURELLE_CONFIG = {
  // Canonical domain used by canonical tags, hreflang and sitemap.xml.
  baseUrl: "https://aurelle.com.cn",

  email: "sales@lielectric.cn",
  phone: "+86-13362952925",
  whatsapp: "8613362952925",       // digits only, used for wa.me links

  currency: "USD",

  /* Online payment — choose ONE mode and fill in the field it needs.
       "payment-link" : order is placed, we email a secure payment link / invoice (default)
       "paypal"       : PayPal Smart Buttons on the confirmation page, amount from the bag
       "paypal-me"    : PayPal.me link with the amount prefilled (no client ID needed)
       "stripe"       : fixed-price Stripe Payment Link — a link carries ONE price, so it only
                        fits a single set; see README for the card alternative.
     Nothing is charged until the customer pays; no card data ever touches this site. */
  payments: {
    mode: "paypal",
    paypalClientId: "BAASjcdNimP4w0osGtjXs_kZfstGDEFZQpKLqDGWHQeamwsPmKJ6bXxscj4boolw4D-ShzSYmY5u0KmDGs",
    paypalMeHandle: "",        // PayPal.me: your handle, e.g. "aurelle" -> paypal.me/aurelle
    stripePaymentLink: "",     // Stripe: https://buy.stripe.com/...
    payNowLabel: ""            // optional button text override
  },

  /* Offline payment — same accounts as JINHUA LI ELECTRIC TRADING CO., LTD */
  bank: {
    beneficiary: "JINHUA LI ELECTRIC TRADING CO., LTD",
    bankName: "BANK OF CHINA JINHUA BRANCH, JINDONG SUB-BRANCH",
    swift: "BKCHCNBJ92H",
    accounts: { USD: "392284749260", EUR: "390984762597" },
    address: "NO.183 4th floor, Jinou Road, Dongxiao Street, Jindong District, Jinhua, Zhejiang, China"
  },

  // Shipping is quoted per order; set a flat amount here if you ever want one.
  shipping: { mode: "quoted", flat: 0 }
};
