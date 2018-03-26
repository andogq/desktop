/**********
*   Imports
**********/
const ntlm = require("httpntlm");
const fs = require("fs");

/**********
*   Globals
**********/
// Holds the timetable
let timetable = [];
// Holds the ID of the current and pervious period
let currentPeriod;
let previousPeriod;
// Clears odd things from class names
const cleanRegex = /^\d+ *| \([\s\S]+\)| Block \d[\s\S]+$| Cert[\s\S]+$/g;

const configFile = JSON.parse(fs.readFileSync("./userConfig.json", {encoding: "utf8"}));

/*************
*   Global DOM
*************/
const timetableView = document.getElementById("timetableView");

/*****************
*   Date functions
*****************/
// Converts a normal date into one that suits SIMON. Defaults to today
function generateSelectedDate(date) {
    // Date() only accepts mm/dd/yyyy, so convert dd/mm to mm/dd
    date = date == undefined ? new Date() : new Date(date.replace(/(\d+)\/(\d+)/, "$2/$1"));
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

/****************
*   DOM Functions
****************/
// Takes a timetable and displays it in the timetable view. If noTimetable == true then it'll just say no classes
function loadTimetable(timetable, noTimetable) {
    if (noTimetable) {
        let note = document.createElement("h5");
        note.innerHTML = "no classes today";

        timetableView.appendChild(note);
    } else {
        for (period of timetable.periods) {
            let periodContainer = document.createElement("div");
            periodContainer.classList.add("timetableRow");

            let periodClass = document.createElement("h5");
            periodClass.classList.add("timetableClass");
            periodClass.innerHTML = period.class.toLowerCase();

            let periodRoom = document.createElement("h5");
            periodRoom.classList.add("timetableRoom");
            periodRoom.innerHTML = period.room.toLowerCase();

            periodContainer.appendChild(periodClass);
            periodContainer.appendChild(periodRoom);

            timetableView.appendChild(periodContainer);
        }
    }
}

// Changes the highlighted period to the current period
function changePeriod() {
    if (previousPeriod != undefined && previousPeriod != -1) {
        console.log("Here")
        timetableView.children[previousPeriod].classList.remove("currentPeriod");
    }
    timetableView.children[currentPeriod].classList.add("currentPeriod");
}

/**********************
*   Timetable functions
**********************/
// Takes raw data and turns it into the timetable object then loads it into the object
function parseTimetable(data) {
    data = JSON.parse(data).d;
    if (data.Periods.length == 0) {
        loadTimetable("", true);
    } else {
        timetable.periods = [];

        for (period of data.Periods) {
            timetable.periods.push({
                start: period.StartTime,
                end: period.EndTime,
                class: period.Classes[0].Description == null ? "" : period.Classes[0].Description.replace(cleanRegex, ""),
                room: period.Classes[0].Room == null ? "" : period.Classes[0].Room
            });
        }

        loadTimetable(timetable);
    }
}

// Returns the current period based on what time it is and the start and ends of the period
function findCurrentPeriod() {
    let todayTime = Date.parse(`1/1/2001 ${new Date().getHours()}:${new Date().getMinutes()}`);
    for (periodId in timetable.periods) {
        let startTime = Date.parse(`1/1/2001 ${timetable.periods[periodId].start}`);
        let endTime = Date.parse(`1/1/2001 ${timetable.periods[periodId].end}`);
        if (startTime <= todayTime && endTime >= todayTime) {
            return periodId;
        }
    }
    return -1;
}

// Checks if the period has changed
function checkCurrentPeriod() {
    previousPeriod = currentPeriod;
    currentPeriod = findCurrentPeriod();
    if (currentPeriod != -1 && currentPeriod != previousPeriod) {
        changePeriod();
    }
}

/*********************
*   Interval functions
*********************/
// Function run every second
function intervalFunction() {
    checkCurrentPeriod();
}
setInterval(intervalFunction, 1000);

setInterval(getTimetable, 3600000);

/********************
*   Request functions
********************/
// Requests a timetable for a certain date, defaulting to today
function getTimetable(date) {
    // Data required for the SIMON server
    const data = JSON.stringify({
        selectedDate: generateSelectedDate(date),
        selectedGroup: null
    });

    ntlm.post({
        url: `http://${configFile.simon.url}/Default.asmx/GetTimetable?${new Date().getTime()}`,
        username: configFile.simon.username,
        password: configFile.simon.password,
        body: data,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json; charset=utf-8"
        }
    }, (err, res) => {
        if (err) console.log(err);
        parseTimetable(res.body);
    });
}

module.exports.init = getTimetable;
