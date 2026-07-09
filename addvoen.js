<script>
  const API_URL = 'https://autoreport-production.up.railway.app/api/companies';

  document.addEventListener('DOMContentLoaded', () => {
    // Əsas konteynerlər
    const mainContainer = document.querySelector('.example');
    const templateCard = document.querySelector('.company-card');
    const consoleDiv = document.querySelector('.console-div');
    const dataCountDiv = document.querySelector('.data-count');

    // ❌ Sənin təyin etdiyin Popup Div-i və Bağlama Düyməsi (Klas ilə)
    const popupDiv = document.querySelector('.popup_1');
    const closeBtn = document.querySelector('.close-btn');

    // İlk açılışda popup_1 div-inin görünüşünü zəmanətli şəkildə gizli edirik
    if (popupDiv) {
      popupDiv.style.display = 'none';
    }

    // Əsas Form elementləri (ID ilə)
    const statusMsg = document.getElementById('data-status-msg');
    const inputVoen = document.getElementById('add-voen');
    const inputCompany = document.getElementById('add-company');
    const inputLeader = document.getElementById('add-leader');
    const inputAddress = document.getElementById('add-address');
    const radioPerson1 = document.getElementById('person1');
    const radioPerson2 = document.getElementById('person2');
    const saveBtn = document.getElementById('data-save-btn');

    // Düymələr və Axtarış elementləri (Klas ilə)
    const searchInput = document.querySelector('.src-voen');
    const searchBtn = document.querySelector('.src-voen-btn');
    const refreshBtn = document.querySelector('.refresh-btn');
    const voenSrcBtn = document.querySelector('.voen-src'); 

    // Qlobal məlumat kəşi
    let allCompaniesData = [];

    // ❌ X DÜYMƏSİNƏ BASTIQDA POPUP_1 GİZLƏNSİN
    if (closeBtn && popupDiv) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        popupDiv.style.display = 'none';
        logToScreen('Qeydiyyat paneli gizlədildi.');
      });
      closeBtn.style.cursor = 'pointer';
    }

    // Konsol ekranına yazma funksiyası
    function logToScreen(message, isError = false) {
      if (consoleDiv) {
        consoleDiv.innerText = message;
        consoleDiv.style.color = isError ? '#ff4d4d' : '#00ff66';
      }
      if (isError) console.error(message); else console.log(message);
    }

    // Status sahəsinə yazma funksiyası
    function setStatus(message, isError = false) {
      if (statusMsg) {
        statusMsg.innerText = message;
        statusMsg.style.color = isError ? '#ff4d4d' : '#00aa50';
        statusMsg.style.display = 'block';
      }
    }

    // Radio dəyişdikdə şirkət inputunu kilidləyən funksiya
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

    logToScreen('Məlumatlar bazadan yüklənir...');
    if (dataCountDiv) dataCountDiv.innerText = '0 nəticə';

    function clearFormFields() {
      if (inputCompany) inputCompany.value = '';
      if (inputLeader) inputLeader.value = '';
      if (inputAddress) inputAddress.value = '';
      if (radioPerson1) radioPerson1.checked = true;
      handleRadioChange();
    }

    function fillFormWithData(company) {
      // 🌟 Sarı düyməyə və ya lupaya basanda popup_1 blokunu avtomatik GÖRÜNƏN EDİRİK
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
      logToScreen(`"${company.pstatus == 2 ? 'Fiziki Şəxs' : company.comp_name}" məlumatları forma dolduruldu.`);
    }

    // Kartları ekrana render edən ana funksiya
    function renderCompanies(dataArray) {
      if (!mainContainer || !templateCard) return;

      if (dataArray && dataArray.length > 0) {
        if (dataCountDiv) dataCountDiv.innerText = `${dataArray.length} nəticə ✅`;

        const cardCloneTemplate = templateCard.cloneNode(true);
        mainContainer.innerHTML = '';

        const displayData = [...dataArray].reverse();

        displayData.forEach((company) => {
          const newCard = cardCloneTemplate.cloneNode(true);

          const voenText = newCard.querySelector('.voen-text');
          const companyNameText = newCard.querySelector('.company-name');
          const leaderText = newCard.querySelector('.leader-text');
          const addressText = newCard.querySelector('.address-text');
          
          const editButton = newCard.querySelector('#data-edit') || newCard.querySelector('[data-edit]');
          const deleteButton = newCard.querySelector('[data-delete]') || 
                               newCard.querySelector('.data-delete') || 
                               newCard.querySelector('#data-delete') ||
                               newCard.querySelector('.button-delete');

          if (voenText) voenText.innerText = company.voen || '—';
          if (leaderText) leaderText.innerText = company.comp_director_name || '—';
          if (addressText) addressText.innerText = company.comp_adress || '—';

          if (companyNameText) {
            if (company.pstatus == 2) {
              companyNameText.innerText = "vətəndaş";
            } else {
              companyNameText.innerText = company.comp_name || '—';
            }
          }

          // SARI DÜYMƏ (Redaktə) -> Basıldıqda popup_1 canlanacaq
          if (editButton) {
            editButton.addEventListener('click', (e) => {
              e.preventDefault();
              fillFormWithData(company);
            });
          }

          // SİLME DÜYMƏSİ
          if (deleteButton) {
            deleteButton.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const targetName = company.pstatus == 2 ? 'Fiziki Şəxs (Vətəndaş)' : company.comp_name;
              const confirmDelete = confirm(`Diqqət! "${targetName}" məlumatlarını bazadan tamamilə silmək istədiyinizə əminsiniz?`);
              
              if (confirmDelete) {
                setStatus("Məlumat bazadan silinir...");
                
                fetch(`${API_URL}/${company.id}`, { method: 'DELETE' })
                .then(async (res) => {
                  const result = await res.json();
                  if (!res.ok) throw new Error(result.error || "Silinmə xətası");
                  setStatus("Məlumat uğurla silindi! 🗑️", false);
                  loadCompanies();
                })
                .catch((err) => setStatus(`Xəta: ${err.message}`, true));
              }
            });
          }

          mainContainer.appendChild(newCard);
        });
      } else {
        mainContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Uyğun məlumat tapılmadı.</div>';
        if (dataCountDiv) dataCountDiv.innerText = '0 nəticə';
      }
    }

    function loadCompanies() {
      fetch(API_URL)
        .then((response) => {
          if (!response.ok) throw new Error(`Server xətası: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          allCompaniesData = data || [];
          renderCompanies(allCompaniesData);
          logToScreen(`Uğurlu! Toplam ${allCompaniesData.length} şirket sıralandı.`);
        })
        .catch((error) => {
          logToScreen(`Baza xətası: ${error.message}`, true);
        });
    }

    if (mainContainer && templateCard) loadCompanies();

    // 🔍 VÖEN YANINDAKI LUPA DÜYMƏSİ (`.voen-src`) -> Basıldıqda data varsa popup_1 canlanacaq
    if (voenSrcBtn) {
      voenSrcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const typedVoen = inputVoen ? inputVoen.value.trim() : '';
        
        if (typedVoen === '') {
          setStatus("Xəta: Zəhmət olmasa, axtarmaq üçün VÖEN daxil edin!", true);
          clearFormFields();
          return;
        }

        const foundCompany = allCompaniesData.find(c => c.voen && c.voen.toString() === typedVoen);
        
        if (foundCompany) {
          fillFormWithData(foundCompany);
          setStatus("Mövcud VÖEN məlumatları tapıldı və daxil edildi. 🔍", false);
        } else {
          clearFormFields();
          if (popupDiv) popupDiv.style.display = 'block'; // Tapılmasa belə yeni daxiletmə üçün panel açılsın
          setStatus("Bu VÖEN-ə uyğun məlumat tapılmadı. Yeni qeyd daxil edə bilərsiniz.", false);
        }
      });
    }

    // 🔍 ÜST ÜMUMİ AXTARIŞ DÜYMƏSİ (`.src-voen-btn`)
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const query = searchInput ? searchInput.value.trim() : '';
        if (query === '') {
          renderCompanies(allCompaniesData);
        } else {
          const filteredData = allCompaniesData.filter(c => c.voen && c.voen.toString().includes(query));
          renderCompanies(filteredData);
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchBtn) {
          e.preventDefault();
          searchBtn.click();
        }
      });
    }

    // 🔄 REFRESH (YENİLƏMƏ) DÜYMƏSİ (`.refresh-btn`)
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchInput) searchInput.value = '';
        logToScreen('Məlumatlar yenidən yüklənir...');
        loadCompanies();
      });
    }

    // 💾 YADDA SAXLA VƏ YA MÖVCUDDURSA ÜZƏRİNƏ YAZ (POST)
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const voenVal = inputVoen ? inputVoen.value.trim() : '';
        const companyVal = inputCompany ? inputCompany.value.trim() : '';
        const leaderVal = inputLeader ? inputLeader.value.trim() : '';
        const addressVal = inputAddress ? inputAddress.value.trim() : '';
        const pstatusVal = (radioPerson2 && radioPerson2.checked) ? 2 : 1;

        const voenRegex = /^\d{9}$/;
        if (!voenRegex.test(voenVal)) {
          setStatus("Xəta: VÖEN ancaq rəqəmdən ibarət və tam 9 simvol olmalıdır!", true);
          return;
        }
        if (pstatusVal === 1 && companyVal.length < 4) {
          setStatus("Xəta: Şirkət adı ən azı 4 simvol olmalıdır!", true);
          return;
        }
        if (leaderVal.length < 4) {
          setStatus("Xəta: Ad/Soyad ən azı 4 simvol olmalıdır!", true);
          return;
        }
        if (addressVal.length < 4) {
          setStatus("Xəta: Ünvan ən azı 4 simvol olmalıdır!", true);
          return;
        }

        setStatus("Məlumatlar yadda saxlanılır...");

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const formattedDate = `${day}.${month}.${year}`;

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
        .then(async (res) => {
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Xəta baş verdi");
          
          if (result.updated) {
            setStatus("Mövcud VÖEN tapıldı, məlumatlar üzərinə yazıldı! 🔄", false);
          } else {
            setStatus("VÖEN üçün ünvan yadda saxlanıldı. ✅", false);
          }
          
          if (inputVoen) inputVoen.value = '';
          if (inputCompany) inputCompany.value = '';
          if (inputLeader) inputLeader.value = '';
          if (inputAddress) inputAddress.value = '';
          if (searchInput) searchInput.value = '';

          // Məlumat uğurla yazılandan sonra popup-ı avtomatik yenidən bağlayırıq
          if (popupDiv) popupDiv.style.display = 'none';

          loadCompanies();
        })
        .catch((err) => {
          setStatus(`Xəta: ${err.message}`, true);
        });
      });
    }
  });
</script>
