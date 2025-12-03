// ===== Global settings dan Storage Keys =====
let lastImunFile = null;
let lastBiasFile = null;
const IMUN_STORAGE_KEY = 'puskesmasMelata_imunReports';
const BIAS_STORAGE_KEY = 'puskesmasMelata_biasReports';
let sessionImportedFiles = new Set(); 

const BIAS_VACCINES = ['MR', 'DT', 'Td', 'HPV'];

// NEW: School Data and Class Map (Kept for functionality)
const SCHOOL_DATA = {
    'SD NEGERI MELATA': 'SD', 'SD NEGERI NANUAH': 'SD', 'SD NEGERI TOPALAN': 'SD', 
    'SD NEGERI BATU AMPAR': 'SD', 'SD NEGERI LUBUK HIJU': 'SD', 'SD NEGERI BUKIT MAKMUR': 'SD',
    'SD NEGERI BUKIT RAYA': 'SD', 'SD NEGERI MODANG MAS': 'SD', 'SD NEGERI MUKTI MANUNGGAL': 'SD',
    'SD NEGERI SUMBER JAYA': 'SD', 'SD NEGERI BUKIT HARUM': 'SD', 'SDS TSA': 'SD', // <-- DIUBAH: SD Swasta Tanjung Sawit Abadi diubah menjadi SDS TSA
    'MIS RAUDHATUL ULUM': 'SD', 
    'SMP NEGERI 1 MENTHOBI RAYA': 'SMP', 'SMP NEGERI 2 MENTHOBI RAYA': 'SMP', 
    'SMP NEGERI 3 MENTHOBI RAYA': 'SMP', 'SMP NEGERI 4 MENTHOBI RAYA': 'SMP', 
    'SMP NEGERI 5 MENTHOBI RAYA': 'SMP', 'SMP NEGERI SATU ATAP 6 MENTHOBI RAYA': 'SMP',
    'SMP ISLAM AT-TANWIR': 'SMP',
    'MTS RAUDHATUL ULUM': 'SMP', 
    'SMA NEGERI 1 MENTHOBI RAYA': 'SMA',
    'SMK NEGERI 1 MENTHOBI RAYA': 'SMA' 
};

const CLASS_MAP = {
    'SD': [1, 2, 3, 4, 5, 6],
    'SMP': [7, 8, 9],
    'SMA': [10, 11, 12]
};

// Fixed order of schools requested by the user
const SCHOOL_ORDER = [
    'SD NEGERI MELATA', 'SD NEGERI NANUAH', 'SD NEGERI TOPALAN', 'SD NEGERI BATU AMPAR', 
    'SD NEGERI LUBUK HIJU', 'SD NEGERI BUKIT MAKMUR', 'SD NEGERI BUKIT RAYA', 
    'SD NEGERI MODANG MAS', 'SD NEGERI MUKTI MANUNGGAL', 'SD NEGERI SUMBER JAYA', 
    'SD NEGERI BUKIT HARUM', 'MIS RAUDHATUL ULUM', 'SDS TSA', // <-- DIUBAH: SD Swasta Tanjung Sawit Abadi diubah menjadi SDS TSA
    'SMP NEGERI 1 MENTHOBI RAYA', 'SMP NEGERI 2 MENTHOBI RAYA', 'SMP NEGERI 3 MENTHOBI RAYA', 
    'SMP NEGERI 4 MENTHOBI RAYA', 'SMP NEGERI 5 MENTHOBI RAYA', 
    'SMP NEGERI SATU ATAP 6 MENTHOBI RAYA', 'SMP ISLAM AT-TANWIR', 'MTS RAUDHATUL ULUM', 
    'SMA NEGERI 1 MENTHOBI RAYA', 'SMK NEGERI 1 MENTHOBI RAYA' 
];


// ===== Tab Navigation (Tetap) =====
function switchTab(event) {
  const targetTab = event.target.getAttribute('data-tab');
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  document.getElementById(targetTab).style.display = 'block';
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');

  if (targetTab === 'kumulatif') {
    initKumulatifFilters();
    displayKumulatif(); 
  }
}

// ===== IMUNISASI Functions (Tetap) =====
const IMUN_VACCINES = [
    'BCG', 'Pentabio Dosis 1', 'Pentabio Dosis 2', 'Pentabio Dosis 3', 'Campak/MR Dosis 1',
    'Campak/MR Dosis 2', 'IPV Dosis 1', 'IPV Dosis 2', 'DPT/HB/HiB Lanjutan', 'Campak/MR Lanjutan'
];

// Initialize vaksin inputs for IMUNISASI (Tetap)
function initImunisasiForm() {
  const container = document.getElementById('vaksinContainer');
  container.innerHTML = '';
  
  IMUN_VACCINES.forEach(field => {
    const section = document.createElement('div');
    section.className = 'card';
    section.style.padding = '15px';
    section.innerHTML = `
      <h3 style="margin:0 0 10px 0;font-size:1.1rem;color:var(--accent); font-weight:700;">${field}</h3>
      <div class="form-row">
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-weight:600;margin-bottom:6px;">Laki-Laki</label>
          <select name="${slugify(field)}_l" class="imun-number" required></select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-weight:600;margin-bottom:6px;">Perempuan</label>
          <select name="${slugify(field)}_p" class="imun-number" required></select>
        </div>
      </div>
    `;
    container.appendChild(section);
  });
}

function slugify(text){
  return text.toLowerCase().replace(/\s+/g,'_').replace(/[\/]/g,'').replace(/[^a-z0-9_]/g,'');
}

// Fill selects ranges for IMUNISASI (0-50) (Tetap)
function fillImunSelects(){
  const imunSelects = document.querySelectorAll('.imun-number');
  imunSelects.forEach(s => {
    s.innerHTML = '<option value="" disabled selected>-- Pilih Jumlah --</option>';
    for(let i=0;i<=50;i++){
      s.innerHTML += `<option value="${i}">${i}</option>`;
    }
  });
}

// ===== BIAS Functions (Tetap) =====
let classBlockCounter = 0;

// Fill selects ranges for BIAS (0-200) in a specific block (Tetap)
function fillSelectsInBlock(blockId) {
  const block = document.getElementById(`block_${blockId}`);
  if (!block) return;
  
  const biasSelects = block.querySelectorAll('.bias-number');
  biasSelects.forEach(s => {
    s.innerHTML = '<option value="" disabled selected>-- Pilih Jumlah --</option>';
    for(let i=0;i<=200;i++){
      s.innerHTML += `<option value="${i}">${i}</option>`;
    }
    // Set default value for optional fields (Drop Out, all vaccines)
    if (s.id.startsWith('dropout_') || s.id.startsWith('mr_') || s.id.startsWith('dt_') || s.id.startsWith('td_') || s.id.startsWith('hpv_')) {
        s.value = '0';
    }
  });
}

// Initialize BIAS Sekolah Dropdown using fixed order (Tetap)
function initBiasDropdowns() {
  const sekolahSelect = document.getElementById('sekolah');
  const sortedSchools = SCHOOL_ORDER;
  sekolahSelect.innerHTML = '<option value="">-- Pilih Sekolah --</option>';
  sortedSchools.forEach(school => {
    sekolahSelect.innerHTML += `<option value="${school}">${school}</option>`;
  });
}

// Event handler saat memilih sekolah (Tetap)
function onChangeSekolah(){
  const sekolahSelect = document.getElementById('sekolah');
  const container = document.getElementById('biasClassReportsContainer');
  const addButton = document.getElementById('addBiasClassButton');
  
  container.innerHTML = '';
  classBlockCounter = 0; 
  
  if(sekolahSelect.value){
    container.innerHTML = `<p class="muted">Silahkan klik tombol **Tambah Input Kelas** di bawah untuk mulai memasukkan laporan per kelas.</p>`;
    addButton.disabled = false;
    addButton.style.opacity = '1';
    
  } else {
    container.innerHTML = `<p class="muted">Pilih sekolah di samping kiri untuk mengaktifkan input kelas.</p>`;
    addButton.disabled = true;
    addButton.style.opacity = '0.5';
  }
}

// Fungsi untuk menambah input kelas BIAS (Tetap)
function addNewClassInput(){
  const sekolah = document.getElementById('sekolah').value;
  if (!sekolah) return alert('Mohon pilih Nama Sekolah terlebih dahulu.');
  
  classBlockCounter++;
  const blockId = Date.now(); // Unique ID for the block
  const schoolType = SCHOOL_DATA[sekolah];
  const availableClasses = CLASS_MAP[schoolType] || [];
  
  const container = document.getElementById('biasClassReportsContainer');
  
  // Remove placeholder text if it exists
  if(container.querySelector('p.muted:first-child')){
     if(container.querySelector('p.muted:first-child').textContent.includes('Silahkan klik tombol')){
        container.innerHTML = '';
     }
  }
  
  const classInputHtml = `
    <div id="block_${blockId}" class="card class-input-block" style="margin-top:15px; border:2px solid var(--accent-light);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4>Laporan Kelas #${classBlockCounter}</h4>
        <button type="button" class="btn btn-danger" onclick="removeBiasClassInput('${blockId}')" style="padding: 5px 10px; font-size: 0.9rem;">
            <i class="fas fa-trash"></i> Hapus
        </button>
      </div>
      
      <hr class="sep" style="margin:10px 0 15px 0; background:var(--primary-light)">
      
      <div class="form-group">
        <label for="kelas_${blockId}">Pilih Kelas (Wajib)</label>
        <select id="kelas_${blockId}" name="kelas_${blockId}" required 
                data-block-id="${blockId}" onchange="updateBiasVaccineFields(this)">
          <option value="">-- Pilih Kelas --</option>
          ${availableClasses.map(c => `<option value="${c}">Kelas ${c}</option>`).join('')}
        </select>
      </div>

      <h5 style="margin:15px 0 10px 0; font-size:1rem; color:var(--accent); font-weight:700;">Sasaran & Drop Out</h5>
      <div class="form-row">
        <div class="form-group" style="flex:1">
          <label for="sasaran_l_${blockId}">Sasaran L</label>
          <select id="sasaran_l_${blockId}" name="sasaran_l_${blockId}" required class="bias-number"></select>
        </div>
        <div class="form-group" style="flex:1">
          <label for="sasaran_p_${blockId}">Sasaran P</label>
          <select id="sasaran_p_${blockId}" name="sasaran_p_${blockId}" required class="bias-number"></select>
        </div>
        <div class="form-group" style="flex:1.5">
          <label for="dropout_${blockId}">Drop Out</label>
          <select id="dropout_${blockId}" name="dropout_${blockId}" class="bias-number"></select>
        </div>
      </div>

      <hr class="sep" style="margin:15px 0 10px 0; background:#c0d8f0">

      <h5 style="margin:0 0 10px 0; font-size:1rem; color:var(--accent); font-weight:700;">Capaian Vaksin</h5>

      <div id="mrRow_${blockId}" class="form-row bias-vac-row" data-vaccine="MR" style="display:none">
        <div class="form-group" style="flex:unset; min-width:100px; width:auto; justify-content:center;">
          <label style="color:var(--accent); font-weight:700;">MR</label>
        </div>
        <div class="form-group">
          <label for="mr_l_${blockId}">Laki-laki</label>
          <select id="mr_l_${blockId}" name="mr_l_${blockId}" class="bias-number"></select>
        </div>
        <div class="form-group">
          <label for="mr_p_${blockId}">Perempuan</label>
          <select id="mr_p_${blockId}" name="mr_p_${blockId}" class="bias-number"></select>
        </div>
      </div>
      
      <div id="dtRow_${blockId}" class="form-row bias-vac-row" data-vaccine="DT" style="display:none">
        <div class="form-group" style="flex:unset; min-width:100px; width:auto; justify-content:center;">
          <label style="color:var(--accent); font-weight:700;">DT</label>
        </div>
        <div class="form-group">
          <label for="dt_l_${blockId}">Laki-laki</label>
          <select id="dt_l_${blockId}" name="dt_l_${blockId}" class="bias-number"></select>
        </div>
        <div class="form-group">
          <label for="dt_p_${blockId}">Perempuan</label>
          <select id="dt_p_${blockId}" name="dt_p_${blockId}" class="bias-number"></select>
        </div>
      </div>
      
      <div id="tdRow_${blockId}" class="form-row bias-vac-row" data-vaccine="Td" style="display:none">
        <div class="form-group" style="flex:unset; min-width:100px; width:auto; justify-content:center;">
          <label style="color:var(--accent); font-weight:700;">Td</label>
        </div>
        <div class="form-group">
          <label for="td_l_${blockId}">Laki-laki</label>
          <select id="td_l_${blockId}" name="td_l_${blockId}" class="bias-number"></select>
        </div>
        <div class="form-group">
          <label for="td_p_${blockId}">Perempuan</label>
          <select id="td_p_${blockId}" name="td_p_${blockId}" class="bias-number"></select>
        </div>
      </div>
      
      <div id="hpvRow_${blockId}" class="form-row bias-vac-row" data-vaccine="HPV" style="display:none">
        <div class="form-group" style="flex:unset; min-width:100px; width:auto; justify-content:center;">
          <label style="color:var(--accent); font-weight:700;">HPV</label>
        </div>
        <div class="form-group">
          <label for="hpv_l_${blockId}">Laki-laki</label>
          <select id="hpv_l_${blockId}" name="hpv_l_${blockId}" class="bias-number"></select>
        </div>
        <div class="form-group">
          <label for="hpv_p_${blockId}">Perempuan</label>
          <select id="hpv_p_${blockId}" name="hpv_p_${blockId}" class="bias-number"></select>
        </div>
      </div>

    </div>
  `;
  
  container.innerHTML += classInputHtml;
  fillSelectsInBlock(blockId);
}

// Fungsi untuk menghapus input kelas BIAS (Tetap)
function removeBiasClassInput(blockId){
  if(confirm('Yakin ingin menghapus input kelas ini?')){
    const block = document.getElementById(`block_${blockId}`);
    if(block) block.remove();
    
    const container = document.getElementById('biasClassReportsContainer');
    if(container.children.length === 0){
         container.innerHTML = `<p class="muted">Pilih sekolah di samping kiri untuk mengaktifkan input kelas.</p>`;
    }
  }
}

// Fungsi untuk menampilkan/menyembunyikan input vaksin BIAS berdasarkan kelas (Tetap)
function updateBiasVaccineFields(selectElement){
  const blockId = selectElement.getAttribute('data-block-id');
  const k = selectElement.value; 
  const block = document.getElementById(`block_${blockId}`);
  if (!block) return;
  
  const kNum = parseInt(k);
  const isMRorDTClass = kNum === 1 || kNum === 2; // Kelas 1 & 2 -> MR dan DT (MR pada kelas 1, DT pada kelas 2)
  const isTdorHPVClass = kNum === 5 || kNum === 6 || kNum === 9; // Kelas 5, 6, 9 -> Td dan HPV (Td pada kelas 5 & 6, HPV pada kelas 5 & 6)

  function setVacInputState(vacPrefix, isRequired) {
      const rowElement = block.querySelector(`#${vacPrefix}Row_${blockId}`);
      if (!rowElement) return;
      
      rowElement.style.display = isRequired ? 'flex' : 'none';
      
      const lSelect = block.querySelector(`#${vacPrefix}_l_${blockId}`);
      const pSelect = block.querySelector(`#${vacPrefix}_p_${blockId}`);
      
      if (!isRequired) {
          // Reset value to '0' if the vaccine is not required for this class
          if (lSelect) lSelect.value = '0';
          if (pSelect) pSelect.value = '0';
      } else {
          // Clear '0' value if it was set when not required
          if (lSelect && lSelect.value === '0') lSelect.value = ''; 
          if (pSelect && pSelect.value === '0') pSelect.value = '';
      }
  }

  // Logic:
  // MR/DT: Tampilkan hanya jika Kelas 1 atau 2
  setVacInputState('mr', isMRorDTClass);
  setVacInputState('dt', isMRorDTClass);

  // Td/HPV: Tampilkan hanya jika Kelas 5 atau 6 atau 9
  setVacInputState('td', isTdorHPVClass);
  setVacInputState('hpv', isTdorHPVClass);
}

// ===== Download & Save Functions (Diperbarui untuk CSV Only pada BIAS) =====
function cleanInt(val) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  const cleaned = String(val).replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

// util: download blob CSV (Tetap)
function downloadBlobCSV(content, filename){
  const bom = "\uFEFF"; // BOM for UTF-8 compatibility in Excel
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download Imunisasi CSV (Tetap)
function downloadImun(e) {
  e.preventDefault();
  const form = document.getElementById('imunForm');
  const formData = new FormData(form);
  const desa = formData.get('desa_imun');
  const periode = formData.get('periode_imun');
  const tanggalLaporan = new Date().toISOString().slice(0,10);
  
  if (!desa || !periode) {
    alert('Mohon lengkapi Desa dan Periode (Bulan/Tahun) terlebih dahulu.');
    return;
  }

  let reportData = {
    id: Date.now(),
    tanggal_lapor: tanggalLaporan,
    desa: desa,
    periode: periode,
    data: {}
  };
  
  let csvContent = 'Jenis Imunisasi;Laki-laki;Perempuan\n';

  IMUN_VACCINES.forEach(field => {
    const slug = slugify(field);
    const L = cleanInt(formData.get(`${slug}_l`));
    const P = cleanInt(formData.get(`${slug}_p`));
    
    reportData.data[field] = { L, P };
    csvContent += `${field};${L};${P}\n`;
  });

  // 1. Save JSON to Local Storage (only if saving the raw report is desired)
  saveToStorage(IMUN_STORAGE_KEY, reportData); 

  // 2. Download CSV File
  const periodeFmt = periode.replace(/-/g,'');
  const csvFilename = `Laporan_IMUN_CSV_${periodeFmt}_${desa.replace(/\s+/g,'_')}.csv`;
  const header = `Laporan Imunisasi\nDesa;${desa}\nPeriode;${periode}\nTanggal Lapor;${tanggalLaporan}\n\n`;
  downloadBlobCSV(header + csvContent, csvFilename);
  lastImunFile = csvFilename;
  
  alert(`✅ Berhasil mengunduh Laporan Imunisasi untuk ${desa}, periode ${periode}.\nFile CSV: ${csvFilename}\n\nSilahkan kirim file ini ke nomor WA yang tertera.`);
}

// Download BIAS CSV (Tetap)
function downloadBias(e) {
  e.preventDefault();
  
  const sekolah = document.getElementById('sekolah').value;
  const keterangan = document.getElementById('keterangan').value.trim();
  const classBlocks = document.querySelectorAll('.class-input-block');
  const tanggalLaporan = new Date().toISOString().slice(0,10);

  if (!sekolah) {
    alert('Mohon pilih Nama Sekolah terlebih dahulu.');
    return;
  }
  
  if (classBlocks.length === 0) {
    alert('Mohon tambahkan setidaknya satu Input Kelas.');
    return;
  }

  const allBiasReports = []; // Array to store all class reports for JSON save
  let csvContent = '';
  let totalClassesReported = 0;
  
  // CSV Header
  const csvHeader = [
    'Nama Sekolah', 'Kelas', 'Tanggal Lapor', 
    'Sasaran L', 'Sasaran P', 
    'MR L', 'MR P', 
    'DT L', 'DT P', 
    'Td L', 'Td P', 
    'HPV L', 'HPV P', 
    'Drop Out', 
    'Keterangan'
  ].join(';');
  csvContent += csvHeader + '\n';

  classBlocks.forEach(block => {
    const blockId = block.id.replace('block_', '');
    const kelasSelect = document.getElementById(`kelas_${blockId}`);
    
    if (!kelasSelect || !kelasSelect.value) {
      alert(`Peringatan: Ada blok kelas tanpa Kelas yang dipilih. Melewati blok #${blockId}.`);
      return;
    }

    const kelas = kelasSelect.value;
    const kNum = parseInt(kelas);
    const isMRorDTClass = kNum === 1 || kNum === 2;
    const isTdorHPVClass = kNum === 5 || kNum === 6 || kNum === 9;
    
    const sasaranLSelect = document.getElementById(`sasaran_l_${blockId}`);
    const sasaranPSelect = document.getElementById(`sasaran_p_${blockId}`);
    
    if (!sasaranLSelect || !sasaranPSelect || sasaranLSelect.value === '' || sasaranPSelect.value === '') {
      alert(`Peringatan: Input Sasaran L/P untuk Kelas ${kelas} di sekolah ${sekolah} belum lengkap. Melewati blok ini.`);
      return;
    }

    const data = {
      sekolah: sekolah,
      kelas: kelas,
      tanggal: tanggalLaporan,
      Sasaran_L: cleanInt(sasaranLSelect.value),
      Sasaran_P: cleanInt(sasaranPSelect.value),
      DropOut: cleanInt(document.getElementById(`dropout_${blockId}`).value),
      MR_L: isMRorDTClass ? cleanInt(document.getElementById(`mr_l_${blockId}`).value) : 0,
      MR_P: isMRorDTClass ? cleanInt(document.getElementById(`mr_p_${blockId}`).value) : 0,
      DT_L: isMRorDTClass ? cleanInt(document.getElementById(`dt_l_${blockId}`).value) : 0,
      DT_P: isMRorDTClass ? cleanInt(document.getElementById(`dt_p_${blockId}`).value) : 0,
      Td_L: isTdorHPVClass ? cleanInt(document.getElementById(`td_l_${blockId}`).value) : 0,
      Td_P: isTdorHPVClass ? cleanInt(document.getElementById(`td_p_${blockId}`).value) : 0,
      HPV_L: isTdorHPVClass ? cleanInt(document.getElementById(`hpv_l_${blockId}`).value) : 0,
      HPV_P: isTdorHPVClass ? cleanInt(document.getElementById(`hpv_p_${blockId}`).value) : 0,
      keterangan: keterangan
    };

    // Construct CSV row
    const row = [
      `"${data.sekolah}"`, 
      data.kelas, 
      data.tanggal, 
      data.Sasaran_L, 
      data.Sasaran_P, 
      data.MR_L, 
      data.MR_P, 
      data.DT_L, 
      data.DT_P, 
      data.Td_L, 
      data.Td_P, 
      data.HPV_L, 
      data.HPV_P, 
      data.DropOut,
      `"${data.keterangan.replace(/"/g, '""')}"` // Escape quotes in string
    ].join(';');
    csvContent += row + '\n';
    totalClassesReported++;

    // Save JSON (for local storage cumulative report)
    const reportToSave = {
      id: Date.now() + blockId, // Use blockId to ensure uniqueness across reports
      tanggal: tanggalLaporan,
      sekolah: sekolah,
      kelas: kelas,
      data: {
        Sasaran_L: data.Sasaran_L,
        Sasaran_P: data.Sasaran_P,
        MR_L: data.MR_L,
        MR_P: data.MR_P,
        DT_L: data.DT_L,
        DT_P: data.DT_P,
        Td_L: data.Td_L,
        Td_P: data.Td_P,
        HPV_L: data.HPV_L,
        HPV_P: data.HPV_P,
        DropOut: data.DropOut,
        keterangan: data.keterangan
      }
    };
    allBiasReports.push(reportToSave);
  });
  
  if (totalClassesReported === 0) {
    alert('Tidak ada data kelas yang lengkap untuk dilaporkan.');
    return;
  }

  // 1. Save JSON to Local Storage for cumulative reports (one entry per class)
  allBiasReports.forEach(report => saveToStorage(BIAS_STORAGE_KEY, report));

  // 2. Download CSV File
  const schoolSlug = sekolah.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 15);
  const dateFmt = tanggalLaporan.replace(/-/g, '');
  const csvFilename = `Laporan_BIAS_CSV_${dateFmt}_${schoolSlug}.csv`;
  
  const header = `Laporan BIAS\nSekolah;${sekolah}\nTanggal Lapor;${tanggalLaporan}\nTotal Kelas;${totalClassesReported}\nKeterangan;${keterangan}\n\n`;
  downloadBlobCSV(header + csvContent, csvFilename);
  lastBiasFile = csvFilename;

  alert(`✅ Berhasil mengunduh Laporan BIAS untuk ${sekolah}.\nTotal Kelas: ${totalClassesReported}\nFile CSV: ${csvFilename}\n\nSilahkan kirim file ini ke nomor WA yang tertera.`);
  
  // Optional: Reset form after successful download and save
  document.getElementById('biasForm').reset();
  onChangeSekolah();
}


// ===== Storage Functions (Tetap) =====
function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading from localStorage key "${key}":`, e);
    return [];
  }
}

function saveToStorage(key, report) {
  try {
    const existingReports = getFromStorage(key);
    // Check if a report with the same ID already exists (important for import function)
    const exists = existingReports.some(r => r.id === report.id);
    if (exists) return; 

    existingReports.push(report);
    localStorage.setItem(key, JSON.stringify(existingReports));
  } catch (e) {
    console.error(`Error writing to localStorage key "${key}":`, e);
  }
}

function clearAllData() {
  if (confirm('⚠️ PERINGATAN KERAS! Anda akan menghapus SEMUA data laporan Imunisasi dan BIAS dari browser ini secara permanen. Tindakan ini tidak dapat dibatalkan.\n\nPASTIKAN Anda sudah melakukan EXPORT DATABASE JSON sebelum melanjutkan.\n\nLanjutkan penghapusan permanen?')) {
    localStorage.removeItem(IMUN_STORAGE_KEY);
    localStorage.removeItem(BIAS_STORAGE_KEY);
    
    // Clear last file trackers
    lastImunFile = null;
    lastBiasFile = null;

    alert('✅ Semua data laporan (Imunisasi dan BIAS) berhasil dihapus secara permanen.');
    initKumulatifFilters();
    displayKumulatif();
  }
}

// Function for downloadLast button in Export tab (Tetap)
function downloadLast(type) {
  if (type === 'imunisasi') {
    if(!lastImunFile){
      alert('Belum ada file Imunisasi yang diunduh pada sesi ini.');
      return;
    }
    alert(`File CSV terakhir Imunisasi: ${lastImunFile}\nIni hanya pengingat nama file. Untuk mengunduh ulang, silakan isi form Imunisasi dan klik Download.`);
  } else {
    if(!lastBiasFile){
      alert('Belum ada file BIAS yang diunduh pada sesi ini.');
      return;
    }
    alert(`File CSV terakhir BIAS: ${lastBiasFile}\nIni hanya pengingat nama file. Untuk mengunduh ulang, silakan isi form BIAS dan klik Download.`);
  }
}

// Export Database as JSON (Tetap)
function exportDatabase(){
  const imunReports = getFromStorage(IMUN_STORAGE_KEY);
  const biasReports = getFromStorage(BIAS_STORAGE_KEY);
  
  const database = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: 'v6.6-bottom-actions',
      source: 'Puskesmas Melata App'
    },
    imunReports: imunReports,
    biasReports: biasReports
  };

  const jsonString = JSON.stringify(database, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  a.href = url;
  a.download = `PuskesmasMelata_Database_Backup_${dateStamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert(`✅ Berhasil membuat file cadangan database: ${a.download}`);
}

// ===== Import Functions (Tetap) =====
async function readFileContent(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => {
      console.error("Gagal membaca file:", file.name);
      resolve(null);
    };
    reader.readAsText(file);
  });
}

function mergeData(key, newDataArray) {
  let existingReports = getFromStorage(key);
  let importedCount = 0;
  const existingIds = new Set(existingReports.map(r => r.id));

  newDataArray.forEach(newReport => {
    // Check if the report ID already exists
    if (!existingIds.has(newReport.id)) {
      existingReports.push(newReport);
      importedCount++;
    }
  });

  if (importedCount > 0) {
    localStorage.setItem(key, JSON.stringify(existingReports));
  }
  
  return importedCount;
}

async function startImport() {
  const importFile = document.getElementById('importFile');
  const statusDiv = document.getElementById('importStatus');
  const files = Array.from(importFile.files);
  
  if (files.length === 0) {
    statusDiv.innerHTML = 'Mohon pilih file (.json) terlebih dahulu.';
    return;
  }
  
  statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses ${files.length} file...`;
  
  let totalImportedImun = 0;
  let totalImportedBias = 0;
  let totalProcessed = 0;
  const fileStatusMessages = [];

  for (const file of files) {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      fileStatusMessages.push(`❌ File "${file.name}": Tipe file tidak didukung. Abaikan.`);
      continue;
    }
    
    try {
      const content = await readFileContent(file);
      if (!content) throw new Error('Konten file kosong.');
      
      const importedData = JSON.parse(content);

      if (!importedData.metadata || (!importedData.imunReports && !importedData.biasReports)) {
        fileStatusMessages.push(`❌ File "${file.name}": Format JSON tidak valid atau kosong (tidak ditemukan imunReports/biasReports).`);
        continue;
      }
      
      const importedImunCount = importedData.imunReports ? mergeData(IMUN_STORAGE_KEY, importedData.imunReports) : 0;
      const importedBiasCount = importedData.biasReports ? mergeData(BIAS_STORAGE_KEY, importedData.biasReports) : 0;
      
      totalImportedImun += importedImunCount;
      totalImportedBias += importedBiasCount;
      totalProcessed++;
      sessionImportedFiles.add(file.name);
      fileStatusMessages.push(`✅ File "${file.name}": Imunisasi +${importedImunCount}, BIAS +${importedBiasCount}.`);

    } catch (e) {
      fileStatusMessages.push(`❌ File "${file.name}": Gagal memproses data. File mungkin bukan file Database (.json) yang valid. Error: ${e.message}`);
      console.error(`Error processing file ${file.name}:`, e);
    }
  }

  // Final Status Display
  if (totalProcessed > 0) {
    statusDiv.innerHTML = ` ✅ **Import Selesai!** Berhasil memproses **${totalProcessed} file**. <br> Total gabungan: Imunisasi **+${totalImportedImun}** laporan, BIAS **+${totalImportedBias}** laporan. <button class="btn btn-ghost" onclick="document.getElementById('fileDetails').style.display='block'" style="padding:5px 10px; margin-left:10px;">Detail</button>`;
    statusDiv.innerHTML += `<div id="fileDetails" style="display:none; margin-top:10px; padding:10px; border:1px dashed #ccc; background:#f9f9f9">${fileStatusMessages.join('<br>')}</div>`;
    
    // Refresh cumulative data after import
    initKumulatifFilters();
    displayKumulatif();
  } else {
    statusDiv.innerHTML = '❌ **Import Gagal!** Tidak ada file valid yang diproses.';
  }
  
  importFile.value = ''; // Clear file input
}

// ===== Kumulatif & Reporting Functions (Tetap) =====

// Helper function to format month period (YYYY-MM)
const formatPeriod = (p) => new Date(p + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });

// Helper function to calculate totals per month (Tetap)
function aggregateMonthlyData(imunReports, biasReports) {
  const monthlyData = new Map(); // Key: 'YYYY-MM'

  const biasSumKeys = ['Sasaran_L', 'Sasaran_P', 'MR_L', 'MR_P', 'DT_L', 'DT_P', 'Td_L', 'Td_P', 'HPV_L', 'HPV_P', 'DropOut'];
  const imunSumKeys = IMUN_VACCINES; 

  // Process Imunisasi Reports
  imunReports.forEach(report => {
    const periode = report.periode;
    if (!monthlyData.has(periode)) {
      monthlyData.set(periode, { 
        periode: periode, 
        imun: Object.fromEntries(imunSumKeys.map(key => [key, { L: 0, P: 0 }])), 
        bias: Object.fromEntries(biasSumKeys.map(key => [key, 0])) 
      });
    }

    const currentImun = monthlyData.get(periode).imun;
    imunSumKeys.forEach(key => {
      const data = report.data[key];
      if (data) {
        currentImun[key].L += cleanInt(data.L);
        currentImun[key].P += cleanInt(data.P);
      }
    });
  });

  // Process BIAS Reports
  biasReports.forEach(report => {
    const rawDate = report.tanggal;
    const periode = (rawDate && typeof rawDate === 'string' && rawDate.length >= 7) ? rawDate.substring(0, 7) : null;
    
    if (!periode) return;
    
    if (!monthlyData.has(periode)) {
      monthlyData.set(periode, { 
        periode: periode, 
        imun: Object.fromEntries(imunSumKeys.map(key => [key, { L: 0, P: 0 }])),
        bias: { Sasaran_L: 0, Sasaran_P: 0, MR_L: 0, MR_P: 0, DT_L: 0, DT_P: 0, Td_L: 0, Td_P: 0, HPV_L: 0, HPV_P: 0, DropOut: 0 }
      });
    }

    const currentBias = monthlyData.get(periode).bias;
    biasSumKeys.forEach(key => {
      const val = report.data[key] || 0;
      if(typeof val === 'number'){
        currentBias[key] += val;
      }
    });
  });

  // Convert map to sorted array (latest month first)
  return Array.from(monthlyData.values()).sort((a, b) => b.periode.localeCompare(a.periode));
}

// Initialize Kumulatif Filters (Tetap)
function initKumulatifFilters() {
  const imunReports = getFromStorage(IMUN_STORAGE_KEY);
  const biasReports = getFromStorage(BIAS_STORAGE_KEY);
  
  const allPeriods = new Set();
  const allDesa = new Set();
  const allSekolah = new Set();

  imunReports.forEach(r => {
    if (r.periode) allPeriods.add(r.periode);
    if (r.desa) allDesa.add(r.desa);
  });

  biasReports.forEach(r => {
    const rawDate = r.tanggal;
    const periode = (rawDate && typeof rawDate === 'string' && rawDate.length >= 7) ? rawDate.substring(0, 7) : null;
    if (periode) allPeriods.add(periode);
    if (r.sekolah) allSekolah.add(r.sekolah);
  });

  const sortedPeriods = Array.from(allPeriods).sort().reverse();
  const sortedDesa = Array.from(allDesa).sort();
  const sortedSekolah = Array.from(allSekolah).sort();

  function populateSelect(id, items, displayFunc) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="">-- Semua --</option>';
    items.forEach(item => {
      select.innerHTML += `<option value="${item}">${displayFunc ? displayFunc(item) : item}</option>`;
    });
  }

  const periodDisplay = (p) => new Date(p + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });

  // Deletion Filters
  populateSelect('delete_periode', sortedPeriods, periodDisplay);
  populateSelect('delete_desa', sortedDesa);
  populateSelect('delete_sekolah', sortedSekolah);

  // Display Filters
  populateSelect('filter_periode', sortedPeriods, periodDisplay);
  populateSelect('filter_desa', sortedDesa);
  populateSelect('filter_sekolah', sortedSekolah);
}

// Selective Deletion Logic (Tetap)
function performSelectiveDeletion() {
  const periodFilter = document.getElementById('delete_periode').value;
  const desaFilter = document.getElementById('delete_desa').value;
  const sekolahFilter = document.getElementById('delete_sekolah').value;

  if (!periodFilter && !desaFilter && !sekolahFilter) {
    alert('Mohon pilih setidaknya satu filter (Bulan, Desa, atau Sekolah) untuk melakukan penghapusan selektif.');
    return;
  }
  
  if (!confirm(`⚠️ PERINGATAN! Anda akan menghapus data yang cocok dengan kriteria berikut:\n\nBulan/Periode: ${periodFilter || 'SEMUA'}\nDesa: ${desaFilter || 'SEMUA'}\nSekolah: ${sekolahFilter || 'SEMUA'}\n\nLanjutkan penghapusan permanen?`)) {
    return;
  }

  let imunReports = getFromStorage(IMUN_STORAGE_KEY);
  let biasReports = getFromStorage(BIAS_STORAGE_KEY);
  
  let deletedImunCount = 0;
  let deletedBiasCount = 0;

  // 1. Filter Imunisasi
  const newImunReports = imunReports.filter(report => {
    let match = true;
    if (periodFilter && report.periode !== periodFilter) match = false;
    if (desaFilter && report.desa !== desaFilter) match = false;
    if (sekolahFilter) match = false; // Imun report does not match sekolah filter

    return match === false; // Keep reports that DO NOT match filter criteria
  });
  
  deletedImunCount = imunReports.length - newImunReports.length;
  if (deletedImunCount > 0) {
    localStorage.setItem(IMUN_STORAGE_KEY, JSON.stringify(newImunReports));
  }

  // 2. Filter BIAS
  const newBiasReports = biasReports.filter(report => {
    let match = true;
    const rawDate = report.tanggal;
    const reportPeriode = (rawDate && typeof rawDate === 'string' && rawDate.length >= 7) ? rawDate.substring(0, 7) : null;

    if (periodFilter && reportPeriode !== periodFilter) match = false;
    if (desaFilter) match = false; // BIAS report does not match desa filter
    if (sekolahFilter && report.sekolah !== sekolahFilter) match = false;

    return match === false; // Keep reports that DO NOT match filter criteria
  });
  
  deletedBiasCount = biasReports.length - newBiasReports.length;
  if (deletedBiasCount > 0) {
    localStorage.setItem(BIAS_STORAGE_KEY, JSON.stringify(newBiasReports));
  }

  // --- Final result ---
  alert(`✅ Penghapusan Selesai!\n\n- ${deletedImunCount} laporan Imunisasi terhapus.\n- ${deletedBiasCount} laporan BIAS terhapus.\n\nKlik OK untuk memuat ulang hasil kumulatif.`);
  
  document.getElementById('delete_periode').value = '';
  document.getElementById('delete_desa').value = '';
  document.getElementById('delete_sekolah').value = '';

  displayKumulatif();
}

// Display Detailed Reports based on filters (Tetap)
function displayDetailedReports() {
  const periodFilter = document.getElementById('filter_periode').value;
  const desaFilter = document.getElementById('filter_desa').value;
  const sekolahFilter = document.getElementById('filter_sekolah').value;
  const container = document.getElementById('detailedReportList');
  container.innerHTML = '';

  const imunReports = getFromStorage(IMUN_STORAGE_KEY);
  const biasReports = getFromStorage(BIAS_STORAGE_KEY);

  // --- Filter Imunisasi Reports ---
  const filteredImun = imunReports.filter(report => {
    let match = true;
    if (periodFilter && report.periode !== periodFilter) match = false;
    if (desaFilter && report.desa !== desaFilter) match = false;
    if (sekolahFilter) match = false; // Imun report does not match sekolah filter
    return match;
  }).sort((a, b) => b.periode.localeCompare(a.periode)); // Sort by period descending

  // --- Filter BIAS Reports ---
  const filteredBias = biasReports.filter(report => {
    let match = true;
    const rawDate = report.tanggal;
    const reportPeriode = (rawDate && typeof rawDate === 'string' && rawDate.length >= 7) ? rawDate.substring(0, 7) : null;

    if (periodFilter && reportPeriode !== periodFilter) match = false;
    if (desaFilter) match = false; // BIAS report does not match desa filter
    if (sekolahFilter && report.sekolah !== sekolahFilter) match = false;
    return match;
  }).sort((a, b) => b.tanggal.localeCompare(a.tanggal)); // Sort by date descending


  let reportListHtml = '';
  
  if (!periodFilter && !desaFilter && !sekolahFilter) {
    container.innerHTML = `<p class="muted" style="padding:10px 0;">Menampilkan **Semua Laporan** yang tersimpan di penyimpanan lokal.</p>`;
  } else {
    const filtersText = [];
    if (periodFilter) filtersText.push(`Bulan: ${new Date(periodFilter + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}`);
    if (desaFilter) filtersText.push(`Desa: ${desaFilter}`);
    if (sekolahFilter) filtersText.push(`Sekolah: ${sekolahFilter}`);
    container.innerHTML = `<p class="muted" style="padding:10px 0;">Menampilkan laporan dengan filter: <strong>${filtersText.join(' | ')}</strong></p>`;
  }

  if (filteredImun.length > 0) {
    reportListHtml += `<h4><i class="fas fa-syringe" style="color:var(--accent)"></i> Laporan Imunisasi (${filteredImun.length})</h4>`;
    reportListHtml += `<table class="kumulatif-table" style="width:100%; margin-bottom: 20px;"><thead><tr><th style="width:50%">Desa & Periode</th><th style="width:50%">Rincian Vaksin (L / P)</th></tr></thead><tbody>`;
    
    filteredImun.forEach(report => {
      const periodeFmt = formatPeriod(report.periode);
      const vacRows = Object.entries(report.data).map(([vac, data]) => {
        return `
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding: 2px 0;">
            <span style="flex-basis:60%;">${vac}</span>
            <span style="flex-basis:20%; text-align:right; font-weight:600; color:#004080;">${data.L}</span>
            <span style="flex-basis:20%; text-align:right; font-weight:600; color:#FF6347;">${data.P}</span>
          </div>
        `;
      }).join('');
      
      reportListHtml += `
        <tr style="background:#f7fcf9; border-top:2px solid var(--success)">
          <td colspan="1" style="font-weight:700;">
            <i class="fas fa-location-dot"></i> ${report.desa} &bull; ${periodeFmt} 
            <span style="font-size:0.75rem; color:var(--muted); float:right;">ID: ${report.id}</span>
          </td>
        </tr>
        <tr>
          <td colspan="1" style="padding: 10px 20px;">
            ${vacRows}
          </td>
        </tr>
      `;
    });
    reportListHtml += `</tbody></table>`;
  }
  
  if (filteredBias.length > 0) {
    reportListHtml += `<h4><i class="fas fa-school" style="color:var(--accent)"></i> Laporan BIAS (${filteredBias.length})</h4>`;
    reportListHtml += `<table class="kumulatif-table" style="width:100%;"><thead><tr><th>Sekolah & Kelas</th><th>Sasaran (L/P)</th><th>Capaian (MR/DT/Td/HPV)</th></tr></thead><tbody>`;
    
    filteredBias.forEach(report => {
      const vacs = [];
      if (report.data.MR_L + report.data.MR_P > 0) vacs.push(`MR: ${report.data.MR_L}/${report.data.MR_P}`);
      if (report.data.DT_L + report.data.DT_P > 0) vacs.push(`DT: ${report.data.DT_L}/${report.data.DT_P}`);
      if (report.data.Td_L + report.data.Td_P > 0) vacs.push(`Td: ${report.data.Td_L}/${report.data.Td_P}`);
      if (report.data.HPV_L + report.data.HPV_P > 0) vacs.push(`HPV: ${report.data.HPV_L}/${report.data.HPV_P}`);

      reportListHtml += `
        <tr>
          <td style="font-weight:700;">
            ${report.sekolah} (Kelas ${report.kelas})
            <div style="font-size:0.75rem; color:var(--muted); margin-top:3px;">${report.tanggal} | ID: ${report.id}</div>
          </td>
          <td>
            L: ${report.data.Sasaran_L} / P: ${report.data.Sasaran_P} 
            <div style="font-size:0.75rem; color:var(--danger);">DO: ${report.data.DropOut}</div>
          </td>
          <td>${vacs.join('<br>')}</td>
        </tr>
      `;
    });
    reportListHtml += `</tbody></table>`;
  }

  if (filteredImun.length === 0 && filteredBias.length === 0) {
    reportListHtml = `<p class="alert-box alert-warning">Tidak ada laporan yang cocok dengan kriteria filter yang dipilih.</p>`;
  }

  container.innerHTML += reportListHtml;
}

// Download CSV Filtered Reports (Tetap)
function downloadFilteredReportsCSV() {
  const periodFilter = document.getElementById('filter_periode').value;
  const desaFilter = document.getElementById('filter_desa').value;
  const sekolahFilter = document.getElementById('filter_sekolah').value;

  const imunReports = getFromStorage(IMUN_STORAGE_KEY);
  const biasReports = getFromStorage(BIAS_STORAGE_KEY);

  // --- Filter Imunisasi Reports ---
  const filteredImun = imunReports.filter(report => {
    let match = true;
    if (periodFilter && report.periode !== periodFilter) match = false;
    if (desaFilter && report.desa !== desaFilter) match = false;
    if (sekolahFilter) match = false;
    return match;
  });

  // --- Filter BIAS Reports ---
  const filteredBias = biasReports.filter(report => {
    let match = true;
    const rawDate = report.tanggal;
    const reportPeriode = (rawDate && typeof rawDate === 'string' && rawDate.length >= 7) ? rawDate.substring(0, 7) : null;
    
    if (periodFilter && reportPeriode !== periodFilter) match = false;
    if (desaFilter) match = false;
    if (sekolahFilter && report.sekolah !== sekolahFilter) match = false;
    return match;
  });
  // --- End Filter Logic ---

  if (filteredImun.length === 0 && filteredBias.length === 0) {
    alert('Tidak ada laporan yang cocok dengan kriteria filter yang dipilih untuk diunduh.');
    return;
  }

  let csvContent = '';
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let filename = `Laporan_Spesifik_${dateStamp}.csv`;

  // Header Info
  csvContent += `"Laporan Spesifik - Puskesmas Melata"\n`;
  csvContent += `"Filter Bulan";"${periodFilter || 'SEMUA'}"\n`;
  csvContent += `"Filter Desa";"${desaFilter || 'SEMUA'}"\n`;
  csvContent += `"Filter Sekolah";"${sekolahFilter || 'SEMUA'}"\n\n`;


  // 1. Imunisasi CSV Section
  if (filteredImun.length > 0) {
    csvContent += `\n;"DATA IMUNISASI (Sesuai Filter)";\n`;
    csvContent += 'Tanggal Lapor;ID Laporan;Desa;Periode;' + IMUN_VACCINES.map(v => `${v} L;${v} P`).join(';') + '\n';

    filteredImun.forEach(report => {
      let row = [report.tanggal_lapor, report.id, `"${report.desa}"`, report.periode];
      IMUN_VACCINES.forEach(vac => {
        const data = report.data[vac] || { L: 0, P: 0 };
        row.push(data.L);
        row.push(data.P);
      });
      csvContent += row.join(';') + '\n';
    });
    csvContent += `\n`;
  }

  // 2. BIAS CSV Section
  if (filteredBias.length > 0) {
    csvContent += `\n;"DATA BIAS PER KELAS (Sesuai Filter)";\n`;
    const biasHeader = [
      'ID Laporan', 'Tanggal Lapor', 'Nama Sekolah', 'Kelas', 'Keterangan', 
      'Sasaran L', 'Sasaran P', 'Drop Out', 
      'MR L', 'MR P', 'DT L', 'DT P', 'Td L', 'Td P', 'HPV L', 'HPV P'
    ];
    csvContent += biasHeader.join(';') + '\n';

    filteredBias.forEach(report => {
      const data = report.data;
      const row = [
        report.id, 
        report.tanggal, 
        `"${report.sekolah}"`, 
        report.kelas, 
        `"${(data.keterangan || '').replace(/"/g, '""')}"`,
        data.Sasaran_L, data.Sasaran_P, data.DropOut, 
        data.MR_L, data.MR_P, data.DT_L, data.DT_P, 
        data.Td_L, data.Td_P, data.HPV_L, data.HPV_P
      ];
      csvContent += row.join(';') + '\n';
    });
    csvContent += `\n`;
  }

  downloadBlobCSV(csvContent, filename);
  alert(`✅ Berhasil mengunduh laporan yang difilter: ${filename}`);
}

// Download CSV Monthly Totals (Tetap)
function downloadMonthlyTotalsCSV() {
  const imunReports = getFromStorage(IMUN_STORAGE_KEY);
  const biasReports = getFromStorage(BIAS_STORAGE_KEY);

  if (imunReports.length === 0 && biasReports.length === 0) {
    alert('Tidak ada laporan yang tersimpan untuk dibuatkan total per bulan.');
    return;
  }

  const monthlyTotals = aggregateMonthlyData(imunReports, biasReports);

  // CSV Content Generation
  let csvContent = '';
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let filename = `Total_Bulanan_Kumulatif_${dateStamp}.csv`;

  csvContent += `"Total Kumulatif Imunisasi dan BIAS Per Bulan - Puskesmas Melata"\n`;
  csvContent += `\n`;

  // --- 1. BIAS Monthly Total Header ---
  const biasHeader = [
    'Periode (YYYY-MM)', 'Sasaran_L', 'Sasaran_P', 'Total_Sasaran', 'DropOut', 
    'MR_L', 'MR_P', 'Total_MR', 'DT_L', 'DT_P', 'Total_DT', 
    'Td_L', 'Td_P', 'Total_Td', 'HPV_L', 'HPV_P', 'Total_HPV'
  ];
  csvContent += `;"DATA BIAS BULANAN";\n`;
  csvContent += biasHeader.join(';') + '\n';

  // --- 2. BIAS Monthly Total Rows ---
  monthlyTotals.forEach(month => {
    const data = month.bias;
    const totalSasaran = data.Sasaran_L + data.Sasaran_P;
    const totalMR = data.MR_L + data.MR_P;
    const totalDT = data.DT_L + data.DT_P;
    const totalTd = data.Td_L + data.Td_P;
    const totalHPV = data.HPV_L + data.HPV_P;

    const row = [
      month.periode, data.Sasaran_L, data.Sasaran_P, totalSasaran, data.DropOut,
      data.MR_L, data.MR_P, totalMR, data.DT_L, data.DT_P, totalDT,
      data.Td_L, data.Td_P, totalTd, data.HPV_L, data.HPV_P, totalHPV
    ];
    csvContent += row.join(';') + '\n';
  });
  csvContent += `\n`;

  // --- 3. Imunisasi Monthly Total Header ---
  const imunHeader = ['Periode (YYYY-MM)'];
  IMUN_VACCINES.forEach(v => {
    imunHeader.push(`${v}_L`);
    imunHeader.push(`${v}_P`);
    imunHeader.push(`Total_${slugify(v)}`);
  });
  csvContent += `;"DATA IMUNISASI BULANAN";\n`;
  csvContent += imunHeader.join(';') + '\n';

  // --- 4. Imunisasi Monthly Total Rows ---
  monthlyTotals.forEach(month => {
    const data = month.imun;
    let row = [month.periode];
    IMUN_VACCINES.forEach(v => {
      const L = data[v].L;
      const P = data[v].P;
      row.push(L);
      row.push(P);
      row.push(L + P);
    });
    csvContent += row.join(';') + '\n';
  });
  
  downloadBlobCSV(csvContent, filename);
  alert(`✅ Berhasil mengunduh total bulanan: ${filename}`);
}


// Display Kumulatif Report (Tetap)
function displayKumulatif() {
  const container = document.getElementById('kumulatifContent');
  container.innerHTML = '';
  
  const imunReports = getFromStorage(IMUN_STORAGE_KEY);
  const biasReports = getFromStorage(BIAS_STORAGE_KEY);

  if (imunReports.length === 0 && biasReports.length === 0) {
    container.innerHTML = `<p class="alert-box alert-info">Tidak ada data laporan Imunisasi atau BIAS yang tersimpan di browser ini.</p>`;
    return;
  }

  // --- 1. Grand Total Calculation ---
  let imunKumulatif = {};
  imunReports.forEach(report => {
    for(const [vaksin, data] of Object.entries(report.data)){
      if(!imunKumulatif[vaksin]){
        imunKumulatif[vaksin] = { L: 0, P: 0 };
      }
      imunKumulatif[vaksin].L += cleanInt(data.L);
      imunKumulatif[vaksin].P += cleanInt(data.P);
    }
  });

  let biasKumulatif = {
    Sasaran_L: 0, Sasaran_P: 0,
    MR_L: 0, MR_P: 0,
    DT_L: 0, DT_P: 0,
    Td_L: 0, Td_P: 0,
    HPV_L: 0, HPV_P: 0,
    DropOut: 0
  };
  const biasSumKeys = ['Sasaran_L', 'Sasaran_P', 'MR_L', 'MR_P', 'DT_L', 'DT_P', 'Td_L', 'Td_P', 'HPV_L', 'HPV_P', 'DropOut'];
  biasReports.forEach(report => {
    biasSumKeys.forEach(key => {
      const val = report.data[key] || 0;
      if(typeof val === 'number'){
        biasKumulatif[key] += val;
      }
    });
  });

  const monthlyTotals = aggregateMonthlyData(imunReports, biasReports);
  
  let monthlyBreakdownHtml = '';
  let grandTotalHtml = '';

  // --- A. Rincian Kumulatif Per Bulan (TOP) - COMPACTED ---
  if (monthlyTotals.length > 0) {
    monthlyBreakdownHtml += `
      <h3 style="color:var(--accent); margin-top:0px;"><i class="fas fa-calendar-alt"></i> Rincian Kumulatif Per Bulan</h3>
      <p class="muted small" style="margin-top:-10px; margin-bottom:10px;">Total keseluruhan ${monthlyTotals.length} periode laporan Imunisasi dan BIAS.</p>
      <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));">
    `;

    monthlyTotals.forEach(month => {
      const periodFmt = formatPeriod(month.periode);
      const imunData = month.imun;
      const biasData = month.bias;

      // Imunisasi
      let totalMonthlyImun = 0;
      let imunRows = '';
      Object.entries(imunData).forEach(([vac, data]) => {
        const total = data.L + data.P;
        if (total > 0) {
          imunRows += `<tr><td>${vac}</td><td>${data.L}</td><td>${data.P}</td><td>${total}</td></tr>`;
          totalMonthlyImun += total;
        }
      });
      
      // BIAS
      let totalMonthlyBias = 0;
      let biasRows = '';
      const biasVacs = ['MR', 'DT', 'Td', 'HPV'];
      biasVacs.forEach(vac => {
        const L = biasData[`${vac}_L`];
        const P = biasData[`${vac}_P`];
        const total = L + P;
        if (total > 0) {
          biasRows += `<tr><td>${vac}</td><td>${L}</td><td>${P}</td><td>${total}</td></tr>`;
          totalMonthlyBias += total;
        }
      });


      if (totalMonthlyImun > 0 || totalMonthlyBias > 0) {
        monthlyBreakdownHtml += `
          <div class="card" style="padding:15px; background:var(--light); border:1px solid #ddd;">
            <h4 style="margin-top:0; color:var(--primary);">${periodFmt}</h4>
            
            <div style="margin-bottom:15px;">
              <h5 style="color:var(--accent);"><i class="fas fa-syringe"></i> Imunisasi (${totalMonthlyImun} dosis)</h5>
              <table class="kumulatif-table" style="margin-top:0;">
                <thead><tr><th>Vaksin</th><th>L</th><th>P</th><th>Total</th></tr></thead>
                <tbody>${imunRows || '<tr><td colspan="4" class="muted">Tidak ada data</td></tr>'}</tbody>
              </table>
            </div>
            
            <div>
              <h5 style="color:var(--primary);"><i class="fas fa-school"></i> BIAS (${totalMonthlyBias} dosis)</h5>
              <table class="kumulatif-table" style="margin-top:0;">
                <thead><tr><th>Vaksin</th><th>L</th><th>P</th><th>Total</th></tr></thead>
                <tbody>${biasRows || '<tr><td colspan="4" class="muted">Tidak ada data</td></tr>'}</tbody>
                <tfoot><tr><td colspan="3" style="text-align:right;">Total Capaian:</td><td>${totalMonthlyBias}</td></tr></tfoot>
              </table>
              <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #ccc;">
                <p style="margin:0 0 3px 0; font-weight:600; color:var(--accent); font-size:0.85rem;">Sasaran Total: ${biasData.Sasaran_L + biasData.Sasaran_P}</p>
                <p style="margin:0; font-weight:600; color:var(--danger); font-size:0.85rem;">Drop Out: ${biasData.DropOut}</p>
              </div>
            </div>
          </div>
        `;
      }
    });

    monthlyBreakdownHtml += `</div>`;
    container.innerHTML += monthlyBreakdownHtml;
  }

  // --- B. Grand Total Keseluruhan ---
  let totalCapaianImun = 0;
  let imunRows = '';
  Object.entries(imunKumulatif).forEach(([vac, data]) => {
    const total = data.L + data.P;
    imunRows += `<tr><td>${vac}</td><td>${data.L}</td><td>${data.P}</td><td>${total}</td></tr>`;
    totalCapaianImun += total;
  });

  let totalCapaianBias = 0;
  let biasRows = '';
  const biasVacs = ['MR', 'DT', 'Td', 'HPV'];
  biasVacs.forEach(vac => {
    const L = biasKumulatif[`${vac}_L`];
    const P = biasKumulatif[`${vac}_P`];
    const total = L + P;
    biasRows += `<tr><td>${vac}</td><td>${L}</td><td>${P}</td><td>${total}</td></tr>`;
    totalCapaianBias += total;
  });
  
  const grandTotalSasaranBias = biasKumulatif.Sasaran_L + biasKumulatif.Sasaran_P;

  grandTotalHtml += `
    <hr class="sep" style="margin-top:30px;">
    <h3 style="color:var(--primary); margin-top:0px;"><i class="fas fa-chart-pie"></i> Grand Total Keseluruhan Laporan</h3>
    <p class="muted small" style="margin-top:-10px;">Total dari seluruh laporan Imunisasi (${imunReports.length} report) dan BIAS (${biasReports.length} report kelas) yang tersimpan.</p>
    
    <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
      <div class="card" style="padding:15px; background:var(--info-light); border:1px solid var(--info);">
        <h4 style="margin-top:0; color:var(--accent);">Total Imunisasi (${totalCapaianImun} dosis)</h4>
        <div style="max-height: 350px; overflow-y: auto;">
          <table class="kumulatif-table" style="margin-top:0;">
            <thead><tr><th>Vaksin</th><th>L</th><th>P</th><th>Total</th></tr></thead>
            <tbody>${imunRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align:right; font-weight:700;">TOTAL IMUNISASI:</td>
                <td style="font-weight:700;">${totalCapaianImun}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <div class="card" style="padding:15px; background:var(--info-light); border:1px solid var(--info);">
        <h4 style="margin-top:0; color:var(--accent);">Total BIAS (${totalCapaianBias} dosis)</h4>
        <div style="margin-bottom:15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
           <p style="margin:0 0 3px 0; font-weight:700; color:var(--accent); font-size:1rem;">Sasaran Total: ${grandTotalSasaranBias}</p>
           <p style="margin:0; font-weight:700; color:var(--danger); font-size:1rem;">Drop Out Total: ${biasKumulatif.DropOut}</p>
        </div>
        <div style="max-height: 350px; overflow-y: auto;">
          <table class="kumulatif-table" style="margin-top:0;">
            <thead><tr><th>Vaksin</th><th>L</th><th>P</th><th>Total</th></tr></thead>
            <tbody>${biasRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align:right; font-weight:700;">TOTAL BIAS:</td>
                <td style="font-weight:700;">${totalCapaianBias}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML += grandTotalHtml;
}

// Initial calls
document.addEventListener('DOMContentLoaded', () => {
  initImunisasiForm();
  fillImunSelects();
  initBiasDropdowns();
  // displayKumulatif is called when Kumulatif tab is clicked
});