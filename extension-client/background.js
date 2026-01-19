/*
** background.js pour une extension chrome
** 
** Made by Cezar277
** Alias le16
** 
** 
** Last update: 19/01/2026
*/


const API_URL = "https://noninquiring-uniformly-krish.ngrok-free.dev/analyze";
const TIMEOUT_MS = 180000;
const MAX_RETRIES = 2;



chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isScanning: false });
});



chrome.commands.onCommand.addListener((command) => {
  if (command === "start_scanning") {
    chrome.storage.local.set({ isScanning: true });
    sendMessageToActiveTab({ action: "START" });
  } else if (command === "stop_scanning") {
    chrome.storage.local.set({ isScanning: false });
    sendMessageToActiveTab({ action: "STOP" });
  }
});


function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs?.id) {
      chrome.tabs.sendMessage(tabs.id, message).catch(() => {
      });
    }
  });
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleVisibility') {
    chrome.storage.local.get('isVisible', (result) => {
      const newState = !result.isVisible;
      chrome.storage.local.set({ isVisible: newState });
      sendResponse({ ok: true, isVisible: newState });
    });
    return true;
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NW_ANALYZE') {
    const { apiKey, payload } = message;
    const keepAliveInterval = setInterval(() => {
      chrome.runtime.getPlatformInfo(() => {});
    }, 20000);

    (async () => {
      try {
        const result = await fetchWithRetry(apiKey, payload);
        sendResponse({ ok: true, ...result });
      } catch (error) {
        sendResponse({
          ok: false,
          error: error.message === 'The operation was aborted'
            ? 'Timeout: Le serveur a mis trop de temps à répondre (3 min+)'
            : error.message
        });
      } finally {
        clearInterval(keepAliveInterval);
      }
    })();

    return true; 
  }
});



async function fetchWithRetry(apiKey, payload) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const text = await response.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) { /* Pas un JSON valide */ }

      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      return {
        result: json?.result || null,
        raw: json || text
      };

    } catch (e) {
      lastError = e;
      if (attempt === MAX_RETRIES) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
