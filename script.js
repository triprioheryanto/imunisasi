import { db } from './firebase-init.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-database.js";

const VACCINES = ['HB0 <24 Jam', 'BCG', 'Polio 1', 'DPT-HB-Hib 1', 'Polio 2', 'DPT-HB-Hib 2', 'Polio 3', 'PCV 1', 'DPT-HB-Hib 3', 'Polio 4', 'PCV 2', 'IPV 1', 'IPV 2', 'Campak Rubella', 'PCV 3', 'DPT-HB-Hib (Lanjutan)', 'Campak Rubella (Lanjutan)'];
const BIAS_VACCINES = ['MR', 'DT', 'Td', 'HPV'];
const SCHOOL_DATA = {'SD NEGERI MELATA': 'SD', 'SD NEGERI NANUAH': 'SD', 'SD NEGERI TOPALAN': 'SD', 'SD NEGERI BATU AMPAR': 'SD', 'SD NEGERI LUBUK HIJU': 'SD', 'SD NEGERI BUKIT MAKMUR': 'SD', 'SD NEGERI BUKIT RAYA': 'SD', 'SD NEGERI MODANG MAS': 'SD', 'SD NEGERI MUKTI MANUNGGAL': 'SD', 'SD NEGERI SUMBER JAYA': 'SD', 'SD NEGERI BUKIT HARUM': 'SD', 'SDS TSA': 'SD', 'MIS RAUDHATUL ULUM': 'SD', 'SMP NEGERI 1 MENTHOBI RAYA': 'SMP'};

// Fungsi Kirim ke Firebase
async function pushToCloud(folder, data) {
    try {
        const dbRef = ref(db, folder);
        const newPostRef = push(dbRef);
        await set(newPostRef, {
            ...data,
            waktu_input: new Date().toLocaleString('id-ID')
        });
        return true;
    } catch (e) {
        console.error("Error Cloud:", e);
        return false;
    }
}

// Inisialisasi Form Imunisasi
function initImun() {
    const container = document.getElementById('imunFields');
    if(!container) return;
    VACCINES.forEach(v => {
        const div = document.createElement('div');
        div.className = 'vaccine-card';
        div.innerHTML = `<h4>${v}</h4><div class="row">
            <input type="number" placeholder="L" data-vac="${v}" data-g="L" value="0">
            <input type="number" placeholder="P" data-vac="${v}" data-g="P" value="0">
        </div>`;
        container.appendChild(div);
    });
}

// Handle Simpan Imunisasi
async function handleImun(e) {
    e.preventDefault();
    const month = document.getElementById('imunMonth').value;
    const desa = document.getElementById('imunDesa').value;
    const details = [];

    document.querySelectorAll('#imunFields input[data-g="L"]').forEach(input => {
        const v = input.dataset.vac;
        const L = parseInt(input.value) || 0;
        const P = parseInt(document.querySelector(`input[data-vac="${v}"][data-g="P"]`).value) || 0;
        details.push({ vaksin: v, L, P, Total: L + P });
    });

    const report = { bulan: month, desa: desa, rincian: details };
    const success = await pushToCloud('laporan_imunisasi', report);
    
    if(success) {
        alert("Data Imunisasi Terkirim ke Cloud!");
        downloadCSV(`Imunisasi_${desa}.csv`, report.rincian);
    }
}

// Fungsi Download CSV Sederhana
function downloadCSV(name, data) {
    let csv = "Vaksin,L,P,Total\n";
    data.forEach(row => { csv += `${row.vaksin},${row.L},${row.P},${row.Total}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.click();
}

// Navigasi Tab
window.switchTab = function(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Load Awal
document.addEventListener('DOMContentLoaded', () => {
    initImun();
    const biasSel = document.getElementById('biasSchool');
    if(biasSel) {
        Object.keys(SCHOOL_DATA).forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.innerText = s;
            biasSel.appendChild(opt);
        });
    }
    document.getElementById('imunForm').addEventListener('submit', handleImun);
});
