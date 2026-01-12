const url = require("url") 
const http = require("http") 
const port = 10000
const fs = require("fs") 
const { MongoClient, ServerApiVersion } = require('mongodb');
const process = require("process")
const uri = process.env.MONGO_URI


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
    } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
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

http.createServer(async function(req, res) {
    const urlpath = url.parse(req.url, true) 
    const parsedpath = urlpath.path
    let query = urlpath.query
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
        // other sfuff that work both in 2014 and 2015
        } else if (path == "/other/bc.png") {
            sendf(res, "assets/bc.png");
            res.end();
        } else if (path == "/mobile-app-upgrades") {
            sendf(res, "other/mobile-app-upgrades.html");
        }
    }
    if (req.method == "POST") {
        if (path == "/mobileapi/login") {
          let userData = GetUserData("WBtest");
          res.write(JSON.stringify(userData));
        }
    }
}).listen(port);

function sendf(res, file) {
    res.write(fs.readFileSync(__dirname + "/" + file));
    res.end();
}

run().catch(console.dir);
