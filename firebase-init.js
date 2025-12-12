// firebase-init.js

// 1. Import modul yang dibutuhkan dari Firebase SDK (v12.6.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-app.js";
// Import Cloud Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-firestore.js";


const firebaseConfig = {
    // GANTI NILAI INI DENGAN KONFIGURASI PROYEK FIREBASE ANDA
    apiKey: "AIzaSyDK0A-poPW1tOmi3d092fpabElu7JQgjKs", 
    authDomain: "database-imunisasi.firebaseapp.com",
    projectId: "database-imunisasi",
    storageBucket: "database-imunisasi.firebasestorage.app",
    messagingSenderId: "897733986732", 
    appId: "1:897733986732:web:e2f402007e5f6678601209",
    measurementId: "G-KFXGT89T5R" 
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Inisialisasi Cloud Firestore dan eksport objek 'db' untuk digunakan di script.js
export const db = getFirestore(app);

// Catatan: Variabel 'db' sekarang adalah instance Cloud Firestore
