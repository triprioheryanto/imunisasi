// firebase-init.js

// Import modul yang dibutuhkan dari Firebase SDK (v12.6.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDK0A-poPW1tOmi3d092fpabElu7JQgjKs", // API Key Anda 
    authDomain: "database-imunisasi.firebaseapp.com", // 
    projectId: "database-imunisasi", // 
    storageBucket: "database-imunisasi.firebasestorage.app", // 
    messagingSenderId: "897733986732", // 
    appId: "1:897733986732:web:e2f402007e5f6678601209", // 
    measurementId: "G-KFXGT89T5R" // 
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Inisialisasi Realtime Database dan eksport objek 'db'
export const db = getDatabase(app);