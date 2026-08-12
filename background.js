let badgeCount = 0;
let closedMessages = [];
let isEnabled = true;

function updateBadge() {
    if (!isEnabled) {
        chrome.action.setBadgeText({ text: "" });
        chrome.action.setIcon({
            path: {
                "16": "icon16_off.png",
                "48": "icon48_off.png",
                "128": "icon128_off.png"
            }
        });
    } else {
        chrome.action.setIcon({
            path: {
                "16": "icon16.png",
                "48": "icon48.png",
                "128": "icon128.png"
            }
        });
        if (badgeCount > 0) {
            chrome.action.setBadgeText({ text: badgeCount.toString() });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    }
}

updateBadge();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "incrementBadge") {
        badgeCount++;
        updateBadge();
    } else if (request.action === "resetBadge") {
        badgeCount = 0;
        updateBadge();
    } else if (request.action === "saveLog") {
        closedMessages.push(`<b>${new Date().toLocaleTimeString()}</b> - ${request.text}`);
        if (closedMessages.length > 3) closedMessages.shift();
    } else if (request.action === "getLogs") {
        sendResponse({ logs: closedMessages });
    } else if (request.action === "getToggleState") {
        sendResponse({ isEnabled: isEnabled });
    } else if (request.action === "setToggleState") {
        isEnabled = request.isEnabled;
        updateBadge();
        chrome.tabs.query({url: "*://avukat.uyap.gov.tr/*"}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: "toggleChanged", isEnabled: isEnabled }).catch(() => {});
            });
        });
    }
});