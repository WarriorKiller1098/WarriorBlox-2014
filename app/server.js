const http = require("http");
const url = require("url");
const port = process.env.PORT || 10000;

http.createServer(function(req, res) {
    const urlpath = url.parse(req.url, true);
    const parsedpath = urlpath.pathname;
    let query = urlpath.query;

    console.log("Method requested: " + req.method + ", with endpoint " + parsedpath);

    if (parsedpath == "/test") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("render is working.");
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
}).listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
