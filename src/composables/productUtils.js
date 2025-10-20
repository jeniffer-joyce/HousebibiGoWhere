import { db } from '../firebase/firebase_config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Function to fetch orders and calculate total units sold for each product
export const getSellerProductsSortedBySales = async (businessUid) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', businessUid),
      orderBy('totalSales', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const products = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      products.push({
        productId: docSnap.id,
        quantity: data.totalSales || 0,
        name: data.item_name || 'Unknown Product',
        price: data.price || 0,
        imageUrl: data.img_url || '',
        ...data
      });
    });

    return products;
  } catch (error) {
    console.error('Error fetching seller products by sales:', error);
    return [];
  }
};