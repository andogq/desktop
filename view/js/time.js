// Gets and parses the current time
function getCurrentTime() {
    const timeRegex = /(\d+):(\d+)/;
    let time = new Date(Date.now());
    time = timeRegex.exec(time.toTimeString());
    time = [time[1], ":", time[2], ""];
    [time[0], time[3]] = time[0] > 12 ? [time[0] - 12, " pm"] : [time[0], " am"];
    return time.join("");
}

// Loads the time into the element
function loadTime() {
    timeElement.innerText = getCurrentTime();
}

// Time element
const timeElement = document.getElementById("time");

/****************
*   Init function
****************/
function init() {
    loadTime();
    setInterval(() => {
        loadTime();
    }, 1000);
}

/**********
*   Exports
**********/
module.exports.init = init;
