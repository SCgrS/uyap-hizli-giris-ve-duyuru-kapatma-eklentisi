// Sabitleme durumunu canlı izler. Eklenti kendi kendini sabitleyemez
// (Chrome'da böyle bir API yok), ama kullanıcı raptiyeye bastığı anda
// bunu görüp sayfayı "Sabitlendi" durumuna geçirebiliriz.

const statusEl = document.getElementById('status');
const statusText = document.getElementById('statusText');
const headline = document.getElementById('headline');
const pinGuide = document.getElementById('pinGuide');
const doneGuide = document.getElementById('doneGuide');
const closeBtn = document.getElementById('closeBtn');
const laterBtn = document.getElementById('laterBtn');

let pollTimer = null;
let finished = false;

function showPinned() {
    if (finished) return;
    finished = true;

    statusEl.classList.add('done');
    statusText.textContent = 'Sabitlendi';
    headline.textContent = 'Hazırsınız — eklenti araç çubuğuna sabitlendi';
    pinGuide.classList.add('hidden');
    doneGuide.classList.remove('hidden');
    laterBtn.classList.add('hidden');

    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

async function checkPinned() {
    try {
        if (!chrome.action || !chrome.action.getUserSettings) return;
        const settings = await chrome.action.getUserSettings();
        if (settings && settings.isOnToolbar) showPinned();
    } catch (e) {
        // getUserSettings desteklenmiyorsa sessizce yönergelerde kal
    }
}

function closeThisTab() {
    chrome.tabs.getCurrent((tab) => {
        if (tab && tab.id) {
            chrome.tabs.remove(tab.id);
        } else {
            window.close();
        }
    });
}

closeBtn.addEventListener('click', closeThisTab);
laterBtn.addEventListener('click', closeThisTab);

checkPinned();
pollTimer = setInterval(checkPinned, 700);

// Sekme arka plandayken boşuna sorgulamayalım.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkPinned();
});
