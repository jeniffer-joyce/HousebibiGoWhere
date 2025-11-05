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

        // ✅ CREATE STRIPE SESSION FIRST
        const session = await stripe.checkout.sessions.create(sessionConfig);

        // ✅ GROUP ITEMS BY SELLERID
        const itemsBySeller = {};
        items.forEach(item => {
          if (!itemsBySeller[item.sellerId]) {
            itemsBySeller[item.sellerId] = [];
          }
          itemsBySeller[item.sellerId].push(item);
        });

        // ✅ CREATE ORDERS FOR EACH SELLER
        const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, sellerItems]) => {
          // ✅ Validate sellerId is not empty
          if (!sellerId || sellerId === '') {
            throw new Error('Invalid sellerId encountered during order creation');
          }

          const productsTotalPrice = sellerItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

          const orderData = {
            orderId: '',
            uid: userId,
            sellerId: sellerId,
            sellerUsername: sellerItems[0].sellerUsername || '',
            shopName: sellerItems[0].shopName || 'Shop',
            products: sellerItems.map(item => ({
              productId: item.productId || '',
              sellerId: item.sellerId || '',
              item_name: item.item_name || item.name || 'Product',
              img_url: item.img_url || item.image || '',
              price: item.price || 0,
              quantity: item.quantity || 1,
              size: item.size || null,
              sizeIndex: item.sizeIndex !== null ? item.sizeIndex : null,
              sellerUsername: item.sellerUsername || '',
              shopName: item.shopName || '',
              totalPrice: (item.price || 0) * (item.quantity || 1)
            })),
            shippingAddress: {
              fullName: deliveryAddress.fullName || '',
              phoneNumber: deliveryAddress.phoneNumber || '',
              streetName: deliveryAddress.streetName || '',
              unitNumber: deliveryAddress.unitNumber || '',
              postalCode: deliveryAddress.postalCode || ''
            },
            totals: {
              productsTotalPrice: Number(productsTotalPrice.toFixed(2)),
              shippingFee: Number(shippingFee.toFixed(2)),
              grandTotal: Number((productsTotalPrice + shippingFee).toFixed(2))
            },
            payment: {
              method: 'card',
              transactionId: session.id,
              paidAt: admin.firestore.FieldValue.serverTimestamp()
            },
            status: 'to_ship',
            statusLog: [
              {
                status: 'to_pay',
                time: new Date(),
                by: 'system'
              },
              {
                status: 'to_ship',
                time: new Date(),
                by: 'system'
              }
            ],
            logistics: {
              shipper: null,
              trackingNumber: null,
              shippedAt: null,
              deliveredAt: null
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          const orderRef = await admin.firestore().collection("orders").add(orderData);
          
          // ✅ Update orderId field with the document ID
          await orderRef.update({ orderId: orderRef.id });

          console.log(`✅ Order created for seller ${sellerId}:`, orderRef.id);
          return orderRef.id;
        });

        // ✅ Wait for all orders to be created
        const orderIds = await Promise.all(orderPromises);
        console.log('✅ All orders created:', orderIds);

                // ✅ CLEAR PURCHASED ITEMS FROM CART
        try {
          const cartRef = admin.firestore().collection('carts').doc(userId);
          const cartSnap = await cartRef.get();

          if (cartSnap.exists) {
            const allItems = cartSnap.data().items || [];
            
            console.log('🔍 DEBUG - Current cart has', allItems.length, 'items');
            console.log('🔍 DEBUG - Purchased items count:', items.length);

            // Get all cartItemIds from checkout
            const purchasedItemIds = items
              .filter(item => item.cartItemId)
              .map(item => item.cartItemId);

            console.log('🔍 DEBUG - Purchased IDs:', purchasedItemIds);
            console.log('🔍 DEBUG - Cart IDs:', allItems.map(i => i.cartItemId));

            if (purchasedItemIds.length > 0) {
              // Filter out purchased items
              const remainingItems = allItems.filter(cartItem => {
                return !purchasedItemIds.includes(cartItem.cartItemId);
              });

              console.log('🔍 DEBUG - Remaining items after filter:', remainingItems.length);

              // Update cart
              await cartRef.update({
                items: remainingItems,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });

              console.log(`✅ Successfully removed ${purchasedItemIds.length} items from cart`);
            } else {
              console.warn('⚠️ No purchased item IDs found');
            }
          } else {
            console.warn('⚠️ Cart does not exist for user:', userId);
          }
        } catch (cartError) {
          console.error('❌ Error clearing cart:', cartError);
          // Don't fail the order if cart clearing fails
        }


        return res.status(200).json({
          sessionId: session.id,
          url: session.url,
          orderIds: orderIds
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
