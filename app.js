const url = require("url") 
const http = require("http") 
const port = 10000
const fs = require("fs") 
const { MongoClient, ServerApiVersion } = require('mongodb');
const process = require("process")
const uri = process.env.MONGO_URI
let sessions = {}


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server    (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}
process.on("SIGINT", async function() {
    await client.close()
    console.log("\nClosing MongoDB connection!")
    process.exit();
})
           

async function GetUserData(username) {
    let userData = await client.db("WarriorBloxDB").collection("users").findOne({UserName: username})
    return userData
}

function str(i) { 
  return String(i)
}
http.createServer(async function(req, res) {
    const urlpath = url.parse(req.url, true) 
    const parsedpath = urlpath.path
    let query = urlpath.query
    const path = parsedpath.split("?")[0]
    if (path.charAt(path.length - 1) == "?") {
        query = parsedpath.split("?")[1].replace("?", "")
    }
    console.log("Method requested: " + req.method + ", with endpoint " + path + "with query" + str(urlpath.search));
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
        // other sfuff that work both in 2014 and 2015
        } else if (path == "/other/bc.png") {
            sendf(res, "assets/bc.png");
            res.end();
        } else if (path == "/mobile-app-upgrades") {
            sendf(res, "other/mobile-app-upgrades.html");
        }
    }
    if (req.method == "POST") {
      let body = "";

      req.on('data', (chunk) => {
        body + chunk.toString();
      });

      req.on('end', () => {
        console.log("Recieved POSt body data:", body);

        try {
          const postJ = JSON.parse(body);
          console.log("Parsed post JSON:", postJ);

          res.writeHead(200, { "Content-Type": 'application/JSON' });
          res.end(JSON.stringify({ message: 'Recieved successfully', yourData: postData }));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "text/Plain" });
          res.write("Error: bad JSON")
          res.end();
        }
      });
        if (path == "/mobileapi/login") {
          const userData = await GetUserData("WBtest");
                let finishedData = {
                    Status: "",
                    UserInfo: ""
                }
                console.log(userData);
                if ((userData != null && userData.UserPassword != null) && userData.UserPassword == "testpass") {
            if (userData.IsBanned == false) {
                    finishedData.Status = "OK"
                    finishedData.UserInfo = userData;
                    console.log(JSON.stringify(finishedData))
            const isSecure = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https';
            res.writeHead(200, {'Set-Cookie': "username=" + userData.SecurityToken + "; SameSite=Strict" + isSecure ? "; Secure" : ""});
            delete userData.UserPassword
                delete userData.SecurityToken
                    res.write(JSON.stringify(finishedData))
            sessions[req.connection.remoteAddress.replaceAll(".", "") + "-" + req.headers["cf-ipcountry"]] = { UserName: userData.UserName, UserID: userData.UserID };
                    res.end();
            } else {
            delete userData.UserPassword
                delete userData.SecurityToken
            finishedData.Status = "InvalidPassword"
            finishedData.UserInfo = userData;
            res.end();
            }
                } else {
                    finishedData.Status = "InvalidPassword"
                    res.write(JSON.stringify(finishedData));
                    res.end();
                }
          res.write(JSON.stringify(userData));
          res.end();
        }
    } else {
      res.statusCode = 404;
      res.write('Not found.')
      res.end();
    }
}).listen(port);

function sendf(res, file) {
    res.write(fs.readFileSync(__dirname + "/" + file));
    res.end();
}

run().catch(console.dir);
