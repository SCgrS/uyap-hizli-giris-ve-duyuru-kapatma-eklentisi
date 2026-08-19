// Bildirim sesi burada çalınır. Bu sayfa eklentinin kendi sayfası olduğu için
// Chrome'un autoplay kısıtlamasına takılmaz; UYAP sekmesi arka planda olsa,
// başka bir sekmede olsanız da ses duyulur.

let ctx = null;

function getContext() {
    const AudioCtx = self.AudioContext || self.webkitAudioContext;
    if (!ctx || ctx.state === "closed") {
        ctx = new AudioCtx();
    }
    return ctx;
}

async function playBeep() {
    const audio = getContext();
    if (audio.state === "suspended") {
        try { await audio.resume(); } catch (e) { /* yoksay */ }
    }

    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    return new Promise((resolve) => {
        osc.onended = resolve;
        setTimeout(resolve, 500); // güvenlik ağı
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.target !== "offscreen") return;

    if (message.action === "playBeep") {
        playBeep()
            .then(() => sendResponse({ ok: true }))
            .catch(() => sendResponse({ ok: false }));
        return true;
    }
});
