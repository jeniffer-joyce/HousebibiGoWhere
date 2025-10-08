import { db } from '../../firebase_config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getBusinesses() {
  const querySnapshot = await getDocs(collection(db, "businesses"));
  const businesses = [];
  querySnapshot.forEach((doc) => {
    businesses.push(doc.data());
  });

  return businesses;
}