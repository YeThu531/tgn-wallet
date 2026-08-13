import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAc-8EzwZcJvhouuk9Vkx6Ngj_hgjRMiKg",
  authDomain: "tgn-wallet.firebaseapp.com",
  projectId: "tgn-wallet",
  storageBucket: "tgn-wallet.firebasestorage.app",
  messagingSenderId: "347838161609",
  appId: "1:347838161609:web:27b90e794b383d0ddb2318",
  measurementId: "G-250N1M7FB4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

window.firebaseDB = db;
window.firebaseApp = app;
