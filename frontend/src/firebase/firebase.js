// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtUhpbHxWqowm8u9VrrrFsap8COTWpO38",
  authDomain: "ecommerce-16715.firebaseapp.com",
  projectId: "ecommerce-16715",
  storageBucket: "ecommerce-16715.firebasestorage.app",
  messagingSenderId: "417311536674",
  appId: "1:417311536674:web:35d6ee7efaa9a4dc3abc7b",
  measurementId: "G-K96XKD2GPB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);