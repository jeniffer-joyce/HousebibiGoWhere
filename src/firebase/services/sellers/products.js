// src/firebase/services/sellers/products.js
import { db } from '../../firebase_config.js';
import { collection, query, getDocs, doc, getDoc, addDoc , where} from "firebase/firestore";

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
    console.log('🔍 Looking for seller with UID:', sellerID);
    
    // Query by uid field instead of document ID
    const q = query(collection(db, "businesses"), where("uid", "==", sellerID));
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Query results - Found docs:', querySnapshot.size);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const sellerData = { id: docSnap.id, ...docSnap.data() };
      console.log('✅ Seller found:', sellerData);
      console.log('🖼️ Seller profilePic:', sellerData.profilePic);
      return sellerData;
    }
    
    console.log('❌ No seller found with UID:', sellerID);
    return null;
  } catch (error) {
    console.error('❌ Error loading seller info:', error);
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