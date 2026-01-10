/*
** background.js pour une extension chromey
** 
** Made by Cezar277
** Alias le16
** 
** 
** Last update: 10/01/2026
*/






/**
 * Configuration des constantes
 * Modifiez l'URL pour pointer vers votre propre serveur d'analyse
 */
const API_URL = "https://noninquiring-uniformly-krish.ngrok-free.dev/analyze";
const TIMEOUT_MS = 180000; // Timeout de 3 minutes pour les analyses longues
const MAX_RETRIES = 2;    // Nombre de tentatives en cas d'erreur serveur

/**
 * Initialisation de l'extension
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isScanning: false });
});

/**
 * Gestion des raccourcis clavier (configurés dans le manifest.json)
 */
chrome.commands.onCommand.addListener((command) => {
  if (command === "start_scanning") {
    chrome.storage.local.set({ isScanning: true });
    sendMessageToActiveTab({ action: "START" });
  } else if (command === "stop_scanning") {
    chrome.storage.local.set({ isScanning: false });
    sendMessageToActiveTab({ action: "STOP" });
  }
});

/**
 * Fonction utilitaire pour communiquer avec l'onglet actif
 */
function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
        // On ignore l'erreur si le script n'est pas injecté sur la page
      });
    }
  });
}

/**
 * Écouteur principal des messages
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // On traite uniquement les demandes d'analyse
  if (message.type === 'NW_ANALYZE') {
    const { apiKey, payload } = message;

    /**
     * HACK KEEP-ALIVE
     * Les Service Workers de Chrome peuvent s'endormir après 30s.
     * On crée un ping régulier pour forcer le SW à rester éveillé pendant l'analyse.
     */
    const keepAliveInterval = setInterval(() => {
      chrome.runtime.getPlatformInfo(() => {});
    }, 20000);

    // Exécution de la requête asynchrone
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

    return true; // Indispensable pour garder le canal de réponse ouvert (async)
  }
});

/**
 * Logique d'appel API avec gestion des tentatives (Retries)
 */
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

      // Si la requête échoue
      if (!response.ok) {
        // Si erreur serveur (5xx), on retente
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      // Succès
      return {
        result: json?.result || null,
        raw: json || text
      };

    } catch (e) {
      lastError = e;
      if (attempt === MAX_RETRIES) throw e;
      // Pause avant la prochaine tentative
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
