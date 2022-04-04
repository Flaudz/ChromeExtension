chrome.runtime.onMessage.addListener(function (requset, sender, sendResponse){
    // Name - Syncnic / Nicsync
    if(requset == "check" ){
        if(localStorage.getItem('IsHost') == null)
            sendResponse(`false`);
            else 
            sendResponse(`true${localStorage.getItem('videoPassCode')}`);
        return;
    }

    if(requset == "leave"){
        if(localStorage.getItem('IsHost') == "true"){
            fetch(`https://syncnic.nico936d.aspitcloud.dk/api/remove/remove.php?passCode=${localStorage.getItem('videoPassCode')}`)
            .then((result) =>{return result.text();})
            .then((content) =>{
            })
        }
        localStorage.removeItem('videoPassCode');
        localStorage.removeItem('IsHost');
    }

    switch(requset){
        case "Play":
            UpdatePause(0);
            break;
        case "Pause":
            UpdatePause(1);
            break;
    }

    let string ="";
    string +=requset;
    if(string.includes("post")){
        string = string.replace("post", ""); 
        localStorage.setItem('videoPassCode',string); // Saves passcode to lobby
        localStorage.setItem('IsHost', true);
        fetch(`https://syncnic.nico936d.aspitcloud.dk/api/write/PostSession.php?MovieUrl=${window.location.href}&TimeStamp=0&Paused=1&PassCode=${string}`)
        .then((result) =>{return result.text();})
        .then((content) =>{
        })
    } // Creates a session
    else if(string.includes("join")){
        string = string.replace("join", "");
        if(string.length != 0){
            fetch(`https://syncnic.nico936d.aspitcloud.dk/api/post/read.php?passCode=${string}`)
            .then((result) =>{return result.text();})
            .then((content) =>{
                if(!content.includes("No Posts Found")){
                    content = JSON.parse(content);
                    localStorage.setItem('videoPassCode', string);
                    localStorage.setItem('IsHost', false);
                    let url = content.data[0].movieUrl;
                    url = url.replace('/', '');
                    url = url.replace('https:/', '');
                    window.location.assign(`https://${url}&t=${content.data[0].timeStamp}`);
                }
            })
        }
    } // Joins a session
});

const d = new Date();
setTimeout(function (){
    setInterval(function(){
        if(localStorage.getItem('IsHost') == "false" && localStorage.getItem('IsHost') != null){
            if(window.location.href.includes('netflix.com')){
                ControlGuestNetflix();
            }
        }
        else if(localStorage.getItem('IsHost') == "true"){
            let videoPlayer = document.querySelector('video');
            if(videoPlayer != null){
                videoPlayer.addEventListener('seeked', () =>{
                    UpdateTimeStamp(videoPlayer.currentTime);
                    UpdatePause(1);
                })
            }
            
            // Check site to call controll
            if(window.location.href.includes('netflix.com')){
                ControlGuestNetflix();
            }
        }
    
    },100);
}, 1000-d.getMilliseconds());



// Netflix
function ControlGuestNetflix(){
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/post/read.php?passCode=${localStorage.getItem('videoPassCode')}`)
    .then((result) =>{return result.text();})
    .then((content) =>{
        content = JSON.parse(content);

        const videoPlayer = document.querySelector('video');
        if(videoPlayer != null){
            if(content.data[0].paused == 1){
                videoPlayer.pause();
            }
            else{
                videoPlayer.play();
            }
            
            if(videoPlayer.paused && Number(content.data[0].timeStamp)+.09 < videoPlayer.currentTime || Number(content.data[0].timeStamp)-.1 > videoPlayer.currentTime){
                console.log(Number(content.data[0].timeStamp)+0.1);
                let url = content.data[0].movieUrl;
                url = url.replace('/', '');
                url = url.replace('https:/', '');
                window.location.assign(`https://${url}&t=${Number(content.data[0].timeStamp)-0.03}`);
            }
        }
    })
}

// Update information
function UpdatePause(paused){
    console.log(paused);
    if(paused == 1){
        const videoPlayer = document.querySelector('video');
        if(videoPlayer != null){
            UpdateTimeStamp(videoPlayer.currentTime);
        }
    }
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/update/update.php?passCode=${localStorage.getItem('videoPassCode')}&paused=${paused}`)
    .then((result) =>{return result.text();})
    .then((content) =>{
    })
}

function UpdateTimeStamp(timeStamp){
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/update/update.php?passCode=${localStorage.getItem('videoPassCode')}&timeStamp=${timeStamp}`)
    .then((result) =>{return result.text();})
    .then((content) =>{
    })
}