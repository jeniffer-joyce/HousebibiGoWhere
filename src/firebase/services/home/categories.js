import { db } from '../../firebase_config.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function getCategories() {
  const q = query(collection(db, "button_categories"), orderBy("order"));
  const querySnapshot = await getDocs(q);

  const categories = [];
  querySnapshot.forEach((doc) => {
    categories.push(doc.data());
  });

  return categories;
}