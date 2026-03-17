const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const port = parseInt(process.env.PORT || "3000", 10);

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function safeJoin(basePath, requestedPath) {
    const resolvedPath = path.normalize(path.join(basePath, requestedPath));
    if (!resolvedPath.startsWith(basePath)) {
        return null;
    }
    return resolvedPath;
}

function sendFile(filePath, res) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not found");
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            "Content-Type": mimeTypes[ext] || "application/octet-stream"
        });
        res.end(data);
    });
}

function resolveRequestPath(urlPath) {
    let requestedPath = urlPath === "/" ? "/index.html" : urlPath;

    if (!path.extname(requestedPath)) {
        const htmlPath = requestedPath + ".html";
        const fullHtmlPath = safeJoin(rootDir, htmlPath);
        if (fullHtmlPath && fs.existsSync(fullHtmlPath)) {
            return fullHtmlPath;
        }
    }

    const fullPath = safeJoin(rootDir, requestedPath);
    if (!fullPath) return null;

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        const indexPath = path.join(fullPath, "index.html");
        if (fs.existsSync(indexPath)) {
            return indexPath;
        }
    }

    return fullPath;
}

http.createServer(function (req, res) {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const filePath = resolveRequestPath(pathname);

    if (!filePath) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad request");
        return;
    }

    sendFile(filePath, res);
}).listen(port, function () {
    console.log("Frontend server listening on port " + port);
});
