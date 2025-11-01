const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

if (!admin.apps.length) {
  admin.initializeApp();
}

// Define the secret
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Create Stripe Checkout Session
exports.createCheckoutSession = onRequest(
  {
    secrets: [stripeSecretKey],
    cors: true,
  },
  (req, res) => {
    return cors(req, res, async () => {
      // Only allow POST
      if (req.method !== "POST") {
        return res.status(405).json({error: "Method not allowed"});
      }

      try {
        // Get auth token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({error: "Unauthorized"});
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        // Initialize Stripe with secret
        const stripeKey = stripeSecretKey.value();
        if (!stripeKey) {
          console.error("STRIPE_SECRET_KEY not found");
          return res.status(500).json({error: "Stripe not configured"});
        }

        const stripe = require("stripe")(stripeKey);

        const {items, successUrl, cancelUrl} = req.body;

        const lineItems = items.map((item) => ({
          price_data: {
            currency: "sgd",
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          client_reference_id: userId,
          metadata: {userId},
        });

        return res.status(200).json({
          sessionId: session.id,
          url: session.url,
        });
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({error: error.message});
      }
    });
  },
);