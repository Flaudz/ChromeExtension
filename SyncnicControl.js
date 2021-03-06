let hadPaused = false;
chrome.runtime.onMessage.addListener(function (requset, sender, sendResponse){
    // Name - Syncnic / Nicsync
    if(requset == "check" ){
        if(localStorage.getItem('IsHost') == null){
            sendResponse(`false`);
        }
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
        fetch(`https://syncnic.nico936d.aspitcloud.dk/api/write/PostSession.php?MovieUrl=${window.location.href}&TimeStamp=0&Paused=1&pauseTime=0.5&PassCode=${string}`)
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
                    window.location.assign(`https://${url}`);
                }
            })
        }
    } // Joins a session
});

const d = new Date();
setTimeout(function (){
    setInterval(function(){
        if(localStorage.getItem('IsHost') == "true"){
            let videoPlayer = document.querySelector('video');
            if(videoPlayer != null){
                
                if(window.location.href.includes("netflix.com")){

                    videoPlayer.addEventListener('seeked', e =>{
                        UpdatePause(1);
                        UpdatePauseTime(videoPlayer.currentTime+1);
                        UpdateTimeStamp(videoPlayer.currentTime);
                    })
                }
            }
        }

        if(localStorage.getItem('IsHost') != null && localStorage.getItem('IsHost') != ""){
            if(window.location.href.includes('netflix.com')){
                ControlGuestNetflix();
            }
            else if(window.location.href.includes('://viaplay')){
                ControlGuestViaplay();
            }
        }
    
    },100);
}, 1000-d.getMilliseconds());

// Play

// Netflix
function ControlGuestNetflix(){
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/post/read.php?passCode=${localStorage.getItem('videoPassCode')}`)
    .then((result) =>{return result.text();})
    .then((content) =>{
        content = JSON.parse(content);

        const videoPlayer = document.querySelector('video');
        if(videoPlayer != null ){
            let pauseDate;

            if(!hadPaused){
                if(content.data[0].timeToPause > videoPlayer.currentTime){
                    let pauseTime = (content.data[0].timeToPause - videoPlayer.currentTime) * 1000;
                    setTimeout(() => {
                        videoPlayer.pause();
                        hadPaused = true;
                    }, pauseTime);
                }
            }

            if(content.data[0].date != null){
                pauseDate = new Date(Date.parse(content.data[0].date.replace(/[-]/g, '/')));

                if(content.data[0].paused == 1){
                    
                    if(content.data[0].timeToPause > videoPlayer.currentTime){
                        let pauseTime = (content.data[0].timeToPause - videoPlayer.currentTime) * 1000;
                        setTimeout(() => {
                            videoPlayer.pause();
                        }, pauseTime);
                    }

                }
                else{
                    if(new Date() < pauseDate){
                        const timeBeforePlay = Math.abs((pauseDate.getTime() - new Date().getTime()) / 1000);
                        setTimeout(function(){
                            videoPlayer.play();
                        }, timeBeforePlay*1000);
                    }
                }
            }
            
            if(videoPlayer.paused && Number(content.data[0].timeStamp)+5 < videoPlayer.currentTime || Number(content.data[0].timeStamp)-5 > videoPlayer.currentTime){
                let url = content.data[0].movieUrl;
                url = url.replace('/', '');
                url = url.replace('https:/', '');
                setTimeout(() => {
                    window.location.assign(`https://${url}&t=${Number(content.data[0].timeStamp)-0.03}`);
                    
                }, 200);
            }
        }
    })
}

// Viaplay
function ControlGuestViaplay(){
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
        }
    })
}

// Update information
function UpdatePause(paused){
    const videoPlayer = document.querySelector('video');
    if(paused == 1 && videoPlayer != null && window.location.href.includes("netflix.com")){
        UpdateTimeStamp(videoPlayer.currentTime+1);
        const pauseTime = videoPlayer.currentTime+1;
        fetch(`https://syncnic.nico936d.aspitcloud.dk/api/update/update.php?passCode=${localStorage.getItem('videoPassCode')}&pauseTime=${pauseTime}`)
        .then((result) =>{return result.text();})
        .then((content) =>{
        })
    }
    
    const timePlus = 2;
    let d = new Date();
    d.setSeconds(d.getSeconds() + timePlus); // Adds the extra time before fire
    d.setHours(d.getHours() +2);

    let sqlDate = d.toISOString().slice(0, 19).replace('T', ' ');
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/update/update.php?passCode=${localStorage.getItem('videoPassCode')}&paused=${paused}&date=${sqlDate}`)
        .then((result) =>{return result.text();})
        .then((content) =>{
        })
    
}

// Updates the timestamp the video is on
function UpdateTimeStamp(timeStamp){
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/update/update.php?passCode=${localStorage.getItem('videoPassCode')}&timeStamp=${timeStamp}`)
    .then((result) =>{return result.text();})
    .then((content) =>{
    })
}

function UpdatePauseTime(pauseTime){
    fetch(`https://syncnic.nico936d.aspitcloud.dk/api/update/update.php?passCode=${localStorage.getItem('videoPassCode')}&pauseTime=${pauseTime}`)
    .then((result) =>{return result.text();})
    .then((content) =>{
    })
}


/*
    Checks the login.
    If the session does not exist in the database, it will deletes the session information from the browser.
*/
setTimeout(() => {
    if(localStorage.getItem('IsHost') != null){
        fetch(`https://syncnic.nico936d.aspitcloud.dk/api/post/read.php?passCode=${localStorage.getItem('videoPassCode')}`)
        .then((result) =>{return result.text();})
        .then((content) =>{
            if(content.includes('No Posts Found')){
                localStorage.removeItem('IsHost');
                localStorage.removeItem('videoPassCode');
            }
        })
    }
}, 1000);