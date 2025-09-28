const url = require("url")
const http = require("http")
const port = 10000

http.createServer(function(req, res) {
  const urlpath = url.parse(req.url, true)
  const parsedpath = urlpath.path
  const query = urlpath.query
  const path = parsedpath.split("?")[0]
  if (path.charAt(path.length - 1) == "?") {
      query = parsedpath.split("?")[1].replace("?", "")
  }
  console.log("Method requested: " + req.method + ", with endpoint " + path);
  if (path == "/") {
    res.write("hai!");
    res.end();
  } else if (path == "/test") {
    res.write("hello");
    res.end();
  }
}).listen(port);
