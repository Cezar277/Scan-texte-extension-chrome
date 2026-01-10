/*
** content.js pour une extension chrome
**
** Made by Cezar277
** Alias le16
**
**
** Last update: 10/01/2026
*/

const API_URL = "https://noninquiring-uniformly-krish.ngrok-free.dev/analyze";
chrome.storage.local.set({ apiKey: "ndAnPZTLY32KMCwSADQUdPM" });

let state = {
    isScanning: false,
    apiKey: null
};

let lastSentHash = null;        
let isWaitingForResponse = false;

function fastHash(str) {
    let hash = 5381;
    let i = str.length;
    while(i) hash = (hash * 33) ^ str.charCodeAt(--i);
    return hash >>> 0;
}

const initPromise = new Promise(resolve => {
    chrome.storage.local.get(['isScanning', 'apiKey'], (res) => {
        state.isScanning = res.isScanning || false;
        state.apiKey = res.apiKey || null;
        resolve();
    });
});

initPromise.then(() => {
    if (state.isScanning) showOverlay("SYSTEME PRET (F5 conseillé)", true);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.isScanning) {
        state.isScanning = changes.isScanning.newValue;
        if (state.isScanning) showOverlay("SCAN ACTIVÉ", true);
        else showOverlay("SCAN DÉSACTIVÉ", true);
    }
    if (changes.apiKey) {
        state.apiKey = changes.apiKey.newValue;
    }
});

const s = document.createElement('script');
s.src = chrome.runtime.getURL('injector.js');
s.onload = function() { this.remove(); };
(document.head || document.documentElement).appendChild(s);

function extractVisibleText() {    
    let text = document.body.innerText;
    
    text = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 5) 
        .join('\n');
    
    if (text.length > 25000) {
        text = text.substring(0, 10000) + '\n\n... [PARTIE CENTRALE COUPÉE] ...\n\n' + text.substring(text.length - 10000);
    }
        
    return text;
}

if (!window.__NW_LISTENER_ATTACHED__) {
    window.__NW_LISTENER_ATTACHED__ = true;

    let debounceTimer = null;

    (async function() {
        await initPromise;

        window.addEventListener('NW_DATA', async (e) => {
            if (!state.isScanning) return;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                handleScan();
            }, 1000);
        });
    })();
}

async function handleScan() {
    if (isWaitingForResponse) {
        return;
    }

    const pageUrl = window.location.href;
    
    let visibleText = "";
    try {
        visibleText = extractVisibleText();
    } catch (e) {
        return;
    }

    if (!visibleText || visibleText.length < 50) return;

    const currentHash = fastHash(visibleText);
    if (currentHash === lastSentHash) {
        return;
    }

    isWaitingForResponse = true; 
    lastSentHash = currentHash;  

    clearLoadingOverlays(); 
    showOverlay("Analyse en cours...", true);

    try {      
        await sendToBackend(pageUrl, visibleText, 'text');

    } catch (err) {
        clearLoadingOverlays();
        showOverlay("Erreur envoi", false);
    } finally {
        isWaitingForResponse = false;
    }
}

function clearLoadingOverlays() {
    const root = getRoot();
    if (!root) return;
    const loaders = root.querySelectorAll('.loading');
    loaders.forEach(el => el.remove());
}

async function sendToBackend(url, data, dataType) {
    if (!state.apiKey) {
        clearLoadingOverlays();
        showOverlay("ERREUR: Clé API manquante", false);
        return;
    }

    return new Promise((resolve) => {
        const payload = { url, data, dataType };
        chrome.runtime.sendMessage(
            {
                type: 'NW_ANALYZE',
                apiKey: state.apiKey,
                payload
            },
            (response) => {
                clearLoadingOverlays();

                if (chrome.runtime.lastError) {
                    showOverlay("Erreur Serveur", false);
                    resolve(); 
                    return;
                }

                if (!response) {
                    showOverlay("Erreur Serveur", false);
                    resolve();
                    return;
                }

                const { ok, result, error } = response;

                if (!ok) {
                    showOverlay("Erreur Serveur", false);
                    resolve();
                    return;
                }

                if (result && result !== "R.A.S") {
                    showOverlay(result, false);
                } else {
                    showOverlay("R.A.S", false);
                }
                resolve(); 
            }
        );
    });
}

let shadowRoot = null;
let hostElement = null;

function getRoot() {
    if (shadowRoot) return shadowRoot;

    const target = document.body || document.documentElement;
    if (!target) return null;

    hostElement = document.createElement('div');
    hostElement.id = 'nw-' + Math.random().toString(36).substr(2, 9);

    hostElement.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        padding: 20px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        gap: 10px;
        width: auto;
        max-width: 50vw;
        max-height: 85vh;
        pointer-events: none;
        overflow: visible;
    `;

    target.appendChild(hostElement);
    shadowRoot = hostElement.attachShadow({mode: 'closed'});

    const style = document.createElement('style');
    style.textContent = `
        .box {
            background: transparent;
            color: #000000;
            text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 5px rgba(255,255,255,0.8);
            font-family: 'Arial', sans-serif;
            font-weight: 900;
            font-size: 13px;
            width: fit-content;
            max-width: 45vw;
            word-wrap: break-word;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            cursor: default;
            line-height: 1.4;
            animation: slideIn 0.3s ease-out;
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
            max-height: 70vh;
            padding: 12px 14px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
            pointer-events: auto;
        }

        .content-wrapper {
            overflow-y: auto;
            max-height: 65vh;
            padding-right: 8px;
        }

        .content-wrapper::-webkit-scrollbar {
            width: 6px;
        }

        .content-wrapper::-webkit-scrollbar-track {
            background: transparent;
        }

        .content-wrapper::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
        }

        .truncate-notice {
            font-size: 11px;
            color: #666;
            font-style: italic;
            margin-top: 8px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            padding-top: 8px;
        }

        .dots {
            display: inline-flex;
            align-items: center;
            height: 10px;
        }

        .dot {
            width: 5px;
            height: 5px;
            background-color: #000;
            border-radius: 50%;
            margin: 0 2px;
            display: inline-block;
            animation: bounce 1.4s infinite ease-in-out both;
            box-shadow: 0 0 2px #fff;
        }

        .dot:nth-child(1) {
            animation-delay: -0.32s;
        }

        .dot:nth-child(2) {
            animation-delay: -0.16s;
        }

        .dot:nth-child(3) {
            animation-delay: 0s;
        }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    shadowRoot.appendChild(style);
    return shadowRoot;
}

function truncateToScreen(text) {
    const maxChars = 80 * 25;
    
    if (text.length > maxChars) {
        return {
            visible: text.substring(0, maxChars).trim() + '...',
            isTruncated: true,
            fullLength: text.length
        };
    }
    
    return {
        visible: text,
        isTruncated: false,
        fullLength: text.length
    };
}

function showOverlay(text, isLoading) {
    let root = getRoot();
    if (!root) {
        setTimeout(() => showOverlay(text, isLoading), 100);
        return;
    }

    const isRas = text === "R.A.S";

    const div = document.createElement('div');
    
    if (isLoading) {
        div.className = 'box loading';
        div.innerHTML = `
            <span>Analyse en cours</span>
            <span class="dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </span>
        `;
        div.style.pointerEvents = "none";
    } else {
        div.className = text.includes('Erreur') ? 'box error' : 'box done';
        
        ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'touchmove'].forEach(evt => {
            div.addEventListener(evt, (e) => {
                e.stopPropagation(); 
            });
        });

        const truncated = truncateToScreen(text);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content-wrapper';
        contentDiv.innerHTML = truncated.visible.replace(/\n/g, '<br/>');
        
        div.appendChild(contentDiv);
        
        if (truncated.isTruncated) {
            const notice = document.createElement('div');
            notice.className = 'truncate-notice';
            notice.textContent = `[+${truncated.fullLength - truncated.visible.length} caractères en console]`;
            div.appendChild(notice);
        }
    }

    root.appendChild(div);

    if (!isLoading) {
        const duration = isRas ? 3000 : 90000;
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.5s';
            setTimeout(() => div.remove(), 500);
        }, duration);
    }
}
