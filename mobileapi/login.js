
func processLogin(body) {
    const udata = body.split("&")
    const uname = udata[0].split("=")[1]
    const upass = udata[1].split("=")[1]
    let userData = {
        "Status": "OK",
        "UserInfo": {
            "UserName": uname,
            "UserPassword": upass,
            "UserID": 1,
            "RobuxBalance": 150,
            "TicketsBalance": 12000,
            "IsAnyBuildersClubMember": true,
            "ThumbnailUrl": "https://14blox.strangled.net/getUserAvatarImage?userId=1"
        }
    }
}
return JSON.stringify(userData)
