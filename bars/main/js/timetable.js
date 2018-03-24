/**********
*   Imports
**********/
const ntlm = require("httpntlm");

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
        console.log(res.body);
    });
}
