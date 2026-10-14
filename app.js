const url = require("url");
const http = require("http");
const port = process.env.PORT || 10000;
const fs = require("fs");
const pathModule = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');
const process = require("process");
const uri = process.env.MONGO_URI;

let sessions = {};
const DAILY_CHECK_INTERVAL = 60 * 60 * 24 * 1000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

function str(i) { 
  return String(i);
}

function confirmSessionExists(sessionId) {
    return Boolean(sessions[sessionId]);
}

async function gToken(username) {
    const sectoken = Buffer.from(username + "." + Math.floor(Math.random() * 99999)).toString('base64');
    await db.collection("users").updateOne({ UserName: username }, {$set: {SecurityToken: sectoken}});
    return sectoken;
}

async function GetUserData(username) {
    return await db.collection("users").findOne({ UserName: username });
}

function sendf(res, filePath, contentType = "text/html") {
    const fullPath = pathModule.join(__dirname, filePath);
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
}

async function startServer() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    
    db = client.db("WarriorBloxDB");

    setInterval(async function() {
        try {
            await db.collection("users").updateMany({}, {"$inc": {"TicketsBalance": 1}});
            console.log("Incremented all users tickets");
        } catch (err) {
            console.error("Error in daily interval:", err);
        }
    }, DAILY_CHECK_INTERVAL);

    http.createServer(async function(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        
        console.log("Method requested: " + req.method + ", endpoint: " + pathname);

        if (req.method == "GET") {
            if (pathname == "/") {
                sendf(res, "index.html", "text/html");
            } else if (pathname == "/status") {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("i am... good and healthy :D");
            } else if (pathname == "/games/list") {
                sendf(res, "games/list.html", "text/html");
            } else if (pathname == "/assets/logo.png" || pathname == "/games/logo.png") {
                sendf(res, "assets/logo.png", "image/png");
            } else if (pathname == "/style.css" || pathname == "/games/style.css") {
                sendf(res, "assets/style.css", "text/css");
            } else if (pathname == "/games/thumbnail1.jpg") {
                sendf(res, "assets/thumbnail1.jpg", "image/jpeg");
            } else if (pathname == "/games/start") {
                sendf(res, "games/start.html", "text/html");
            } else if (pathname == "/home") {
                sendf(res, "2015/home.html", "text/html");
            } else if (pathname == "/other/bc.png") {
                sendf(res, "assets/bc.png", "image/png");
            } else if (pathname == "/mobile-app-upgrades") {
                sendf(res, "other/mobile-app-upgrades.html", "text/html");
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
            }
        } else if (req.method == "POST") {
            let body = "";
            req.on("data", function(chunk) {
                body += chunk;
            });

            req.on("end", async function() {
                const clientIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || "").replace(/\./g, "");
                const ipCountry = req.headers["cf-ipcountry"] || "US";
                const sessionKey = `${clientIp}-${ipCountry}`;

                if (pathname == "/mobileapi/login") {
                    if (confirmSessionExists(sessionKey)) {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ Status: "AlreadyLoggedIn", Message: "You are already logged in, sir." }));
                    }

                    if (!body) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ Status: 'MissingRequiredField' }));
                    }

                    const params = new URLSearchParams(body);
                    const username = params.get("username") || body.split("&")[0]?.split("=")[1];
                    const userpass = params.get("password") || body.split("&")[1]?.split("=")[1];

                    const userData = await GetUserData(username);

                    if (userData && userData.UserPassword === userpass) {
                        if (!userData.IsBanned) {
                            const token = await gToken(username);
                            userData.SecurityToken = token;

                            let finishedData = {
                                Status: "OK",
                                UserInfo: userData
                            };

                            sessions[sessionKey] = { UserName: userData.UserName, UserID: userData.UserID };
                            
                            const isSecure = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https';
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Set-Cookie': `username=${token}; Path=/; SameSite=Strict${isSecure ? '; Secure' : ''}`
                            });
                            res.end(JSON.stringify(finishedData));
                        } else {
                            res.writeHead(403, { "Content-Type": "text/plain" });
                            res.end("You're banned from WarriorBlox! Please go to the Discord server and appeal.");
                        }
                    } else {
                        res.writeHead(401, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ Status: "InvalidPassword" }));
                    }
                } else if (pathname == "/mobileapi/signup" || pathname == "/mobileapi/securesignup") {
                    try {
                        const params = new URLSearchParams(body);
                        const username = params.get("username") || body.split("&")[0]?.split("=")[1];
                        const userpass = params.get("password") || body.split("&")[1]?.split("=")[1];

                        if (!username || !userpass) {
                            res.writeHead(400, { "Content-Type": "application/json" });
                            return res.end(JSON.stringify({ Status: "MissingFields" }));
                        }

                        let userCount = await db.collection("users").countDocuments({});
                        let now = new Date();
                        let token = await gToken(username);

                        let userData = {
                            UserName: username,
                            UserPassword: userpass,
                            UserID: userCount + 1,
                            RobuxBalance: 0,
                            TicketsBalance: 10,
                            IsAnyBuildersClubMember: false,
                            ThumbnailUrl: "https://14blox.strangled.net/getUserAvatarImage?userId=1",
                            IsBanned: false,
                            SecurityToken: token,
                            lastDailyAward: now,
                            UserBio: "This is the default WB bio!",
                            joinDate: now,
                            UserBadges: []
                        };

                        await db.collection("users").insertOne(userData);
                        sessions[sessionKey] = { UserName: userData.UserName, UserID: userData.UserID };

                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ Status: 'OK', UserInfo: userData }));
                    } catch(err) {
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end("Error -> " + err.message);
                    }
                } else if (pathname == "/mobileapi/logout") {
                    sessions[sessionKey] = undefined;
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ Status: 'OK' }));
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end();
                }
            });
        }
    }).listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

  } catch(err) {
    console.error("Failed to connect to MongoDB: ", err);
    process.exit(1);
  }
}

process.on("SIGINT", async function() {
    if (client) {
        await client.close();
        console.log("\nClosing MongoDB connection!");
    }
    process.exit(0);
});

startServer();
