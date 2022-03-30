// Start state
let NetflixSessionBtnSection = document.querySelector("#NetflixSessionBtnSection");
let CreateNetflixBtn = document.querySelector("#create_netflix_lobby");
let JoinNetflixBtn = document.querySelector("#want_join_netflix_lobby");

// Join State
let JoinSection = document.querySelector("#TypeInPassCode");
let JoinSessionBtn = document.querySelector("#join_session_netflix");

// Passcode state
let PassCodeSection = document.querySelector("#NetflixWatchPassCode");
let PasscodeText = document.querySelector("#passCodeText");
let LeaveSessionBtn = document.querySelector("#LeaveSessionNetflix");

// Control section
let playBtn = document.querySelector("#playbtnController");
let pauseBtn = document.querySelector("#pausebtnController");


document.addEventListener('DOMContentLoaded', function (){

    chrome.tabs.query({currentWindow: true, active: true},
        function (tabs){
            chrome.tabs.sendMessage(tabs[0].id, "check", CheckLogin);
        })

    CreateNetflixBtn.addEventListener('click', CreateLobby, false);
    JoinNetflixBtn.addEventListener('click', ChangeToJoinLobby, false);
    JoinSessionBtn.addEventListener('click', JoinLobby, false);
    LeaveSessionBtn.addEventListener('click', LeaveSession, false);

    // Netflix Video Controller events
    playBtn.addEventListener('click', Play, false);
    pauseBtn.addEventListener('click', Pause, false);

    function CreateLobby(){
        let id;
        id = Math.floor(Math.random() * 10).toString();
        id += Math.floor(Math.random() * 10).toString();
        id += Math.floor(Math.random() * 10).toString();
        id += Math.floor(Math.random() * 10).toString();
        id += Math.floor(Math.random() * 10).toString();
        id += Math.floor(Math.random() * 10).toString();
        fetch(`https://netflixdata.nico936d.aspitcloud.dk/api/post/read.php?passCode=${id}`)
        .then((result) =>{return result.text();})
        .then((content) =>{
            if(content.includes("No Posts Found")){
                sendMessage("post", id);
                NetflixSessionBtnSection.style.display = 'none';
                PassCodeSection.style.display = 'block';
                PasscodeText.textContent = id;
            }
            else{
                CreateLobby();
            }
        })
    }   
})



function JoinLobby(){
    const id = document.getElementById("JoinIdNetflix").value;
    if(id != ""){

        fetch(`https://netflixdata.nico936d.aspitcloud.dk/api/post/read.php?passCode=${id}`)
        .then((result) =>{return result.text();})
        .then((content) =>{
            if(!content.includes("No Posts Found")){
                sendMessage("join", id);
                NetflixSessionBtnSection.classList.add("DisabledSection");
                NetflixSessionBtnSection.classList.remove("NetflixSessionBtnSection");
                PassCodeSection.classList.remove("DisabledSection");
                PasscodeText.textContent = id;
            }
        })
    }
}

function CheckLogin(res){
    let response = "";
    response +=res;

    if(response.includes("true")){
        response = response.replace("true","");
        console.log(response);
        JoinSection.classList.add("DisabledSection");
        NetflixSessionBtnSection.classList.add("DisabledSection");
        NetflixSessionBtnSection.classList.remove("NetflixSessionBtnSection");
        PassCodeSection.classList.remove("DisabledSection");
        PasscodeText.textContent = response;
    }
}

function LeaveSession(){
    chrome.tabs.query({currentWindow: true, active: true},
    function (tabs){
        chrome.tabs.sendMessage(tabs[0].id, "leave", CheckLogin);
    })
    ChangeToStart();
}

// Video controller
function Play(){
    sendMessage("Play", "");
}
function Pause(){
    sendMessage("Pause", "");
}

function sendMessage(message, id){
    chrome.tabs.query({currentWindow: true, active: true},
    function (tabs){
        chrome.tabs.sendMessage(tabs[0].id, message +id);
    })
}

function ChangeToStart(){
    NetflixSessionBtnSection.classList.add("NetflixSessionBtnSection");
    NetflixSessionBtnSection.classList.remove("DisabledSection");
    JoinSection.classList.remove("TypeInPassCodeSection");
    JoinSection.classList.add("DisabledSection");
    PassCodeSection.classList.add("DisabledSection");
}

function ChangeToJoinLobby(){
    NetflixSessionBtnSection.classList.add("DisabledSection");
    NetflixSessionBtnSection.classList.remove("NetflixSessionBtnSection");
    PassCodeSection.classList.add("DisabledSection");
    JoinSection.classList.remove("DisabledSection");
    JoinSection.classList.add("TypeInPassCodeSection");
}