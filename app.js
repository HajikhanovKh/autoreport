<div id="popup_pre_raport_warning" class="modal-overlay" style="display:none;">
    <div class="modal-content large-modal" style="max-width: 900px;">
        <div class="modal-header">
            <h2><i class="fa-solid fa-file-lines" style="color:#3b82f6;"></i> Raport Xülasəsi</h2>
            <button class="modal-close" id="close-preraport-popup"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <p style="font-size:13px; margin-bottom:15px; color:#475569;">Aşağıdakı cədvəldə yalnız sizin seçdiyiniz və <strong>raportinfo</strong> bazasında olmayan <strong>(Nəzərə alınan)</strong> bəyannamələr sıralanmışdır. Davam etdikdə sənədlər məhz bu qeydlər üzrə hazırlanacaq:</p>
            <div class="table-wrapper">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Firma / VÖEN</th>
                            <th>Nəzərə Alınmayan (Köhnə) Bəyannamələr</th>
                            <th>Nəzərə Alınan (Yeni) Bəyannamələr</th>
                            <th>Yeni Hesablanan Borc</th>
                        </tr>
                    </thead>
                    <tbody id="preraport-tbody">
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 15px;">
                <button class="btn btn-outline" id="cancel-preraport-btn">Ləğv et</button>
                <button class="btn btn-primary" id="confirm-raport-zip-btn"><i class="fa-solid fa-arrow-right"></i> Davam et və ZIP Hazırla</button>
            </div>
        </div>
    </div>
</div>

<div id="popup_raport_selection" class="modal-overlay" style="display:none;">
    <div class="modal-content large-modal" style="max-width: 900px;">
        <div class="modal-header">
            <h2><i class="fa-solid fa-database"></i> Raportları Bazaya Yazın</h2>
            <button class="modal-close" id="close-raport-zip-popup"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <p style="font-size:13px; color:#64748b; margin-bottom: 15px;">Aşağıdakı siyahıdan bazada "raportinfo" cədvəlinə əlavə etmək istədiklərinizi seçin.</p>
            <div class="table-wrapper">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;"><input type="checkbox" id="raport-zip-select-all" class="custom-checkbox" checked></th>
                            <th>Gömrük Orqanı</th>
                            <th>Firma / VÖEN</th>
                            <th>Bəyannamə Nömrələri</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="raport-zip-selection-tbody">
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 15px;">
                <button class="btn btn-outline" id="cancel-raport-zip-save">Ləğv et</button>
                <button class="btn btn-primary" id="save-raport-selections-btn"><i class="fa-solid fa-save"></i> Yaddaşa Yaz</button>
            </div>
        </div>
    </div>
</div>
