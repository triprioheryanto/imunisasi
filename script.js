import { db } from './firebase-init.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.1/firebase-database.js";

// Data Master
const DESA_MENTHOBI = ["Melata", "Nanuah", "Topalan", "Batu Ampar", "Lubuk Hiju", "Bukit Makmur", "Bukit Raya", "Modang Mas", "Mukti Manunggal", "Sumber Jaya", "Bukit Harum"];
const VACCINES = ['HB0 <24 Jam', 'BCG', 'Polio 1', 'DPT-HB-Hib 1', 'Polio 2', 'DPT-HB-Hib 2', 'Polio 3', 'PCV 1', 'DPT-HB-Hib 3', 'Polio 4', 'PCV 2', 'IPV 1', 'IPV 2', 'Campak Rubella', 'PCV 3', 'DPT-HB-Hib (Lanjutan)', 'Campak Rubella (Lanjutan)'];
const SCHOOL_DATA = {'SD NEGERI MELATA': 'SD', 'SD NEGERI NANUAH': 'SD', 'SD NEGERI TOPALAN': 'SD', 'SD NEGERI BATU AMPAR': 'SD', 'SD NEGERI LUBUK HIJU': 'SD', 'SD NEGERI BUKIT MAKMUR': 'SD', 'SD NEGERI BUKIT RAYA': 'SD', 'SD NEGERI MODANG MAS': 'SD', 'SD NEGERI MUKTI MANUNGGAL': 'SD', 'SD NEGERI SUMBER JAYA': 'SD', 'SD NEGERI BUKIT HARUM': 'SD', 'SDS TSA': 'SD', 'MIS RAUDHATUL ULUM': 'SD', 'SMP NEGERI 1 MENTHOBI RAYA': 'SMP'};

document.addEventListener('DOMContentLoaded', () => {
    initImunFields();
    setupLocationLogic();
    initBiasSchools();
    document.getElementById('imunForm').addEventListener('submit', handleImunSubmit);
});

// Logika Dropdown Kecamatan & Desa
function setupLocationLogic() {
    const kecSelect = document.getElementById('imunKecamatan');
    const desaSelect = document.getElementById('imunDesa');

    kecSelect.addEventListener('change', () => {
        const selectedKec = kecSelect.value;
        desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';

        if (selectedKec === "Menthobi Raya") {
            DESA_MENTHOBI.forEach(desa => {
                const opt = document.createElement('option');
                opt.value = desa; opt.innerText = desa;
                desaSelect.appendChild(opt);
            });
        } else if (selectedKec !== "") {
            const opt = document.createElement('option');
            opt.value = "Desa Umum"; opt.innerText = "Pusat Kecamatan / Desa Lain";
            desaSelect.appendChild(opt);
        }
    });
}

// Generate Input Form Imunisasi
function initImunFields() {
    const container = document.getElementById('imunFields');
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

// Simpan Data Imunisasi
async function handleImunSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;

    const dataReport = {
        bulan: document.getElementById('imunMonth').value,
        kecamatan: document.getElementById('imunKecamatan').value,
        desa: document.getElementById('imunDesa').value,
        rincian: []
    };

    document.querySelectorAll('#imunFields .vaccine-card').forEach(card => {
        const v = card.querySelector('h4').innerText;
        const L = parseInt(card.querySelector('[data-g="L"]').value) || 0;
        const P = parseInt(card.querySelector('[data-g="P"]').value) || 0;
        dataReport.rincian.push({ vaksin: v, L, P, total: L + P });
    });

    try {
        const dbRef = ref(db, 'laporan_imunisasi');
        await push(dbRef, { ...dataReport, timestamp: Date.now() });
        alert("Data Berhasil dikirim ke Cloud Firebase!");
        downloadCSV(`Imunisasi_${dataReport.desa}.csv`, dataReport.rincian);
    } catch (err) {
        alert("Gagal menyimpan ke Cloud!");
    } finally {
        btn.disabled = false;
    }
}

// (Fungsi pendukung lainnya seperti downloadCSV, switchTab, initBias tetap sama seperti sebelumnya)
function downloadCSV(name, data) {
    let csv = "Vaksin,L,P,Total\n";
    data.forEach(r => csv += `${r.vaksin},${r.L},${r.P},${r.total}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
}

window.switchTab = function(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
};

function initBiasSchools() {
    const select = document.getElementById('biasSchool');
    if(!select) return;
    Object.keys(SCHOOL_DATA).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.innerText = s;
        select.appendChild(opt);
    });
}
