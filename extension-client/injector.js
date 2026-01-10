/*
** injector.js pour une extension chrome
**
** Made by Cezar277
** Alias le16
**
**
** Last update: 10/01/2026
*/

(function() {
    function infectWindow(win) {
        try {
            if (win._nw_infected) return;
            Object.defineProperty(win, '_nw_infected', { value: true, enumerable: false, writable: true });
        } catch(e) { return; }

        function makeNative(mock, original) {
            try {
                Object.defineProperty(mock, 'name', { value: original.name });
                const toStringProxy = function() { return original.toString(); };
                Object.defineProperty(toStringProxy, 'toString', {
                    value: function() { return original.toString.toString(); }
                });
                Object.defineProperty(mock, 'toString', {
                    value: toStringProxy,
                    writable: true,
                    configurable: true
                });
            } catch (e) {}
            return mock;
        }

        function tryParseJSON(text) {
            if (!text || text.length < 5) return null;
            const first = text.trim()[0];
            if (first !== '{' && first !== '[') return null;
            try {
                return JSON.parse(text);
            } catch (e) {
                return null;
            }
        }

        const OriginalPerformance = win.performance;
        const OriginalPO = win.PerformanceObserver;

        if (OriginalPerformance) {
            ['getEntries', 'getEntriesByType', 'getEntriesByName'].forEach(method => {
                if (OriginalPerformance[method]) {
                    const originalMethod = OriginalPerformance[method];
                    const proxiedMethod = function(...args) {
                        return originalMethod.apply(this, args).filter(entry => 
                            !entry.name.startsWith('chrome-extension') && 
                            !entry.name.includes('injector.js')
                        );
                    };
                    makeNative(proxiedMethod, originalMethod);
                    OriginalPerformance[method] = proxiedMethod;
                }
            });
        }

        if (OriginalPO) {
            const ProxiedPO = new Proxy(OriginalPO, {
                construct(target, args) {
                    const [callback] = args;
                    const wrappedCallback = (list, observer) => {
                        const filteredEntries = list.getEntries().filter(entry => 
                            !entry.name.startsWith('chrome-extension') && 
                            !entry.name.includes('injector.js')
                        );
                        if (filteredEntries.length > 0) {
                            const fakeList = {
                                getEntries: () => filteredEntries,
                                getEntriesByType: (type) => filteredEntries.filter(e => e.entryType === type),
                                getEntriesByName: (name) => filteredEntries.filter(e => e.name === name)
                            };
                            callback(fakeList, observer);
                        }
                    };
                    return new target(wrappedCallback);
                }
            });
            makeNative(ProxiedPO, OriginalPO);
            win.PerformanceObserver = ProxiedPO;
        }

        const OriginalXHR = win.XMLHttpRequest;
        class ProxiedXHR extends OriginalXHR {
            constructor() {
                super();
                this._url = null;
            }
            open(method, url) {
                this._url = url;
                return super.open(...arguments);
            }
            send(body) {
                this.addEventListener('load', () => {
                    try {
                        let jsonData = null;
                        let htmlData = null;
                        if (this.responseType === 'json' && this.response) {
                            jsonData = this.response;
                        } else if (this.responseText) {
                            jsonData = tryParseJSON(this.responseText);
                            if (!jsonData && this.responseText.includes('<')) {
                                htmlData = this.responseText;
                            }
                        }
                        if (jsonData || htmlData) {
                            window.postMessage({
                                type: 'NW_INTERNAL_FWD',
                                url: this._url,
                                jsonData: jsonData,
                                htmlData: htmlData
                            }, window.location.origin);
                        }
                    } catch (e) {}
                });
                return super.send(...arguments);
            }
        }
        makeNative(ProxiedXHR, OriginalXHR);
        makeNative(ProxiedXHR.prototype.open, OriginalXHR.prototype.open);
        makeNative(ProxiedXHR.prototype.send, OriginalXHR.prototype.send);
        win.XMLHttpRequest = ProxiedXHR;

        const originalFetch = win.fetch;
        const newFetch = async function(...args) {
            let url = args[0];
            if (typeof url === 'object' && url instanceof Request) url = url.url;
            const response = await originalFetch(...args);
            try {
                const clone = response.clone();
                clone.text().then(text => {
                    let jsonData = tryParseJSON(text);
                    let htmlData = null;
                    if (!jsonData && text.includes('<')) {
                        htmlData = text;
                    }
                    if (jsonData || htmlData) {
                        window.postMessage({
                            type: 'NW_INTERNAL_FWD',
                            url: url,
                            jsonData: jsonData,
                            htmlData: htmlData
                        }, window.location.origin);
                    }
                }).catch(() => {});
            } catch (e) {}
            return response;
        };
        makeNative(newFetch, originalFetch);
        win.fetch = newFetch;
    }

    if (window === window.top) {
        function dispatch(url, jsonData, htmlData) {
            const jsonSize = jsonData ? JSON.stringify(jsonData).length : 0;
            const htmlSize = htmlData ? htmlData.length : 0;
            let finalData = null;
            let dataType = null;
            if (jsonSize > htmlSize && jsonSize > 100) {
                finalData = jsonData;
                dataType = 'json';
            } else if (htmlSize > jsonSize && htmlSize > 100) {
                finalData = htmlData;
                dataType = 'html';
            } else if (jsonSize > 0) {
                finalData = jsonData;
                dataType = 'json';
            } else {
                return;
            }
            if (dataType === 'json' && Object.keys(finalData).length === 0) return;
            if (url && typeof url === 'string' && !url.startsWith('http')) {
                try { url = new URL(url, window.location.origin).href; } catch(e){}
            }
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('NW_DATA', { 
                    detail: { 
                        url: url, 
                        data: finalData,
                        dataType: dataType
                    } 
                }));
            }, 0);
        }

        window.addEventListener('message', (e) => {
            if (e.origin !== window.location.origin) return;
            if (e.data && e.data.type === 'NW_INTERNAL_FWD') {
                dispatch(e.data.url, e.data.jsonData, e.data.htmlData);
            }
        });
    }

    infectWindow(window);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IFRAME') {
                    const infect = () => {
                        try {
                            if (node.contentWindow) infectWindow(node.contentWindow);
                        } catch(e) {}
                    };
                    infect();
                    node.addEventListener('load', infect, { once: true });
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        setTimeout(() => {
            const pageHTML = document.documentElement.outerHTML;
            const keywords = ['exercise', 'assignment', 'task', 'implement', 'todo', 'fixme', 'step'];
            const hasKeywords = keywords.some(kw => pageHTML.toLowerCase().includes(kw));
            if (hasKeywords) {
                window.dispatchEvent(new CustomEvent('NW_DATA', {
                    detail: {
                        url: window.location.href,
                        data: pageHTML,
                        dataType: 'html',
                        source: 'page_load'
                    }
                }));
            }
        }, 2000);
    });
})();
