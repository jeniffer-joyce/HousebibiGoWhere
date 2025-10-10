import { db } from '../../firebase_config.js';
import { collection, getDocs } from "firebase/firestore";

export async function getBusinesses() {
  const querySnapshot = await getDocs(collection(db, "businesses"));
  const businesses = [];
  querySnapshot.forEach((doc) => {
    businesses.push(doc.data());
  });

  return businesses;
}