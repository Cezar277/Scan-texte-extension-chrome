/*
** injector_v2.js
**
** ULTRA-STEALTH & PERFORMANCE OPTIMIZED
** - Removed heavy DOM hooking (querySelector hooks)
** - UI is now "Lazy Loaded" (doesn't exist until keypress)
** - Uses "Clean Iframe" technique to steal pristine natives
*/

(function() {
    const CONFIG = {
        TRIGGER_KEYS: ['²', '@'],
        KEYWORDS: ['exercise', 'assignment', 'task', 'implement', 'todo', 'fixme', 'step'],
        CONTAINER_ID: 'nw-' + Math.random().toString(36).substr(2, 9)
    };

    const getCleanNatives = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
        
        const Clean = {
            console: iframe.contentWindow.console,
            Object: iframe.contentWindow.Object,
            Function: iframe.contentWindow.Function,
            JSON: iframe.contentWindow.JSON,
            fetch: iframe.contentWindow.fetch,
            XMLHttpRequest: iframe.contentWindow.XMLHttpRequest,
            PerformanceObserver: iframe.contentWindow.PerformanceObserver,
            customEvent: iframe.contentWindow.CustomEvent
        };
        
        iframe.remove();
        return Clean;
    };

    let Natives = { 
        console: console, Object: Object, Function: Function, 
        JSON: JSON, fetch: fetch, XMLHttpRequest: XMLHttpRequest 
    };
    
    if (document.body) {
        Natives = getCleanNatives();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            Natives = getCleanNatives();
        }, { once: true });
    }


    function hideHook(mock, original) {
        try {
            Natives.Object.defineProperty(mock, 'name', { value: original.name });
            const toStringProxy = new Proxy(original.toString, {
                apply: function(target, thisArg, argumentsList) {
                    return original.toString.apply(thisArg, argumentsList);
                }
            });
            Natives.Object.defineProperty(mock, 'toString', {
                value: toStringProxy,
                writable: true,
                configurable: true
            });
        } catch (e) {}
        return mock;
    }

    function safeJSONParse(text) {
        if (!text || text.length < 2) return null;
        try {
            return Natives.JSON.parse(text);
        } catch (e) {
            return null;
        }
    }

    const originalConsoleError = console.error;
    console.error = function(...args) {
        const msg = args && args[0] ? args[0].toString() : '';
        if (msg.includes('chrome-extension') || msg.includes(CONFIG.CONTAINER_ID)) return;
        return originalConsoleError.apply(this, args);
    };


    function exfiltrate(url, data, type) {
        if (!data) return; 
        let cleanUrl = url;
        try { cleanUrl = new URL(url, window.location.origin).href; } catch(e){}

        window.dispatchEvent(new CustomEvent('NW_DATA', {
            detail: {
                url: cleanUrl,
                data: data,
                dataType: type,
                timestamp: Date.now()
            }
        }));
    }

    const XHRProxy = new Proxy(window.XMLHttpRequest, {
        construct(target, args) {
            const xhr = new target(...args);
            
            const openOriginal = xhr.open;
            xhr.open = function(method, url) {
                this._nw_url = url;
                return openOriginal.apply(this, arguments);
            };

            xhr.addEventListener('load', () => {
                try {
                    if (xhr.responseType === 'json' || (xhr.responseText && xhr.responseText.startsWith('{'))) {
                        const json = xhr.responseType === 'json' ? xhr.response : safeJSONParse(xhr.responseText);
                        if (json) exfiltrate(this._nw_url, json, 'json');
                    }
                    else if (xhr.responseText && xhr.responseText.includes('<div')) {
                        exfiltrate(this._nw_url, xhr.responseText, 'html');
                    }
                } catch(e) {}
            });

            return xhr;
        }
    });
    hideHook(XHRProxy, window.XMLHttpRequest);
    window.XMLHttpRequest = XHRProxy;


    const originalFetch = window.fetch;
    const fetchProxy = async function(...args) {
        const result = await originalFetch.apply(this, args);
        
        try {
            const clone = result.clone();
            const url = (args[0] instanceof Request) ? args[0].url : args[0];

            clone.text().then(text => {
                const json = safeJSONParse(text);
                if (json) {
                    exfiltrate(url, json, 'json');
                } else if (text.includes('<!DOCTYPE') || text.includes('<div')) {
                    exfiltrate(url, text, 'html');
                }
            }).catch(() => {});
        } catch(e) {}

        return result;
    };
    hideHook(fetchProxy, originalFetch);
    window.fetch = fetchProxy;



    let uiInitialized = false;
    let uiVisible = false;
    let toggleBtn = null;

    const initUI = () => {
        if (uiInitialized) return;
        
        const container = document.createElement('div');
        container.id = CONFIG.CONTAINER_ID;
        
        const shadow = container.attachShadow({ mode: 'closed' });
        
        const style = document.createElement('style');
        style.textContent = `
            :host { all: initial; }
            button {
                position: fixed; bottom: 20px; left: 20px;
                width: 30px; height: 30px;
                background: #222; color: #fff;
                border: none; border-radius: 50%;
                font-family: monospace; font-weight: bold;
                cursor: pointer; z-index: 2147483647;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                transition: transform 0.2s;
            }
            button:hover { transform: scale(1.1); background: #000; }
            button:active { transform: scale(0.95); }
        `;
        
        const btn = document.createElement('button');
        btn.textContent = '²';
        btn.onclick = () => {
            window.postMessage({ type: 'NW_TOGGLE_VISIBILITY_REQUEST' }, '*');
        };

        shadow.appendChild(style);
        shadow.appendChild(btn);
        
        (document.body || document.documentElement).appendChild(container);
        
        toggleBtn = container;
        uiInitialized = true;
    };

    document.addEventListener('keydown', (e) => {
        if (CONFIG.TRIGGER_KEYS.includes(e.key) && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            e.stopPropagation();

            if (!uiInitialized) {
                initUI();
                uiVisible = true;
            } else {
                uiVisible = !uiVisible;
                toggleBtn.style.display = uiVisible ? 'block' : 'none';
            }
        }
    }, true);


    window.addEventListener('load', () => {
        setTimeout(() => {
            try {
                const html = document.documentElement.outerHTML.toLowerCase();
                const found = CONFIG.KEYWORDS.some(kw => html.includes(kw));
                
                if (found) {
                    exfiltrate(window.location.href, document.documentElement.outerHTML, 'html');
                }
            } catch(e) {}
        }, 1500);
    });

})();
