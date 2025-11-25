// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEqE9kULaPJaK8oP0NfO2AvQn82dhKyX0",
    authDomain: "mygamelist-3c79d.firebaseapp.com",
    projectId: "mygamelist-3c79d",
    storageBucket: "mygamelist-3c79d.firebasestorage.app",
    messagingSenderId: "996800517153",
    appId: "1:996800517153:web:6b0c2cdbed020c74c73f60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
