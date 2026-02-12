// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDK0A-poPW1tOmi3d092fpabElu7JQgjKs",
    authDomain: "database-imunisasi.firebaseapp.com",
    databaseURL: "https://database-imunisasi-default-rtdb.firebaseio.com/", // Sudah disesuaikan
    projectId: "database-imunisasi",
    storageBucket: "database-imunisasi.firebasestorage.app",
    messagingSenderId: "897733986732",
    appId: "1:897733986732:web:e2f402007e5f6678601209",
    measurementId: "G-KFXGT89T5R"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
