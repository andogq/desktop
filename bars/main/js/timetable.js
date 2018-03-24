/**********
*   Imports
**********/
const ntlm = require("httpntlm");

/**********
*   Globals
**********/
let timetable = [];
// Clears odd things from class names
const cleanRegex = /^\d+ *| \([\s\S]+\)| Block \d[\s\S]+$| Cert[\s\S]+$/g;

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

/**********************
*   Timetable functions
**********************/
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

/********************
*   Request functions
********************/
// Requests a timetable for a certain date, defaulting to today
function getTimetable(date) {
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

getTimetable("02/05/18");
