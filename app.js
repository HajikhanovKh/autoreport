document.addEventListener("DOMContentLoaded", function () {
    // Sizin funksiyalarınız və kodlarınız bura yazılmalıdır:
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
            </div>
        `;
        document.body.appendChild(overlay);
        const input = document.getElementById('sec-password');
        const btn = document.getElementById('sec-submit');
        const error = document.getElementById('sec-error');
        function checkPassword() {
            if (input.value === DOGRU_SIFRE) {
                overlay.style.opacity = '0'; overlay.style.transition = 'opacity 0.4s ease'; document.body.style.overflow = ''; 
                setTimeout(() => overlay.remove(), 400); 
            } else {
                error.style.display = 'block'; input.style.borderColor = '#ef4444'; input.value = ''; input.focus();
            }
        }
        btn.addEventListener('click', checkPassword);
        input.addEventListener('keypress', function(e) { if (e.key === 'Enter') checkPassword(); });
        setTimeout(() => input.focus(), 100);
    })();
}

document.addEventListener("DOMContentLoaded", function() {
    const API_URL = 'https://autoreport-production.up.railway.app/api/companies';
    const SIGNER_API_URL = 'https://autoreport-production.up.railway.app/api/mesulsexs';
    const BİL_API_URL = 'https://autoreport-production.up.railway.app/api/bildirisler';

    
    let allCompaniesData = [];
    let currentFilteredData = [];
    let currentFilterType = "";
    
    let currentPage = 1;
    const rowsPerPage = 20;
    let minAmountFilter = 0; 
    let currentSignerId = null;
    let allBildirislerData = []; 

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

    /* ZIP və Pre-ZIP Modalları */
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

    let pendingDbSavePayload = [];

    let selectedFile = null; 
    const analizBtn = document.getElementById('analiz-start'); 

    function normStr(str) {
        if(!str) return "";
        return str.toString().toLowerCase().replace(/ü/g, 'u').replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/\s+/g, '');
    }

    function getTodayFormatted() { const today = new Date(); return `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`; }
    function setStatus(message, isError = false) { if (statusMsg) { statusMsg.innerText = message; statusMsg.style.color = isError ? '#ef4444' : '#10b981'; statusMsg.style.display = 'block'; } }
    function refreshAnalysisIfPossible() { if (selectedFile && analizBtn) analizBtn.click(); }

    if (meblegBtn && popupMebleg) { meblegBtn.addEventListener('click', (e) => { e.preventDefault(); minAmountInput.value = minAmountFilter; popupMebleg.style.display = 'flex'; }); }
    if (closeMeblegBtn && popupMebleg) { closeMeblegBtn.addEventListener('click', (e) => { e.preventDefault(); popupMebleg.style.display = 'none'; }); }
    if (applyMeblegBtn && popupMebleg) {
        applyMeblegBtn.addEventListener('click', (e) => {
            e.preventDefault(); let val = parseFloat(minAmountInput.value);
            if (isNaN(val)) val = 0; minAmountFilter = val;
            popupMebleg.style.display = 'none'; refreshAnalysisIfPossible();
        });
    }

    function loadSigners() {
        fetch(SIGNER_API_URL).then(r => r.json()).then(data => {
            if (data && data.length > 0) {
                const s = data[0]; 
                currentSignerId = s.id; iLeaderPerson.value = s.leaderperson || ''; iLeaderName.value = s.leadername || '';
                iSecondPerson.value = s.secondperson || ''; iPhone.value = s.phone || '';
            }
        }).catch(err => console.error(err));
    }
    
    if (signerBtn && popupSigners) { signerBtn.addEventListener('click', e => { e.preventDefault(); popupSigners.style.display = 'flex'; signerStatusMsg.style.display = 'none'; }); }
    if (closeSignerBtn && popupSigners) { closeSignerBtn.addEventListener('click', e => { e.preventDefault(); popupSigners.style.display = 'none'; }); }
    if (saveSignersBtn) {
        saveSignersBtn.addEventListener('click', e => {
            e.preventDefault();
            const payload = { leaderperson: iLeaderPerson.value.trim(), leadername: iLeaderName.value.trim(), secondperson: iSecondPerson.value.trim(), phone: iPhone.value.trim() };
            let method = currentSignerId ? 'PUT' : 'POST'; let url = currentSignerId ? `${SIGNER_API_URL}/${currentSignerId}` : SIGNER_API_URL;
            saveSignersBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gözləyin...`; saveSignersBtn.disabled = true;

            fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            }).then(res => res.json()).then(data => {
                signerStatusMsg.innerText = "Uğurla yadda saxlanıldı! ✅"; signerStatusMsg.style.color = "#10b981"; signerStatusMsg.style.display = "block";
                if (!currentSignerId && data && data.id) currentSignerId = data.id;
                setTimeout(() => { popupSigners.style.display = 'none'; }, 1500);
            }).catch(err => {
                signerStatusMsg.innerText = "Xəta baş verdi!"; signerStatusMsg.style.color = "#ef4444"; signerStatusMsg.style.display = "block";
            }).finally(() => { saveSignersBtn.innerHTML = `<i class="fa-solid fa-save"></i> Yadda Saxla`; saveSignersBtn.disabled = false; });
        });
    }
    
    function loadAllBildirisler() {
        fetch(BİL_API_URL).then(r => r.json()).then(data => {
            allBildirislerData = data || [];
            const missingCount = allBildirislerData.filter(b => !b.bildiris_nomresi || b.bildiris_nomresi.trim() === "").length;
            if(missingBadge) missingBadge.innerText = missingCount;
            refreshAnalysisIfPossible();
        }).catch(err => console.error(err));
    }

    function renderBildirisTable() {
        if (!bildirisTbody) return;
        bildirisTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Yüklənir...</td></tr>`;
        
        fetch(`${BİL_API_URL}/missing`).then(r => r.json()).then(data => {
            bildirisTbody.innerHTML = '';
            if (!data || data.length === 0) {
                bildirisTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:#94a3b8;">Bütün bildiriş nömrələri qeyd edilib və ya siyahı boşdur.</td></tr>`;
                return;
            }
            
            data.forEach(b => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: 600; color: #475569;">${b.gomruk_orqani}</td>
                    <td><div style="font-weight: 700; color: #0f172a;">${b.firma}</div><div style="font-size: 11px; color: #64748b;">VÖEN: ${b.voen}</div></td>
                    <td><div style="font-weight: 600; color: #3b82f6;">${b.tarix_yazilma}</div><div style="font-size: 11px; color: #64748b;">Dövr: ${b.tarix_borcdovru}</div></td>
                    <td style="font-size: 12px; font-weight: 600; color: #ef4444;">${b.melumat}</td>
                    <td>
                        <div style="display:flex; gap:6px; justify-content:center; align-items:center;">
                            <input type="text" class="modal-input" placeholder="Nömrə daxil edin" id="b-num-${b.id}" style="padding: 6px 10px; font-size: 12px; width: 140px; margin:0;">
                            <button class="btn-primary" style="padding: 6px 12px; border-radius: 6px; border:none; cursor:pointer;" title="Təsdiqlə" onclick="saveBildirisNum(${b.id})"><i class="fa-solid fa-check"></i></button>
                            <button style="padding: 6px 12px; border-radius: 6px; border:none; cursor:pointer; background:#ef4444; color:white;" title="Sil" onclick="deleteBildiris(${b.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                bildirisTbody.appendChild(tr);
            });
        }).catch(err => { bildirisTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Xəta baş verdi.</td></tr>`; });
    }

    window.saveBildirisNum = function(id) {
        const input = document.getElementById(`b-num-${id}`);
        const val = input.value.trim();
        if(!val) { alert("Zəhmət olmasa nömrəni daxil edin!"); return; }
        
        fetch(`${BİL_API_URL}/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bildiris_nomresi: val })
        }).then(() => { renderBildirisTable(); loadAllBildirisler(); }).catch(err => alert("Xəta: " + err.message));
    }

    window.deleteBildiris = function(id) {
        if(!confirm("Bu bildiriş qeydini silmək istədiyinizə əminsiniz?")) return;
        fetch(`${BİL_API_URL}/${id}`, { method: 'DELETE' }).then(() => { renderBildirisTable(); loadAllBildirisler(); }).catch(err => alert("Silinərkən xəta: " + err.message));
    }

    if (bildirisBtn && bildirisPopup) { bildirisBtn.addEventListener('click', e => { e.preventDefault(); bildirisPopup.style.display = 'flex'; renderBildirisTable(); }); }
    if (closeBildirisBtn && bildirisPopup) { closeBildirisBtn.addEventListener('click', e => { e.preventDefault(); bildirisPopup.style.display = 'none'; }); }

    loadSigners(); loadAllBildirisler();

    function handleRadioChange() {
        if (radioPerson2 && radioPerson2.checked) {
            if (inputCompany) { inputCompany.value = ''; inputCompany.disabled = true; inputCompany.style.backgroundColor = '#f1f5f9'; }
        } else {
            if (inputCompany) { inputCompany.disabled = false; inputCompany.style.backgroundColor = ''; }
        }
    }
    if (radioPerson1) radioPerson1.addEventListener('change', handleRadioChange);
    if (radioPerson2) radioPerson2.addEventListener('change', handleRadioChange);

    function clearFormFields() {
        if (inputVoen) inputVoen.value = ''; if (inputCompany) inputCompany.value = ''; if (inputLeader) inputLeader.value = ''; if (inputAddress) inputAddress.value = '';
        if (radioPerson1) radioPerson1.checked = true; handleRadioChange(); if (statusMsg) statusMsg.style.display = 'none';
        if (tableSearchInput) tableSearchInput.value = ''; updateSearchIconState();
    }

    function fillFormWithData(company) {
        if (inputVoen) inputVoen.value = company.voen || ''; if (inputLeader) inputLeader.value = company.comp_director_name || ''; if (inputAddress) inputAddress.value = company.comp_adress || '';
        if (company.pstatus == 2) { if (radioPerson2) radioPerson2.checked = true; } else { if (radioPerson1) radioPerson1.checked = true; }
        handleRadioChange(); if (inputCompany) inputCompany.value = company.pstatus == 2 ? '' : (company.comp_name || '');
        updateSearchIconState();
    }

    function updateSearchIconState() {
        if (!inputVoen || !voenSrcIcon) return;
        if (inputVoen.value.trim().length > 0) { voenSrcIcon.classList.add('active-search'); } 
        else { voenSrcIcon.classList.remove('active-search'); }
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
        const startIndex = (currentPage - 1) * rowsPerPage; const endIndex = startIndex + rowsPerPage;
        const pageData = currentFilteredData.slice(startIndex, endIndex);

        pageData.forEach(company => {
            const tr = document.createElement('tr'); const isFiziki = company.pstatus == 2;
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
                </td>
            `;
            tr.querySelector('.btn-edit').addEventListener('click', (e) => { e.preventDefault(); fillFormWithData(company); document.querySelector('.modal-body').scrollTo({ top: 0, behavior: 'smooth' }); });
            tr.querySelector('.btn-delete').addEventListener('click', (e) => { e.preventDefault(); if (confirm(`${company.voen} VÖEN-li qeydi silmək istədiyinizə əminsiniz?`)) { fetch(`${API_URL}/${company.id}`, { method: 'DELETE' }).then(() => loadCompanies()); } });
            voenTbody.appendChild(tr);
        });
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-controls');
        if (!paginationContainer) return; paginationContainer.innerHTML = ''; if (totalPages <= 1) return;

        const prevBtn = document.createElement('button'); prevBtn.className = 'page-btn'; prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1; prevBtn.onclick = (e) => { e.preventDefault(); currentPage--; renderTable(); };
        paginationContainer.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - 2); let endPage = Math.min(totalPages, currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            const pBtn = document.createElement('button'); pBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`; pBtn.innerText = i;
            pBtn.onclick = (e) => { e.preventDefault(); currentPage = i; renderTable(); }; paginationContainer.appendChild(pBtn);
        }

        const nextBtn = document.createElement('button'); nextBtn.className = 'page-btn'; nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages; nextBtn.onclick = (e) => { e.preventDefault(); currentPage++; renderTable(); };
        paginationContainer.appendChild(nextBtn);
    }

    function loadCompanies(callback) { fetch(API_URL).then(res => res.json()).then(data => { allCompaniesData = data || []; filterAndRenderTable(); if(callback) callback(); }).catch(err => console.error("Baza xətası:", err)); }

    function filterAndRenderTable() {
        const query = tableSearchInput ? tableSearchInput.value.trim().toLowerCase() : '';
        let sortedData = [...allCompaniesData].reverse();
        currentFilteredData = sortedData.filter(c => c.voen && c.voen.toString().toLowerCase().includes(query));
        currentPage = 1; renderTable();
    }

    if (tableSearchInput) tableSearchInput.addEventListener('input', filterAndRenderTable);
    loadCompanies();

    if (refreshDbBtn) { refreshDbBtn.addEventListener('click', (e) => { e.preventDefault(); loadCompanies(); clearFormFields(); }); }
    if (addVoenBtn && popupDiv) { addVoenBtn.addEventListener("click", (e) => { e.preventDefault(); popupDiv.style.display = "flex"; clearFormFields(); filterAndRenderTable(); }); }
    if (closePopupBtn && popupDiv) { closePopupBtn.addEventListener("click", (e) => { e.preventDefault(); popupDiv.style.display = "none"; loadCompanies(() => { refreshAnalysisIfPossible(); }); }); }

    function searchVoenAction() {
        const typedVoen = inputVoen ? inputVoen.value.trim() : ''; if (!typedVoen) return;
        const found = allCompaniesData.find(c => c.voen && c.voen.toString() === typedVoen);
        if (found) { fillFormWithData(found); setStatus("✅ Məlumat tapıldı və formaya yazıldı.", false); } 
        else { setStatus("Bu VÖEN bazada qeydə alınmayıb.", true); }
    }

    if (voenSrcIcon) { voenSrcIcon.addEventListener('click', (e) => { e.preventDefault(); if (voenSrcIcon.classList.contains('active-search')) searchVoenAction(); }); }
    if (inputVoen) inputVoen.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (inputVoen.value.trim()) searchVoenAction(); } });

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const voenVal = inputVoen ? inputVoen.value.trim() : ''; const companyVal = inputCompany ? inputCompany.value.trim() : ''; 
            const leaderVal = inputLeader ? inputLeader.value.trim() : ''; const addressVal = inputAddress ? inputAddress.value.trim() : ''; 
            const pstatusVal = (radioPerson2 && radioPerson2.checked) ? 2 : 1;
            
            if (!/^\d{10}$/.test(voenVal)) { setStatus("Xəta: VÖEN tam 10 rəqəm olmalıdır!", true); return; }
            if (pstatusVal === 1 && !companyVal) { setStatus("Xəta: Şirkətin adı boş ola bilməz!", true); return; }
            if (!leaderVal) { setStatus("Xəta: Şəxsin adı boş ola bilməz!", true); return; }
            if (!addressVal) { setStatus("Xəta: Ünvan boş ola bilməz!", true); return; }
            
            const oldText = saveBtn.innerHTML; saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yadda saxlanılır...`; saveBtn.disabled = true;

            fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voen: voenVal, comp_name: pstatusVal === 2 ? '' : companyVal, comp_director_name: leaderVal, comp_adress: addressVal, pstatus: pstatusVal, data_info_date: getTodayFormatted() })
            }).then(() => { setStatus("Uğurla yadda saxlanıldı! ✅", false); clearFormFields(); loadCompanies(); 
            }).finally(() => { saveBtn.innerHTML = oldText; saveBtn.disabled = false; });
        });
    }

    const fileBtn = document.getElementById('slc-file-btn'); const fileArea = document.getElementById('slc-file-area'); 
    if (fileBtn && fileArea) {
        let fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.style.display = 'none'; document.body.appendChild(fileInput);
        fileBtn.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
        fileInput.addEventListener('change', () => { if (fileInput.files.length > 0) { selectedFile = fileInput.files[0]; fileArea.innerText = selectedFile.name; fileArea.style.color = "#3b82f6"; } });
    }

    const sections = [{ btn: document.getElementById('slc-rub-btn'), div: document.getElementById('slc-rub'), type: "rub" }, { btn: document.getElementById('slc-ay-btn'), div: document.getElementById('slc-ay'), type: "ay" }];
    sections.forEach(s => { if (s.btn && s.div) { s.btn.addEventListener('click', (e) => { e.preventDefault(); sections.forEach(x => { if(x.div) { x.div.classList.remove('active-filter'); } }); s.div.classList.add('active-filter'); currentFilterType = s.type; }); } });

    function parseExcelDate(dateStr) {
        if (!dateStr) return null; const parts = dateStr.toString().trim().split('.'); if (parts.length !== 3) return null;
        const month = parseInt(parts[1], 10); const year = parts[2].toString().trim();
        let rub = "i rüb"; if (month >= 4 && month <= 6) rub = "ii rüb"; else if (month >= 7 && month <= 9) rub = "iii rüb"; else if (month >= 10 && month <= 12) rub = "iv rüb";
        const monthsAz = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktabr", "noyabr", "dekabr"];
        return { month: monthsAz[month - 1] || "", year, rub };
    }
    
    const analizBox = document.getElementById('analiz-box');
    const neticeDovrElement = document.querySelector('.netice-dovr');
    
    if (analizBtn) {
        analizBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!selectedFile || !currentFilterType) { alert("Zəhmət olmasa əvvəlcə faylı və dövrü (Rüb və ya Ay) seçin!"); return; }

            let rawPeriod = (currentFilterType === "rub" ? document.getElementById('slc-rub-select')?.value : document.getElementById('slc-ay-select')?.value) || "";
            let rawYear = (currentFilterType === "rub" ? document.getElementById('slc-rub-year')?.value : document.getElementById('slc-ay-year')?.value) || "";
            
            let displayPeriod = `${rawPeriod.toUpperCase()} ${rawYear}`.trim();
            if (neticeDovrElement) neticeDovrElement.innerText = displayPeriod;
            
            let filterPeriod = rawPeriod.trim().toLowerCase(); 
            let filterYear = rawYear.trim();

            analizBox.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:30px; color:#3b82f6;"></i><p style="margin-top:10px;">Analiz edilir, gözləyin...</p></div>`;

            const fileReader = new FileReader(); fileReader.readAsArrayBuffer(selectedFile);
            fileReader.onload = function(evt) {
                setTimeout(() => {
                    const workbook = XLSX.read(evt.target.result, { type: 'buffer' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                    let groupedResults = {}; 

                    for (let i = 1; i < excelData.length; i++) {
                        const row = excelData[i]; if (!row || row.length < 18) continue; 
                        const tarixStr = row[2] ? row[2].toString().trim() : ""; const dateInfo = parseExcelDate(tarixStr); if (!dateInfo) continue;
                        let qaliqBorc = parseFloat(row[17]) || 0; let isMatch = false;

                        if (currentFilterType === "rub" && dateInfo.rub === filterPeriod && dateInfo.year === filterYear) isMatch = true;
                        if (currentFilterType === "ay" && dateInfo.month === filterPeriod && dateInfo.year === filterYear) isMatch = true;

                        if (isMatch && qaliqBorc > minAmountFilter) {
                            let idareAdi = row[0] ? row[0].toString().trim() : "Qeydsiz İdarə";
                            let bNo = row[1] ? row[1].toString().trim() : "Nömrəsiz";
                            let voen = row[3] ? row[3].toString().trim() : ""; 
                            let firmaAdiRaw = row[5] ? row[5].toString().trim() : "Bilinməyən Firma"; 

                            let isFiziki = false;
                            let mmcStatus = row[4] ? row[4].toString().trim().toUpperCase() : "";
                            let hasMMC = /mmc|məhdud məsuliyyətli cəmiyyət(i)?/i.test(firmaAdiRaw);
                            if (mmcStatus === "" && !hasMMC && !/asc|qsc|şirkət|firması/i.test(firmaAdiRaw)) isFiziki = true;
                            if (voen && voen.toString().endsWith('2')) isFiziki = true; else if (voen && voen.toString().endsWith('1')) isFiziki = false;

                            let tamFirmaAdi = firmaAdiRaw; 

                            if (!groupedResults[idareAdi]) groupedResults[idareAdi] = {};
                            let groupKey = voen ? voen : tamFirmaAdi;
                            if (!groupedResults[idareAdi][groupKey]) { 
                                groupedResults[idareAdi][groupKey] = { firma: tamFirmaAdi, voen: voen || "", isFiziki: isFiziki, decls: {}, toplamBorc: 0, qeydSayi: 0 }; 
                            }
                            
                            // YENİ: Hər bəyannamənin xüsusi borcunu və tarixini tuturuq
                            let firmObj = groupedResults[idareAdi][groupKey];
                            if(!firmObj.decls[bNo]) firmObj.decls[bNo] = { borc: 0, tarixler: new Set() };
                            
                            firmObj.decls[bNo].borc += qaliqBorc;
                            firmObj.decls[bNo].tarixler.add(tarixStr);
                            firmObj.toplamBorc += qaliqBorc; 
                            firmObj.qeydSayi += 1;
                        }
                    }

                    if (Object.keys(groupedResults).length === 0) { analizBox.innerHTML = `<div style="text-align:center; padding: 40px; color:#ef4444;"><i class="fa-solid fa-circle-exclamation" style="font-size: 30px; margin-bottom: 10px;"></i><p>Uyğun borc tapılmadı!</p></div>`; return; }

                    let htmlContent = ``; let idareIdx = 1; let firmaIdx = 1;
                    
                    for (const idare in groupedResults) {
                        let idaredəkiFirmalar = Object.values(groupedResults[idare]);
                        let idareUmumiBorc = 0; let idareUmumiQeydSayi = 0;
                        idaredəkiFirmalar.forEach(item => { idareUmumiBorc += item.toplamBorc; idareUmumiQeydSayi += item.qeydSayi; });

                        let safeIdare = idare.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                        htmlContent += `<div class="result-group"><div class="group-header"><div class="group-title-main"><h4><input type="checkbox" class="custom-checkbox idare-check1" id="idare-check1-${idareIdx}" checked style="margin-right:12px; display:inline-grid;">${idare}</h4><span class="group-meta">(${idaredəkiFirmalar.length} firma, ${idareUmumiQeydSayi} bəyannamə)</span></div><div class="group-debt">Ümumi Borc: ${idareUmumiBorc.toFixed(2)} ABŞ</div></div>`;

                        idaredəkiFirmalar.forEach(item => {
                            let isVoenInDb = true; let missingAlertHtml = ""; let safeFirmaAdi = item.firma ? item.firma.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';

                            if (item.voen) {
                                isVoenInDb = allCompaniesData.some(c => c.voen && c.voen.toString() === item.voen.toString());
                                if (!isVoenInDb) { missingAlertHtml = `<button class="add-missing-voen-btn" data-voen="${item.voen}" data-firma="${safeFirmaAdi}" data-isfiziki="${item.isFiziki}"><i class="fa-solid fa-triangle-exclamation"></i> VÖEN bazada yoxdur - Əlavə etmək üçün klikləyin</button>`; }
                            } else { isVoenInDb = false; }

                            let checkboxAttr = isVoenInDb ? "checked" : "disabled";
                            let opacityStyle = isVoenInDb ? "1" : "0.5"; 

                            // 🔥 YENİ: RƏNG, YENİ/KÖHNƏ AYIRIMI
                            let newDecls = [];
                            let oldDecls = [];
                            let newBorc = 0;
                            let newTarixler = new Set();
                            let allTarixler = new Set();
                            let accordionListHtml = ``;
                            let hasBildiris = false;

                            for(const nomre in item.decls) {
                                let borcu = item.decls[nomre].borc;
                                let tarixleri = Array.from(item.decls[nomre].tarixler);
                                tarixleri.forEach(t => allTarixler.add(t));
                                
                                let foundBil = allBildirislerData.find(b => 
                                    normStr(b.tarix_borcdovru) === normStr(displayPeriod) && 
                                    ((item.voen && b.voen === item.voen.toString()) || (!item.voen && b.firma === item.firma)) &&
                                    b.melumat && b.melumat.includes(nomre)
                                );

                                if (foundBil) {
                                    hasBildiris = true;
                                    oldDecls.push(nomre);
                                    let mainBildirisNo = foundBil.bildiris_nomresi && foundBil.bildiris_nomresi.trim() !== "" ? foundBil.bildiris_nomresi : null;

                                    accordionListHtml += `
                                        <li>
                                            <span><i class="fa-solid fa-file-invoice" style="color:#94a3b8; margin-right:5px;"></i> Bəyannamə: <strong>${nomre}</strong></span>
                                            <span>
                                                ${mainBildirisNo 
                                                    ? `<span style="color: #10b981; font-weight:700;"><i class="fa-solid fa-check"></i> Bildiriş №: ${mainBildirisNo}</span>` 
                                                    : `<button class="btn-sec add-bildiris-panel-btn" style="padding: 4px 10px; font-size:11px; color:#2563eb; border-color:#2563eb; background:#eff6ff; cursor:pointer;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Panelə keç</button>`
                                                }
                                            </span>
                                        </li>
                                    `;
                                } else {
                                    newDecls.push(nomre);
                                    newBorc += borcu;
                                    tarixleri.forEach(t => newTarixler.add(t));
                                    accordionListHtml += `
                                        <li>
                                            <span style="color: #64748b;"><i class="fa-solid fa-file-invoice" style="margin-right:5px;"></i> Bəyannamə: <strong>${nomre}</strong></span>
                                            <span style="font-size: 11px; color: #94a3b8;"><i class="fa-solid fa-circle-info"></i> Hələ bazaya yazılmayıb</span>
                                        </li>
                                    `;
                                }
                            }

                            // RƏNG VƏ STATUS
                            let bgStyle = "#ffffff";
                            let cardBorder = "1px solid #e2e8f0";
                            let statusBadge = "";
                            
                            if (oldDecls.length > 0 && newDecls.length > 0) {
                                bgStyle = "#fffbeb"; 
                                cardBorder = "1px solid #fde68a";
                                statusBadge = `<div class="badge-pill" style="background:#fef3c7; color:#d97706; border-color:#fcd34d;"><i class="fa-solid fa-triangle-exclamation"></i> Qismən Yazılıb</div>`;
                            } else if (oldDecls.length > 0 && newDecls.length === 0) {
                                bgStyle = "#f0fdf4";
                                cardBorder = "1px solid #bbf7d0";
                                statusBadge = `<div class="badge-pill" style="background:#dcfce7; color:#166534; border-color:#86efac;"><i class="fa-solid fa-check-double"></i> Tam Yazılıb</div>`;
                            }

                            let byNoStr = Object.keys(item.decls).join(", ");
                            let tarixStr = Array.from(allTarixler).join(", ");
                            let newTarixStr = Array.from(newTarixler).join(", ");
                            let accordionToggleBtn = hasBildiris ? `<button class="toggle-btn" title="Bəyannamələri göstər"><i class="fa-solid fa-chevron-down"></i></button>` : '';

                            // Data attribute-larda Yeni/Köhnə dəyərləri saxlayırıq!
                            htmlContent += `
                            <div class="firm-item" style="background: ${bgStyle}; border: ${cardBorder}; opacity: ${opacityStyle};">
                                <div class="firm-main-row">
                                    <input type="checkbox" class="custom-checkbox firma-check2" ${checkboxAttr} 
                                        data-idare="${safeIdare}" 
                                        data-voen="${item.voen}" 
                                        data-firma="${safeFirmaAdi}" 
                                        data-isfiziki="${item.isFiziki}"
                                        data-gb="${byNoStr}" 
                                        data-new-gb="${newDecls.join(', ')}"
                                        data-old-gb="${oldDecls.join(', ')}"
                                        data-borc="${item.toplamBorc.toFixed(2)}"
                                        data-new-borc="${newBorc.toFixed(2)}"
                                        data-new-tarixler="${newTarixStr}">
                                    <div class="firm-info">
                                        <div class="firm-name">${item.firma} <span class="firm-voen">(VÖEN: ${item.voen || "Yoxdur"})</span></div>
                                        <div class="firm-badges">
                                            <div class="badge-pill"><strong>Bəyannamələr:</strong> ${byNoStr}</div>
                                            <div class="badge-pill"><strong>Tarixlər:</strong> ${tarixStr}</div>
                                            <div class="badge-pill badge-danger-pill">Yekun Borc: ${item.toplamBorc.toFixed(2)} ABŞ</div>
                                            ${statusBadge}
                                        </div>
                                        ${missingAlertHtml}
                                    </div>
                                    ${accordionToggleBtn}
                                </div>
                                ${hasBildiris ? `
                                <div class="details-panel">
                                    <ul>${accordionListHtml}</ul>
                                </div>
                                ` : ''}
                            </div>`;
                            
                            firmaIdx++;
                        });
                        htmlContent += `</div>`; idareIdx++;
                    }
                    analizBox.innerHTML = htmlContent;

                    document.querySelectorAll('.add-missing-voen-btn').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const voen = this.getAttribute('data-voen'); const firmaName = this.getAttribute('data-firma'); const isFiziki = this.getAttribute('data-isfiziki') === 'true';

                            popupDiv.style.display = "flex"; clearFormFields();
                            if (inputVoen) { inputVoen.value = voen; inputVoen.dispatchEvent(new Event('input')); }
                            if (isFiziki) { if (radioPerson2) radioPerson2.checked = true; if (inputLeader) inputLeader.value = firmaName; } 
                            else { if (radioPerson1) radioPerson1.checked = true; if (inputCompany) inputCompany.value = firmaName; }
                            handleRadioChange();
                        });
                    });

                    document.querySelectorAll('.toggle-btn').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const parentItem = this.closest('.firm-item');
                            const panel = parentItem.querySelector('.details-panel');
                            const icon = this.querySelector('i');
                            if (panel.style.display === 'block') { panel.style.display = 'none'; icon.className = 'fa-solid fa-chevron-down';
                            } else { panel.style.display = 'block'; icon.className = 'fa-solid fa-chevron-up'; }
                        });
                    });

                    document.querySelectorAll('.add-bildiris-panel-btn').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            if (bildirisPopup) { bildirisPopup.style.display = 'flex'; renderBildirisTable(); }
                        });
                    });

                    document.querySelectorAll('.idare-check1').forEach(idareCheck => { idareCheck.addEventListener('change', function() { const parentDiv = this.closest('.result-group'); parentDiv.querySelectorAll('.firma-check2:not([disabled])').forEach(child => child.checked = this.checked); }); });
                    document.querySelectorAll('.firma-check2:not([disabled])').forEach(firmaCheck => { firmaCheck.addEventListener('change', function() { const parentDiv = this.closest('.result-group'); const parentCheck = parentDiv.querySelector('.idare-check1'); const allChildren = parentDiv.querySelectorAll('.firma-check2:not([disabled])'); if(allChildren.length > 0) { parentCheck.checked = Array.from(allChildren).every(c => c.checked); parentCheck.indeterminate = !parentCheck.checked && Array.from(allChildren).some(c => c.checked); } }); });
                }, 500); 
            };
        });
    }

    function getMinMaxDate(datesStr) {
        if (!datesStr) return ""; const parts = datesStr.split(", "); if (parts.length === 1) return parts[0];
        const dates = parts.map(d => { const [day, month, year] = d.split("."); return new Date(`${year}-${month}-${day}`); });
        const minDate = new Date(Math.min(...dates)); const maxDate = new Date(Math.max(...dates));
        const format = dt => `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`;
        return `${format(minDate)} - ${format(maxDate)}`;
    }

    // MODAL BAĞLAMA EVENTLƏRİ
    if(closePrezipBtn) { closePrezipBtn.addEventListener('click', () => { preZipPopup.style.display = 'none'; }); }
    if(cancelPrezipBtn) { cancelPrezipBtn.addEventListener('click', () => { preZipPopup.style.display = 'none'; }); }
    if(closeZipPopupBtn) { closeZipPopupBtn.addEventListener('click', () => { zipPopup.style.display = 'none'; }); }
    if(cancelZipSaveBtn) { cancelZipSaveBtn.addEventListener('click', () => { zipPopup.style.display = 'none'; }); }
    if(zipSelectAll) { zipSelectAll.addEventListener('change', (e) => { const cbs = document.querySelectorAll('.zip-row-check'); cbs.forEach(cb => cb.checked = e.target.checked); }); }

    const bildirisQosmaBtn = document.getElementById("bildiris-qosma");
    if (bildirisQosmaBtn) {
        bildirisQosmaBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const checkedFirms = document.querySelectorAll(".firma-check2:checked:not([disabled])");
            if (checkedFirms.length === 0) { alert("Diqqət: Zəhmət olmasa ən azı bir firma seçin (Yalnız VÖEN-i bazada olanlar seçilə bilər)!"); return; }

            let firmsToProcess = [];
            let warningHtml = "";
            let hasOverlap = false;

            for (const checkbox of checkedFirms) {
                let oldGb = checkbox.getAttribute("data-old-gb");
                let newGb = checkbox.getAttribute("data-new-gb");
                let newBorc = checkbox.getAttribute("data-new-borc");
                let firmaAdi = checkbox.getAttribute("data-firma").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); 

                if (!newGb || newGb.trim() === "") { continue; } // Əgər yeni yazılacaq məlumat sıfırdırsa, bu firmanı tamamilə çıxar

                if (oldGb && oldGb.trim() !== "") hasOverlap = true;

                firmsToProcess.push({
                    checkbox: checkbox,
                    newGb: newGb,
                    newBorc: newBorc
                });

                if(oldGb && oldGb.trim() !== "") {
                    warningHtml += `<tr>
                        <td><strong>${firmaAdi}</strong></td>
                        <td style="color:#ef4444; font-size:12px;">${oldGb}</td>
                        <td style="color:#10b981; font-weight:bold; font-size:12px;">${newGb}</td>
                        <td style="font-weight:bold; color:#1e293b;">${newBorc} ABŞ</td>
                    </tr>`;
                }
            }

            if (firmsToProcess.length === 0) { alert("Seçdiyiniz firmaların bütün bəyannamələri artıq bazadadır. Yeni bildiriş yazılası məlumat yoxdur!"); return; }

            // Davam etmək üçün globala mənimsədirik
            window.pendingFirmsToZip = firmsToProcess;

            if (hasOverlap) {
                prezipTbody.innerHTML = warningHtml;
                preZipPopup.style.display = "flex";
            } else {
                executeZipProcess();
            }
        });
    }

    if(confirmPrezipBtn) {
        confirmPrezipBtn.addEventListener("click", () => {
            preZipPopup.style.display = "none";
            executeZipProcess();
        });
    }

    async function executeZipProcess() {
        const payload = [];
        pendingDbSavePayload = []; 
        const targetPeriod = document.querySelector('.netice-dovr') ? document.querySelector('.netice-dovr').innerText.trim() : '';

        for (const item of window.pendingFirmsToZip) {
            const checkbox = item.checkbox;
            const voen = checkbox.getAttribute("data-voen"); 
            const firmaAdi = checkbox.getAttribute("data-firma").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); 
            const isFiziki = checkbox.getAttribute("data-isfiziki") === "true";
            const dbData = allCompaniesData.find(c => c.voen && c.voen.toString() === voen) || {}; 
            const rehberAdi = dbData.comp_director_name || "Qeyd edilməyib";
            
            payload.push({ 
                unvan: dbData.comp_adress || "Qeyd edilməyib", 
                firma: isFiziki ? rehberAdi : firmaAdi, 
                voen: voen, 
                tarixEsas: getMinMaxDate(checkbox.getAttribute("data-new-tarixler")), 
                soyadiadi: rehberAdi, 
                gb: item.newGb, 
                borc: item.newBorc, 
                tarixQosma: getTodayFormatted(), 
                safeFirmaAdi: firmaAdi.replace(/[^a-zA-Z0-9azəöğüşıçƏÖĞÜŞİÇ ]/gi, '').trim().substring(0, 30) 
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

        const oldBtnText = bildirisQosmaBtn.innerHTML; 
        bildirisQosmaBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ZİP Hazırlanır...`; 
        bildirisQosmaBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/generate-docs`, { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedFirms: payload }) 
            });
            
            if (!response.ok) {
                let errMsg = 'Server xətası baş verdi.';
                try { const errData = await response.json(); errMsg = errData.error || errMsg; } catch(ex) { errMsg = `Server xətası (Status: ${response.status})`; }
                throw new Error(errMsg);
            }
            
            const blob = await response.blob(); const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `Senedler_${getTodayFormatted()}.zip`;
            document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
            
            zipTbody.innerHTML = '';
            pendingDbSavePayload.forEach((obj, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="custom-checkbox zip-row-check" data-idx="${idx}" checked></td>
                    <td>${obj.gomruk_orqani}</td>
                    <td>${obj.firma}</td>
                    <td style="color:#2563eb; font-weight:600;">${obj.melumat.replace('Bəyannamələr: ', '')}</td>
                    <td>Borc məlumatı Exceldə</td>
                `;
                zipTbody.appendChild(tr);
            });
            zipPopup.style.display = 'flex';
            
        } catch (error) { 
            alert("XƏTA: " + error.message); 
        } finally { 
            bildirisQosmaBtn.innerHTML = oldBtnText; bildirisQosmaBtn.disabled = false; 
        }
    }

    if(saveZipSelectionsBtn) {
        saveZipSelectionsBtn.addEventListener('click', async () => {
            const checkedBoxes = document.querySelectorAll('.zip-row-check:checked');
            if(checkedBoxes.length === 0) { alert("Heç bir məlumat seçilməyib!"); return; }

            const finalPayload = [];
            checkedBoxes.forEach(cb => { const idx = cb.getAttribute('data-idx'); finalPayload.push(pendingDbSavePayload[idx]); });

            const oldText = saveZipSelectionsBtn.innerHTML;
            saveZipSelectionsBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yazılır...`; saveZipSelectionsBtn.disabled = true;

            try {
                const bRes = await fetch(`${BİL_API_URL}/bulk`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bildirisler: finalPayload })
                });
                if(!bRes.ok) {
                    const err = await bRes.json(); alert("Xəta baş verdi: " + (err.error || "Bilinməyən xəta"));
                } else {
                    alert("Məlumatlar uğurla bazaya yazıldı! Nəticələr yenilənir.");
                    zipPopup.style.display = 'none'; loadAllBildirisler(); 
                }
            } catch(err) { alert("Şəbəkə xətası: " + err.message);
            } finally { saveZipSelectionsBtn.innerHTML = oldText; saveZipSelectionsBtn.disabled = false; }
        });
    }

});

    console.log("Webflow səhifəsi hazır!");
});
