const url = require("url")
const http = require("http")
const port = 10000
const fs = require("fs")
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
    sendf(res, "index.html");
  } else if (path == "/status") {
    res.write("i am... good and healthy :D");
    res.end();
  } else if (path == "/games/list") {
        sendf(res, "games/list.html");
  } else if (path == "/assets/logo.png") {
        sendf(res, "assets/logo.png");
        res.end();
  } else if (path == "/style.css") {
        sendf(res, "assets/style.css");
        res.end();
  } else if (path == "/games/style.css") {
        sendf(res, "assets/style.css");
        res.end();
  } else if (path == "/games/thumbnail1.jpg") {
        sendf(res, "assets/thumbnail1.jpg");
        res.end();
  } else if (path == "/games/start") {
    sendf(res, "games/start.html");
  } else if (path == "/mobileapi/login")
    sendf(res, "mobileapi/login.js");
}).listen(port);

function sendf(res, file) {
  res.write(fs.readFileSync(__dirname + "/" + file));
  res.end();
}
