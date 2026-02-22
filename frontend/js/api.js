(function () {
    var TOKEN_KEY = "autoseller-token";
    var USER_KEY = "autoseller-user";
    var COMPARE_KEY = "autoseller-compare";

    function getBaseUrl() {
        if (typeof window === "undefined") return "";
        if (window.API_BASE !== undefined && window.API_BASE !== "") return window.API_BASE;
        if (window.location && window.location.port !== "5112") {
            var protocol = window.location.protocol || "http:";
            var host = window.location.hostname || "localhost";
            return protocol + "//" + host + ":5112";
        }
        return "";
    }

    function getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }

    function setToken(token) {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    }

    function getUser() {
        try {
            var raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function setUser(user) {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
    }

    function getAuthHeaders() {
        var t = getToken();
        var h = { "Content-Type": "application/json" };
        if (t) h["Authorization"] = "Bearer " + t;
        return h;
    }

    function request(method, path, body) {
        var url = getBaseUrl() + path;
        var opts = { method: method, headers: getAuthHeaders() };
        if (body) opts.body = typeof body === "string" ? body : JSON.stringify(body);
        return fetch(url, opts).then(function (res) {
            if (!res.ok) return res.json().then(function (data) { throw data; }, function () { throw { message: res.statusText }; });
            if (res.status === 204) return null;
            var ct = res.headers.get("Content-Type");
            if (ct && ct.indexOf("application/json") !== -1) return res.json();
            return res.text();
        });
    }

    function get(path) { return request("GET", path); }
    function post(path, body) { return request("POST", path, body); }
    function patch(path, body) { return request("PATCH", path, body); }
    function del(path) { return request("DELETE", path); }

    function getCompareIds() {
        try {
            var raw = localStorage.getItem(COMPARE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function setCompareIds(ids) {
        localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    }

    function updateCompareCount() {
        var token = getToken();
        var setCount = function (n) {
            document.querySelectorAll(".compare-count").forEach(function (el) { el.textContent = "(" + n + ")"; });
        };
        if (token) {
            get("/api/comparison").then(function (list) { setCount(Array.isArray(list) ? list.length : 0); }).catch(function () { setCount(0); });
        } else {
            setCount(getCompareIds().length);
        }
    }

    window.api = {
        getBaseUrl: getBaseUrl,
        getToken: getToken,
        setToken: setToken,
        getUser: getUser,
        setUser: setUser,
        getAuthHeaders: getAuthHeaders,
        get: get,
        post: post,
        patch: patch,
        delete: del,
        getCompareIds: getCompareIds,
        setCompareIds: setCompareIds,
        updateCompareCount: updateCompareCount
    };
})();
