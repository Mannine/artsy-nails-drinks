# Artsy Nails complimentary drink bar

Guests scan the existing QR sign, choose their technician and drink, and submit an order. Staff, menu choices, photos and styling are preserved in this security-release branch.

## Notification security

The prepared page sends validated order fields to a separate notification worker. The notification destination and provider credentials must never appear in this repository or browser JavaScript. The worker validates the menu, checks the bot token, applies atomic limits, and remembers completed requests so retries do not create duplicate orders.

The only public connection values are the worker HTTPS order endpoint and the Turnstile site key in order-config.js. The browser creates an anonymous local identifier for limits and keeps a pending request identifier in session storage for safe retries. It does not collect guest names or payment details.

## Release status

This branch is preparation only. Connection values are intentionally empty until the worker, bot configuration and replacement notification route are verified. Empty settings show the existing ask-your-technician fallback. Do not publish the incomplete branch over the working site.

A coordinated release must preserve the existing page and QR URL. Verify the replacement worker in a separate staging environment, configure the public connection values, pass source checks, then coordinate device subscriptions and publication during the approved quiet period. A worker pause does not silence the old direct notification channel; that channel needs its own device cutover.

## Checks

Run python tools/check-public-source.py before release. It rejects obvious notification credentials and incomplete connection settings without printing detected values. The included GitHub Actions check must be required by branch protection before it can prevent direct publication; a failing check alone does not stop legacy GitHub Pages publishing.

The page is served by GitHub Pages from main at the repository root. A push to main can publish immediately. Keep repairs on the review branch until the coordinated release is approved.
