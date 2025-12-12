// script.js

// =========================================================================
// FIREBASE IMPORTS
// =========================================================================
import { db } from './firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-firestore.js";


// =========================================================================
// GLOBAL SETTINGS & DATA KONSTANTA
// =========================================================================
let lastImunFile = null;
let lastBiasFile = null;
// Keys kini berfungsi sebagai nama Koleksi di Firestore
const IMUN_COLLECTION_NAME = 'imunReports'; 
const BIAS_COLLECTION_NAME = 'biasReports'; 
let sessionImportedFiles = new Set(); 

// Data Vaksin dan Sekolah (diambil dari snippet Anda)
const IMUN_VACCINES = ['BCG', 'POLIO-1', 'POLIO-2', 'POLIO-3', 'POLIO-4', 'DPT-HB-HIB-1', 'DPT-HB-HIB-2', 'DPT-HB-HIB-3', 'CAMPAK/MR'];
const BIAS_VACCINES = ['MR', 'DT', 'Td', 'HPV'];
const SCHOOL_DATA = {
    'SD NEGERI MELATA': 'SD', 'SD NEGERI NANUAH': 'SD', 'SD NEGERI TOPALAN': 'SD', 
    'SD NEGERI BATU AMPAR': 'SD', 'SD NEGERI LUBUK HIJU': 'SD', 'SD NEGERI BUKIT MAKMUR': 'SD',
    'SD NEGERI BUKIT RAYA': 'SD', 'SD NEGERI MODANG MAS': 'SD', 'SD NEGERI MUKTI MANUNGGAL': 'SD',
    'SD NEGERI SUMBER JAYA': 'SD', 'SD NEGERI BUKIT HARUM': 'SD', 'SDS TSA': 'SD',
    'MIS RAUDHATUL ULUM': 'SD', 
    'SMP NEGERI 1 MENTHOBI RAYA': 'SMP', 'SMP NEGERI 2 MENTHOBI RAYA': 'SMP', 
    'SMP NEGERI 3 MENTHOBI RAYA': 'SMP', 'MTSS RAUDHATUL ULUM': 'SMP'
};

// Variabel untuk menyimpan data yang dimuat dari Firestore
let imunReports = [];
let biasReports = [];

// =========================================================================
// FIREBASE FIRESTORE DATA FUNCTIONS (SINKRONISASI ONLINE)
// =========================================================================

/**
 * Menyimpan data laporan baru ke Firestore (Fungsi SINKRONISASI WRITE).
 * @param {string} collectionName - Nama koleksi Firestore.
 * @param {object} data - Objek data laporan.
 */
async function saveReportToFirestore(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            timestamp: new Date().toISOString() // Simpan waktu pengiriman
        });
        showAlert(`Laporan berhasil **dikirim** secara online. ID Dokumen: ${docRef.id}`, 'success');
        return true;
    } catch (error) {
        console.error(`Error menyimpan data ke ${collectionName}: `, error);
        showAlert(`Gagal mengirim data ke Firestore: ${error.message}. Periksa koneksi dan Firebase Rules Anda.`, 'danger');
        return false;
    }
}

/**
 * Mengambil semua data laporan dari Firestore (Fungsi SINKRONISASI READ).
 * @param {string} collectionName - Nama koleksi Firestore.
 * @returns {Array} - Array objek laporan.
 */
async function loadReportsFromFirestore(collectionName) {
    const reports = [];
    try {
        // Mengambil semua dokumen, diurutkan berdasarkan bulan atau tanggal laporan
        const q = query(collection(db, collectionName), orderBy("bulan")); // Asumsi field 'bulan' ada
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            // Menambahkan ID dokumen (doc.id) ke dalam objek data
            reports.push({ id: doc.id, ...doc.data() });
        });
        
        return reports;
    } catch (error) {
        console.error(`Error memuat data dari ${collectionName}: `, error);
        showAlert(`Gagal memuat data dari Firestore: ${error.message}.`, 'danger');
        return [];
    }
}

/**
 * Menghapus dokumen laporan dari Firestore.
 */
async function deleteReportFromFirestore(collectionName, docId) {
    try {
        await deleteDoc(doc(db, collectionName, docId));
        showAlert(`Laporan ID ${docId} berhasil dihapus dari online.`, 'info');
        // Muat ulang data setelah penghapusan
        await loadReports();
    } catch (error) {
        console.error("Error saat menghapus dokumen: ", error);
        showAlert(`Gagal menghapus data dari Firestore: ${error.message}`, 'danger');
    }
}

// =========================================================================
// CORE APPLICATION LOGIC (MENGGUNAKAN DATA ONLINE)
// =========================================================================

/**
 * Fungsi utama untuk memuat data online saat aplikasi dibuka/diperbarui.
 */
async function loadReports() {
    // Memuat data secara asinkron
    imunReports = await loadReportsFromFirestore(IMUN_COLLECTION_NAME);
    biasReports = await loadReportsFromFirestore(BIAS_COLLECTION_NAME);
    
    // Setelah data dimuat, update UI
    generateKumulatifReport(); 
    populateExportTables(); 
}

/**
 * Menyimpan dan Sinkronisasi data laporan baru.
 */
async function saveReport(reportType, data) {
    const collectionName = reportType === 'imun' ? IMUN_COLLECTION_NAME : BIAS_COLLECTION_NAME;
    
    const success = await saveReportToFirestore(collectionName, data);
    
    if (success) {
        await loadReports(); // Muat ulang data setelah sukses disimpan
    }
}

// =========================================================================
// FORM HANDLERS
// =========================================================================

function handleImunFormSubmit(event) {
    event.preventDefault();
    
    // --- Logika Validasi dan Pengambilan Data ---
    const form = event.target;
    const data = {
        tipe: 'Imunisasi',
        tglLaporan: form['imun-tgl-laporan'].value,
        kecamatan: form['imun-kecamatan'].value,
        desa: form['imun-desa'].value,
        // Asumsi struktur input data vaksin adalah L dan P
    };

    IMUN_VACCINES.forEach(v => {
        data[`${v}_L`] = parseInt(form[`imun-${v}-L`].value) || 0;
        data[`${v}_P`] = parseInt(form[`imun-${v}-P`].value) || 0;
    });

    data.bulan = form['imun-bulan'].value; // Ambil bulan untuk kueri/pengurutan

    // Panggil fungsi sinkronisasi
    saveReport('imun', data);
    form.reset();
}

function handleBiasFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const data = {
        tipe: 'BIAS',
        tglLaporan: form['bias-tgl-laporan'].value,
        sekolah: form['bias-sekolah'].value,
        tingkat: SCHOOL_DATA[form['bias-sekolah'].value] || 'Lain',
    };

    BIAS_VACCINES.forEach(v => {
        data[`${v}_L`] = parseInt(form[`bias-${v}-L`].value) || 0;
        data[`${v}_P`] = parseInt(form[`bias-${v}-P`].value) || 0;
    });

    data.bulan = form['bias-bulan'].value;

    saveReport('bias', data);
    form.reset();
}

// =========================================================================
// UI & UTILITY FUNCTIONS (Skeleton)
// =========================================================================

function showAlert(message, type) {
    const alertBox = document.getElementById('app-alerts');
    alertBox.innerHTML = `<div class="alert-box alert-${type}">${message}</div>`;
    setTimeout(() => alertBox.innerHTML = '', 7000);
}

function showTab(tabId) {
    // Fungsi untuk mengontrol tampilan tab
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(`tab-content-${tabId}`).style.display = 'block';
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');

    // Khusus untuk tab kumulatif, pastikan laporan terbaru di-generate
    if (tabId === 'kumulatif') {
        generateKumulatifReport();
    } else if (tabId === 'export') {
        populateExportTables();
    }
}

function generateKumulatifReport() {
    // --- Logika Perhitungan Kumulatif (Hanya Sederhana untuk Ilustrasi) ---
    
    const imunCountEl = document.getElementById('kumulatif-imun-count');
    const biasCountEl = document.getElementById('kumulatif-bias-count');

    if (imunCountEl) imunCountEl.innerHTML = `Total Imunisasi: **${imunReports.length} Laporan** (Data Online)`;
    if (biasCountEl) biasCountEl.innerHTML = `Total BIAS: **${biasReports.length} Laporan** (Data Online)`;
    
    // --- Lanjutkan logika perhitungan kumulatif, pengelompokan per bulan, dll. ---
    // Di sini Anda akan menggunakan data di variabel 'imunReports' dan 'biasReports'
}

function populateExportTables() {
    // Membuat tabel yang menampilkan data imunReports dan biasReports,
    // termasuk tombol Hapus yang memanggil confirmDeleteReport(type, id)
    // Gunakan 'report.id' dari Firestore untuk identifikasi.
    
    const imunTableBody = document.querySelector('#export-imun-table tbody');
    if (imunTableBody) {
        imunTableBody.innerHTML = imunReports.map(report => `
            <tr>
                <td>${report.tglLaporan}</td>
                <td>${report.desa}</td>
                <td>...</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="confirmDeleteReport('imun', '${report.id}')">Hapus</button>
                </td>
            </tr>
        `).join('');
    }
}

function confirmDeleteReport(reportType, docId) {
    const collectionName = reportType === 'imun' ? IMUN_COLLECTION_NAME : BIAS_COLLECTION_NAME;
    if (confirm(`Anda yakin ingin menghapus laporan ID ${docId}? Tindakan ini akan menghapus data dari Firestore (Online) dan tidak dapat dibatalkan.`)) {
        deleteReportFromFirestore(collectionName, docId);
    }
}


// =========================================================================
// ENTRY POINT (Inisialisasi)
// =========================================================================

window.onload = async () => {
    // Inisialisasi Event Listeners
    document.getElementById('imun-form').addEventListener('submit', handleImunFormSubmit);
    document.getElementById('bias-form').addEventListener('submit', handleBiasFormSubmit);

    // Muat data dari Firestore saat aplikasi dimulai
    await loadReports();
    
    // Tampilkan tab Kumulatif saat pertama kali dibuka
    showTab('kumulatif'); 
};
