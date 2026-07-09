const API_URL = 'https://autoreport-production.up.railway.app/api/companies';

// Elementlərin və səhifənin tam hazır olmasını gözləyən zirehli funksiya
function initAutoReportSystem() {
    // Əsas konteynerlər
    const mainContainer = document.querySelector('.example');
    const templateCard = document.querySelector('.company-card');
    const consoleDiv = document.querySelector('.console-div');
    const dataCountDiv = document.querySelector('.data-count');

    // Elementləri həm ID, həm klas kombinasiyası ilə tapırıq (Səhv riskini sıfırlamaq üçün)
    const popupDiv = document.querySelector('.popup_1') || document.getElementById('popup_1');
    const closeBtn = document.getElementById('close-btn') || document.querySelector('.close-btn');
    const inputVoen = document.getElementById('add-voen') || document.querySelector('.add-voen');
    const inputCompany = document.getElementById('add-company') || document.querySelector('.add-company');
    const inputLeader = document.getElementById('add-leader') || document.querySelector('.add-leader');
    const inputAddress = document.getElementById('add-address') || document.querySelector('.add-address');
    const statusMsg = document.getElementById('data-status-msg') || document.querySelector('.data-status-msg');
    
    const radioPerson1 = document.getElementById('person1') || document.querySelector('.person1');
    const radioPerson2 = document.getElementById('person2') || document.querySelector('.person2');
    const saveBtn = document.getElementById('data-save-btn') || document.querySelector('.data-save-btn');

    const searchInput = document.querySelector('.src-voen');
    const searchBtn = document.querySelector('.src-voen-btn');
    const refreshBtn = document.querySelector('.refresh-btn');
    const voenSrcBtn = document.querySelector('.voen-src'); 

    let allCompaniesData = [];

    // İlkin gizlətmə
    if (popupDiv) {
        popupDiv.style.display = 'none';
    }

    // Konsol log funksiyası
    function logToScreen(message, isError = false) {
        if (consoleDiv) {
            consoleDiv.innerText = message;
            consoleDiv.style.color = isError ? '#ff4d4d' : '#00ff66';
        }
    }

    // Status mesajı funksiyası
    function setStatus(message, isError = false) {
        if (statusMsg) {
            statusMsg.innerText = message;
            statusMsg.style.color = isError ? '#ff4d4d' : '#00aa50';
            statusMsg.style.display = 'block';
        }
    }

    // Radio dəyişmə məntiqi
    function handleRadioChange() {
        if (radioPerson2 && radioPerson2.checked) {
            if (inputCompany) {
                inputCompany.value = '';
                inputCompany.disabled = true;
                inputCompany.style.backgroundColor = '#f0f0f0';
                inputCompany.style.cursor = 'not-allowed';
            }
        } else {
            if (inputCompany) {
                inputCompany.disabled = false;
                inputCompany.style.backgroundColor = '';
                inputCompany.style.cursor = 'text';
            }
        }
    }

    if (radioPerson1) radioPerson1.addEventListener('change', handleRadioChange);
    if (radioPerson2) radioPerson2.addEventListener('change', handleRadioChange);
    handleRadioChange();

    // X düyməsi ilə bağlama
    if (closeBtn) {
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (popupDiv) popupDiv.style.display = 'none';
        });
    }

    function clearFormFields() {
        if (inputCompany) inputCompany.value = '';
        if (inputLeader) inputLeader.value = '';
        if (inputAddress) inputAddress.value = '';
        if (radioPerson1) radioPerson1.checked = true;
        handleRadioChange();
    }

    function fillFormWithData(company) {
        if (popupDiv) popupDiv.style.display = 'block';
        if (inputVoen) inputVoen.value = company.voen || '';
        if (inputLeader) inputLeader.value = company.comp_director_name || '';
        if (inputAddress) inputAddress.value = company.comp_adress || '';

        if (company.pstatus == 2) {
            if (radioPerson2) radioPerson2.checked = true;
        } else {
            if (radioPerson1) radioPerson1.checked = true;
        }
        handleRadioChange();

        if (inputCompany && company.pstatus != 2) {
            inputCompany.value = company.comp_name || '';
        }
    }

    function renderCompanies(dataArray) {
        if (!mainContainer || !templateCard) return;
        mainContainer.innerHTML = '';

        if (dataArray && dataArray.length > 0) {
            if (dataCountDiv) dataCountDiv.innerText = `${dataArray.length} nəticə ✅`;
            const cardCloneTemplate = templateCard.cloneNode(true);

            [...dataArray].reverse().forEach((company) => {
                const newCard = cardCloneTemplate.cloneNode(true);
                const voenText = newCard.querySelector('.voen-text');
                const companyNameText = newCard.querySelector('.company-name');
                const leaderText = newCard.querySelector('.leader-text');
                const addressText = newCard.querySelector('.address-text');
                
                const editButton = newCard.querySelector('#data-edit') || newCard.querySelector('[data-edit]');
                const deleteButton = newCard.querySelector('[data-delete]') || newCard.querySelector('.data-delete') || newCard.querySelector('#data-delete');

                if (voenText) voenText.innerText = company.voen || '—';
                if (leaderText) leaderText.innerText = company.comp_director_name || '—';
                if (addressText) addressText.innerText = company.comp_adress || '—';

                if (companyNameText) {
                    companyNameText.innerText = (company.pstatus == 2) ? "vətəndaş" : (company.comp_name || '—');
                }

                if (editButton) {
                    editButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        fillFormWithData(company);
                    });
                }

                if (deleteButton) {
                    deleteButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const confirmDelete = confirm("Bu məlumatı silmək istədiyinizə əminsiniz?");
                        if (confirmDelete) {
                            fetch(`${API_URL}/${company.id}`, { method: 'DELETE' })
                            .then(() => loadCompanies())
                            .catch((err) => setStatus(`Xəta: ${err.message}`, true));
                        }
                    });
                }
                mainContainer.appendChild(newCard);
            });
        } else {
            if (dataCountDiv) dataCountDiv.innerText = '0 nəticə';
        }
    }

    function loadCompanies() {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                allCompaniesData = data || [];
                renderCompanies(allCompaniesData);
                logToScreen(`Uğurlu! Toplam ${allCompaniesData.length} məlumat sıralandı.`);
            })
            .catch(err => logToScreen(`Xəta: ${err.message}`, true));
    }

    loadCompanies();

    // Lupa düyməsi
    if (voenSrcBtn) {
        voenSrcBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const typedVoen = inputVoen ? inputVoen.value.trim() : '';
            const found = allCompaniesData.find(c => c.voen && c.voen.toString() === typedVoen);
            if (found) {
                fillFormWithData(found);
            } else {
                clearFormFields();
                if (popupDiv) popupDiv.style.display = 'block';
            }
        });
    }

    // Üst axtarış
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = searchInput ? searchInput.value.trim() : '';
            const filtered = allCompaniesData.filter(c => c.voen && c.voen.toString().includes(query));
            renderCompanies(filtered);
        });
    }

    // Refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchInput) searchInput.value = '';
            loadCompanies();
        });
    }

    // Yadda saxla (Save)
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const voenVal = inputVoen ? inputVoen.value.trim() : '';
            const companyVal = inputCompany ? inputCompany.value.trim() : '';
            const leaderVal = inputLeader ? inputLeader.value.trim() : '';
            const addressVal = inputAddress ? inputAddress.value.trim() : '';
            const pstatusVal = (radioPerson2 && radioPerson2.checked) ? 2 : 1;

            if (voenVal.length !== 9 || (pstatusVal === 1 && companyVal.length < 4) || leaderVal.length < 4 || addressVal.length < 4) {
                setStatus("Xəta: Validasiya limitlərinə diqqət edin!", true);
                return;
            }

            const today = new Date();
            const formattedDate = `${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${today.getFullYear()}`;

            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voen: voenVal,
                    comp_name: pstatusVal === 2 ? '' : companyVal,
                    comp_director_name: leaderVal,
                    comp_adress: addressVal,
                    pstatus: pstatusVal,
                    data_info_date: formattedDate
                })
            })
            .then(() => {
                if (inputVoen) inputVoen.value = '';
                clearFormFields();
                if (popupDiv) popupDiv.style.display = 'none';
                loadCompanies();
            })
            .catch(err => setStatus(`Xəta: ${err.message}`, true));
        });
    }
}

// Bütün yüklənmə metodlarında zəmanətli işə düşmə
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoReportSystem);
} else {
    initAutoReportSystem();
}
