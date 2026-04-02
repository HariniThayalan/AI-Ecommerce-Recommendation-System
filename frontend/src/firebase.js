import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtUhpbHxWqowm8u9VrrrFsap8COTWpO38",
  authDomain: "ecommerce-16715.firebaseapp.com",
  projectId: "ecommerce-16715",
  storageBucket: "ecommerce-16715.appspot.com",
  messagingSenderId: "417311536674",
  appId: "1:417311536674:web:35d6ee7efaa9a4dc3abc7b",
  measurementId: "G-K96XKD2GPB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;