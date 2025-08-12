// auctionSocket.js
// ES module export. Usage: import AuctionSocket from './auctionSocket.js';

export default class AuctionSocket {
    /**
     * options:
     *  - urlBase: string (ví dụ "wss://api.example.com" hoặc "https://api.example.com")
     *  - token: string (JWT)
     *  - auctionId: string
     *  - reconnect: boolean (default: true)
     *  - reconnectBase: number ms (default: 1000)
     *  - reconnectMax: number ms (default: 30000)
     *  - maxRetries: number (default: Infinity)
     *  - heartbeatInterval: number ms (default: 0 => disabled)
     *  - heartbeatMsg: string|object (default: "ping")
     *  - debug: boolean
     */
    constructor({ urlBase = null, token, auctionId, reconnect = true, reconnectBase = 1000, reconnectMax = 30000, maxRetries = Infinity, heartbeatInterval = 0, heartbeatMsg = "ping", debug = false } = {}) {
        if (!auctionId) throw new Error("auctionId is required");
        this.auctionId = auctionId;
        this.token = token || "";
        this.urlBase = urlBase || this._defaultUrlBase();
        this.reconnect = reconnect;
        this.reconnectBase = reconnectBase;
        this.reconnectMax = reconnectMax;
        this.maxRetries = maxRetries;
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatMsg = heartbeatMsg;
        this.debug = debug;

        this.ws = null;
        this.forcedClose = false;
        this.retryCount = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;

        // Event callbacks (override externally)
        this.onopen = () => { };
        this.onmessage = (msg) => { };
        this.onclose = (ev) => { };
        this.onerror = (err) => { };
        this.onauthfail = (code, reason) => { }; // called when 4401 or 1008

        // Auto connect on construction:
        this.connect();
    }

    _log(...args) {
        if (this.debug) console.log("[AuctionSocket]", ...args);
    }

    _defaultUrlBase() {
        // If no urlBase provided, assume same host as page
        // convert http(s) to ws(s)
        const loc = window.location;
        const protocol = loc.protocol === "https:" ? "wss:" : "ws:";
        return `${protocol}//${loc.host}`;
    }

    _buildUrl() {
        // Ensure urlBase uses ws/wss scheme
        let base = this.urlBase;
        base = base.replace(/^http:\/\//i, "ws://").replace(/^https:\/\//i, "wss://");
        // Build endpoint path exactly like your FastAPI router
        const path = `/websocket/auction/${encodeURIComponent(this.auctionId)}`;
        const sep = base.endsWith("/") ? "" : "";
        const tokenParam = `token=${encodeURIComponent(this.token || "")}`;
        return `${base}${sep}${path}?${tokenParam}`;
    }

    connect() {
        if (!this.token) {
            this._log("No token set. Attempting connection without token (server may reject).");
        }

        this.forcedClose = false;
        const url = this._buildUrl();
        this._log("Connecting to", url);

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = (ev) => {
                this._log("onopen", ev);
                this.retryCount = 0;
                this._clearReconnectTimer();

                // Start heartbeat only if enabled (default disabled)
                if (this.heartbeatInterval > 0) {
                    this._startHeartbeat();
                }

                try { this.onopen(ev); } catch (e) { console.error(e); }
            };

            this.ws.onmessage = (ev) => {
                // Try to parse JSON, fallback to text
                let payload = ev.data;
                try {
                    payload = JSON.parse(ev.data);
                } catch (e) {
                    // keep raw text
                }
                try { this.onmessage(payload, ev); } catch (e) { console.error(e); }
            };

            this.ws.onclose = (ev) => {
                this._log("onclose", ev);
                this._stopHeartbeat();

                // Special handling for auth failures from your utils.py:
                // - 4401: custom "no token"
                // - 1008: policy violation (you used 1008 for auth fail)
                if (ev.code === 4401 || ev.code === 1008) {
                    this._log("Auth failed or unauthorized (code)", ev.code, ev.reason);
                    try { this.onauthfail(ev.code, ev.reason); } catch (e) { console.error(e); }
                    // Do not attempt reconnection when auth fails
                    return;
                }

                try { this.onclose(ev); } catch (e) { console.error(e); }

                if (!this.forcedClose && this.reconnect && this.retryCount < this.maxRetries) {
                    this._scheduleReconnect();
                }
            };

            this.ws.onerror = (ev) => {
                this._log("onerror", ev);
                try { this.onerror(ev); } catch (e) { console.error(e); }
                // Note: 'onerror' often precedes 'onclose' — reconnection is handled in onclose
            };
        } catch (err) {
            this._log("Connection attempt threw", err);
            try { this.onerror(err); } catch (e) { console.error(e); }
            this._scheduleReconnect();
        }
    }

    _startHeartbeat() {
        this._stopHeartbeat();
        if (this.heartbeatInterval > 0) {
            this.heartbeatTimer = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    // WARNING: Application-level heartbeat will be broadcast by your server to other clients.
                    // If you don't want that, keep heartbeatInterval = 0 (disabled).
                    const msg = typeof this.heartbeatMsg === "string" ? this.heartbeatMsg : JSON.stringify(this.heartbeatMsg);
                    this._log("Sending heartbeat", msg);
                    this.ws.send(msg);
                }
            }, this.heartbeatInterval);
        }
    }

    _stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    _scheduleReconnect() {
        this.retryCount += 1;
        const backoff = Math.min(this.reconnectBase * Math.pow(1.5, this.retryCount - 1), this.reconnectMax);
        // add jitter +/- 20%
        const jitter = backoff * 0.2 * (Math.random() - 0.5);
        const delay = Math.max(200, Math.floor(backoff + jitter));

        this._log(`Reconnect scheduled (#${this.retryCount}) in ${delay}ms`);
        this._clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            this._log("Reconnecting now...");
            this.connect();
        }, delay);
    }

    _clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    send(data) {
        // For consistency with your server which uses send_json, prefer sending JSON objects.
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this._log("Cannot send, socket not open");
            return false;
        }
        try {
            // If object -> stringify, if string -> send as-is
            const payload = (typeof data === "object") ? JSON.stringify(data) : data;
            this.ws.send(payload);
            return true;
        } catch (err) {
            this._log("Send error", err);
            return false;
        }
    }

    close() {
        this.forcedClose = true;
        this._clearReconnectTimer();
        this._stopHeartbeat();
        if (this.ws) {
            try { this.ws.close(); } catch (e) { /* ignore */ }
        }
    }

    /**
     * Update token (useful for refresh token flow) and reconnect with the new token.
     * If wantImmediateReconnect = true -> will close existing and reconnect immediately.
     */
    updateToken(newToken, { reconnectImmediate = true } = {}) {
        this.token = newToken;
        this._log("Token updated");
        if (reconnectImmediate) {
            this._log("Reconnecting with new token...");
            this.forcedClose = false;
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                // close current connection to force reconnect with new token
                try { this.ws.close(); } catch (e) { /* ignore */ }
            } else {
                // if not open, ensure we start connection
                this._clearReconnectTimer();
                this.connect();
            }
        }
    }
}
