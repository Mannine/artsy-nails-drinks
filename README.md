# Artsy Nails · Complimentary Drink Bar

A tiny mobile web app that lets manicure/pedicure guests at Artsy Nails (Pensacola, FL)
order their free drink from their phone. Guests scan a QR code, pick their nail tech,
pick a drink, and the salon gets an email with the order.

**Live site:** https://mannine.github.io/artsy-drinks/

## How it works

1. Guest scans the QR sign ([qr-sign.html](qr-sign.html) — open it and hit Print).
2. Picks who's doing their nails: Natalia, Amalia, Anna, or Iasmym.
3. Picks a cold or hot drink, optionally adds their first name.
4. The order is emailed via [formsubmit.co](https://formsubmit.co) (free, no account) with
   drink, hot/cold, nail tech, customer name, and time.

## Changing things

Everything configurable lives at the top of [app.js](app.js):

- **`NOTIFY_EMAIL`** — where order emails go. ⚠️ The first order sent to a new address
  triggers a one-time "Activate" email from formsubmit.co — click it once and all
  future orders arrive normally.
- **`STAFF`** — names, titles, and photos (photos live in `img/`).
- **`DRINKS`** — the cold and hot menus. Add/remove lines to change the menu.
- **`RESET_AFTER_SECONDS`** — how long the thank-you screen stays before resetting.

## Deploying

Hosted on GitHub Pages from this repo (`main` branch, root folder).
Push to `main` and the site updates in about a minute — no build step.
