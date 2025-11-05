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
        // Verify authentication
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

        // ✅ UNPACK PARAMETERS FROM REQUEST
        const { items, shippingFee, totalAmount, deliveryAddress, successUrl, cancelUrl, savedCard, metadata: clientMetadata } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "Items are required" });
        }
        if (!deliveryAddress) {
          return res.status(400).json({ error: "Delivery address is required" });
        }

        // ✅ CREATE LIGHTWEIGHT METADATA (max 500 chars)
        const metadata = {
          itemCount: String(items.length),
          subtotal: (totalAmount - shippingFee).toFixed(2),
          total: totalAmount.toFixed(2),
          userId: userId,
          // Only add essential info that won't exceed character limit
          ...(clientMetadata && { ...clientMetadata })
        };

        console.log('📊 Metadata size:', JSON.stringify(metadata).length, 'chars');

        // Create line items
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

        // ✅ SESSION CONFIG WITH LIGHTWEIGHT METADATA
        const sessionConfig = {
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: decodedToken.email || undefined,
          metadata: metadata, // ✅ USE LIGHTWEIGHT METADATA HERE
          shipping_address_collection: {
            allowed_countries: ["SG"],
          },
          billing_address_collection: "required"
        };

        // Save order details to Firestore for later retrieval
        // (In case you need full item details beyond metadata)
        const orderRef = await admin.firestore().collection("orders").add({
          userId: userId,
          items: items,
          shippingFee: shippingFee,
          totalAmount: totalAmount,
          deliveryAddress: deliveryAddress,
          savedCard: savedCard || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending", // Will be updated when payment succeeds
          stripeSessionId: null // Will be updated after session creation
        });

        // Create session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        // ✅ UPDATE ORDER WITH SESSION ID
        await orderRef.update({
          stripeSessionId: session.id
        });

        console.log('✅ Checkout session created:', session.id);

        return res.status(200).json({
          sessionId: session.id,
          url: session.url,
        });

      } catch (error) {
        console.error("❌ Error creating checkout session:", error);
        return res.status(500).json({ error: error.message });
      }
    });
  }
);
