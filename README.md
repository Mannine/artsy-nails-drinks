# Artsy Nails complimentary drink bar

Guests scan the existing QR sign, choose their technician and drink, and submit an order. Staff, menu choices, photos and styling are preserved in this security-release branch.

## Notification security

The prepared page sends validated order fields to a separate notification worker. The notification destination and provider credentials must never appear in this repository or browser JavaScript. The worker validates the menu, checks the bot token, applies atomic limits, and remembers completed requests so retries do not create duplicate orders.

The public connection values are the worker HTTPS order endpoint and the Turnstile site key in order-config.js. The notification topic is a server secret. The browser creates an anonymous local identifier for limits and keeps a pending request identifier in session storage for safe retries. It does not collect guest names or payment details.

## Release status

The security release connects to the replacement worker. Automatic ordering is temporarily paused while the receiving iPhone and desktop are reconnected and delivery is verified. The page directs guests to ask their technician and sends no order requests while orderingPaused is true. The worker also starts paused and independently blocks new orders.

Preserve the existing page and QR URL. Before enabling orders, complete real bot verification and device delivery testing, resume the worker, and set orderingPaused to false in a checked release. New orders are accepted daily from 7:00 a.m. until 7:30 p.m. Central. A worker pause does not silence the old notification channel; both receiving devices must unsubscribe from it.

The free notification option uses a long random topic name as a shared secret. Anyone who learns that name can read or publish to it. Account-based provider access control is a separate option; sending credentials alone do not make an unreserved topic private. Never copy a topic name into public code, documentation, screenshots, issue reports or browser responses.

## Checks

Run python tools/check-public-source.py before release. It rejects obvious notification credentials and incomplete connection settings without printing detected values. The included GitHub Actions check must be required by branch protection before it can prevent direct publication; a failing check alone does not stop legacy GitHub Pages publishing.

The page is served by GitHub Pages from main at the repository root. A push to main can publish immediately. Keep repairs on the review branch until the coordinated release is approved.
