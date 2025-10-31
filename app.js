const url = require("url") 
const http = require("http") 
const port = 10000
const fs = require("fs") 

let userData = {
    "Status": "OK",
    "UserInfo": {
        "UserName": "test123",
        "UserPassword": "123",
        "UserID": 1,
        "RobuxBalance": 150,
        "TicketsBalance": 12000,
        "IsAnyBuildersClubMember": true,
        "ThumbnailUrl": "https://14blox.strangled.net/getUserAvatarImage?userId=1"
    }
}

http.createServer(function(req, res) {
    const urlpath = url.parse(req.url, true) 
    const parsedpath = urlpath.path
    const query = urlpath.query
    const path = parsedpath.split("?")[0]
    if (path.charAt(path.length - 1) == "?") {
        query = parsedpath.split("?")[1].replace("?", "")
    }
    console.log("Method requested: " + req.method + ", with endpoint " + path);
    if (req.method == "GET") {
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
        // 2015 trash sfuff
        } else if (path == "/home") {
            sendf(res, "2015/home.html");
        }
        // other sfuff that work both in 2014 and 2015
        } else if (path == "/other/bc.png") {
            sendf(res, "assets/bc.png");
            res.end();
        } else if (path == "/mobile-app-upgrades") {
            sendf(res, "games/mobile-app-upgrades.html");
        }
    }
    if (req.method == "POST") {
        if (path == "/mobileapi/login") {
            res.write(JSON.stringify(userData));
            res.end();
        }
    }
}).listen(port);

function sendf(res, file) {
    res.write(fs.readFileSync(__dirname + "/" + file));
    res.end();
}
