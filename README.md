# Artsy Nails · Complimentary Drink Bar

A tiny mobile web app that lets manicure/pedicure guests at Artsy Nails (Pensacola, FL)
order their free drink from their phone. Guests scan a QR code, pick their nail tech,
pick a drink, and the salon gets an email with the order.

**Live site:** https://mannine.github.io/artsy-nails-drinks/

## How it works

1. Guest scans the QR sign ([qr-sign.html](qr-sign.html) — open it and hit Print).
2. Picks who's doing their nails: Natalia, Amalia, Anna, or Iasmym.
3. Picks a cold or hot drink (some drinks ask how many tsp of sugar).
4. The order arrives as an **instant push notification** via [ntfy.sh](https://ntfy.sh)
   (free, no account). Email notifications via [formsubmit.co](https://formsubmit.co)
   are built in but currently switched off — see `NOTIFY_EMAIL` below.

## Getting order notifications on a phone or PC

Orders are published to a private ntfy topic (see `NTFY_TOPIC` in `app.js`).
Anyone who should see orders just subscribes to that topic:

- **Phone:** install the free **ntfy** app ([App Store](https://apps.apple.com/us/app/ntfy/id1625396347) /
  [Google Play](https://play.google.com/store/apps/details?id=io.heckel.ntfy)), tap **+**,
  and enter the topic name exactly as it appears in `app.js`. Every order now pops up
  as a notification.
- **PC:** open [ntfy.sh/app](https://ntfy.sh/app), subscribe to the same topic, and allow
  browser notifications. Keep the tab pinned (or enable background notifications in the
  web app's settings) to get alerts while working in other tabs.

The topic name is the only "password" — anyone who knows it can read or post orders,
so don't share it beyond the salon. To rotate it, change `NTFY_TOPIC` in `app.js` and
re-subscribe on each device.

## Changing things

Everything configurable lives at the top of [app.js](app.js):

- **`NOTIFY_EMAIL`** — where order emails go. Currently `""` = email notifications off;
  set an address to turn them on. ⚠️ The first order sent to a new address triggers a
  one-time "Activate" email from formsubmit.co — click it once and all future orders
  arrive normally.
- **`NTFY_TOPIC`** — the ntfy.sh topic that phone/PC push notifications publish to.
- **`STAFF`** — names, titles, and photos (photos live in `img/`).
- **`DRINKS`** — the cold and hot menus. Add/remove lines to change the menu.
- **`RESET_AFTER_SECONDS`** — how long the thank-you screen stays before resetting.

## Deploying

Hosted on GitHub Pages from this repo (`main` branch, root folder).
Push to `main` and the site updates in about a minute — no build step.
