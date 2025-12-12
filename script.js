// script.js

// Import instance 'db' dari firebase-init.js
import { db } from './firebase-init.js';
// Import fungsi-fungsi Cloud Firestore yang dibutuhkan
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-firestore.js";


// ===== Global settings dan Collection Keys (Menggantikan Local Storage Keys) =====
let lastImunFile = null;
let lastBiasFile = null;
const IMUN_COLLECTION_NAME = 'imunReports'; // Nama Koleksi Firestore untuk Imunisasi
const BIAS_COLLECTION_NAME = 'biasReports'; // Nama Koleksi Firestore untuk BIAS
let sessionImportedFiles = new Set(); 

// Data-data konstanta yang mungkin sudah ada di script.js Anda
const BIAS_VACCINES = ['MR', 'DT', 'Td', 'HPV'];
const IMUN_VACCINES = ['BCG', 'POLIO-1', 'POLIO-2', 'POLIO-3', 'POLIO-4', 'DPT-HB-HIB-1', 'DPT-HB-HIB-2', 'DPT-HB-HIB-3', 'CAMPAK/MR'];
const SCHOOL_DATA = {
    'SD NEGERI MELATA': 'SD', 'SD NEGERI NANUAH': 'SD', 'SD NEGERI TOPALAN': 'SD', 
    'SD NEGERI BATU AMPAR': 'SD', 'SD NEGERI LUBUK HIJU': 'SD', 'SD NEGERI BUKIT MAKMUR': 'SD',
    'SD NEGERI BUKIT RAYA': 'SD', 'SD NEGERI MODANG MAS': 'SD', 'SD NEGERI MUKTI MANUNGGAL': 'SD',
    'SD NEGERI SUMBER JAYA': 'SD', 'SD NEGERI BUKIT HARUM': 'SD', 'SDS TSA': 'SD', 
    'MIS RAUDHATUL ULUM': 'SD', 
    'SMP NEGERI 1 MENTHOBI RAYA': 'SMP', 'SMP NEGERI 2 MENTHOBI RAYA': 'SMP', 
    'SMP NEGERI 3 MENTHOBI RAYA': 'SMP', 'MTSS RAUDHATUL ULUM': 'SMP'
};
// =========================================================================


// =========================================================================
// FIREBASE FIRESTORE DATA FUNCTIONS
// =========================================================================

/**
 * Menyimpan data laporan ke Firestore.
 * @param {string} collectionName - Nama koleksi Firestore.
 * @param {object} data - Objek data laporan.
 */
async function saveReportToFirestore(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            timestamp: new Date().toISOString() // Tambahkan timestamp
        });
        showAlert(`Data berhasil disimpan secara online dengan ID: ${docRef.id}`, 'success');
        return true;
    } catch (error) {
        console.error(`Error menyimpan data ke ${collectionName}: `, error);
        showAlert(`Gagal menyimpan data ke Firestore: ${error.message}`, 'danger');
        return false;
    }
}

/**
 * Mengambil semua data laporan dari Firestore.
 * @param {string} collectionName - Nama koleksi Firestore.
 * @returns {Array} - Array objek laporan.
 */
async function loadReportsFromFirestore(collectionName) {
    const reports = [];
    try {
        // Kueri: Ambil semua dokumen, diurutkan berdasarkan bulan, kemudian ID (misalnya)
        const q = query(collection(db, collectionName), orderBy("bulan"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            // Mengambil ID dokumen dan data. ID dokumen penting untuk fungsi Hapus/Ekspor.
            reports.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Berhasil memuat ${reports.length} laporan dari ${collectionName}.`);
        return reports;
    } catch (error) {
        console.error(`Error memuat data dari ${collectionName}: `, error);
        showAlert(`Gagal memuat data dari Firestore: ${error.message}. Periksa koneksi atau rules Anda.`, 'danger');
        return [];
    }
}

/**
 * Menghapus dokumen laporan dari Firestore.
 * @param {string} collectionName - Nama koleksi Firestore.
 * @param {string} docId - ID Dokumen Firestore yang akan dihapus.
 */
async function deleteReportFromFirestore(collectionName, docId) {
    try {
        await deleteDoc(doc(db, collectionName, docId));
        showAlert(`Laporan dengan ID ${docId} berhasil dihapus dari Firestore.`, 'info');
        // Muat ulang data setelah penghapusan berhasil
        await loadReports();
    } catch (error) {
        console.error("Error saat menghapus dokumen: ", error);
        showAlert(`Gagal menghapus data dari Firestore: ${error.message}`, 'danger');
    }
}

// =========================================================================
// CORE APPLICATION LOGIC (Diperbarui untuk Asinkron)
// =========================================================================

let imunReports = [];
let biasReports = [];

/**
 * Fungsi utama untuk memuat data saat aplikasi dibuka/diperbarui.
 */
async function loadReports() {
    // Muat data Imunisasi
    imunReports = await loadReportsFromFirestore(IMUN_COLLECTION_NAME);
    // Muat data BIAS
    biasReports = await loadReportsFromFirestore(BIAS_COLLECTION_NAME);
    
    // Setelah data dimuat, generate laporan kumulatif
    generateKumulatifReport(); 
    // Muat ulang tabel ekspor untuk menampilkan data baru
    populateExportTables(); 
}

/**
 * Menyimpan data laporan (dipanggil dari form handler).
 * @param {string} reportType - 'imun' atau 'bias'.
 * @param {object} data - Data laporan dari form.
 */
async function saveReport(reportType, data) {
    const collectionName = reportType === 'imun' ? IMUN_COLLECTION_NAME : BIAS_COLLECTION_NAME;
    
    // Memanggil fungsi penyimpanan Firestore
    const success = await saveReportToFirestore(collectionName, data);
    
    if (success) {
        // Muat ulang semua data dan update tampilan setelah penyimpanan berhasil
        await loadReports();
    }
}

/**
 * Menghapus laporan berdasarkan ID.
 * Fungsi ini harus dipanggil dari tabel ekspor/daftar laporan.
 */
function confirmDeleteReport(reportType, docId) {
    const collectionName = reportType === 'imun' ? IMUN_COLLECTION_NAME : BIAS_COLLECTION_NAME;
    if (confirm(`Anda yakin ingin menghapus laporan ID ${docId}? Tindakan ini tidak dapat dibatalkan.`)) {
        deleteReportFromFirestore(collectionName, docId);
    }
}


// =========================================================================
// UI AND UTILITY FUNCTIONS (Diasumsikan sudah ada di kode Anda)
// =========================================================================

// --- [ BAGIAN UNTUK MENGAMBIL DATA DARI FORM ] ---
// (Anda harus memastikan fungsi-fungsi ini memanggil saveReport(type, data))

function handleImunFormSubmit(event) {
    event.preventDefault();
    // ... Logika pengambilan data dari form imunisasi ...
    const data = {
        bulan: document.getElementById('imun-bulan').value,
        // ... ambil field lain (Tgl Laporan, Kecamatan, Desa, dll)
        BCG_L: parseInt(document.getElementById('imun-BCG-L').value) || 0,
        BCG_P: parseInt(document.getElementById('imun-BCG-P').value) || 0,
        // ... (data vaksin lainnya)
    };
    saveReport('imun', data);
}

function handleBiasFormSubmit(event) {
    event.preventDefault();
    // ... Logika pengambilan data dari form bias ...
    const data = {
        bulan: document.getElementById('bias-bulan').value,
        sekolah: document.getElementById('bias-sekolah').value,
        // ... ambil field lain
        MR_L: parseInt(document.getElementById('bias-MR-L').value) || 0,
        MR_P: parseInt(document.getElementById('bias-MR-P').value) || 0,
        // ... (data vaksin lainnya)
    };
    saveReport('bias', data);
}


// --- [ FUNGSI UNTUK GENERATE LAPORAN KUMULATIF ] ---
// Fungsi ini tetap sama, hanya sekarang ia menggunakan variabel global imunReports dan biasReports yang sudah diisi dari Firestore

function generateKumulatifReport() {
    // Logika perhitungan kumulatif (penjumlahan data per bulan/vaksin)
    // ... (Logika kumulatif Anda yang kompleks di sini) ...
    
    // --- Contoh sederhana untuk menguji data terload ---
    if (imunReports.length > 0) {
        document.getElementById('kumulatif-imun-count').textContent = `Total Imunisasi: ${imunReports.length} Laporan.`;
    } else {
        document.getElementById('kumulatif-imun-count').textContent = `Total Imunisasi: 0 Laporan.`;
    }
    // ... dan seterusnya untuk BIAS dan tabel-tabel detail lainnya
}

// --- [ FUNGSI UTILITY LAINNYA ] ---

function showAlert(message, type) {
    const alertBox = document.getElementById('app-alerts');
    alertBox.innerHTML = `<div class="alert-box alert-${type}">${message}</div>`;
    setTimeout(() => alertBox.innerHTML = '', 7000);
}

// Fungsi untuk mengisi data ke tabel ekspor (memerlukan struktur data dengan properti 'id')
function populateExportTables() {
    // Pastikan Anda memodifikasi fungsi ini untuk menggunakan properti 'id' yang berasal dari Firestore, 
    // misalnya untuk tombol hapus: onclick="confirmDeleteReport('imun', '${report.id}')"
    // ... (Logika populate tabel ekspor Anda di sini) ...
}

// --- [ INI ADALAH ENTRY POINT APLIKASI ] ---
// Panggil loadReports() secara asinkron saat aplikasi dimuat.

window.onload = async () => {
    // Atur handler submit form
    const imunForm = document.getElementById('imun-form');
    if (imunForm) imunForm.addEventListener('submit', handleImunFormSubmit);

    const biasForm = document.getElementById('bias-form');
    if (biasForm) biasForm.addEventListener('submit', handleBiasFormSubmit);

    // Muat data dari Firestore
    await loadReports();
    
    // Tampilkan tab Kumulatif secara default (atau sesuai preferensi)
    showTab('kumulatif');
};

// ... (Fungsi-fungsi lain: showTab, setupDatePicker, exportToCSV, importFromJSON)
