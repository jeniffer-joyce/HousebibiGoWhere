// src/firebase/services/sellers/products.js
import { db } from '../../firebase_config.js';
import { collection, query, getDocs, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getSellerProducts(sellerID) {
  console.log('🔍 Loading products from Firestore...');
  
  try {
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    
    console.log('✅ Found', querySnapshot.size, 'products in Firestore');
    
    const products = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      products.push({
        id: docSnap.id,
        type: 'product',
        name: data.item_name,
        item_name: data.item_name,
        category: data.category,
        price: data.price,
        availability: data.availability,
        quantity: data.quantity,
        size: data.size,
        description: data.description,
        img: data.img_url,
        img_url: data.img_url,
        images: data.images || null,
        sellerName: data.sellerName,
        sellerID: data.sellerId,
        createdAt: data.createdAt
      });
    });
    
    console.log('📦 Loaded products:', products);
    return products;
    
  } catch (error) {
    console.error('❌ Error loading products:', error);
    throw error;
  }
}

export async function getSellerInfo(sellerID) {
  try {
    const docRef = doc(db, "sellers", sellerID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error loading seller info:', error);
    throw error;
  }
}

export async function createProduct(productData) {
  console.log('📝 Creating new product in Firestore...');
  
  try {
    const docRef = await addDoc(collection(db, "products"), productData);
    console.log('✅ Product created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
}