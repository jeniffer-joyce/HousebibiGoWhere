// Firebase Configuration and Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

//Below is for authetication, must set up authetication methods first and do the backend for
//login and signup
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth }; //add in auth later

// let currentCategory = null;

// // Load Categories from Firebase
// async function loadCategories() {
//   const container = document.getElementById("categories-container");
//   container.innerHTML = "<p class='text-gray-500 text-sm'>Loading categories...</p>";

//   try {
//     const q = query(collection(db, "button_categories"), orderBy("order"));
//     const querySnapshot = await getDocs(q);
//     container.innerHTML = "";

//     // Add "All" button
//     const allButton = document.createElement("button");
//     allButton.className = "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors";
//     allButton.textContent = "All";
//     allButton.dataset.slug = "all";
//     allButton.onclick = () => filterByCategory(null);
//     container.appendChild(allButton);

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       const button = document.createElement("button");
//       button.className = "rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 transition-colors";
//       button.textContent = data.name;
//       button.dataset.slug = data.slug;
//       button.onclick = () => filterByCategory(data.slug);
//       container.appendChild(button);
//     });
//   } catch (e) {
//     container.innerHTML = `<p class="text-red-500 text-sm">Error loading categories: ${e.message}</p>`;
//     console.error(e);
//   }
// }

// // Load Businesses from Firebase
// async function loadBusinesses(categorySlug = null) {
//   const container = document.getElementById("featured-businesses");
//   container.innerHTML = "<p class='text-gray-500'>Loading...</p>";

//   try {
//     const querySnapshot = await getDocs(collection(db, "businesses"));
//     container.innerHTML = "";

//     let hasResults = false;

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
      
//       // Filter by category if one is selected
//       if (categorySlug && data.category !== categorySlug) {
//         return;
//       }

//       hasResults = true;
//       container.innerHTML += `
//         <div class="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900">
//           <div class="h-40 w-full bg-slate-200 dark:bg-slate-800">
//             <img src="${data.image}" alt="${data.name}" class="h-full w-full object-cover object-center"/>
//           </div>
//           <div class="px-4 py-3">
//             <p class="text-base font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
//               ${data.name}
//             </p>
//           </div>
//         </div>
//       `;
//     });

//     if (!hasResults) {
//       container.innerHTML = "<p class='text-gray-500'>No businesses found in this category.</p>";
//     }
//   } catch (e) {
//     container.innerHTML = `<p class="text-red-500">Error loading data: ${e.message}</p>`;
//     console.error(e);
//   }
// }

// // Filter Businesses by Category
// function filterByCategory(slug) {
//   currentCategory = slug;
  
//   // Update button styles
//   const buttons = document.querySelectorAll("#categories-container button");
//   buttons.forEach(btn => {
//     if ((slug === null && btn.dataset.slug === "all") || btn.dataset.slug === slug) {
//       btn.className = "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors";
//     } else {
//       btn.className = "rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 transition-colors";
//     }
//   });
  
//   // Reload businesses with filter
//   loadBusinesses(slug);
// }

// // Initialize on page load
// window.addEventListener("DOMContentLoaded", () => {
//   loadCategories();
//   loadBusinesses();
// });