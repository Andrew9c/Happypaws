# Happy Paws

A real, working pet marketplace: Node.js + Express backend, a plain HTML/CSS/JS
storefront, and **real Stripe Checkout** for payment — not a demo. Prices are
U.S. market averages for each animal and food item (see the note at the top
of `products.json`).

## What's actually "real" here

- The catalog (`products.json`) is served by a live API endpoint, not baked
  into the page.
- "Check out" creates a genuine Stripe Checkout Session and redirects the
  buyer to Stripe's own secure, hosted payment page — real card processing,
  once you add your own Stripe keys.
- A webhook endpoint (`/api/webhook`) is wired up so you can confirm and
  fulfill paid orders.

What it does **not** include yet: a database to store orders long-term
(a paid order just logs to the console right now), user accounts, and
seller payouts if other people will list animals too.

## Deploying

1. Push all files to GitHub, matching the folder structure exactly
   (`public/` holds the frontend files, everything else is at the root).
2. Sign up at stripe.com, grab your Secret key from Developers → API keys.
3. On render.com: New → Web Service → connect this repo → Build command
   `npm install` → Start command `npm start` → add `STRIPE_SECRET_KEY`
   under Environment.
4. Test with card `4242 4242 4242 4242`, any future expiry, any CVC.

## About the prices

`products.json` uses researched U.S. averages for each breed/species and
common retail food prices. Real prices vary by breeder, region, and season —
treat these as a starting point and adjust before taking real orders.

## Selling live animals is regulated

If you're actually selling live animals across state lines in the U.S.,
you'll likely need a USDA APHIS license and to follow your state's pet
dealer and animal welfare rules — confirm with your state's department of
agriculture before going live.
