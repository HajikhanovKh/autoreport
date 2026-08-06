if (!document.documentElement.classList.contains('w-editor')) {
    (function() {
        const DOGRU_SIFRE = "Analog*+2026+*";
        document.body.style.overflow = 'hidden';
        
        const overlay = document.createElement('div');
        overlay.id = "security-overlay";
        overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); z-index: 9999999; display: flex; justify-content: center; align-items: center;";
        overlay.innerHTML = `
            <div style="background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; width: 100%; max-width: 380px;">
                <div style="background: #e0e7ff; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; color: #4f46e5; font-size: 28px;">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Giriş Təsdiqi</h2>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Sistemə daxil olmaq üçün şifrəni yazın.</p>
                <input type="password" id="sec-password" placeholder="Şifrəni daxil edin..." style="width: 100%; box-sizing: border-box; padding: 14px 16px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 15px; outline: none; transition: 0.2s;">
                <p id="sec-error" style="color: #ef4444; font-size: 13px; font-weight: 600; margin: 0 0 14px 0; display: none;">❌ Yanlış şifrə!</p>
                <button id="sec-submit" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">Daxil Ol</button>
            </div>`;
        document.body.appendChild(overlay);
        
        const input = document.getElementById('sec-password');
        const btn = document.getElementById('sec-submit');
        const error = document.getElementById('sec-error');
        
        function checkPassword() {
            if (input.value === DOGRU_SIFRE) {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.4s ease';
                document.body.style.overflow = '';
                setTimeout(() => overlay.remove(), 400);
            } else {
                error.style.display = 'block';
                input.style.borderColor = '#ef4444';
                input.value = '';
                input.focus();
            }
        }
        
        btn.addEventListener('click', checkPassword);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') checkPassword();
        });
        
        setTimeout(() => input.focus(), 100);
    })();
}

document.addEventListener("DOMContentLoaded", function() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes flashHighlight {
            0% { background-color: #fde047; }
            50% { background-color: #fef08a; }
            100% { background-color: transparent; }
        }
        .highlight-row { animation: flashHighlight 3s ease-out; }
    `;
    document.head.appendChild(style);

    const actionBtns = document.querySelectorAll('.action-bar .btn');
    actionBtns.forEach(btn => {
        // Bu düymələri heç vaxt kilidləmə:
        const excludedIds = [
            'btn-open-cover-settings', 
            'bildiris-nomre-btn',
            'raport-nomre-btn', // YENİ ƏLAVƏ EDİLƏN DÜYMƏ
            'bildiris-qosma', 
            'btn-raport-qosma', 
            'btn-open-cover-gen'
        ];
        
        if (!excludedIds.includes(btn.id)) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    });

    const COVER_API = 'https://autoreport-production.up.railway.app/api/coverinfo';
    let currentCoverId = 1;

    const coverSettingsModal = document.getElementById('cover-settings-modal');
    const coverGenModal = document.getElementById('cover-gen-modal');
    const btnOpenCoverSettings = document.getElementById('btn-open-cover-settings');
    const btnOpenCoverGen = document.getElementById('btn-open-cover-gen');

    if(btnOpenCoverSettings) btnOpenCoverSettings.addEventListener('click', openCoverSettings);
    if(btnOpenCoverGen) btnOpenCoverGen.addEventListener('click', openCoverGenerateModal);

    const btnCoverClose = document.getElementById('btn-cover-close');
    if(btnCoverClose) btnCoverClose.onclick = () => coverSettingsModal.style.display = 'none';
    
    const btnCoverEdit = document.getElementById('btn-cover-edit');
    if(btnCoverEdit) btnCoverEdit.onclick = () => toggleCoverMode(true);
    
    const btnCoverCancel = document.getElementById('btn-cover-cancel');
    if(btnCoverCancel) btnCoverCancel.onclick = () => toggleCoverMode(false);
    
    const btnCoverSave = document.getElementById('btn-cover-save');
    if(btnCoverSave) btnCoverSave.onclick = saveCoverData;
    
    const btnExecuteCover = document.getElementById('btn-execute-cover');
    if(btnExecuteCover) btnExecuteCover.onclick = executeCoverGenerate;

    function openCoverSettings(e) {
        e.preventDefault();
        coverSettingsModal.style.display = 'flex';
        fetchCoverData();
    }

    function toggleCoverMode(isEdit) {
        document.getElementById('cover-view-mode').style.display = isEdit ? 'none' : 'block';
        document.getElementById('cover-edit-mode').style.display = isEdit ? 'block' : 'none';
        document.getElementById('btn-cover-edit').style.display = isEdit ? 'none' : 'inline-block';
        document.getElementById('btn-cover-close').style.display = isEdit ? 'none' : 'inline-block';
        document.getElementById('btn-cover-save').style.display = isEdit ? 'inline-block' : 'none';
        document.getElementById('btn-cover-cancel').style.display = isEdit ? 'inline-block' : 'none';
    }

    function fetchCoverData() {
        fetch(COVER_API).then(r => r.json()).then(data => {
            currentCoverId = data.id || 1;
            document.getElementById('cv-go').innerText = data.go || '-';
            document.getElementById('cv-adres').innerText = data.adres || '-';
            document.getElementById('ci-go').value = data.go || '';
            document.getElementById('ci-adres').value = data.adres || '';
        }).catch(err => console.error(err));
    }

    function saveCoverData() {
        const payload = { go: document.getElementById('ci-go').value, adres: document.getElementById('ci-adres').value };
        const btn = document.getElementById('btn-cover-save');
        btn.innerText = "Gözləyin..."; btn.disabled = true;
        
        fetch(`${COVER_API}/${currentCoverId}`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        }).then(() => {
            fetchCoverData();
            toggleCoverMode(false);
        }).finally(() => { btn.innerText = "Saxla"; btn.disabled = false; });
    }

    function openCoverGenerateModal(e) {
        e.preventDefault();
        const checkedFirms = document.querySelectorAll(".firma-check2:checked:not([disabled])");
        if (checkedFirms.length === 0) { 
            alert("Zəhmət olmasa siyahıdan ən azı bir firma seçin!"); 
            return; 
        }

        let listHtml = "";
        window.pendingCovers = [];

        checkedFirms.forEach(cb => {
            let voen = cb.getAttribute("data-voen") || "";
            if (voen === "undefined" || voen === "null") voen = "";

            let isFiziki = cb.getAttribute("data-isfiziki") === "true";
            
            let rawFirma = cb.getAttribute("data-firma") || "";
            if (rawFirma === "undefined" || rawFirma === "null") rawFirma = "";
            const firmaAdi = rawFirma.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            
            let dbData = {};
            if (typeof allCompaniesData !== "undefined" && Array.isArray(allCompaniesData)) {
                dbData = allCompaniesData.find(c => c.voen && c.voen.toString() === voen) || {};
            }
            
            let director = dbData.comp_director_name || "";
            if (!director || director === "undefined" || director === "null") director = "Qeyd edilməyib";
            
            let fullAddress = dbData.comp_adress || "";
            if (!fullAddress || fullAddress === "undefined" || fullAddress === "null") fullAddress = "Ünvan qeyd edilməyib";
            
            let zipIndex = "";
            let cleanAddress = fullAddress;
            
            let match = fullAddress.match(/(AZ[-\s]?\d{4})/i);
            if (match && match[1]) {
                zipIndex = match[1];
                cleanAddress = fullAddress.replace(match[1], '').replace(/^[,\s]+|[,\s]+$/g, '').trim();
            }

            if (!cleanAddress) cleanAddress = "Ünvan qeyd edilməyib";

            const covername = director;
            const covercompany = isFiziki ? "" : firmaAdi;
            
            const finalDisplayName = covercompany ? covercompany : covername;
            const finalZipIndex = zipIndex ? zipIndex : "";

            window.pendingCovers.push({ 
                covername: covername, 
                covercompany: covercompany, 
                covercompanyadres: cleanAddress, 
                index: finalZipIndex 
            });

            listHtml += `<li style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:8px;">
                <div style="font-weight:700; color:#1e293b; font-size:13px;">${finalDisplayName} <span style="color:#8b5cf6; float:right;">${finalZipIndex}</span></div>
                <div style="font-size:11px; color:#64748b; margin-top:4px;">${cleanAddress}</div>
            </li>`;
        });

        const coverGenList = document.getElementById('cover-gen-list');
        if (coverGenList) coverGenList.innerHTML = listHtml;
        
        if (coverGenModal) coverGenModal.style.display = 'flex';
    }

    async function executeCoverGenerate() {
        const btn = document.getElementById('btn-execute-cover');
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Hazırlanır...`;
        btn.disabled = true;

        try {
            const response = await fetch('https://autoreport-production.up.railway.app/api/generate-cover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedFirms: window.pendingCovers })
            });

            if (!response.ok) throw new Error("Server xətası yarandı");

            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Zerf_Uzlukleri_${getTodayFormatted()}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            document.getElementById('cover-gen-modal').style.display = 'none';
        } catch (error) {
            alert("Xəta: " + error.message);
        } finally {
            btn.innerHTML = `<i class="fa-solid fa-file-word"></i> Hazırla və Yüklə`;
            btn.disabled = false;
        }
    }

    const API_URL = 'https://autoreport-production.up.railway.app/api/companies';
    const SIGNER_API_URL = 'https://autoreport-production.up.railway.app/api/mesulsexs';
    const BIL_API_URL = 'https://autoreport-production.up.railway.app/api/bildirisler';
    const RAPORT_API_URL = 'https://autoreport-production.up.railway.app/api/raportinfo';
    const RAPORT_AYAR_API_URL = 'https://autoreport-production.up.railway.app/api/raportayarlar';

    let allCompaniesData = [];
    let currentFilteredData = [];
    let currentFilterType = "";
    let currentPage = 1;
    const rowsPerPage = 20;
    
    let currentBilPage = 1;
    const bilRowsPerPage = 20;
    
    let minAmountFilter = 0; 
    let currentSignerId = null;
    let allBildirislerData = []; 
    let allRaportData = [];
    let raportAyarlarData = {};

    const addVoenBtn = document.getElementById("add-voen-data");
    const closePopupBtn = document.getElementById("close-popup");
    const popupDiv = document.getElementById("popup_1");
    const inputVoen = document.getElementById('add-voen');
    const inputCompany = document.getElementById('add-company');
    const inputLeader = document.getElementById('add-leader');
    const inputAddress = document.getElementById('add-address');
    const radioPerson1 = document.getElementById('person1'); 
    const radioPerson2 = document.getElementById('person2'); 
    const saveBtn = document.getElementById('data-save-btn');
    const voenSrcIcon = document.getElementById('voen-src-icon');
    const statusMsg = document.getElementById('data-status-msg');
    const tableSearchInput = document.getElementById('table-search-input');
    const voenTbody = document.getElementById('voen-tbody');
    const dataCountBadge = document.getElementById('data-count-badge');
    const refreshDbBtn = document.getElementById('refresh-db-btn');
    
    const meblegBtn = document.getElementById('mebleg-axtarisi');
    const popupMebleg = document.getElementById('popup_mebleg');
    const closeMeblegBtn = document.getElementById('close-mebleg-popup');
    const applyMeblegBtn = document.getElementById('apply-mebleg-btn');
    const minAmountInput = document.getElementById('min-amount-input');

    const signerBtn = document.getElementById('signer-btn');
    const popupSigners = document.getElementById('popup_signers');
    const closeSignerBtn = document.getElementById('close-signer-popup');
    const saveSignersBtn = document.getElementById('save-signers-btn');
    const iLeaderPerson = document.getElementById('sign-leader-person');
    const iLeaderName = document.getElementById('sign-leader-name');
    const iSecondPerson = document.getElementById('sign-second-person');
    const iPhone = document.getElementById('sign-phone');
    const signerStatusMsg = document.getElementById('signer-status-msg');

    const bildirisBtn = document.getElementById('bildiris-nomre-btn');
    const bildirisPopup = document.getElementById('popup_bildirisler');
    const closeBildirisBtn = document.getElementById('close-bildiris-popup');
    const bildirisTbody = document.getElementById('bildiris-tbody');
    const missingBadge = document.getElementById('missing-nomre-count');

    const preZipPopup = document.getElementById('popup_pre_zip_warning');
    const closePrezipBtn = document.getElementById('close-prezip-popup');
    const cancelPrezipBtn = document.getElementById('cancel-prezip-btn');
    const confirmPrezipBtn = document.getElementById('confirm-zip-btn');
    const prezipTbody = document.getElementById('prezip-tbody');

    const zipPopup = document.getElementById('popup_zip_selection');
    const closeZipPopupBtn = document.getElementById('close-zip-popup');
    const cancelZipSaveBtn = document.getElementById('cancel-zip-save');
    const saveZipSelectionsBtn = document.getElementById('save-zip-selections-btn');
    const zipTbody = document.getElementById('zip-selection-tbody');
    const zipSelectAll = document.getElementById('zip-select-all');

    const preRaportPopup = document.getElementById('popup_pre_raport_warning');
    const closePreRaportBtn = document.getElementById('close-preraport-popup');
    const cancelPreRaportBtn = document.getElementById('cancel-preraport-btn');
    const confirmRaportZipBtn = document.getElementById('confirm-raport-zip-btn');
    const preraportTbody = document.getElementById('preraport-tbody');

    const raportZipPopup = document.getElementById('popup_raport_selection');
    const closeRaportZipPopupBtn = document.getElementById('close-raport-zip-popup');
    const cancelRaportZipSaveBtn = document.getElementById('cancel-raport-zip-save');
    const saveRaportSelectionsBtn = document.getElementById('save-raport-selections-btn');
    const raportZipTbody = document.getElementById('raport-zip-selection-tbody');
    const raportZipSelectAll = document.getElementById('raport-zip-select-all');

    let pendingDbSavePayload = [];
    let pendingRaportDbSavePayload = []; 
    let selectedFile = null; 
    const analizBtn = document.getElementById('analiz-start'); 

    function normStr(str) {
        if(!str) return "";
        return str.toString().toLowerCase().replace(/ü/g, 'u').replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/\s+/g, '');
    }

    function excelDateToJSDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.toString().trim().split('.');
        if (parts.length !== 3) return null;
        const isoString = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00`;
        return new Date(isoString);
    }

    function getTodayFormatted() { 
        const today = new Date(); 
        return `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`; 
    }
    
    function setStatus(message, isError = false) { 
        if (statusMsg) { 
            statusMsg.innerText = message; 
            statusMsg.style.color = isError ? '#ef4444' : '#10b981'; 
            statusMsg.style.display = 'block'; 
        } 
    }
    
    function refreshAnalysisIfPossible() { 
        if (selectedFile && analizBtn) analizBtn.click(); 
    }

    if (meblegBtn && popupMebleg) { 
        meblegBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            minAmountInput.value = minAmountFilter; 
            popupMebleg.style.display = 'flex'; 
        }); 
    }
    
    if (closeMeblegBtn && popupMebleg) { 
        closeMeblegBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            popupMebleg.style.display = 'none'; 
        }); 
    }
    
    if (applyMeblegBtn && popupMebleg) {
        applyMeblegBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            let val = parseFloat(minAmountInput.value);
            if (isNaN(val)) val = 0; 
            minAmountFilter = val;
            popupMebleg.style.display = 'none'; 
            refreshAnalysisIfPossible();
        });
    }

   //----------------------------------------------------
   // ==========================================
    // İMZALAYAN ŞƏXSLƏR PƏNCƏRƏSİ (DİNAMİK VƏ 2 BÖLMƏLİ)
    // ==========================================
    
    
    // Pəncərənin daxilini 2 bölməli xüsusi dizaynla JS vasitəsilə sıfırdan qururuq
    if (popupSigners) {
        popupSigners.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 99999; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; border-radius: 16px; width: 90%; max-width: 650px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column;">
                <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-top-left-radius: 16px; border-top-right-radius: 16px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;"><i class="fa-solid fa-users-gear" style="color: #3b82f6; margin-right: 8px;"></i>İmzalayan Şəxslərin Tənzimlənməsi</h2>
                    <button id="close-signer-popup-btn" style="background: transparent; border: none; font-size: 24px; color: #64748b; cursor: pointer; transition: 0.2s;">&times;</button>
                </div>
                <div style="padding: 24px; max-height: 70vh; overflow-y: auto;">
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 10px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #1e40af; border-bottom: 1px dashed #93c5fd; padding-bottom: 10px;"><i class="fa-solid fa-file-signature" style="margin-right: 6px;"></i>1. Bildirişlərin hazırlanmasında məsul şəxslər</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">İmzalayan şəxsin vəzifəsi</label>
                                <!-- Vəzifə xanası Textarea edildi -->
                                <textarea id="dyn-sign-leader-person" rows="2" placeholder="Məs: İdarə rəisinin müavini..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">İmzalayan şəxsin Soyadı, adı</label>
                                <!-- Yeni Input əlavə edildi -->
                                <input type="text" id="dyn-sign-leader-name" placeholder="Məs: Həsənov Həsən..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">İcra edən şəxsin Soyadı, adı</label>
                                <input type="text" id="dyn-sign-second-person" placeholder="Məs: Həsənov Həsən..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Telefon nömrəsi</label>
                                <input type="text" id="dyn-sign-phone" placeholder="Məs: 050 123 45 67..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 10px;">
                        <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #166534; border-bottom: 1px dashed #86efac; padding-bottom: 10px;"><i class="fa-solid fa-file-contract" style="margin-right: 6px;"></i>2. Raportun hazırlanması üçün məlumatlar</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Raportun yazıldığı şəxsin vəzifəsi</label>
                                <!-- Vəzifə xanası Textarea edildi -->
                                <textarea id="dyn-rap-reisi-vezifesi" rows="2" placeholder="Məs: Gömrük İdarəsinin Rəisinə..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Həmin şəxsin Soyadı, adı</label>
                                <input type="text" id="dyn-rap-reisi-adi" placeholder="Məs: cənab Vəli Əliyevə..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Raportu imzalayacaq şəxsin vəzifəsi</label>
                                <!-- Vəzifə xanası Textarea edildi -->
                                <textarea id="dyn-rap-mesul-vezife" rows="2" placeholder="Məs: Gömrük Əməliyyatları Bölməsinin rəisi..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">İmzalayacaq şəxsin Soyadı, adı</label>
                                <input type="text" id="dyn-rap-mesul-adi" placeholder="Məs: Həsən Həsənov..." style="width: 100%; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; display: flex; justify-content: flex-end; align-items: center; gap: 16px;">
                    <span id="dyn-signer-status-msg" style="font-size: 13px; font-weight: 700; display: none;"></span>
                    <button id="dyn-save-signers-btn" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-save" style="margin-right: 6px;"></i> Yadda Saxla</button>
                </div>
            </div>
        </div>
        `;
        popupSigners.style.background = 'transparent'; 
    }

    function loadSigners() {
        fetch(SIGNER_API_URL).then(r => r.json()).then(data => {
            if (data && data.length > 0) {
                const s = data[0]; 
                currentSignerId = s.id; 
                let el1 = document.getElementById('dyn-sign-leader-person'); if(el1) el1.value = s.leaderperson || ''; 
                let el2 = document.getElementById('dyn-sign-leader-name'); if(el2) el2.value = s.leadername || ''; // Gizli dəyər
                let el3 = document.getElementById('dyn-sign-second-person'); if(el3) el3.value = s.secondperson || ''; 
                let el4 = document.getElementById('dyn-sign-phone'); if(el4) el4.value = s.phone || '';
            }
        }).catch(err => console.error(err));
    }

    function loadRaportAyarlar() {
        fetch(RAPORT_AYAR_API_URL).then(r => r.json()).then(data => {
            if(data && data.length > 0) {
                raportAyarlarData = data[0];
                let r1 = document.getElementById('dyn-rap-reisi-vezifesi'); if(r1) r1.value = raportAyarlarData.idarereisivezifesi || '';
                let r2 = document.getElementById('dyn-rap-reisi-adi'); if(r2) r2.value = raportAyarlarData.idarereisi || '';
                let r3 = document.getElementById('dyn-rap-mesul-vezife'); if(r3) r3.value = raportAyarlarData.mesulsexsvezifesi || raportAyarlarData.mesulsexsvezife || '';
                let r4 = document.getElementById('dyn-rap-mesul-adi'); if(r4) r4.value = raportAyarlarData.mesulsexs || '';
            }
        }).catch(e => console.error("Raport Ayar Xətası:", e));
    }

    if (signerBtn && popupSigners) { 
        signerBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            popupSigners.style.display = 'block'; 
            let msg = document.getElementById('dyn-signer-status-msg');
            if(msg) msg.style.display = 'none'; 
            
            // Pəncərə açılanda dərhal 2 cədvəldən də məlumatları çəkir
            loadSigners();
            loadRaportAyarlar();
        }); 
    }

    // Modalın düymələri dinamik yaradıldığı üçün EventListener-ləri xüsusi formada bağlayırıq
    document.addEventListener('click', async function(e) {
        // Pəncərəni bağlama düyməsi
        if (e.target && (e.target.id === 'close-signer-popup-btn' || e.target.closest('#close-signer-popup-btn'))) {
            e.preventDefault();
            if (popupSigners) popupSigners.style.display = 'none';
        }

        // Məlumatları Yadda Saxlama düyməsi
        if (e.target && (e.target.id === 'dyn-save-signers-btn' || e.target.closest('#dyn-save-signers-btn'))) {
            e.preventDefault();
            const btn = document.getElementById('dyn-save-signers-btn');
            const msg = document.getElementById('dyn-signer-status-msg');

            // 1-ci bölmə: Bildirişlər üçün paket
            const payloadMesul = { 
                leaderperson: document.getElementById('dyn-sign-leader-person').value.trim(), 
                leadername: document.getElementById('dyn-sign-leader-name').value.trim(), 
                secondperson: document.getElementById('dyn-sign-second-person').value.trim(), 
                phone: document.getElementById('dyn-sign-phone').value.trim() 
            };
            
            // 2-ci bölmə: Raportlar üçün paket
            // 1. Bazadan gələn bütün köhnə məlumatları (mezenne və s.) qoruyuruq
            let payloadRaport = { ...raportAyarlarData };
            
            // 2. Yeni yazılan məlumatları aidiyyatı üzrə yeniləyirik
            payloadRaport.idarereisivezifesi = document.getElementById('dyn-rap-reisi-vezifesi').value.trim();
            payloadRaport.idarereisi = document.getElementById('dyn-rap-reisi-adi').value.trim();
            payloadRaport.mesulsexs = document.getElementById('dyn-rap-mesul-adi').value.trim();

            // 3. Sütun adı xətası üçün ağıllı yoxlama:
            if (payloadRaport.hasOwnProperty('mesulsexsvezife')) {
                payloadRaport.mesulsexsvezife = document.getElementById('dyn-rap-mesul-vezife').value.trim();
            } else {
                payloadRaport.mesulsexsvezifesi = document.getElementById('dyn-rap-mesul-vezife').value.trim();
            }

            let methodMesul = currentSignerId ? 'PUT' : 'POST'; 
            let urlMesul = currentSignerId ? `${SIGNER_API_URL}/${currentSignerId}` : SIGNER_API_URL;
            
            let methodRaport = (raportAyarlarData && raportAyarlarData.id) ? 'PUT' : 'POST';
            let urlRaport = (raportAyarlarData && raportAyarlarData.id) ? `${RAPORT_AYAR_API_URL}/${raportAyarlarData.id}` : RAPORT_AYAR_API_URL;

            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Yadda Saxlanılır...`; 
            btn.disabled = true;

            try {
                // Hər iki bazaya eyni anda sinxron müraciət edirik
                const [resMesul, resRaport] = await Promise.all([
                    fetch(urlMesul, { method: methodMesul, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadMesul) }),
                    fetch(urlRaport, { method: methodRaport, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadRaport) })
                ]);

                if (!resMesul.ok || !resRaport.ok) throw new Error("Server xətası baş verdi");

                const dataMesul = await resMesul.json();
                const dataRaport = await resRaport.json();

                // Əgər bazada ilk dəfə yaradılıbsa ID-ləri proqrama tanıtdırırıq
                if (!currentSignerId && dataMesul && dataMesul.id) currentSignerId = dataMesul.id;
                if (!raportAyarlarData.id && dataRaport && dataRaport.id) raportAyarlarData.id = dataRaport.id;

                if (msg) {
                    msg.innerText = "Hər iki məlumat uğurla yadda saxlanıldı! ✅"; 
                    msg.style.color = "#166534"; 
                    msg.style.display = "block";
                }
                
                // Məlumatlar yeniləndikdən sonra fona da çəkirik
                loadSigners();
                loadRaportAyarlar();

                setTimeout(() => { if (popupSigners) popupSigners.style.display = 'none'; }, 2000);

            } catch(err) {
                if (msg) {
                    msg.innerText = "Xəta baş verdi, interneti yoxlayın!"; 
                    msg.style.color = "#ef4444"; 
                    msg.style.display = "block";
                }
            } finally {
                btn.innerHTML = `<i class="fa-solid fa-save" style="margin-right: 6px;"></i> Yadda Saxla`; 
                btn.disabled = false; 
            }
        }
    });


    
    //---------------------------------------------------
    if (saveSignersBtn) {
        saveSignersBtn.addEventListener('click', e => {
            e.preventDefault();
            const payload = { 
                leaderperson: iLeaderPerson.value.trim(), 
                leadername: iLeaderName.value.trim(), 
                secondperson: iSecondPerson.value.trim(), 
                phone: iPhone.value.trim() 
            };
            let method = currentSignerId ? 'PUT' : 'POST'; 
            let url = currentSignerId ? `${SIGNER_API_URL}/${currentSignerId}` : SIGNER_API_URL;
            saveSignersBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gözləyin...`; 
            saveSignersBtn.disabled = true;

            fetch(url, { 
                method: method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload)
            }).then(res => res.json()).then(data => {
                signerStatusMsg.innerText = "Uğurla yadda saxlanıldı! ✅"; 
                signerStatusMsg.style.color = "#10b981"; 
                signerStatusMsg.style.display = "block";
                if (!currentSignerId && data && data.id) currentSignerId = data.id;
                setTimeout(() => { popupSigners.style.display = 'none'; }, 1500);
            }).catch(err => {
                signerStatusMsg.innerText = "Xəta baş verdi!"; 
                signerStatusMsg.style.color = "#ef4444"; 
                signerStatusMsg.style.display = "block";
            }).finally(() => { 
                saveSignersBtn.innerHTML = `<i class="fa-solid fa-save"></i> Yadda Saxla`; 
                saveSignersBtn.disabled = false; 
            });
        });
    }
    
    function loadAllBildirisler(callback) {
        fetch(BIL_API_URL).then(r => r.json()).then(data => {
            allBildirislerData = data || [];
            const missingCount = allBildirislerData.filter(b => !b.bildiris_nomresi || b.bildiris_nomresi.trim() === "").length;
            if(missingBadge) missingBadge.innerText = missingCount;
            refreshAnalysisIfPossible();
            if(callback) callback();
        }).catch(err => console.error(err));
    }

    function loadAllRaports(callback) {
        fetch(RAPORT_API_URL).then(r => r.json()).then(data => {
            allRaportData = data || [];
            if(callback) callback();
        }).catch(err => console.error("Raport xətası:", err));
    }

    function renderBildirisTable(highlightId = null) {
        if (!bildirisTbody) return;
        
        let sortedData = [...allBildirislerData].sort((a, b) => {
            const aEmpty = (!a.bildiris_nomresi || a.bildiris_nomresi.trim() === '');
            const bEmpty = (!b.bildiris_nomresi || b.bildiris_nomresi.trim() === '');
            if (aEmpty && !bEmpty) return -1;
            if (!aEmpty && bEmpty) return 1;
            return b.id - a.id; 
        });

        if (highlightId) {
            const targetIndex = sortedData.findIndex(item => item.id.toString() === highlightId.toString());
            if (targetIndex !== -1) {
                currentBilPage = Math.floor(targetIndex / bilRowsPerPage) + 1;
            }
        }

        const totalPages = Math.ceil(sortedData.length / bilRowsPerPage) || 1;
        if (currentBilPage > totalPages) currentBilPage = totalPages;

        const startIndex = (currentBilPage - 1) * bilRowsPerPage;
        const pageData = sortedData.slice(startIndex, startIndex + bilRowsPerPage);

        bildirisTbody.innerHTML = '';
        if (pageData.length === 0) {
            bildirisTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:#94a3b8;">Sistemdə heç bir bildiriş məlumatı tapılmadı.</td></tr>`;
            renderBilPagination(totalPages);
            return;
        }
        
        pageData.forEach(b => {
            const tr = document.createElement('tr');
            if (highlightId && b.id.toString() === highlightId.toString()) {
                tr.classList.add('highlight-row');
            }

            let isMissing = (!b.bildiris_nomresi || b.bildiris_nomresi.trim() === '');
            
            tr.setAttribute('data-id', b.id);
            tr.setAttribute('data-orqan', b.gomruk_orqani || '');
            tr.setAttribute('data-firma', b.firma || '');
            tr.setAttribute('data-voen', b.voen || '');
            tr.setAttribute('data-tarix', b.tarix_yazilma || '');
            tr.setAttribute('data-dovr', b.tarix_borcdovru || '');
            tr.setAttribute('data-melumat', b.melumat || '');
            tr.setAttribute('data-nomre', b.bildiris_nomresi || '');

            let safeFirma = (b.firma || '').replace(/"/g, '&quot;');
            let melumatText = b.melumat || '';

            if (isMissing) {
                tr.innerHTML = `
                    <td style="font-size: 11px; color:#475569;">${b.gomruk_orqani || '—'}</td>
                    <td><div style="font-weight:700; font-size:12px;">${safeFirma}</div><div style="font-size:11px; color:#64748b;">${b.voen || '—'}</div></td>
                    <td>
                        <input type="text" class="modal-input edit-tarix-${b.id}" value="${b.tarix_yazilma || ''}" style="width:100%; font-size:11px; padding:4px; margin-bottom:4px;" placeholder="Tarix">
                        <div style="font-size:11px; color:#64748b;">${b.tarix_borcdovru || '—'}</div>
                    </td>
                    <td style="font-size:11px; color:#2563eb; font-weight:600;">${melumatText}</td>
                    <td>
                        <div style="display:flex; gap:6px; flex-direction:column; align-items:center;">
                            <input type="text" class="modal-input edit-nomre-${b.id}" placeholder="Nömrə əlavə et..." style="padding:4px; font-size:12px; width:100%; text-align:center; border-color:#ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2);">
                            <div style="display:flex; gap:6px; width:100%;">
                                <button class="btn-primary" style="flex:1; padding:4px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#10b981; color:white;" onclick="updateBildirisFromTable(${b.id})">
                                    <i class="fa-solid fa-save"></i> Saxla
                                </button>
                                <button style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#ef4444; color:white;" onclick="deleteBildiris(${b.id})">
                                    <i class="fa-solid fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    </td>`;
            } else {
                tr.innerHTML = `
                    <td style="font-size: 11px; color:#475569;">${b.gomruk_orqani || '—'}</td>
                    <td><div style="font-weight:700; font-size:12px;">${safeFirma}</div><div style="font-size:11px; color:#64748b;">${b.voen || '—'}</div></td>
                    <td>
                        <div class="view-tarix-${b.id}" style="font-size:11px; font-weight:600; margin-bottom:2px;">${b.tarix_yazilma || '—'}</div>
                        <input type="text" class="modal-input edit-tarix-${b.id}" value="${b.tarix_yazilma || ''}" style="display:none; width:100%; font-size:11px; padding:4px; margin-bottom:4px;" placeholder="Tarix">
                        <div style="font-size:11px; color:#64748b;">${b.tarix_borcdovru || '—'}</div>
                    </td>
                    <td style="font-size:11px; color:#2563eb; font-weight:600;">${melumatText}</td>
                    <td>
                        <div class="view-panel-${b.id}" style="display:flex; gap:10px; align-items:center; justify-content:center;">
                            <span style="color:#166534; font-weight:700; font-size:13px;">${b.bildiris_nomresi}</span>
                            <div style="display:flex; gap:6px;">
                                <button onclick="enableEditMode(${b.id})" style="border-radius: 50%; border: none; cursor: pointer; background: transparent; color: #f59e0b; font-size: 14px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" title="Dəyişdir">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button onclick="deleteBildiris(${b.id})" style="border-radius: 50%; border: none; cursor: pointer; background: transparent; color: #ef4444; font-size: 14px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" title="Sil">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="edit-panel-${b.id}" style="display:none; flex-direction:column; gap:6px; align-items:center;">
                            <input type="text" class="modal-input edit-nomre-${b.id}" value="${b.bildiris_nomresi}" style="padding:4px; font-size:12px; width:100%; text-align:center;">
                            <div style="display:flex; gap:6px; width:100%;">
                                <button class="btn-primary" style="flex:1; padding:4px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#10b981; color:white;" onclick="updateBildirisFromTable(${b.id})">
                                    <i class="fa-solid fa-save"></i> Saxla
                                </button>
                                <button style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#ef4444; color:white;" onclick="deleteBildiris(${b.id})">
                                    <i class="fa-solid fa-trash"></i> Sil
                                </button>
                                <button style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#94a3b8; color:white;" onclick="cancelEditMode(${b.id})">
                                    <i class="fa-solid fa-xmark"></i> Ləğv
                                </button>
                            </div>
                        </div>
                    </td>`;
            }
            bildirisTbody.appendChild(tr);
        });

        renderBilPagination(totalPages);
    }

    function renderBilPagination(totalPages) {
        let container = document.getElementById('bildiris-pagination-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'bildiris-pagination-controls';
            container.className = 'pagination-container';
            const wrapper = document.querySelector('#popup_bildirisler .table-wrapper');
            if(wrapper) wrapper.appendChild(container);
        }
        container.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button'); 
        prevBtn.className = 'page-btn'; 
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentBilPage === 1; 
        prevBtn.onclick = (e) => { e.preventDefault(); currentBilPage--; renderBildirisTable(); };
        container.appendChild(prevBtn);

        let startPage = Math.max(1, currentBilPage - 2); 
        let endPage = Math.min(totalPages, currentBilPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            const pBtn = document.createElement('button'); 
            pBtn.className = `page-btn ${i === currentBilPage ? 'active' : ''}`; 
            pBtn.innerText = i;
            pBtn.onclick = (e) => { e.preventDefault(); currentBilPage = i; renderBildirisTable(); }; 
            container.appendChild(pBtn);
        }

        const nextBtn = document.createElement('button'); 
        nextBtn.className = 'page-btn'; 
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentBilPage === totalPages; 
        nextBtn.onclick = (e) => { e.preventDefault(); currentBilPage++; renderBildirisTable(); };
        container.appendChild(nextBtn);
    }

    window.enableEditMode = function(id) {
        const viewTarix = document.querySelector(`.view-tarix-${id}`);
        const editTarix = document.querySelector(`.edit-tarix-${id}`);
        const viewPanel = document.querySelector(`.view-panel-${id}`);
        const editPanel = document.querySelector(`.edit-panel-${id}`);

        if(viewTarix) viewTarix.style.display = 'none';
        if(editTarix) editTarix.style.display = 'block';
        if(viewPanel) viewPanel.style.display = 'none';
        if(editPanel) editPanel.style.display = 'flex';
    }

    window.cancelEditMode = function(id) {
        const viewTarix = document.querySelector(`.view-tarix-${id}`);
        const editTarix = document.querySelector(`.edit-tarix-${id}`);
        const viewPanel = document.querySelector(`.view-panel-${id}`);
        const editPanel = document.querySelector(`.edit-panel-${id}`);

        if(viewTarix) viewTarix.style.display = 'block';
        if(editTarix) editTarix.style.display = 'none';
        if(viewPanel) viewPanel.style.display = 'flex';
        if(editPanel) editPanel.style.display = 'none';
    }

    window.updateBildirisFromTable = function(id) {
        const tr = document.querySelector(`tr[data-id="${id}"]`);
        if(!tr) return;

        const newTarix = document.querySelector(`.edit-tarix-${id}`).value.trim();
        const newNomre = document.querySelector(`.edit-nomre-${id}`).value.trim();

        if(!newNomre) {
            alert("Bəyannamə/Bildiriş nömrəsini daxil edin!");
            return;
        }

        const payload = {
            gomruk_orqani: tr.getAttribute('data-orqan'),
            firma: tr.getAttribute('data-firma'),
            voen: tr.getAttribute('data-voen'),
            tarix_yazilma: newTarix,
            tarix_borcdovru: tr.getAttribute('data-dovr'),
            melumat: tr.getAttribute('data-melumat'),
            bildiris_nomresi: newNomre
        };

        fetch(`${BIL_API_URL}/${id}`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload)
        }).then(() => { 
            loadAllBildirisler(() => renderBildirisTable());
        }).catch(err => {
            alert("Xəta baş verdi: " + err.message);
        });
    }

    window.deleteBildiris = function(id) {
        if(!confirm("Diqqət: Bu bildiriş qeydini bazadan tamamilə silmək istədiyinizə əminsiniz?")) return;
        fetch(`${BIL_API_URL}/${id}`, { method: 'DELETE' })
        .then(() => { loadAllBildirisler(() => renderBildirisTable()); })
        .catch(err => alert("Silinərkən xəta: " + err.message));
    }

    if (bildirisBtn && bildirisPopup) { 
        bildirisBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            bildirisPopup.style.display = 'flex'; 
            currentBilPage = 1; 
            renderBildirisTable(); 
        }); 
    }
    
    if (closeBildirisBtn && bildirisPopup) { 
        closeBildirisBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            bildirisPopup.style.display = 'none'; 
        }); 
    }

    window.openBildirisPanelAndHighlight = function(bilId) {
        if (bildirisPopup) {
            bildirisPopup.style.display = 'flex';
            renderBildirisTable(bilId);
            
            // Pəncərə açılandan dərhal sonra hədəfə sürüşdürmə (Scroll)
            setTimeout(() => {
                const modalBody = bildirisPopup.querySelector('.modal-body');
                const highlightedRow = bildirisPopup.querySelector('.highlight-row');
                
                if (highlightedRow) {
                    // Əgər rənglənmiş sətir varsa, onu ekranın mərkəzinə gətir
                    highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (modalBody) {
                    // Tapılmazsa, ən azından pəncərəni ən yuxarıya qaldır
                    modalBody.scrollTop = 0;
                }
            }, 50);
        }
    }

    // ========================================================
    // BURADAN AŞAĞIYA SİZİN GÖNDƏRDİYİNİZ YENİ KODU YAPIŞDIRIN
    // ========================================================

    let currentRapPage = 1;
    const rapRowsPerPage = 20;

    const raportBtn = document.getElementById('raport-nomre-btn');
    const raportNomrePopup = document.getElementById('popup_raport_nomreleri');
    const closeRaportNomreBtn = document.getElementById('close-raport-nomre-popup');
    const raportTbody = document.getElementById('raport-tbody');
    const missingRaportBadge = document.getElementById('missing-raport-count');

    // Raport məlumatlarının yüklənməsi və badge-in yenilənməsi
    function loadAllRaports(callback) {
        fetch(RAPORT_API_URL).then(r => r.json()).then(data => {
            allRaportData = data || [];
            const missingCount = allRaportData.filter(r => !r.raport_nomresi || r.raport_nomresi.trim() === "").length;
            if(missingRaportBadge) missingRaportBadge.innerText = missingCount;
            if(callback) callback();
        }).catch(err => console.error("Raport xətası:", err));
    }

    // Raport cədvəlinin ekrana çıxarılması
    function renderRaportTable(highlightId = null) {
        if (!raportTbody) return;
        
        let sortedData = [...allRaportData].sort((a, b) => {
            const aEmpty = (!a.raport_nomresi || a.raport_nomresi.trim() === '');
            const bEmpty = (!b.raport_nomresi || b.raport_nomresi.trim() === '');
            if (aEmpty && !bEmpty) return -1;
            if (!aEmpty && bEmpty) return 1;
            return b.id - a.id; 
        });

        if (highlightId) {
            const targetIndex = sortedData.findIndex(item => item.id.toString() === highlightId.toString());
            if (targetIndex !== -1) {
                currentRapPage = Math.floor(targetIndex / rapRowsPerPage) + 1;
            }
        }

        const totalPages = Math.ceil(sortedData.length / rapRowsPerPage) || 1;
        if (currentRapPage > totalPages) currentRapPage = totalPages;

        const startIndex = (currentRapPage - 1) * rapRowsPerPage;
        const pageData = sortedData.slice(startIndex, startIndex + rapRowsPerPage);

        raportTbody.innerHTML = '';
        if (pageData.length === 0) {
            raportTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:#94a3b8;">Sistemdə heç bir raport məlumatı tapılmadı.</td></tr>`;
            renderRapPagination(totalPages);
            return;
        }
        
        pageData.forEach(r => {
            const tr = document.createElement('tr');
            if (highlightId && r.id.toString() === highlightId.toString()) tr.classList.add('highlight-row');

            let isMissing = (!r.raport_nomresi || r.raport_nomresi.trim() === '');
            let safeFirma = (r.firma || '').replace(/"/g, '&quot;');
            let melumatText = r.melumat || '';

            tr.setAttribute('data-id', r.id);
            tr.setAttribute('data-orqan', r.gomruk_orqani || '');
            tr.setAttribute('data-firma', r.firma || '');
            tr.setAttribute('data-voen', r.voen || '');
            tr.setAttribute('data-tarix', r.tarix_yazilma || '');
            tr.setAttribute('data-dovr', r.tarix_borcdovru || '');
            tr.setAttribute('data-melumat', melumatText);

            if (isMissing) {
                tr.innerHTML = `
                    <td style="font-size: 11px; color:#475569;">${r.gomruk_orqani || '—'}</td>
                    <td><div style="font-weight:700; font-size:12px;">${safeFirma}</div><div style="font-size:11px; color:#64748b;">${r.voen || '—'}</div></td>
                    <td>
                        <input type="text" class="modal-input edit-rap-tarix-${r.id}" value="${r.tarix_yazilma || ''}" style="width:100%; font-size:11px; padding:4px; margin-bottom:4px;" placeholder="Tarix">
                        <div style="font-size:11px; color:#64748b;">${r.tarix_borcdovru || '—'}</div>
                    </td>
                    <td style="font-size:11px; color:#2563eb; font-weight:600;">${melumatText}</td>
                    <td>
                        <div style="display:flex; gap:6px; flex-direction:column; align-items:center;">
                            <input type="text" class="modal-input edit-rap-nomre-${r.id}" placeholder="Raport əlavə et..." style="padding:4px; font-size:12px; width:100%; text-align:center; border-color:#ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2);">
                            <div style="display:flex; gap:6px; width:100%;">
                                <button class="btn-primary" style="flex:1; padding:4px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#10b981; color:white;" onclick="updateRaportFromTable(${r.id})"><i class="fa-solid fa-save"></i> Saxla</button>
                                <button style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#ef4444; color:white;" onclick="deleteRaport(${r.id})"><i class="fa-solid fa-trash"></i> Sil</button>
                            </div>
                        </div>
                    </td>`;
            } else {
                tr.innerHTML = `
                    <td style="font-size: 11px; color:#475569;">${r.gomruk_orqani || '—'}</td>
                    <td><div style="font-weight:700; font-size:12px;">${safeFirma}</div><div style="font-size:11px; color:#64748b;">${r.voen || '—'}</div></td>
                    <td>
                        <div class="view-rap-tarix-${r.id}" style="font-size:11px; font-weight:600; margin-bottom:2px;">${r.tarix_yazilma || '—'}</div>
                        <input type="text" class="modal-input edit-rap-tarix-${r.id}" value="${r.tarix_yazilma || ''}" style="display:none; width:100%; font-size:11px; padding:4px; margin-bottom:4px;" placeholder="Tarix">
                        <div style="font-size:11px; color:#64748b;">${r.tarix_borcdovru || '—'}</div>
                    </td>
                    <td style="font-size:11px; color:#2563eb; font-weight:600;">${melumatText}</td>
                    <td>
                        <div class="view-rap-panel-${r.id}" style="display:flex; gap:10px; align-items:center; justify-content:center;">
                            <span style="color:#166534; font-weight:700; font-size:13px;">${r.raport_nomresi}</span>
                            <div style="display:flex; gap:6px;">
                                <button onclick="enableRaportEditMode(${r.id})" style="border-radius: 50%; border: none; cursor: pointer; background: transparent; color: #f59e0b; font-size: 14px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deleteRaport(${r.id})" style="border-radius: 50%; border: none; cursor: pointer; background: transparent; color: #ef4444; font-size: 14px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="edit-rap-panel-${r.id}" style="display:none; flex-direction:column; gap:6px; align-items:center;">
                            <input type="text" class="modal-input edit-rap-nomre-${r.id}" value="${r.raport_nomresi}" style="padding:4px; font-size:12px; width:100%; text-align:center;">
                            <div style="display:flex; gap:6px; width:100%;">
                                <button class="btn-primary" style="flex:1; padding:4px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#10b981; color:white;" onclick="updateRaportFromTable(${r.id})"><i class="fa-solid fa-save"></i> Saxla</button>
                                <button style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#ef4444; color:white;" onclick="deleteRaport(${r.id})"><i class="fa-solid fa-trash"></i> Sil</button>
                                <button style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer; font-size:11px; background:#94a3b8; color:white;" onclick="cancelRaportEditMode(${r.id})"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        </div>
                    </td>`;
            }
            raportTbody.appendChild(tr);
        });
        renderRapPagination(totalPages);
    }

    function renderRapPagination(totalPages) {
        let container = document.getElementById('raport-pagination-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'raport-pagination-controls';
            container.className = 'pagination-container';
            const wrapper = document.querySelector('#popup_raport_nomreleri .table-wrapper');
            if(wrapper) wrapper.appendChild(container);
        }
        container.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button'); 
        prevBtn.className = 'page-btn'; prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentRapPage === 1; 
        prevBtn.onclick = (e) => { e.preventDefault(); currentRapPage--; renderRaportTable(); };
        container.appendChild(prevBtn);

        let startPage = Math.max(1, currentRapPage - 2); 
        let endPage = Math.min(totalPages, currentRapPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            const pBtn = document.createElement('button'); 
            pBtn.className = `page-btn ${i === currentRapPage ? 'active' : ''}`; 
            pBtn.innerText = i;
            pBtn.onclick = (e) => { e.preventDefault(); currentRapPage = i; renderRaportTable(); }; 
            container.appendChild(pBtn);
        }

        const nextBtn = document.createElement('button'); 
        nextBtn.className = 'page-btn'; nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentRapPage === totalPages; 
        nextBtn.onclick = (e) => { e.preventDefault(); currentRapPage++; renderRaportTable(); };
        container.appendChild(nextBtn);
    }

    window.enableRaportEditMode = function(id) {
        document.querySelector(`.view-rap-tarix-${id}`).style.display = 'none';
        document.querySelector(`.edit-rap-tarix-${id}`).style.display = 'block';
        document.querySelector(`.view-rap-panel-${id}`).style.display = 'none';
        document.querySelector(`.edit-rap-panel-${id}`).style.display = 'flex';
    }

    window.cancelRaportEditMode = function(id) {
        document.querySelector(`.view-rap-tarix-${id}`).style.display = 'block';
        document.querySelector(`.edit-rap-tarix-${id}`).style.display = 'none';
        document.querySelector(`.view-rap-panel-${id}`).style.display = 'flex';
        document.querySelector(`.edit-rap-panel-${id}`).style.display = 'none';
    }

    window.updateRaportFromTable = function(id) {
        const tr = document.querySelector(`tr[data-id="${id}"]`);
        if(!tr) return;

        const newTarix = document.querySelector(`.edit-rap-tarix-${id}`).value.trim();
        const newNomre = document.querySelector(`.edit-rap-nomre-${id}`).value.trim();

        if(!newNomre) { alert("Raport nömrəsini daxil edin!"); return; }

        const payload = {
            gomruk_orqani: tr.getAttribute('data-orqan'),
            firma: tr.getAttribute('data-firma'),
            voen: tr.getAttribute('data-voen'),
            tarix_yazilma: newTarix,
            tarix_borcdovru: tr.getAttribute('data-dovr'),
            melumat: tr.getAttribute('data-melumat'),
            raport_nomresi: newNomre
        };

        fetch(`${RAPORT_API_URL}/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        }).then(() => { 
            loadAllRaports(() => renderRaportTable());
        }).catch(err => alert("Xəta baş verdi: " + err.message));
    }

    window.deleteRaport = function(id) {
        if(!confirm("Diqqət: Bu raport qeydini bazadan tamamilə silmək istədiyinizə əminsiniz?")) return;
        fetch(`${RAPORT_API_URL}/${id}`, { method: 'DELETE' })
        .then(() => { loadAllRaports(() => renderRaportTable()); })
        .catch(err => alert("Silinərkən xəta: " + err.message));
    }

    // Event Listeners for the modal
    if (raportBtn && raportNomrePopup) { 
        raportBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            raportNomrePopup.style.display = 'flex'; 
            currentRapPage = 1; 
            renderRaportTable(); 
        }); 
    }
    
    if (closeRaportNomreBtn && raportNomrePopup) { 
        closeRaportNomreBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            raportNomrePopup.style.display = 'none'; 
        }); 
    }

    // Raport nömrəsi çatışmayan yerlərdən kliklədikdə modala yönləndirmə
   window.openRaportPanelAndHighlight = function(rapId) {
        if (raportNomrePopup) {
            raportNomrePopup.style.display = 'flex';
            renderRaportTable(rapId);
            
            // Pəncərə açılandan dərhal sonra hədəfə sürüşdürmə (Scroll)
            setTimeout(() => {
                const modalBody = raportNomrePopup.querySelector('.modal-body');
                const highlightedRow = raportNomrePopup.querySelector('.highlight-row');
                
                if (highlightedRow) {
                    highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (modalBody) {
                    modalBody.scrollTop = 0;
                }
            }, 50);
        }
    }

    loadSigners(); 
    loadAllBildirisler();
    loadAllRaports();
    loadRaportAyarlar(); 

    function handleRadioChange() {
        if (radioPerson2 && radioPerson2.checked) {
            if (inputCompany) { 
                inputCompany.value = ''; 
                inputCompany.disabled = true; 
                inputCompany.style.backgroundColor = '#f1f5f9'; 
            }
        } else {
            if (inputCompany) { 
                inputCompany.disabled = false; 
                inputCompany.style.backgroundColor = ''; 
            }
        }
    }
    
    if (radioPerson1) radioPerson1.addEventListener('change', handleRadioChange);
    if (radioPerson2) radioPerson2.addEventListener('change', handleRadioChange);

    function clearFormFields() {
        if (inputVoen) inputVoen.value = ''; 
        if (inputCompany) inputCompany.value = ''; 
        if (inputLeader) inputLeader.value = ''; 
        if (inputAddress) inputAddress.value = '';
        if (radioPerson1) radioPerson1.checked = true; 
        handleRadioChange(); 
        if (statusMsg) statusMsg.style.display = 'none';
        if (tableSearchInput) tableSearchInput.value = ''; 
        updateSearchIconState();
    }

    function fillFormWithData(company) {
        if (inputVoen) inputVoen.value = company.voen || ''; 
        if (inputLeader) inputLeader.value = company.comp_director_name || ''; 
        if (inputAddress) inputAddress.value = company.comp_adress || '';
        
        if (company.pstatus == 2) { 
            if (radioPerson2) radioPerson2.checked = true; 
        } else { 
            if (radioPerson1) radioPerson1.checked = true; 
        }
        
        handleRadioChange(); 
        if (inputCompany) inputCompany.value = company.pstatus == 2 ? '' : (company.comp_name || '');
        updateSearchIconState();
    }

    function updateSearchIconState() {
        if (!inputVoen || !voenSrcIcon) return;
        if (inputVoen.value.trim().length > 0) { 
            voenSrcIcon.classList.add('active-search'); 
        } else { 
            voenSrcIcon.classList.remove('active-search'); 
        }
    }
    
    if (inputVoen) inputVoen.addEventListener('input', updateSearchIconState);

    function renderTable() {
        if (!voenTbody) return; voenTbody.innerHTML = '';
        if (dataCountBadge) dataCountBadge.innerText = `${currentFilteredData.length} qeyd`;
        
        if (currentFilteredData.length === 0) {
            voenTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:#94a3b8;">Heç bir nəticə tapılmadı.</td></tr>`;
            renderPagination(0); return;
        }

        const totalPages = Math.ceil(currentFilteredData.length / rowsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        const startIndex = (currentPage - 1) * rowsPerPage; 
        const endIndex = startIndex + rowsPerPage;
        const pageData = currentFilteredData.slice(startIndex, endIndex);

        pageData.forEach(company => {
            const tr = document.createElement('tr'); 
            const isFiziki = company.pstatus == 2;
            const compName = isFiziki ? `<span style="color:#64748b; font-style:italic;">Fiziki Şəxs</span>` : (company.comp_name || '—');

            tr.innerHTML = `
                <td style="font-weight: 700; color: #3b82f6;">${company.voen || '—'}</td>
                <td style="font-weight: 500;">${compName}</td>
                <td>${company.comp_director_name || '—'}</td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${company.comp_adress || ''}">${company.comp_adress || '—'}</td>
                <td>
                    <div class="action-cell">
                        <button class="btn-icon btn-edit" title="Redaktə et"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon btn-delete" title="Sil"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>`;
                
            tr.querySelector('.btn-edit').addEventListener('click', (e) => { 
                e.preventDefault(); 
                fillFormWithData(company); 
                document.querySelector('.modal-body').scrollTo({ top: 0, behavior: 'smooth' }); 
            });
            tr.querySelector('.btn-delete').addEventListener('click', (e) => { 
                e.preventDefault(); 
                if (confirm(`${company.voen} VÖEN-li qeydi silmək istədiyinizə əminsiniz?`)) { 
                    fetch(`${API_URL}/${company.id}`, { method: 'DELETE' }).then(() => loadCompanies()); 
                } 
            });
            voenTbody.appendChild(tr);
        });
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-controls');
        if (!paginationContainer) return; 
        paginationContainer.innerHTML = ''; 
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button'); 
        prevBtn.className = 'page-btn'; 
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1; 
        prevBtn.onclick = (e) => { e.preventDefault(); currentPage--; renderTable(); };
        paginationContainer.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - 2); 
        let endPage = Math.min(totalPages, currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            const pBtn = document.createElement('button'); 
            pBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`; 
            pBtn.innerText = i;
            pBtn.onclick = (e) => { e.preventDefault(); currentPage = i; renderTable(); }; 
            paginationContainer.appendChild(pBtn);
        }

        const nextBtn = document.createElement('button'); 
        nextBtn.className = 'page-btn'; 
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages; 
        nextBtn.onclick = (e) => { e.preventDefault(); currentPage++; renderTable(); };
        paginationContainer.appendChild(nextBtn);
    }

    function loadCompanies(callback) { 
        fetch(API_URL).then(res => res.json()).then(data => { 
            allCompaniesData = data || []; 
            filterAndRenderTable(); 
            if(callback) callback(); 
        }).catch(err => console.error("Baza xətası:", err)); 
    }

    function filterAndRenderTable() {
        const query = tableSearchInput ? tableSearchInput.value.trim().toLowerCase() : '';
        let sortedData = [...allCompaniesData].reverse();
        currentFilteredData = sortedData.filter(c => c.voen && c.voen.toString().toLowerCase().includes(query));
        currentPage = 1; 
        renderTable();
    }

    if (tableSearchInput) tableSearchInput.addEventListener('input', filterAndRenderTable);
    loadCompanies();

    if (refreshDbBtn) { 
        refreshDbBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            loadCompanies(); 
            clearFormFields(); 
        }); 
    }
    
    if (addVoenBtn && popupDiv) { 
        addVoenBtn.addEventListener("click", (e) => { 
            e.preventDefault(); 
            popupDiv.style.display = "flex"; 
            clearFormFields(); 
            filterAndRenderTable(); 
        }); 
    }
    
    if (closePopupBtn && popupDiv) { 
        closePopupBtn.addEventListener("click", (e) => { 
            e.preventDefault(); 
            popupDiv.style.display = "none"; 
            loadCompanies(() => { refreshAnalysisIfPossible(); }); 
        }); 
    }

    function searchVoenAction() {
        const typedVoen = inputVoen ? inputVoen.value.trim() : ''; 
        if (!typedVoen) return;
        
        const found = allCompaniesData.find(c => c.voen && c.voen.toString() === typedVoen);
        if (found) { 
            fillFormWithData(found); 
            setStatus("✅ Məlumat tapıldı və formaya yazıldı.", false); 
        } else { 
            setStatus("Bu VÖEN bazada qeydə alınmayıb.", true); 
        }
    }

    if (voenSrcIcon) { 
        voenSrcIcon.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (voenSrcIcon.classList.contains('active-search')) searchVoenAction(); 
        }); 
    }
    
    if (inputVoen) {
        inputVoen.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { 
                e.preventDefault(); 
                if (inputVoen.value.trim()) searchVoenAction(); 
            } 
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const voenVal = inputVoen ? inputVoen.value.trim() : ''; 
            const companyVal = inputCompany ? inputCompany.value.trim() : ''; 
            const leaderVal = inputLeader ? inputLeader.value.trim() : ''; 
            const addressVal = inputAddress ? inputAddress.value.trim() : ''; 
            const pstatusVal = (radioPerson2 && radioPerson2.checked) ? 2 : 1;
            
            if (!/^\d{10}$/.test(voenVal)) { setStatus("Xəta: VÖEN tam 10 rəqəm olmalıdır!", true); return; }
            if (pstatusVal === 1 && !companyVal) { setStatus("Xəta: Şirkətin adı boş ola bilməz!", true); return; }
            if (!leaderVal) { setStatus("Xəta: Şəxsin adı boş ola bilməz!", true); return; }
            if (!addressVal) { setStatus("Xəta: Ünvan boş ola bilməz!", true); return; }
            
            const oldText = saveBtn.innerHTML; 
            saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yadda saxlanılır...`; 
            saveBtn.disabled = true;

            const finalPayload = { 
                voen: voenVal, 
                comp_name: pstatusVal === 2 ? '' : companyVal, 
                comp_director_name: leaderVal, 
                comp_adress: addressVal, 
                pstatus: pstatusVal, 
                data_info_date: getTodayFormatted() 
            };

            fetch(API_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(finalPayload)
            }).then(() => { 
                setStatus("Uğurla yadda saxlanıldı! ✅", false); 
                clearFormFields(); 
                loadCompanies(); 
            }).finally(() => { 
                saveBtn.innerHTML = oldText; 
                saveBtn.disabled = false; 
            });
        });
    }

    const fileBtn = document.getElementById('slc-file-btn'); 
    const fileArea = document.getElementById('slc-file-area'); 
    if (fileBtn && fileArea) {
        let fileInput = document.createElement('input'); 
        fileInput.type = 'file'; 
        fileInput.accept = '.xlsx, .xls'; 
        fileInput.style.display = 'none'; 
        document.body.appendChild(fileInput);
        
        fileBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            fileInput.click(); 
        });
        
        fileInput.addEventListener('change', () => { 
            if (fileInput.files.length > 0) { 
                selectedFile = fileInput.files[0]; 
                
                const fileName = selectedFile.name.toLowerCase();
                if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
                    alert("Diqqət: Zəhmət olmasa, yalnız Excel (.xlsx və ya .xls) formatında fayl yükləyin!");
                    fileInput.value = '';
                    selectedFile = null;
                    fileArea.innerText = "Faylı seçin...";
                    fileArea.style.color = "#64748b";
                    return;
                }

                fileArea.innerText = selectedFile.name; 
                fileArea.style.color = "#3b82f6"; 
            } 
        });
    }

    const sections = [
        { btn: document.getElementById('slc-rub-btn'), div: document.getElementById('slc-rub'), type: "rub" }, 
        { btn: document.getElementById('slc-ay-btn'), div: document.getElementById('slc-ay'), type: "ay" },
        { btn: document.getElementById('slc-tarix-btn'), div: document.getElementById('slc-tarix'), type: "tarix" }
    ];
    
    sections.forEach(s => { 
        if (s.btn && s.div) { 
            s.btn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                sections.forEach(x => { if(x.div) { x.div.classList.remove('active-filter'); } }); 
                s.div.classList.add('active-filter'); 
                currentFilterType = s.type; 
            }); 
        } 
    });

    function parseExcelDate(dateStr) {
        if (!dateStr) return null; 
        const parts = dateStr.toString().trim().split('.'); 
        if (parts.length !== 3) return null;
        const month = parseInt(parts[1], 10); 
        const year = parts[2].toString().trim();
        let rub = "i rüb"; 
        if (month >= 4 && month <= 6) rub = "ii rüb"; 
        else if (month >= 7 && month <= 9) rub = "iii rüb"; 
        else if (month >= 10 && month <= 12) rub = "iv rüb";
        const monthsAz = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktabr", "noyabr", "dekabr"];
        return { month: monthsAz[month - 1] || "", year, rub };
    }
    
    const analizBox = document.getElementById('analiz-box');
    const neticeDovrElement = document.querySelector('.netice-dovr');
    
    if (analizBtn) {
        analizBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (typeof XLSX === 'undefined') {
                alert("SİSTEM XƏTASI: Excel analiz kitabxanası (XLSX) tapılmadı!");
                return;
            }
            
            if (!selectedFile || !currentFilterType) { 
                alert("Zəhmət olmasa əvvəlcə faylı və dövrü (Rüb, Ay və ya Tarix) seçin!"); 
                return; 
            }

            let displayPeriod = "";
            let filterPeriod = "";
            let filterYear = "";

            if (currentFilterType === "rub") {
                let rawPeriod = document.getElementById('slc-rub-select')?.value || "";
                let rawYear = document.getElementById('slc-rub-year')?.value || "";
                displayPeriod = `${rawPeriod.toUpperCase()} ${rawYear}`.trim();
                filterPeriod = rawPeriod.trim().toLowerCase();
                filterYear = rawYear.trim();
            } else if (currentFilterType === "ay") {
                let rawPeriod = document.getElementById('slc-ay-select')?.value || "";
                let rawYear = document.getElementById('slc-ay-year')?.value || "";
                displayPeriod = `${rawPeriod.toUpperCase()} ${rawYear}`.trim();
                filterPeriod = rawPeriod.trim().toLowerCase();
                filterYear = rawYear.trim();
            } else if (currentFilterType === "tarix") {
                let baslangic = document.getElementById('tarix-baslangic').value;
                let son = document.getElementById('tarix-son').value;
                if(!baslangic || !son) { alert("Zəhmət olmasa başlanğıc və son tarixi tam seçin!"); return; }
                let bFormat = baslangic.split('-').reverse().join('.');
                let sFormat = son.split('-').reverse().join('.');
                displayPeriod = `${bFormat} - ${sFormat}`;
            }

            if (neticeDovrElement) neticeDovrElement.innerText = displayPeriod;

            analizBox.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:30px; color:#3b82f6;"></i><p style="margin-top:10px;">Analiz edilir, gözləyin...</p></div>`;

            const fileReader = new FileReader(); 
            fileReader.readAsArrayBuffer(selectedFile);
            
            fileReader.onload = function(evt) {
                setTimeout(() => {
                    try {
                        const workbook = XLSX.read(evt.target.result, { type: 'buffer' });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                        let groupedResults = {}; 

                        for (let i = 1; i < excelData.length; i++) {
                            const row = excelData[i]; 
                            if (!row || row.length < 18) continue; 
                            
                            const tarixStr = row[2] ? row[2].toString().trim() : ""; 
                            const dateInfo = parseExcelDate(tarixStr); 
                            if (!dateInfo) continue;
                            
                            let qaliqBorc = parseFloat(row[17]) || 0; 
                            let isMatch = false;

                            if (currentFilterType === "rub" && dateInfo.rub === filterPeriod && dateInfo.year === filterYear) isMatch = true;
                            if (currentFilterType === "ay" && dateInfo.month === filterPeriod && dateInfo.year === filterYear) isMatch = true;
                            if (currentFilterType === "tarix") {
                                let baslangic = document.getElementById('tarix-baslangic').value;
                                let son = document.getElementById('tarix-son').value;
                                let excelD = excelDateToJSDate(tarixStr);
                                let startD = new Date(baslangic + "T00:00:00");
                                let endD = new Date(son + "T23:59:59");
                                if (excelD && excelD >= startD && excelD <= endD) {
                                    isMatch = true;
                                }
                            }

                            if (isMatch && qaliqBorc > minAmountFilter) {
                                let idareAdi = row[0] ? row[0].toString().trim() : "Qeydsiz İdarə";
                                let bNo = row[1] ? row[1].toString().trim() : "Nömrəsiz";
                                let voen = row[3] ? row[3].toString().trim() : ""; 
                                let firmaAdiRaw = row[5] ? row[5].toString().trim() : "Bilinməyən Firma"; 

                                let isFiziki = false;
                                let mmcStatus = row[4] ? row[4].toString().trim().toUpperCase() : "";
                                let hasMMC = /mmc|məhdud məsuliyyətli cəmiyyət(i)?/i.test(firmaAdiRaw);
                                if (mmcStatus === "" && !hasMMC && !/asc|qsc|şirkət|firması/i.test(firmaAdiRaw)) isFiziki = true;
                                if (voen && voen.toString().endsWith('2')) isFiziki = true; 
                                else if (voen && voen.toString().endsWith('1')) isFiziki = false;

                                let tamFirmaAdi = firmaAdiRaw; 

                                if (!groupedResults[idareAdi]) groupedResults[idareAdi] = {};
                                let groupKey = voen ? voen : tamFirmaAdi;
                                if (!groupedResults[idareAdi][groupKey]) { 
                                    groupedResults[idareAdi][groupKey] = { 
                                        firma: tamFirmaAdi, 
                                        voen: voen || "", 
                                        isFiziki: isFiziki, 
                                        decls: {}, 
                                        toplamBorc: 0, 
                                        qeydSayi: 0 
                                    }; 
                                }
                                
                                const ixracStr = row[8] ? row[8].toString().trim() : "";
                                const invoysVal = parseFloat(row[12]) || 0;

                                let firmObj = groupedResults[idareAdi][groupKey];
                                if(!firmObj.decls[bNo]) firmObj.decls[bNo] = { borc: 0, tarixler: new Set(), ixrac: "", invoys: 0 };
                                
                                firmObj.decls[bNo].borc += qaliqBorc;
                                firmObj.decls[bNo].tarixler.add(tarixStr);
                                if (ixracStr && !firmObj.decls[bNo].ixrac) firmObj.decls[bNo].ixrac = ixracStr;
                                firmObj.decls[bNo].invoys += invoysVal;

                                firmObj.toplamBorc += qaliqBorc; 
                                firmObj.qeydSayi += 1;
                            }
                        }

                        if (Object.keys(groupedResults).length === 0) { 
                            analizBox.innerHTML = `<div style="text-align:center; padding: 40px; color:#ef4444;"><i class="fa-solid fa-circle-exclamation" style="font-size: 30px; margin-bottom: 10px;"></i><p>Uyğun borc tapılmadı!</p></div>`; 
                            const actionBtns = document.querySelectorAll('.action-bar .btn');
                            actionBtns.forEach(btn => {
                                btn.disabled = true;
                                btn.style.opacity = '0.5';
                                btn.style.cursor = 'not-allowed';
                            });
                            return; 
                        }

                        let htmlContent = ``; 
                        let idareIdx = 1; 
                        let firmaIdx = 1;
                        
                        for (const idare in groupedResults) {
                            let idaredəkiFirmalar = Object.values(groupedResults[idare]);
                            let idareUmumiBorc = 0; 
                            let idareUmumiQeydSayi = 0;
                            idaredəkiFirmalar.forEach(item => { 
                                idareUmumiBorc += item.toplamBorc; 
                                idareUmumiQeydSayi += item.qeydSayi; 
                            });

                            let safeIdare = idare.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                            htmlContent += `
                                <div class="result-group">
                                    <div class="group-header">
                                        <div class="group-title-main">
                                            <h4><input type="checkbox" class="custom-checkbox idare-check1" id="idare-check1-${idareIdx}" checked style="margin-right:12px; display:inline-grid;">${idare}</h4>
                                            <span class="group-meta">(${idaredəkiFirmalar.length} firma, ${idareUmumiQeydSayi} bəyannamə)</span>
                                        </div>
                                        <div class="group-debt">Ümumi Borc: ${idareUmumiBorc.toFixed(2)} ABŞ</div>
                                    </div>`;

                            idaredəkiFirmalar.forEach(item => {
                                let isVoenInDb = true; 
                                let missingAlertHtml = ""; 
                                let safeFirmaAdi = item.firma ? item.firma.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';

                                if (item.voen) {
                                    isVoenInDb = allCompaniesData.some(c => c.voen && c.voen.toString() === item.voen.toString());
                                    if (!isVoenInDb) { 
                                        missingAlertHtml = `<button class="add-missing-voen-btn" data-voen="${item.voen}" data-firma="${safeFirmaAdi}" data-isfiziki="${item.isFiziki}" style="margin-top:6px; background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> VÖEN bazada yoxdur - Əlavə etmək üçün klikləyin</button>`; 
                                    }
                                } else { 
                                    isVoenInDb = false; 
                                }

                                let newDecls = [];
                                let oldDecls = [];
                                let newBorc = 0;
                                let newTarixler = new Set();
                                
                                let oldRaportDecls = [];
                                let newRaportDecls = [];
                                let newRaportBorc = 0;
                                let newRaportIxracList = new Set();
                                let newRaportInvoysSum = 0;

                                let accordionListHtml = ``;
                                
                                let foundRecordsForFirm = allBildirislerData.filter(b => 
                                    (item.voen && b.voen === item.voen.toString()) || (!item.voen && b.firma === item.firma)
                                );
                                
                                let foundRaportsForFirm = allRaportData.filter(r => 
                                    (item.voen && r.voen === item.voen.toString()) || (!item.voen && r.firma === item.firma)
                                );

                                let totalDecls = Object.keys(item.decls).length;
                                let completedDecls = 0;
                                let allDeclsHaveBildirisNo = true;
                                let allDeclsHaveRaportRecord = true; // Bütün bəyannamələrin Raport qeydi varmı?
                                let allDeclsHaveRaportNo = true;     // Bütün Raportların nömrəsi varmı?

                                for(const nomre in item.decls) {
                                    let borcu = item.decls[nomre].borc;
                                    let tarixleri = Array.from(item.decls[nomre].tarixler);
                                    let regex = new RegExp(`\\b${nomre}\\b`);
                                    
                                    let matchedRecord = foundRecordsForFirm.find(b => b.melumat && regex.test(b.melumat));
                                    let matchedRaport = foundRaportsForFirm.find(r => r.melumat && regex.test(r.melumat));

                                    let bildirisStatus = "";
                                    let raportStatus = "";
                                    let hasFullBildiris = false;
                                    let hasFullRaport = false;

                                    // Bildirişin Yoxlanması
                                    if (matchedRecord) {
                                        oldDecls.push(nomre);
                                        let mainBildirisNo = matchedRecord.bildiris_nomresi && matchedRecord.bildiris_nomresi.trim() !== "" ? matchedRecord.bildiris_nomresi : null;
                                        if (mainBildirisNo) {
                                            bildirisStatus = `<span style="color: #2563eb; font-size:11px; font-weight:700; margin-right: 12px;"><i class="fa-solid fa-check"></i> Bil. №: ${mainBildirisNo}</span>`;
                                            hasFullBildiris = true;
                                        } else {
                                            allDeclsHaveBildirisNo = false;
                                            bildirisStatus = `<button class="btn-sec" onclick="openBildirisPanelAndHighlight('${matchedRecord.id}')" style="padding: 4px 8px; font-size:10px; color:#f59e0b; border:1px solid #fcd34d; border-radius:4px; background:#fffbeb; cursor:pointer; font-weight:700; margin-right: 12px;" title="Bildiriş nömrəsi artır"><i class="fa-solid fa-plus"></i> Bil. Nömrəsi</button>`;
                                        }
                                    } else {
                                        allDeclsHaveBildirisNo = false;
                                        newDecls.push(nomre);
                                        newBorc += borcu; 
                                        tarixleri.forEach(t => newTarixler.add(t));
                                        bildirisStatus = `<span style="font-size: 11px; color: #ef4444; font-weight:700; margin-right: 12px;"><i class="fa-solid fa-circle-plus"></i> Yeni Bildiriş</span>`;
                                    }

                                    // Raportun Yoxlanması
                                    if (matchedRaport) {
                                        oldRaportDecls.push(nomre);
                                        let mainRaportNo = matchedRaport.raport_nomresi && matchedRaport.raport_nomresi.trim() !== "" ? matchedRaport.raport_nomresi : null;
                                        if (mainRaportNo) {
                                            raportStatus = `<span style="color: #166534; font-size:11px; font-weight:700;"><i class="fa-solid fa-check"></i> Raport №: ${mainRaportNo}</span>`;
                                            hasFullRaport = true;
                                        } else {
                                            allDeclsHaveRaportNo = false;
                                            raportStatus = `<button class="btn-sec" onclick="typeof openRaportPanelAndHighlight === 'function' ? openRaportPanelAndHighlight('${matchedRaport.id}') : alert('Raport nömrəsi əlavə etmə paneli hələ qoşulmayıb')" style="padding: 4px 8px; font-size:10px; color:#f59e0b; border:1px solid #fcd34d; border-radius:4px; background:#fffbeb; cursor:pointer; font-weight:700;" title="Raport nömrəsi artır"><i class="fa-solid fa-plus"></i> Raport Nömrəsi</button>`;
                                        }
                                    } else {
                                        allDeclsHaveRaportRecord = false;
                                        allDeclsHaveRaportNo = false;
                                        newRaportDecls.push(nomre);
                                        newRaportBorc += borcu;
                                        if (item.decls[nomre].ixrac) newRaportIxracList.add(item.decls[nomre].ixrac);
                                        newRaportInvoysSum += item.decls[nomre].invoys;
                                        raportStatus = `<span style="font-size: 11px; color: #ef4444; font-weight:700;"><i class="fa-solid fa-circle-plus"></i> Yeni Raport</span>`;
                                    }

                                    if (hasFullBildiris && hasFullRaport) completedDecls++;

                                    accordionListHtml += `<li style="display:flex; justify-content:space-between; align-items:center; padding: 10px 14px; border: 1px solid #cbd5e1; background:#ffffff; margin-bottom:6px; border-radius:6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                        <span style="color: #2563eb; font-size:13px;"><i class="fa-solid fa-file-invoice" style="margin-right:6px;"></i> <strong>${nomre}</strong></span>
                                        <div style="display:flex; align-items:center;">${bildirisStatus} ${raportStatus}</div>
                                    </li>`;
                                }

                                // ---------------- RAPORT ŞƏRTLƏRİ ----------------
                                let canRaport = true;
                                let hasEmptyBildirisNomreForNewRaport = false;

                                newRaportDecls.forEach(gb => {
                                    let regex = new RegExp(`\\b${gb}\\b`);
                                    let matched = foundRecordsForFirm.find(b => b.melumat && regex.test(b.melumat));
                                    
                                    if (!matched) {
                                        canRaport = false; 
                                    } else if (!matched.bildiris_nomresi || matched.bildiris_nomresi.trim() === "") {
                                        hasEmptyBildirisNomreForNewRaport = true; 
                                    }
                                });

                                let raportBadgeHtml = "";
                                if (newRaportDecls.length > 0) {
                                    if (!canRaport) {
                                        raportBadgeHtml = `<div class="badge-pill" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;"><i class="fa-solid fa-ban"></i> Raport qadağandır (Bildiriş yoxdur)</div>`;
                                    } else if (hasEmptyBildirisNomreForNewRaport) {
                                        raportBadgeHtml = `<div class="badge-pill" style="background:#fef3c7; color:#d97706; border-color:#fcd34d;"><i class="fa-solid fa-triangle-exclamation"></i> Raport yazıla bilər (Bil. nömrəsi yoxdur)</div>`;
                                    } else {
                                        raportBadgeHtml = `<div class="badge-pill" style="background:#dcfce7; color:#166534; border-color:#86efac;"><i class="fa-solid fa-check-double"></i> Raporta tam hazırdır</div>`;
                                    }
                                }
                                // -------------------------------------------------

                                let bgStyle = "#ffffff";
                                let cardBorder = "1px solid #cbd5e1";
                                let statusBadge = "";
                                let fullCompletedBadgeHtml = "";
                                
                                // BÜTÜN MƏLUMATLARIN (TAM YAXUD QİSMƏN) YOXLANMASI
                                if (completedDecls === totalDecls && totalDecls > 0) {
                                    // Hər şey tamdır (Bildiriş və Raport nömrələri var)
                                    fullCompletedBadgeHtml = `<div class="badge-pill" style="background:#dcfce7; color:#166534; border-color:#86efac;"><i class="fa-solid fa-circle-check"></i> Bütün Bildiriş və Raportlar qeydə alınıb</div>`;
                                    bgStyle = "#f0fdf4"; cardBorder = "1px solid #bbf7d0";
                                } else if (allDeclsHaveRaportRecord && !allDeclsHaveRaportNo && totalDecls > 0) {
                                    // Bütün Raportlar bazada var, amma nömrəsi yoxdur
                                    fullCompletedBadgeHtml = `<div class="badge-pill" style="background:#fef3c7; color:#d97706; border-color:#fcd34d;"><i class="fa-solid fa-circle-info"></i> Bütün Bildiriş və Raportlar qeydə alınıb (Raport nömrəsi yoxdur)</div>`;
                                    bgStyle = "#f8fafc"; cardBorder = "1px solid #e2e8f0";
                                } else if (oldDecls.length > 0 && newDecls.length > 0) {
                                    bgStyle = "#fffbeb"; cardBorder = "1px solid #fde68a";
                                    statusBadge = `<div class="badge-pill" style="background:#fef3c7; color:#d97706; border-color:#fcd34d;"><i class="fa-solid fa-code-merge"></i> Qismən Yeni</div>`;
                                } else if (oldDecls.length > 0 && newDecls.length === 0) {
                                    bgStyle = "#f8fafc"; cardBorder = "1px solid #e2e8f0";
                                    statusBadge = `<div class="badge-pill" style="background:#e2e8f0; color:#475569; border-color:#cbd5e1;"><i class="fa-solid fa-database"></i> Bildirişlər Yazılıb</div>`;
                                } else {
                                    bgStyle = "#ffffff"; cardBorder = "1px solid #e2e8f0";
                                    statusBadge = `<div class="badge-pill" style="background:#dbeafe; color:#1d4ed8; border-color:#bfdbfe;"><i class="fa-solid fa-sparkles"></i> Yeni Bildiriş</div>`;
                                }

                                let canCreateNew = isVoenInDb;
                                let checkboxAttr = canCreateNew ? "checked" : "disabled";
                                let opacityStyle = canCreateNew ? "1" : "0.5"; 

                                let byNoStr = Object.keys(item.decls).join(", ");
                                let newTarixStr = Array.from(newTarixler).join(", ");
                                let accordionToggleBtn = `<button class="toggle-btn" style="background:transparent; border:none; cursor:pointer; font-size:18px; color:#64748b;" title="Bəyannamələri göstər"><i class="fa-solid fa-chevron-down"></i></button>`;

                                htmlContent += `
                                    <div class="firm-item" style="background: ${bgStyle}; border: ${cardBorder}; opacity: ${opacityStyle}; margin-bottom: 12px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                        <div class="firm-main-row" style="display:flex; justify-content:space-between; align-items:flex-start; padding: 16px;">
                                            <div style="display:flex; gap:12px; align-items:flex-start; flex:1;">
                                                <input type="checkbox" class="custom-checkbox firma-check2" ${checkboxAttr} data-can-raport="${canRaport}" data-idare="${safeIdare}" data-voen="${item.voen}" data-firma="${safeFirmaAdi}" data-isfiziki="${item.isFiziki}" data-gb="${byNoStr}" data-new-gb="${newDecls.join(', ')}" data-old-gb="${oldDecls.join(', ')}" data-borc="${item.toplamBorc.toFixed(2)}" data-new-borc="${newBorc.toFixed(2)}" data-new-tarixler="${newTarixStr}" data-new-raport-gb="${newRaportDecls.join(', ')}" data-old-raport-gb="${oldRaportDecls.join(', ')}" data-new-raport-borc="${newRaportBorc.toFixed(2)}" data-new-raport-ixrac="${Array.from(newRaportIxracList).join(', ')}" data-new-raport-invoys="${newRaportInvoysSum.toFixed(2)}" style="margin-top:6px;">
                                                <div class="firm-info" style="flex:1;">
                                                    <div class="firm-name" style="font-size:15px; font-weight:700; color:#0f172a; margin-bottom:6px;">${item.firma} <span class="firm-voen" style="color:#64748b; font-size:13px; font-weight:500;">(VÖEN: ${item.voen || "Yoxdur"})</span></div>
                                                    <div class="firm-badges" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                                                        <div class="badge-pill badge-danger-pill" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">Ümumi Borc: ${item.toplamBorc.toFixed(2)} USD</div>
                                                        ${statusBadge}
                                                        ${raportBadgeHtml}
                                                        ${fullCompletedBadgeHtml}
                                                    </div>
                                                    ${missingAlertHtml}
                                                </div>
                                            </div>
                                            <div>${accordionToggleBtn}</div>
                                        </div>
                                        <div class="details-panel" style="display:none; padding: 16px; background: #f1f5f9; border-top: 1px solid #e2e8f0;">
                                            <h5 style="margin:0 0 10px 0; font-size:12px; color:#475569; text-transform:uppercase; font-weight:700;">Bəyannamələr Üzrə Detallar</h5>
                                            <ul style="list-style:none; padding:0; margin:0;">
                                                ${accordionListHtml}
                                            </ul>
                                        </div>
                                    </div>`;
                                firmaIdx++;
                            });
                            htmlContent += `</div>`; 
                            idareIdx++;
                        }
                        analizBox.innerHTML = htmlContent;

                        const actionBtns = document.querySelectorAll('.action-bar .btn');
                        actionBtns.forEach(btn => {
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.cursor = 'pointer';
                        });

                        document.querySelectorAll('.add-missing-voen-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.preventDefault();
                                const voen = this.getAttribute('data-voen'); 
                                const firmaName = this.getAttribute('data-firma'); 
                                const isFiziki = this.getAttribute('data-isfiziki') === 'true';
                                popupDiv.style.display = "flex"; 
                                clearFormFields();
                                if (inputVoen) { inputVoen.value = voen; inputVoen.dispatchEvent(new Event('input')); }
                                if (isFiziki) { 
                                    if (radioPerson2) radioPerson2.checked = true; 
                                    if (inputLeader) inputLeader.value = firmaName; 
                                } else { 
                                    if (radioPerson1) radioPerson1.checked = true; 
                                    if (inputCompany) inputCompany.value = firmaName; 
                                }
                                handleRadioChange();
                            });
                        });

                        document.querySelectorAll('.toggle-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.preventDefault();
                                const parentItem = this.closest('.firm-item');
                                const panel = parentItem.querySelector('.details-panel');
                                const icon = this.querySelector('i');
                                if (panel.style.display === 'block') { 
                                    panel.style.display = 'none'; icon.className = 'fa-solid fa-chevron-down';
                                } else { 
                                    panel.style.display = 'block'; icon.className = 'fa-solid fa-chevron-up'; 
                                }
                            });
                        });

                        document.querySelectorAll('.add-bildiris-panel-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.preventDefault();
                                if (bildirisPopup) { 
                                    bildirisPopup.style.display = 'flex'; currentBilPage = 1; renderBildirisTable(); 
                                }
                            });
                        });

                        document.querySelectorAll('.idare-check1').forEach(idareCheck => { 
                            idareCheck.addEventListener('change', function() { 
                                const parentDiv = this.closest('.result-group'); 
                                parentDiv.querySelectorAll('.firma-check2:not([disabled])').forEach(child => child.checked = this.checked); 
                            }); 
                        });
                        
                        document.querySelectorAll('.firma-check2:not([disabled])').forEach(firmaCheck => { 
                            firmaCheck.addEventListener('change', function() { 
                                const parentDiv = this.closest('.result-group'); 
                                const parentCheck = parentDiv.querySelector('.idare-check1'); 
                                const allChildren = parentDiv.querySelectorAll('.firma-check2:not([disabled])'); 
                                if(allChildren.length > 0) { 
                                    parentCheck.checked = Array.from(allChildren).every(c => c.checked); 
                                    parentCheck.indeterminate = !parentCheck.checked && Array.from(allChildren).some(c => c.checked); 
                                } 
                            }); 
                        });
                    } catch (err) {
                        alert("Analiz zamanı xəta baş verdi: " + err.message);
                    }
                }, 500); 
            };
        });
    }

    if(closePrezipBtn) closePrezipBtn.addEventListener('click', () => { preZipPopup.style.display = 'none'; });
    if(cancelPrezipBtn) cancelPrezipBtn.addEventListener('click', () => { preZipPopup.style.display = 'none'; });
    if(closeZipPopupBtn) closeZipPopupBtn.addEventListener('click', () => { zipPopup.style.display = 'none'; });
    if(cancelZipSaveBtn) cancelZipSaveBtn.addEventListener('click', () => { zipPopup.style.display = 'none'; });
    
    // RAPORT BUTTON BAĞLAMALARI
    if(closePreRaportBtn) closePreRaportBtn.addEventListener('click', () => { preRaportPopup.style.display = 'none'; });
    if(cancelPreRaportBtn) cancelPreRaportBtn.addEventListener('click', () => { preRaportPopup.style.display = 'none'; });
    if(closeRaportZipPopupBtn) closeRaportZipPopupBtn.addEventListener('click', () => { raportZipPopup.style.display = 'none'; });
    if(cancelRaportZipSaveBtn) cancelRaportZipSaveBtn.addEventListener('click', () => { raportZipPopup.style.display = 'none'; });
    
    if(zipSelectAll) { 
        zipSelectAll.addEventListener('change', (e) => { 
            const cbs = document.querySelectorAll('.zip-row-check'); 
            cbs.forEach(cb => cb.checked = e.target.checked); 
        }); 
    }
    if(raportZipSelectAll) { 
        raportZipSelectAll.addEventListener('change', (e) => { 
            const cbs = document.querySelectorAll('.raport-zip-row-check'); 
            cbs.forEach(cb => cb.checked = e.target.checked); 
        }); 
    }

    const createLoadingOverlay = () => {
        let overlay = document.getElementById('zip-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'zip-loading-overlay';
            overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); z-index: 9999999; display: flex; justify-content: center; align-items: center; flex-direction: column; opacity: 0; transition: opacity 0.3s; pointer-events: none;";
            overlay.innerHTML = `
                <div style="background: white; padding: 40px 30px; border-radius: 20px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.25); max-width: 400px; width: 90%; border: 1px solid #cbd5e1;">
                    <i class="fa-solid fa-file-zipper fa-bounce" style="font-size: 50px; color: #3b82f6; margin-bottom: 20px;"></i>
                    <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 18px; font-weight: 800;">Sənədlər Hazırlanır</h3>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 25px;">Bu proses məlumatın həcmindən asılı olaraq bir neçə saniyə çəkə bilər, zəhmət olmasa səhifə bağlamayın...</p>
                    <div style="width: 100%; background: #e2e8f0; height: 10px; border-radius: 6px; overflow: hidden; position: relative;">
                        <div id="zip-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #3b82f6, #4f46e5); transition: width 0.4s ease;"></div>
                    </div>
                    <p id="zip-progress-text" style="margin-top: 12px; font-weight: 800; color: #3b82f6; font-size: 15px;">0%</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    };

    const getMinMaxDate = (dateStr) => {
        if (!dateStr) return "";
        const dates = dateStr.split(',').map(d => d.trim()).filter(d => d);
        if (dates.length === 0) return "";
        if (dates.length === 1) return dates[0];
        let parsedDates = dates.map(d => {
            let parts = d.split('.');
            return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(d);
        }).filter(d => !isNaN(d.getTime()));
        if (parsedDates.length === 0) return dateStr;
        let minDate = new Date(Math.min(...parsedDates));
        let maxDate = new Date(Math.max(...parsedDates));
        let formatD = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
        return minDate.getTime() === maxDate.getTime() ? formatD(minDate) : `${formatD(minDate)} - ${formatD(maxDate)}`;
    };

    const executeZipProcess = async () => {
        const overlay = createLoadingOverlay();
        const progressBar = document.getElementById('zip-progress-bar');
        const progressText = document.getElementById('zip-progress-text');
        
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = 'auto';
        setTimeout(() => overlay.style.opacity = '1', 10);

        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.floor(Math.random() * 15) + 5;
                if(progress > 90) progress = 90;
                progressBar.style.width = `${progress}%`;
                progressText.innerText = `${progress}%`;
            }
        }, 600);

        try {
            const payload = [];
            pendingDbSavePayload = [];
            const targetPeriod = document.querySelector('.netice-dovr') ? document.querySelector('.netice-dovr').innerText.trim() : '';

            for (const item of window.pendingFirmsToZip) {
                const checkbox = item.checkbox;
                const voen = checkbox.getAttribute("data-voen");
                const rawFirma = checkbox.getAttribute("data-firma") || "";
                const firmaAdi = rawFirma.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                const isFiziki = checkbox.getAttribute("data-isfiziki") === "true";
                const dbData = allCompaniesData.find(c => c.voen && c.voen.toString() === voen) || {};
                const rehberAdi = dbData.comp_director_name || "Qeyd edilməyib";

                payload.push({
                    unvan: dbData.comp_adress || "Qeyd edilməyib",
                    firma: isFiziki ? rehberAdi : firmaAdi,
                    voen: voen || "Qeyd edilməyib",
                    tarixEsas: getMinMaxDate(checkbox.getAttribute("data-new-tarixler")),
                    soyadiadi: rehberAdi,
                    gb: item.newGb || "",
                    borc: item.newBorc || "0.00",
                    tarixQosma: getTodayFormatted(),
                    safeFirmaAdi: firmaAdi.replace(/[^a-zA-Z0-9azəöğüşıçƏÖĞÜŞİÇ ]/gi, '').trim().substring(0, 30) || "Firma",
                    uzatma: isFiziki ? "na" : "yə" 
                });

                pendingDbSavePayload.push({
                    gomruk_orqani: checkbox.getAttribute("data-idare") || "",
                    firma: isFiziki ? rehberAdi : firmaAdi,
                    voen: voen || "",
                    tarix_yazilma: getTodayFormatted(),
                    tarix_borcdovru: targetPeriod || "",
                    melumat: `Bəyannamələr: ${item.newGb}`
                });
            }

            const generateDocsEndpoint = 'https://autoreport-production.up.railway.app/api/generate-docs';
            const signerData = {
                leaderperson: document.getElementById('sign-leader-person')?.value.trim() || '',
                leadername: document.getElementById('sign-leader-name')?.value.trim() || '',
                secondperson: document.getElementById('sign-second-person')?.value.trim() || '',
                phone: document.getElementById('sign-phone')?.value.trim() || ''
            };

            const response = await fetch(generateDocsEndpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedFirms: payload, mesulsexs: signerData })
            });

            if (!response.ok) throw new Error(`Server xətası (Status: ${response.status})`);

            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'application/zip' });
            
            clearInterval(progressInterval);
            progressBar.style.width = `100%`;
            progressText.style.color = `#10b981`; 
            progressText.innerText = `100% - Yüklənir!`;

            await new Promise(r => setTimeout(r, 600));

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Senedler_${getTodayFormatted()}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            if (zipTbody) {
                zipTbody.innerHTML = '';
                pendingDbSavePayload.forEach((obj, idx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td><input type="checkbox" class="custom-checkbox zip-row-check" data-idx="${idx}" checked></td><td>${obj.gomruk_orqani}</td><td>${obj.firma}</td><td style="color:#2563eb; font-weight:600;">${obj.melumat.replace('Bəyannamələr: ', '')}</td><td>Sənəddə mövcuddur</td>`;
                    zipTbody.appendChild(tr);
                });
            }
            if (zipPopup) zipPopup.style.display = 'flex';

        } catch (error) {
            clearInterval(progressInterval);
            alert("XƏTA: " + error.message);
        } finally {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                overlay.style.display = 'none'; progressBar.style.width = '0%'; progressText.innerText = '0%'; progressText.style.color = '#3b82f6';
            }, 300);
        }
    };

    // ==========================================
    // YENİ: RAPORT ÜÇÜN XÜSUSİ ZIP GENERASİYASI
    // ==========================================
    const executeRaportZipProcess = async () => {
    const updatePromises = [];
    const payload = [];
    pendingRaportDbSavePayload = [];
    const targetPeriod = document.querySelector('.netice-dovr') ? document.querySelector('.netice-dovr').innerText.trim() : '';
    let mezenne = parseFloat(raportAyarlarData.mezenne) || 1.7; 

    // Xətanı izləmək üçün bayraq
    let hasError = false;

    // 🔴 KÖMƏKÇİ FUNKSİYA: Ekranda qırmızı çərçivə və kursor effekti yaradır
    const showInlineError = (inputEl, placeholderText) => {
        if (inputEl) {
            // Ekranda vizual olaraq xətanı göstəririk
            inputEl.style.transition = "all 0.3s ease";
            inputEl.style.border = "2px solid #ef4444"; // Qırmızı çərçivə
            inputEl.style.boxShadow = "0 0 8px rgba(239, 68, 68, 0.4)"; // Qırmızı kölgə effekti
            inputEl.focus(); // Kursoru birbaşa o xanaya gətirir
            
            let oldPlaceholder = inputEl.placeholder;
            inputEl.placeholder = placeholderText; // Xananın içində qısa xəbərdarlıq

            // 3 saniyə sonra xananı əvvəlki sakit halına qaytarırıq
            setTimeout(() => {
                inputEl.style.border = "";
                inputEl.style.boxShadow = "";
                inputEl.placeholder = oldPlaceholder;
            }, 3000);
        }
    };

    for (const item of window.pendingFirmsToRaportZip) {
        // Əgər ilk xəta tapılıbsa, o xana qırmızı olacaq və digərlərini yoxlamağa ehtiyac yoxdur
        if (hasError) break;

        let rowCheck = document.querySelector(`.raport-modal-check[data-idx="${item.rowIdx}"]`);
        if (!rowCheck || !rowCheck.checked) continue; 

        let malinAdiInput = document.getElementById(`malin-adi-${item.rowIdx}`);
        let malinAdiValue = malinAdiInput ? malinAdiInput.value.trim() : "";

        let nomreInputs = document.querySelectorAll(`.rap-bil-nomre-${item.rowIdx}`);
        let tarixInputs = document.querySelectorAll(`.rap-bil-tarix-${item.rowIdx}`);

        let nomreVals = [];
        let tarixVals = [];

        nomreInputs.forEach((inp, idx) => {
            let nVal = inp.value.trim();
            let tVal = tarixInputs[idx] ? tarixInputs[idx].value.trim() : "";
            let bId = inp.getAttribute("data-bil-id");

            if (nVal) nomreVals.push(nVal);
            if (tVal) tarixVals.push(tVal);

            if (bId && (nVal || tVal)) {
                let oldObj = allBildirislerData.find(b => b.id.toString() === bId.toString());
                if (oldObj && (oldObj.bildiris_nomresi !== nVal || oldObj.tarix_yazilma !== tVal)) {
                    let updatePayload = { ...oldObj, bildiris_nomresi: nVal, tarix_yazilma: tVal };
                    updatePromises.push(
                        fetch(`${BIL_API_URL}/${bId}`, { 
                            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updatePayload) 
                        })
                    );
                }
            }
        });

        let finalNomre = Array.from(new Set(nomreVals)).join(", ");
        let finalTarix = Array.from(new Set(tarixVals)).join(", ");

        // 🟢 YENİ SƏSSİZ VƏ VİZUAL XƏBƏRDARLIQ SİSTEMİ
        if (!malinAdiValue) {
            showInlineError(malinAdiInput, "Malın adı mütləqdir!");
            hasError = true;
            break; 
        }
        if (!finalNomre) {
            showInlineError(nomreInputs[0], "Nömrəni yazın!");
            hasError = true;
            break;
        }
        if (!finalTarix) {
            showInlineError(tarixInputs[0], "Tarixi daxil edin!");
            hasError = true;
            break;
        }

        let totalInvoys = parseFloat(item.invoysSum) || 0;
        let manatInvoys = totalInvoys * mezenne;
        let borc = parseFloat(item.newBorc) || 0;
        let manatBorc = borc * mezenne;

        payload.push({
            idarereisivezifesi: raportAyarlarData[0] ? raportAyarlarData[0].idarereisivezifesi : "",
            idarereisi: raportAyarlarData[0] ? raportAyarlarData[0].idarereisi : "",
            mesulsexsvezifeyeri: raportAyarlarData[0] ? (raportAyarlarData[0].mesulsexsvezife || raportAyarlarData[0].mesulsexsvezifesi) : "",
            mesulsexs: raportAyarlarData[0] ? raportAyarlarData[0].mesulsexs : "",
            raportfirma: item.firmaAdi,
            uzanti: item.isFiziki ? "na" : "nin",
            raportgbnomresi: item.newGb,
            ixracolke: item.ixracList,
            invoysmebleg: totalInvoys.toFixed(2),
            manatinvoysmebleg: manatInvoys.toFixed(2),
            cevirme: mezenne.toString(),
            malinadi: malinAdiValue,
            borc: borc.toFixed(2),
            manatborc: manatBorc.toFixed(2),
            safeFirmaAdi: item.firmaAdi.replace(/[^a-zA-Z0-9azəöğüşıçƏÖĞÜŞİÇ ]/gi, '').trim().substring(0, 30) || "Firma",
            bildiristarix: finalTarix,
            bildirisnomresi: finalNomre,
            tarixyazilma: getTodayFormatted()
        });

        pendingRaportDbSavePayload.push({
            gomruk_orqani: item.checkbox.getAttribute("data-idare") || "",
            firma: item.firmaAdi,
            voen: item.voen || "",
            tarix_yazilma: getTodayFormatted(),
            tarix_borcdovru: targetPeriod || "",
            melumat: `Bəyannamələr: ${item.newGb}`
        });
    }

    // 🛑 ƏGƏR XƏTA (Boş xana) VARSA, FUNKSİYANI DƏRHAL DAYANDIRIRIQ Kİ PƏNCƏRƏ BAĞLANMASIN:
    if (hasError) {
        return; 
    }

    if (payload.length === 0) {
        alert("Seçilmiş firma tapılmadı!"); 
        return;
    }

    if (updatePromises.length > 0) {
        try { await Promise.all(updatePromises); loadAllBildirisler(); } 
        catch (err) { console.error("Bildiriş məlumatlarını yeniləyərkən xəta: ", err); }
    }

    // UĞURLU OLDUQDA PƏNCƏRƏNİ (MODALI) MƏHZ BURADA BAĞLAYIRIQ
    if (typeof preRaportPopup !== 'undefined' && preRaportPopup) {
        preRaportPopup.style.display = 'none';
    }

    const overlay = createLoadingOverlay();
    const progressBar = document.getElementById('zip-progress-bar');
    const progressText = document.getElementById('zip-progress-text');
    
    overlay.style.display = 'flex'; overlay.style.pointerEvents = 'auto';
    setTimeout(() => overlay.style.opacity = '1', 10);

    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.floor(Math.random() * 15) + 5;
            if(progress > 90) progress = 90;
            progressBar.style.width = `${progress}%`;
            progressText.innerText = `${progress}%`;
        }
    }, 600);

    try {
        const generateDocsEndpoint = 'https://autoreport-production.up.railway.app/api/generate-raports'; 
        const response = await fetch(generateDocsEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedFirms: payload })
        });

        if (!response.ok) throw new Error(`Server xətası (Status: ${response.status})`);

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/zip' });
        
        clearInterval(progressInterval);
        progressBar.style.width = `100%`;
        progressText.style.color = `#10b981`; progressText.innerText = `100% - Yüklənir!`;
        await new Promise(r => setTimeout(r, 600));

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Raportlar_${getTodayFormatted()}.zip`;
        document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);

        if (typeof raportZipTbody !== 'undefined' && raportZipTbody) {
            raportZipTbody.innerHTML = '';
            pendingRaportDbSavePayload.forEach((obj, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td><input type="checkbox" class="custom-checkbox raport-zip-row-check" data-idx="${idx}" checked></td><td>${obj.gomruk_orqani}</td><td>${obj.firma}</td><td style="color:#2563eb; font-weight:600;">${obj.melumat.replace('Bəyannamələr: ', '')}</td><td>Raport hazırlanacaq</td>`;
                raportZipTbody.appendChild(tr);
            });
        }
        if (typeof raportZipPopup !== 'undefined' && raportZipPopup) {
            raportZipPopup.style.display = 'flex';
        }

    } catch (error) {
        clearInterval(progressInterval); 
        alert("Server ilə əlaqə xətası: " + error.message);
    } finally {
        overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none';
        setTimeout(() => {
            overlay.style.display = 'none'; progressBar.style.width = '0%'; progressText.innerText = '0%'; progressText.style.color = '#3b82f6';
        }, 300);
    }
};





    

    if(confirmPrezipBtn) {
        confirmPrezipBtn.addEventListener("click", () => {
            if (window.pendingFirmsToZip && window.pendingFirmsToZip.length === 0) {
                alert("Diqqət: Seçdiyiniz firmalar üçün yeni bildiriş yazılası bəyannamə yoxdur. Sənəd yaradılmadı.");
                if (preZipPopup) preZipPopup.style.display = "none";
                return;
            }
            if (preZipPopup) preZipPopup.style.display = "none";
            executeZipProcess();
        });
    }

    // Əvvəlki confirmRaportZipBtn üçün olan bütün addEventListener-ləri silin və yalnız bunu qoyun:
if (confirmRaportZipBtn) {
    // Köhnə dinləyicilərin təsirini silmək üçün klonlayırıq
    const newBtn = confirmRaportZipBtn.cloneNode(true);
    confirmRaportZipBtn.parentNode.replaceChild(newBtn, confirmRaportZipBtn);
    
    newBtn.addEventListener("click", () => {
        if (window.pendingFirmsToRaportZip && window.pendingFirmsToRaportZip.length === 0) {
            alert("Diqqət: Seçdiyiniz firmalar üçün raport yazılası yeni bəyannamə yoxdur.");
            if (preRaportPopup) preRaportPopup.style.display = "none";
            return;
        }

        // 1. Əvvəlcə daxil edilməyən xanaları yoxlayırıq (Pəncərə hələ AÇIQDIR!)
        let firstInvalidInput = null;

        for (const item of window.pendingFirmsToRaportZip) {
            let rowCheck = document.querySelector(`.raport-modal-check[data-idx="${item.rowIdx}"]`);
            if (!rowCheck || !rowCheck.checked) continue; 

            let malinAdiInput = document.getElementById(`malin-adi-${item.rowIdx}`);
            let malinAdiValue = malinAdiInput ? malinAdiInput.value.trim() : "";

            let nomreInputs = document.querySelectorAll(`.rap-bil-nomre-${item.rowIdx}`);
            let tarixInputs = document.querySelectorAll(`.rap-bil-tarix-${item.rowIdx}`);

            let hasNomre = Array.from(nomreInputs).some(inp => inp.value.trim() !== "");
            let hasTarix = Array.from(tarixInputs).some(inp => inp.value.trim() !== "");

            if (!malinAdiValue) {
                firstInvalidInput = malinAdiInput;
                break;
            }
            if (!hasNomre) {
                firstInvalidInput = nomreInputs[0];
                break;
            }
            if (!hasTarix) {
                firstInvalidInput = tarixInputs[0];
                break;
            }
        }

        // 2. Əgər boş xana varsa, pəncərəni QƏTİYYƏN BAĞLAMIROQ!
        if (firstInvalidInput) {
            // Xananı qırmızı rəngə boyayırıq və kursoru ora qoyuruq
            firstInvalidInput.style.transition = "all 0.3s ease";
            firstInvalidInput.style.border = "2px solid #ef4444";
            firstInvalidInput.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.5)";
            firstInvalidInput.focus();

            // 3 saniyə sonra xana normal rəngə qayıtsın
            setTimeout(() => {
                firstInvalidInput.style.border = "";
                firstInvalidInput.style.boxShadow = "";
            }, 3000);

            return; // 🛑 DAYANIRIK! Pəncərə açılıb qalır, heç bir yerə getmir.
        }

        // 3. Hər şey qaydasındadırsa, pəncərəni məhz indi bağlayırıq və ZIP prosesini işə salırıq
        if (preRaportPopup) preRaportPopup.style.display = "none";
        executeRaportZipProcess();
    });
}

    const bildirisQosmaBtn = document.getElementById("bildiris-qosma");
    if (bildirisQosmaBtn) {
        bildirisQosmaBtn.addEventListener("click", function(e) {
            e.preventDefault();
            const checkedFirms = document.querySelectorAll(".firma-check2:checked:not([disabled])");
            if (checkedFirms.length === 0) { 
                alert("Diqqət: Zəhmət olmasa ən azı bir firma seçin!"); return; 
            }

            let firmsToProcess = [];
            let warningHtml = "";

            for (let i=0; i<checkedFirms.length; i++) {
                const checkbox = checkedFirms[i];
                let oldGb = checkbox.getAttribute("data-old-gb") || "";
                let newGb = checkbox.getAttribute("data-new-gb") || "";
                let newBorc = checkbox.getAttribute("data-new-borc") || "0.00";
                let rawFirmaAdi = checkbox.getAttribute("data-firma") || "";
                let firmaAdi = rawFirmaAdi.replace(/&quot;/g, '"').replace(/&#39;/g, "'"); 

                if (newGb.trim() !== "") {
                    warningHtml += `<tr><td><strong>${firmaAdi}</strong></td><td style="color:#ef4444; font-size:12px;">${oldGb.trim() !== "" ? oldGb : "Yoxdur"}</td><td style="color:#10b981; font-weight:bold; font-size:12px;">${newGb}</td><td style="font-weight:bold; color:#1e293b;">${newBorc} ABŞ</td></tr>`;
                    firmsToProcess.push({ checkbox: checkbox, newGb: newGb, newBorc: newBorc });
                }
            }

            if (firmsToProcess.length === 0) { 
                alert("Diqqət: Seçdiyiniz firmaların bütün bəyannamələrinə artıq bildiriş yazılıb!"); return; 
            }
            window.pendingFirmsToZip = firmsToProcess;

            if (prezipTbody && preZipPopup) {
                prezipTbody.innerHTML = warningHtml;
                preZipPopup.style.display = "flex";
            }
        });
    }

    const raportQosmaBtn = document.getElementById("btn-raport-qosma");
    if (raportQosmaBtn) {
        raportQosmaBtn.addEventListener("click", function(e) {
            e.preventDefault();
            const checkedFirms = document.querySelectorAll(".firma-check2:checked:not([disabled])");
            if (checkedFirms.length === 0) { 
                alert("Diqqət: Zəhmət olmasa ən azı bir firma seçin!"); return; 
            }

            let firmsToProcess = [];
            let warningHtml = "";

            for (let i = 0; i < checkedFirms.length; i++) {
                const checkbox = checkedFirms[i];
                let canRaport = checkbox.getAttribute("data-can-raport") === "true";

                if (!canRaport) continue;

                let voen = checkbox.getAttribute("data-voen") || "";
                let idare = checkbox.getAttribute("data-idare") || "";
                let rawFirmaAdi = checkbox.getAttribute("data-firma") || "";
                let firmaAdi = rawFirmaAdi.replace(/&quot;/g, '"').replace(/&#39;/g, "'"); 
                let newRaportGb = checkbox.getAttribute("data-new-raport-gb") || "";
                let oldRaportGb = checkbox.getAttribute("data-old-raport-gb") || "";
                let newRaportBorc = checkbox.getAttribute("data-new-raport-borc") || "0.00";
                let isFiziki = checkbox.getAttribute("data-isfiziki") === "true";
                let ixracList = checkbox.getAttribute("data-new-raport-ixrac") || "";
                let invoysSum = checkbox.getAttribute("data-new-raport-invoys") || "0";

                if (newRaportGb.trim() !== "") {
                    let gbArr = newRaportGb.split(',').map(s => s.trim()).filter(s => s);
                    
                    let matchedRecords = [];
                    gbArr.forEach(gb => {
                        let regex = new RegExp(`\\b${gb}\\b`);
                        let rec = allBildirislerData.find(b => b.melumat && regex.test(b.melumat) && ((voen && b.voen === voen) || (!voen && b.firma === firmaAdi)));
                        if (rec && !matchedRecords.some(r => r.id === rec.id)) {
                            matchedRecords.push(rec);
                        }
                    });

                    let bilInputsHtml = '';
                    let hasMissingNomre = false;

                    if (matchedRecords.length > 0) {
                        matchedRecords.forEach((rec) => {
                            let nomre = rec.bildiris_nomresi || "";
                            let tarix = rec.tarix_yazilma || "";
                            if (!nomre || !tarix) hasMissingNomre = true;
                            
                            bilInputsHtml += `
                                <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center; background:#f1f5f9; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; flex: 1 1 45%; min-width: 250px;">
                                    <strong style="font-size:11px; color:#475569; width:40px;"><i class="fa-solid fa-file-invoice"></i></strong>
                                    <input type="text" class="rap-bil-nomre-${i}" data-bil-id="${rec.id}" value="${nomre}" placeholder="Bildiriş Nömrəsi" style="flex:1; padding:6px 10px; font-size:12px; border:1px solid ${nomre ? '#cbd5e1' : '#ef4444'}; border-radius:4px; outline:none; background:${nomre ? '#ffffff' : '#fef2f2'};">
                                    <input type="text" class="rap-bil-tarix-${i}" data-bil-id="${rec.id}" value="${tarix}" placeholder="Tarix" style="width:90px; padding:6px 10px; font-size:12px; border:1px solid ${tarix ? '#cbd5e1' : '#ef4444'}; border-radius:4px; outline:none; background:${tarix ? '#ffffff' : '#fef2f2'};">
                                </div>`;
                        });
                    } else {
                        hasMissingNomre = true;
                        bilInputsHtml = `
                            <div style="display:flex; gap:8px; align-items:center; background:#f1f5f9; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; width:100%;">
                                <strong style="font-size:11px; color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Bazada yoxdur:</strong>
                                <input type="text" class="rap-bil-nomre-${i}" value="" placeholder="Bildiriş Nömrəsi..." style="flex:1; padding:6px 10px; font-size:12px; border:1px solid #ef4444; border-radius:4px; outline:none; background:#fef2f2;">
                                <input type="text" class="rap-bil-tarix-${i}" value="" placeholder="Tarix..." style="width:100px; padding:6px 10px; font-size:12px; border:1px solid #ef4444; border-radius:4px; outline:none; background:#fef2f2;">
                            </div>`;
                    }

                    let warningBadge = hasMissingNomre 
                        ? `<div style="margin-top:6px; color:#b91c1c; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; background: #fee2e2; padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-triangle-exclamation"></i> Bildiriş məlumatı əksikdir! Aşağı oxa basın</div>` 
                        : `<div style="margin-top:6px; color:#166534; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; background: #dcfce7; padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-check-circle"></i> Bildiriş tamdır</div>`;

                    warningHtml += `
                    <tr>
                        <td style="padding: 0; border: none; padding-bottom: 12px;">
                            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
                                    
                                    <div style="display:flex; gap:12px; align-items:flex-start; flex:1; min-width:250px;">
                                        <input type="checkbox" class="custom-checkbox raport-modal-check" data-idx="${i}" checked style="margin-top:4px;">
                                        <div>
                                            <strong style="color:#0f172a; font-size:14px; display:block; margin-bottom:2px;">${idare}</strong>
                                            <span style="font-size:12px; color:#475569; display:block;">${firmaAdi}</span>
                                            ${warningBadge}
                                        </div>
                                    </div>

                                    <div style="display:flex; gap:15px; align-items:center; background:#f8fafc; padding:8px 16px; border-radius:8px; border:1px solid #e2e8f0;">
                                        <div>
                                            <div style="font-size:10px; color:#64748b; text-transform:uppercase; font-weight:700; margin-bottom:2px;">Köhnə Bəy.</div>
                                            <div style="color:#ef4444; font-size:12px; font-weight:600;">${oldRaportGb || "Yoxdur"}</div>
                                        </div>
                                        <div style="width:1px; height:24px; background:#cbd5e1;"></div>
                                        <div>
                                            <div style="font-size:10px; color:#64748b; text-transform:uppercase; font-weight:700; margin-bottom:2px;">Yeni Bəy.</div>
                                            <div style="color:#10b981; font-weight:800; font-size:13px;">${newRaportGb}</div>
                                        </div>
                                        <div style="width:1px; height:24px; background:#cbd5e1;"></div>
                                        <div>
                                            <div style="font-size:10px; color:#64748b; text-transform:uppercase; font-weight:700; margin-bottom:2px;">Borc</div>
                                            <div style="font-weight:800; color:#1e293b; font-size:13px;">${newRaportBorc} USD</div>
                                        </div>
                                        <button class="btn-sec toggle-raport-details" data-target="raport-details-${i}" style="padding:6px 10px; font-size:12px; border-radius:6px; margin-left:8px;" title="Bildiriş məlumatlarını göstər"><i class="fa-solid fa-chevron-down"></i></button>
                                    </div>
                                </div>

                                <div id="raport-details-${i}" style="display:none; margin-top:16px; padding-top:16px; border-top:1px dashed #cbd5e1;">
                                    <div style="display:flex; flex-wrap:wrap; gap:10px;">
                                        ${bilInputsHtml}
                                    </div>
                                </div>

                                <div style="margin-top:16px;">
                                    <input type="text" id="malin-adi-${i}" class="malin-adi-input" placeholder="Malın adını bura daxil edin..." style="width:100%; padding:10px 14px; font-size:13px; border:1px solid #cbd5e1; border-radius:6px; outline:none; background:#f8fafc; transition:0.2s;">
                                </div>

                            </div>
                        </td>
                    </tr>`;

                    firmsToProcess.push({ 
                        checkbox: checkbox, newGb: newRaportGb, newBorc: newRaportBorc, firmaAdi: firmaAdi,
                        rawFirmaAdi: rawFirmaAdi, voen: voen, isFiziki: isFiziki, ixracList: ixracList,
                        invoysSum: parseFloat(invoysSum), rowIdx: i
                    });
                }
            }

            if (firmsToProcess.length === 0) { 
                alert("Diqqət: Seçdiyiniz firmalar ya tam raportlanıb, ya da bildirişi olmadığı üçün raport blokuna salınıb."); return; 
            }

            window.pendingFirmsToRaportZip = firmsToProcess;

            if (preraportTbody && preRaportPopup) {
                // Cədvəlin ənənəvi başlıqlarını gizlədirik ki, tam Kart dizaynı olsun
                let thead = preraportTbody.closest('table').querySelector('thead');
                if (thead) { thead.style.display = 'none'; }
                
                preraportTbody.innerHTML = warningHtml;
                preRaportPopup.style.display = "flex";

                // Ox (Accordion) düyməsi üçün Event Listener
                document.querySelectorAll('.toggle-raport-details').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('data-target');
                        const targetRow = document.getElementById(targetId);
                        const icon = this.querySelector('i');
                        if (targetRow.style.display === 'none') {
                            targetRow.style.display = 'block';
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-up');
                        } else {
                            targetRow.style.display = 'none';
                            icon.classList.remove('fa-chevron-up');
                            icon.classList.add('fa-chevron-down');
                        }
                    });
                });
            }
        });
    }

    if(saveZipSelectionsBtn) {
        saveZipSelectionsBtn.addEventListener('click', function() {
            const checkedBoxes = document.querySelectorAll('.zip-row-check:checked');
            if(checkedBoxes.length === 0) { alert("Heç bir məlumat seçilməyib!"); return; }

            const finalPayload = [];
            checkedBoxes.forEach(cb => { 
                const idx = cb.getAttribute('data-idx'); 
                finalPayload.push(pendingDbSavePayload[idx]); 
            });

            const oldText = saveZipSelectionsBtn.innerHTML;
            saveZipSelectionsBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yazılır...`; 
            saveZipSelectionsBtn.disabled = true;

            fetch(BIL_API_URL + '/bulk', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bildirisler: finalPayload })
            })
            .then(res => {
                if(!res.ok) return res.json().then(err => { throw new Error(err.error || "Bilinməyən xəta") });
                return res.json();
            })
            .then(data => {
                alert("Bildirişlər uğurla bazaya yazıldı! Nəticələr yenilənir.");
                if(zipPopup) zipPopup.style.display = 'none'; 
                loadAllBildirisler(() => renderBildirisTable()); 
            })
            .catch(err => { alert("Şəbəkə xətası: " + err.message); })
            .finally(() => { saveZipSelectionsBtn.innerHTML = oldText; saveZipSelectionsBtn.disabled = false; });
        });
    }

    if(saveRaportSelectionsBtn) {
        saveRaportSelectionsBtn.addEventListener('click', function() {
            const checkedBoxes = document.querySelectorAll('.raport-zip-row-check:checked');
            if(checkedBoxes.length === 0) { alert("Heç bir məlumat seçilməyib!"); return; }

            const finalPayload = [];
            checkedBoxes.forEach(cb => { 
                const idx = cb.getAttribute('data-idx'); 
                finalPayload.push(pendingRaportDbSavePayload[idx]); 
            });

            const oldText = saveRaportSelectionsBtn.innerHTML;
            saveRaportSelectionsBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yazılır...`; 
            saveRaportSelectionsBtn.disabled = true;

            fetch(RAPORT_API_URL + '/bulk', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raportlar: finalPayload })
            })
            .then(res => {
                if(!res.ok) return res.json().then(err => { throw new Error(err.error || "Bilinməyən xəta") });
                return res.json();
            })
            .then(data => {
                alert("Raportlar uğurla bazaya yazıldı!");
                if(raportZipPopup) raportZipPopup.style.display = 'none'; 
                loadAllRaports(() => refreshAnalysisIfPossible()); 
            })
            .catch(err => { alert("Şəbəkə xətası: " + err.message); })
            .finally(() => { saveRaportSelectionsBtn.innerHTML = oldText; saveRaportSelectionsBtn.disabled = false; });
        });
    }
});
