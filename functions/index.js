const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

// Define the secret for Stripe
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Create Stripe Checkout Session
exports.createCheckoutSession = onRequest(
  {
    secrets: [stripeSecretKey],
    cors: true,
  },
  async (req, res) => {
    return cors(req, res, async () => {
      // Only allow POST
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      try {
        // Verify authentication (for callable, you use context.auth; in HTTPS, check Bearer)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        const userId = decodedToken.uid;

        // Get Stripe key securely at runtime
        const stripeKey = stripeSecretKey.value();
        if (!stripeKey) {
          console.error("STRIPE_SECRET_KEY not found");
          return res.status(500).json({ error: "Stripe not configured" });
        }

        const stripe = require("stripe")(stripeKey);

        // Unpack parameters
        const { items, shippingFee, totalAmount, deliveryAddress, successUrl, cancelUrl, savedCard } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "Items are required" });
        }
        if (!deliveryAddress) {
          return res.status(400).json({ error: "Delivery address is required" });
        }

        // Create line items as in your update
        const lineItems = items.map((item) => ({
          price_data: {
            currency: "sgd",
            product_data: {
              name: item.name + (item.size ? ` (Size: ${item.size})` : ''),
              images: item.image ? [item.image] : [],
              metadata: {
                productId: item.productId,
                sellerId: item.sellerId,
                shopName: item.shopName || '',
                size: item.size || '',
                sizeIndex: item.sizeIndex !== null ? String(item.sizeIndex) : ''
              }
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        // Add shipping fee as a line item
        if (shippingFee && shippingFee > 0) {
          lineItems.push({
            price_data: {
              currency: "sgd",
              product_data: {
                name: "Shipping Fee",
                description: "Standard delivery"
              },
              unit_amount: Math.round(shippingFee * 100),
            },
            quantity: 1,
          });
        }

        // Session config
        const sessionConfig = {
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: decodedToken.email || undefined,
          metadata: {
            userId,
            items: JSON.stringify(items.map(item => ({
              productId: item.productId,
              sellerId: item.sellerId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              sizeIndex: item.sizeIndex,
              shopName: item.shopName
            }))),
            shippingFee: shippingFee?.toString() || '0',
            totalAmount: totalAmount?.toString() || '0',
            deliveryAddress: JSON.stringify(deliveryAddress || {}),
          },
          shipping_address_collection: {
            allowed_countries: ["SG"],
          },
          billing_address_collection: "required"
        };

        // Saved card logic, if used (see your current logic, simplified as per HTTPS)
        if (savedCard) {
          // ... (Optionally re-implement as in your update if needed)
          // For security, generally do not process raw card data on backend
        }

        // Create session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        return res.status(200).json({
          sessionId: session.id,
          url: session.url,
        });

      } catch (error) {
        console.error("Error creating checkout session:", error);
        return res.status(500).json({ error: error.message });
      }
    });
  }
);
