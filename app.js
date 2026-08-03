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
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
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
    const RAPORT_API_URL = 'https://autoreport-production.up.railway.app/api/raportinfo'; // RAPORT ÜÇÜN YENİ APİ

    let allCompaniesData = [];
    let currentFilteredData = [];
    let currentFilterType = "";
    let currentPage = 1;
    const rowsPerPage = 20;
    
    let currentBilPage = 1;
    const bilRowsPerPage = 30;
    
    let minAmountFilter = 0; 
    let currentSignerId = null;
    let allBildirislerData = []; 
    let allRaportData = []; // RAPORT ÜÇÜN BAZA VERİLƏNLƏRİ

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

    // BILDIRIS MODAL VARIABLES
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

    // RAPORT MODAL VARIABLES
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
    let pendingRaportDbSavePayload = []; // RAPORT ÜÇÜN PAYLOAD
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

    function loadSigners() {
        fetch(SIGNER_API_URL).then(r => r.json()).then(data => {
            if (data && data.length > 0) {
                const s = data[0]; 
                currentSignerId = s.id; 
                iLeaderPerson.value = s.leaderperson || ''; 
                iLeaderName.value = s.leadername || '';
                iSecondPerson.value = s.secondperson || ''; 
                iPhone.value = s.phone || '';
            }
        }).catch(err => console.error(err));
    }
    
    if (signerBtn && popupSigners) { 
        signerBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            popupSigners.style.display = 'flex'; 
            signerStatusMsg.style.display = 'none'; 
        }); 
    }
    
    if (closeSignerBtn && popupSigners) { 
        closeSignerBtn.addEventListener('click', e => { 
            e.preventDefault(); 
            popupSigners.style.display = 'none'; 
        }); 
    }
    
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

    // RAPORT VERİLƏNLƏRİNİ ÇƏKƏN YENİ FUNKSİYA
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
        }
    }

    loadSigners(); 
    loadAllBildirisler();
    loadAllRaports(); // RAPORT BAZASINI YÜKLƏMƏK ÜÇÜN ÇAĞIRIRIQ

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
                                
                                let firmObj = groupedResults[idareAdi][groupKey];
                                if(!firmObj.decls[bNo]) firmObj.decls[bNo] = { borc: 0, tarixler: new Set() };
                                
                                firmObj.decls[bNo].borc += qaliqBorc;
                                firmObj.decls[bNo].tarixler.add(tarixStr);
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
                                        missingAlertHtml = `<button class="add-missing-voen-btn" data-voen="${item.voen}" data-firma="${safeFirmaAdi}" data-isfiziki="${item.isFiziki}"><i class="fa-solid fa-triangle-exclamation"></i> VÖEN bazada yoxdur - Əlavə etmək üçün klikləyin</button>`; 
                                    }
                                } else { 
                                    isVoenInDb = false; 
                                }

                                // BİLDİRİŞ DƏYİŞƏNLƏRİ
                                let newDecls = [];
                                let oldDecls = [];
                                let newBorc = 0;
                                let newTarixler = new Set();
                                
                                // RAPORT DƏYİŞƏNLƏRİ (YENİ)
                                let oldRaportDecls = [];
                                let newRaportDecls = [];
                                let newRaportBorc = 0;

                                let accordionListHtml = ``;
                                let hasBildiris = false;
                                
                                let foundRecordsForFirm = allBildirislerData.filter(b => 
                                    (item.voen && b.voen === item.voen.toString()) || (!item.voen && b.firma === item.firma)
                                );
                                
                                let foundRaportsForFirm = allRaportData.filter(r => 
                                    (item.voen && r.voen === item.voen.toString()) || (!item.voen && r.firma === item.firma)
                                );

                                for(const nomre in item.decls) {
                                    let borcu = item.decls[nomre].borc;
                                    let tarixleri = Array.from(item.decls[nomre].tarixler);
                                    
                                    let regex = new RegExp(`\\b${nomre}\\b`);
                                    
                                    // BİLDİRİŞ YOXLANIŞI
                                    let matchedRecord = foundRecordsForFirm.find(b => b.melumat && regex.test(b.melumat));
                                    if (matchedRecord) {
                                        hasBildiris = true;
                                        oldDecls.push(nomre);
                                        let mainBildirisNo = matchedRecord.bildiris_nomresi && matchedRecord.bildiris_nomresi.trim() !== "" ? matchedRecord.bildiris_nomresi : null;

                                        accordionListHtml += `<li><span><i class="fa-solid fa-file-invoice" style="color:#94a3b8; margin-right:5px;"></i> ${nomre}</span><span>${mainBildirisNo ? `<span style="color: #166534; font-weight:700;"><i class="fa-solid fa-check"></i> Bildiriş №: ${mainBildirisNo}</span>` : `<button class="btn-sec" onclick="openBildirisPanelAndHighlight('${matchedRecord.id}')" style="padding: 4px 10px; font-size:11px; color:#f59e0b; border-color:#f59e0b; background:#fffbeb; cursor:pointer; font-weight:700;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Nömrə artır</button>`}</span></li>`;
                                    } else {
                                        newDecls.push(nomre);
                                        newBorc += borcu; 
                                        tarixleri.forEach(t => newTarixler.add(t));
                                        accordionListHtml += `<li><span style="color: #2563eb;"><i class="fa-solid fa-file-invoice" style="margin-right:5px;"></i> <strong>${nomre}</strong></span><span style="font-size: 11px; color: #ef4444; font-weight:700;"><i class="fa-solid fa-circle-plus"></i> Yeni</span></li>`;
                                    }

                                    // RAPORT YOXLANIŞI (YENİ)
                                    let matchedRaport = foundRaportsForFirm.find(r => r.melumat && regex.test(r.melumat));
                                    if (matchedRaport) {
                                        oldRaportDecls.push(nomre);
                                    } else {
                                        newRaportDecls.push(nomre);
                                        newRaportBorc += borcu;
                                    }
                                }

                                let bgStyle = "#ffffff";
                                let cardBorder = "1px solid #e2e8f0";
                                let statusBadge = "";
                                
                                if (oldDecls.length > 0 && newDecls.length > 0) {
                                    bgStyle = "#fffbeb"; 
                                    cardBorder = "1px solid #fde68a";
                                    statusBadge = `<div class="badge-pill" style="background:#fef3c7; color:#d97706; border-color:#fcd34d;"><i class="fa-solid fa-code-merge"></i> Qismən Yeni</div>`;
                                } else if (oldDecls.length > 0 && newDecls.length === 0) {
                                    bgStyle = "#f8fafc";
                                    cardBorder = "1px solid #e2e8f0";
                                    statusBadge = `<div class="badge-pill" style="background:#e2e8f0; color:#475569; border-color:#cbd5e1;"><i class="fa-solid fa-database"></i> Tamamilə Bildiriş Yazılıb</div>`;
                                } else {
                                    bgStyle = "#f0fdf4";
                                    cardBorder = "1px solid #bbf7d0";
                                    statusBadge = `<div class="badge-pill" style="background:#dcfce7; color:#166534; border-color:#86efac;"><i class="fa-solid fa-sparkles"></i> Yeni Bildiriş</div>`;
                                }

                                let canCreateNew = isVoenInDb;
                                let checkboxAttr = canCreateNew ? "checked" : "disabled";
                                let opacityStyle = canCreateNew ? "1" : "0.5"; 

                                let byNoStr = Object.keys(item.decls).join(", ");
                                let newTarixStr = Array.from(newTarixler).join(", ");
                                let accordionToggleBtn = hasBildiris ? `<button class="toggle-btn" title="Bəyannamələri göstər"><i class="fa-solid fa-chevron-down"></i></button>` : '';

                                // ƏLAVƏ EDİLDİ: Raport məlumatları DOM-a (HTML-ə) atribut olaraq ötürülür
                                htmlContent += `
                                    <div class="firm-item" style="background: ${bgStyle}; border: ${cardBorder}; opacity: ${opacityStyle};">
                                        <div class="firm-main-row">
                                            <input type="checkbox" class="custom-checkbox firma-check2" ${checkboxAttr} data-idare="${safeIdare}" data-voen="${item.voen}" data-firma="${safeFirmaAdi}" data-isfiziki="${item.isFiziki}" data-gb="${byNoStr}" data-new-gb="${newDecls.join(', ')}" data-old-gb="${oldDecls.join(', ')}" data-borc="${item.toplamBorc.toFixed(2)}" data-new-borc="${newBorc.toFixed(2)}" data-new-tarixler="${newTarixStr}" data-new-raport-gb="${newRaportDecls.join(', ')}" data-old-raport-gb="${oldRaportDecls.join(', ')}" data-new-raport-borc="${newRaportBorc.toFixed(2)}">
                                            <div class="firm-info">
                                                <div class="firm-name">${item.firma} <span class="firm-voen">(VÖEN: ${item.voen || "Yoxdur"})</span></div>
                                                <div class="firm-badges">
                                                    <div class="badge-pill" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${newDecls.join(', ')}"><strong>Yeni Bəyannamələr:</strong> ${newDecls.length > 0 ? newDecls.join(', ') : 'Yoxdur'}</div>
                                                    <div class="badge-pill badge-danger-pill">Ümumi Borc: ${item.toplamBorc.toFixed(2)} ABŞ</div>
                                                    ${statusBadge}
                                                </div>
                                                ${missingAlertHtml}
                                            </div>
                                            ${accordionToggleBtn}
                                        </div>
                                        ${hasBildiris ? `<div class="details-panel"><ul>${accordionListHtml}</ul></div>` : ''}
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
                                    panel.style.display = 'none'; 
                                    icon.className = 'fa-solid fa-chevron-down';
                                } else { 
                                    panel.style.display = 'block'; 
                                    icon.className = 'fa-solid fa-chevron-up'; 
                                }
                            });
                        });

                        document.querySelectorAll('.add-bildiris-panel-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.preventDefault();
                                if (bildirisPopup) { 
                                    bildirisPopup.style.display = 'flex'; 
                                    currentBilPage = 1; 
                                    renderBildirisTable(); 
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
                        console.error(err);
                    }
                }, 500); 
            };
        });
    }

    // MODAL BAĞLAMA DÜYMƏLƏRİ
    if(closePrezipBtn) closePrezipBtn.addEventListener('click', () => { preZipPopup.style.display = 'none'; });
    if(cancelPrezipBtn) cancelPrezipBtn.addEventListener('click', () => { preZipPopup.style.display = 'none'; });
    if(closeZipPopupBtn) closeZipPopupBtn.addEventListener('click', () => { zipPopup.style.display = 'none'; });
    if(cancelZipSaveBtn) cancelZipSaveBtn.addEventListener('click', () => { zipPopup.style.display = 'none'; });
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
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 25px;">Bu proses məlumatın həcmindən asılı olaraq bir neçə saniyə çəkə bilər, zəhmət olmasa səhifəni bağlamayın...</p>
                    
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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedFirms: payload, mesulsexs: signerData })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errData = await response.json();
                throw new Error(errData.error || errData.message || "Server xətası baş verdi.");
            }

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
            console.error("ZIP Error:", error);
        } finally {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                overlay.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.innerText = '0%';
                progressText.style.color = '#3b82f6';
            }, 300);
        }
    };

    // ==========================================
    // YENİ: RAPORT ÜÇÜN XÜSUSİ ZIP GENERASİYASI
    // ==========================================
    const executeRaportZipProcess = async () => {
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
            pendingRaportDbSavePayload = [];
            const targetPeriod = document.querySelector('.netice-dovr') ? document.querySelector('.netice-dovr').innerText.trim() : '';

            for (const item of window.pendingFirmsToRaportZip) {
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

                // RAPORT BAZASI ÜÇÜN PAYLOAD
                pendingRaportDbSavePayload.push({
                    gomruk_orqani: checkbox.getAttribute("data-idare") || "",
                    firma: isFiziki ? rehberAdi : firmaAdi,
                    voen: voen || "",
                    tarix_yazilma: getTodayFormatted(),
                    tarix_borcdovru: targetPeriod || "",
                    melumat: `Bəyannamələr: ${item.newGb}`
                });
            }

            // DİQQƏT: Arxa planda raport üçün ayrıca API varsa buranı dəyişdirin
            const generateDocsEndpoint = 'https://autoreport-production.up.railway.app/api/generate-raports'; 
            const signerData = {
                leaderperson: document.getElementById('sign-leader-person')?.value.trim() || '',
                leadername: document.getElementById('sign-leader-name')?.value.trim() || '',
                secondperson: document.getElementById('sign-second-person')?.value.trim() || '',
                phone: document.getElementById('sign-phone')?.value.trim() || ''
            };

            const response = await fetch(generateDocsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedFirms: payload, mesulsexs: signerData })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errData = await response.json();
                throw new Error(errData.error || errData.message || "Server xətası baş verdi.");
            }

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
            a.download = `Raportlar_${getTodayFormatted()}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            if (raportZipTbody) {
                raportZipTbody.innerHTML = '';
                pendingRaportDbSavePayload.forEach((obj, idx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td><input type="checkbox" class="custom-checkbox raport-zip-row-check" data-idx="${idx}" checked></td><td>${obj.gomruk_orqani}</td><td>${obj.firma}</td><td style="color:#2563eb; font-weight:600;">${obj.melumat.replace('Bəyannamələr: ', '')}</td><td>Raport hazırlanacaq</td>`;
                    raportZipTbody.appendChild(tr);
                });
            }
            if (raportZipPopup) raportZipPopup.style.display = 'flex';

        } catch (error) {
            clearInterval(progressInterval);
            alert("XƏTA: " + error.message);
            console.error("ZIP Error:", error);
        } finally {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                overlay.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.innerText = '0%';
                progressText.style.color = '#3b82f6';
            }, 300);
        }
    };


    // BİLDİRİŞ PRE-ZIP
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

    // RAPORT PRE-ZIP
    if(confirmRaportZipBtn) {
        confirmRaportZipBtn.addEventListener("click", () => {
            if (window.pendingFirmsToRaportZip && window.pendingFirmsToRaportZip.length === 0) {
                alert("Diqqət: Seçdiyiniz firmalar üçün raport yazılası yeni bəyannamə yoxdur.");
                if (preRaportPopup) preRaportPopup.style.display = "none";
                return;
            }
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
                alert("Diqqət: Zəhmət olmasa ən azı bir firma seçin!"); 
                return; 
            }

            let firmsToProcess = [];
            let warningHtml = "";

            for (const checkbox of checkedFirms) {
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
                alert("Diqqət: Seçdiyiniz firmaların bütün bəyannamələrinə artıq bildiriş yazılıb!"); 
                return; 
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
                alert("Diqqət: Zəhmət olmasa ən azı bir firma seçin!"); 
                return; 
            }

            let firmsToProcess = [];
            let warningHtml = "";

            for (const checkbox of checkedFirms) {
                let oldRaportGb = checkbox.getAttribute("data-old-raport-gb") || "";
                let newRaportGb = checkbox.getAttribute("data-new-raport-gb") || "";
                let newRaportBorc = checkbox.getAttribute("data-new-raport-borc") || "0.00";
                let rawFirmaAdi = checkbox.getAttribute("data-firma") || "";
                let firmaAdi = rawFirmaAdi.replace(/&quot;/g, '"').replace(/&#39;/g, "'"); 

                if (newRaportGb.trim() !== "") {
                    warningHtml += `<tr><td><strong>${firmaAdi}</strong></td><td style="color:#ef4444; font-size:12px;">${oldRaportGb.trim() !== "" ? oldRaportGb : "Yoxdur"}</td><td style="color:#10b981; font-weight:bold; font-size:12px;">${newRaportGb}</td><td style="font-weight:bold; color:#1e293b;">${newRaportBorc} ABŞ</td></tr>`;
                    firmsToProcess.push({ checkbox: checkbox, newGb: newRaportGb, newBorc: newRaportBorc });
                }
            }

            if (firmsToProcess.length === 0) { 
                alert("Diqqət: Seçdiyiniz firmaların bütün bəyannamələrinə artıq raport yazılıb!"); 
                return; 
            }

            window.pendingFirmsToRaportZip = firmsToProcess;

            if (preraportTbody && preRaportPopup) {
                preraportTbody.innerHTML = warningHtml;
                preRaportPopup.style.display = "flex";
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

            // RAPORT TOPLU YAZILMA API-si
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
