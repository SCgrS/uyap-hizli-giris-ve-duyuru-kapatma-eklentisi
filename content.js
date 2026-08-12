(function() {
    'use strict';

    let scanner = null;
    let loginClicked = false;
    let isExtensionEnabled = true;
    let lastUrl = window.location.href;

    chrome.runtime.sendMessage({ action: "getToggleState" }, (response) => {
        if (response) {
            isExtensionEnabled = response.isEnabled;
        }
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "toggleChanged") {
            isExtensionEnabled = request.isEnabled;
            if (!isExtensionEnabled) {
                clearEverything();
            } else {
                startScanner();
            }
        }
    });

    const clearEverything = () => {
        if (scanner) {
            clearInterval(scanner);
            scanner = null;
        }
    };

    const saveLog = (text) => {
        chrome.runtime.sendMessage({ action: "saveLog", text: text });
        chrome.runtime.sendMessage({ action: "incrementBadge" });
    };

    const startScanner = () => {
        if (!isExtensionEnabled) {
            clearEverything();
            return;
        }

        if (!scanner) {
            scanner = setInterval(() => {
                if (!isExtensionEnabled) {
                    clearEverything();
                    return;
                }

                const currentUrl = window.location.href;
                const isRootUrl = currentUrl === "https://avukat.uyap.gov.tr/" || currentUrl === "https://avukat.uyap.gov.tr/#";
                const isLoginUrl = currentUrl.includes("/giris");

                if (!isRootUrl && !isLoginUrl) {
                    return;
                }

                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    if (isLoginUrl) loginClicked = false;
                }

                const closeBtns = document.querySelectorAll('.dx-button-danger[role="button"]');
                for (const btn of closeBtns) {
                    if (btn.textContent.trim() === 'Kapat' && btn.offsetParent !== null) {
                        let popupText = "Bilinmeyen Duyuru";
                        const popupWrapper = btn.closest('.dx-popup-wrapper');
                        
                        if (popupWrapper) {
                            const duyuruNode = popupWrapper.querySelector('#duyuruicerik');
                            if (duyuruNode) {
                                popupText = duyuruNode.innerText.trim();
                            } else {
                                popupText = popupWrapper.innerText.replace('Tekrar Gösterme', '').replace('Kapat', '').trim();
                            }
                        }
                        
                        saveLog(popupText);
                        btn.click();
                        return; 
                    }
                }

                if (isLoginUrl) {
                    const pinInput = document.querySelector('input[type="password"]') ||
                                     document.querySelector('input[placeholder*="Pin"]');

                    if (pinInput && pinInput.offsetParent !== null) {
                        loginClicked = true;
                        if (document.activeElement !== pinInput && pinInput.value === "") {
                            pinInput.focus();
                            pinInput.click();
                            setTimeout(() => {
                                if (document.activeElement !== pinInput) pinInput.focus();
                            }, 50);
                        }
                        return; 
                    }

                    if (!loginClicked) {
                        let eImzaBtn = null;
                        const buttons = document.querySelectorAll('div.dx-button[role="button"]');
                        for (const btn of buttons) {
                            if (btn.textContent.includes('Adalet E-imza')) {
                                eImzaBtn = btn;
                                break;
                            }
                        }

                        if (eImzaBtn) {
                            if (eImzaBtn.offsetParent !== null) {
                                ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                                    eImzaBtn.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window }));
                                });
                                loginClicked = true;
                            } else {
                                const mobileMenuBtn = document.querySelector('button.navbar-toggler');
                                if (mobileMenuBtn && mobileMenuBtn.offsetParent !== null && mobileMenuBtn.getAttribute('aria-expanded') === 'false') {
                                    mobileMenuBtn.click();
                                }
                            }
                        }
                    }
                }
            }, 100);
        }
    };

    new MutationObserver(() => {
        startScanner();
    }).observe(document, {subtree: true, childList: true});

    startScanner();
})();