document.addEventListener('DOMContentLoaded', () => {
    const logDiv = document.getElementById('log');
    const toggleSwitch = document.getElementById('toggleSwitch');
    const toggleStatusText = document.getElementById('toggleStatusText');

    chrome.runtime.sendMessage({ action: "resetBadge" });

    const updateUIState = (isEnabled) => {
        toggleSwitch.checked = isEnabled;
        if (isEnabled) {
            toggleStatusText.textContent = "UYAP Hızlı Giriş ve Duyuru Kapatma eklentisi AÇIK";
            toggleStatusText.style.color = "#4CAF50";
        } else {
            toggleStatusText.textContent = "UYAP Hızlı Giriş ve Duyuru Kapatma eklentisi KAPALI";
            toggleStatusText.style.color = "#f44336";
        }
    };

    chrome.runtime.sendMessage({ action: "getToggleState" }, (response) => {
        if (response) updateUIState(response.isEnabled);
    });

    toggleSwitch.addEventListener('change', (e) => {
        const newState = e.target.checked;
        chrome.runtime.sendMessage({ action: "setToggleState", isEnabled: newState });
        updateUIState(newState);
    });

    chrome.runtime.sendMessage({ action: "getLogs" }, (response) => {
        if (chrome.runtime.lastError) {
            logDiv.innerHTML = '<div class="empty">Bağlantı hatası: ' + chrome.runtime.lastError.message + '</div>';
            return;
        }

        if (response && response.logs && response.logs.length > 0) {
            logDiv.innerHTML = response.logs.slice().reverse().map(msg => 
                `<div class="log-item">${msg}</div>`
            ).join('');
        } else {
            logDiv.innerHTML = '<div class="empty">Kapatılan bir duyuru yok.</div>';
        }
    });
});