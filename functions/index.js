const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");


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
        // ✅ Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        // ✅ Get Stripe key securely at runtime
        const stripeKey = stripeSecretKey.value();
        if (!stripeKey) {
          console.error("STRIPE_SECRET_KEY not found");
          return res.status(500).json({ error: "Stripe not configured" });
        }

        const stripe = require("stripe")(stripeKey);

        // ✅ UNPACK PARAMETERS FROM REQUEST
        const { items, shippingFee, totalAmount, deliveryAddress, successUrl, cancelUrl, savedCard, metadata: clientMetadata } = req.body;

        // ✅ Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "Items are required" });
        }
        if (!deliveryAddress) {
          return res.status(400).json({ error: "Delivery address is required" });
        }

        // ✅ Validate prices, quantities, and IDs
        for (const item of items) {
          if (typeof item.price !== 'number' || item.price < 0) {
            return res.status(400).json({ error: `Invalid price for item ${item.item_name}` });
          }
          if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            return res.status(400).json({ error: `Invalid quantity for item ${item.item_name}` });
          }
          if (!item.sellerId) {
            return res.status(400).json({ error: "Item missing sellerId" });
          }
          if (!item.cartItemId) {
            return res.status(400).json({ error: "Item missing cartItemId" });
          }
        }

        // ✅ CREATE LIGHTWEIGHT METADATA (max 500 chars)
        const metadata = {
          itemCount: String(items.length),
          subtotal: (totalAmount - shippingFee).toFixed(2),
          total: totalAmount.toFixed(2),
          userId: userId,
          ...(clientMetadata && { ...clientMetadata })
        };

        console.log('📊 Metadata size:', JSON.stringify(metadata).length, 'chars');

        // ✅ Create line items with safe values
        const lineItems = items.map((item) => ({
          price_data: {
            currency: "sgd",
            product_data: {
              name: (item.item_name || item.name || 'Product') + (item.size ? ` (Size: ${item.size})` : ''),
              images: (item.img_url || item.image) ? [(item.img_url || item.image)] : [],
              metadata: {
                productId: item.productId || '',
                sellerId: item.sellerId || '',
                shopName: item.shopName || '',
                size: item.size || '',
                sizeIndex: item.sizeIndex !== null ? String(item.sizeIndex) : ''
              }
            },
            unit_amount: Math.round((item.price || 0) * 100),
          },
          quantity: item.quantity || 1,
        }));

        // ✅ Add shipping fee as a line item
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

        // ✅ SESSION CONFIG WITH LIGHTWEIGHT METADATA
        const sessionConfig = {
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: decodedToken.email || undefined,
          metadata: metadata,
          shipping_address_collection: {
            allowed_countries: ["SG"],
          },
          billing_address_collection: "required"
        };

        // ✅ CREATE STRIPE SESSION
        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log('✅ Stripe session created:', session.id);

        // ✅ RETURN SESSION DETAILS (NO ORDER CREATION)
        return res.status(200).json({
          sessionId: session.id,
          url: session.url
        });

      } catch (error) {
        console.error("❌ Error creating checkout session:", error);
        return res.status(500).json({ 
          error: error.message,
          code: error.code 
        });
      }
    });
  }
);



