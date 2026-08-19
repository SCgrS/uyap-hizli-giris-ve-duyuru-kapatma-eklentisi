function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const logDiv = document.getElementById('log');
    const masterToggle = document.getElementById('masterToggle');
    const quickLoginToggle = document.getElementById('quickLoginToggle');
    const announcementsToggle = document.getElementById('announcementsToggle');
    const menuHideToggle = document.getElementById('menuHideToggle');
    const soundToggle = document.getElementById('soundToggle');
    const soundFrequencySelect = document.getElementById('soundFrequencySelect');
    const soundRow = document.getElementById('soundRow');
    const soundFrequencyRow = document.getElementById('soundFrequencyRow');

    chrome.runtime.sendMessage({ action: "resetBadge" });

    const applyState = (state) => {
        if (!state) return;
        quickLoginToggle.checked = state.quickLoginEnabled;
        announcementsToggle.checked = state.announcementsEnabled;
        menuHideToggle.checked = state.menuHideEnabled;
        masterToggle.checked = state.masterEnabled;

        soundToggle.checked = state.soundEnabled;
        soundFrequencySelect.value = String(state.soundFrequency || 5);

        // Duyuru Kapatma veya eklenti (master) kapalıyken her iki satır da,
        // ayrıca Bildirim Sesi kendisi kapalıyken sıklık satırı da grileşir.
        const parentInactive = !(state.masterEnabled && state.announcementsEnabled);
        soundRow.classList.toggle('dimmed', parentInactive);
        soundFrequencyRow.classList.toggle('dimmed', parentInactive || !state.soundEnabled);
    };

    chrome.runtime.sendMessage({ action: "getToggleState" }, applyState);

    masterToggle.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "setToggleState", feature: "master", isEnabled: e.target.checked }, applyState);
    });

    quickLoginToggle.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "setToggleState", feature: "quickLogin", isEnabled: e.target.checked }, applyState);
    });

    announcementsToggle.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "setToggleState", feature: "announcements", isEnabled: e.target.checked }, applyState);
    });

    menuHideToggle.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "setToggleState", feature: "menuHide", isEnabled: e.target.checked }, applyState);
    });

    soundToggle.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "setToggleState", feature: "sound", isEnabled: e.target.checked }, applyState);
    });

    soundFrequencySelect.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "setToggleState", feature: "soundFrequency", value: parseInt(e.target.value, 10) }, applyState);
    });

    chrome.runtime.sendMessage({ action: "getLogs" }, (response) => {
        if (chrome.runtime.lastError) {
            logDiv.innerHTML = '<div class="empty">Bağlantı hatası: ' + escapeHtml(chrome.runtime.lastError.message) + '</div>';
            return;
        }

        if (response && response.logs && response.logs.length > 0) {
            logDiv.innerHTML = response.logs.slice().reverse().map(item =>
                `<div class="log-item" title="${escapeHtml(item.text)}"><span class="log-time mono">${escapeHtml(item.time)}</span>${escapeHtml(item.text)}</div>`
            ).join('');
        } else {
            logDiv.innerHTML = '<div class="empty">Kapatılan bir duyuru yok.</div>';
        }
    });
});
