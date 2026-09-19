require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe needs the raw body for webhook signature verification,
// so the webhook route is registered BEFORE express.json().
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
const allItems = {};
catalog.pets.forEach(p => (allItems[p.id] = p));
catalog.food.forEach(f => (allItems[f.id] = f));

app.use(cors());

// ---------- Stripe webhook (raw body, must come before express.json) ----------
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // This is where you'd mark an order paid in a real database,
    // email the buyer, notify the seller, etc.
    console.log('✅ Payment completed for session:', session.id, session.customer_email);
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API: full catalog ----------
app.get('/api/products', (req, res) => {
  res.json(catalog);
});

// ---------- API: create a real Stripe Checkout session ----------
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment variables.'
      });
    }

    const { cart } = req.body; // { itemId: quantity, ... }
    if (!cart || Object.keys(cart).length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const line_items = Object.entries(cart).map(([id, qty]) => {
      const item = allItems[id];
      if (!item) throw new Error(`Unknown item: ${id}`);
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: item.name, description: item.description },
          unit_amount: Math.round(item.price * 100) // Stripe uses cents
        },
        quantity: qty
      };
    });

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: { allowed_countries: ['US'] },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Happy Paws Market running on port ${PORT}`);
});
