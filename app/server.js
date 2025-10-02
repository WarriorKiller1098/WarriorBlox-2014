const http = require("http")

http.createServer(function(req, res) {
  const urlpath = url.parse(req.url, true)
  const parsedpath = urlpath.path
  const query = urlpath.query
  const path = parsedpath.split("?")[0]
  if (path.charAt(path.length - 1) == "?") {
      query = parsedpath.split("?")[1].replace("?", "")
  }
  console.log("Method requested: " + req.method + ", with endpoint " + path);
  if (path == "/test") {
    res.write("render is working.");
    res.end();
  }
})
