/*********
*   Import
*********/
const path = require("path")

/******************
*   Import function
******************/
function importFile(file) {
    return require(path.resolve(`view/js/${file}`));
}

/********************
*   Importing modules
********************/
const animation = importFile("animation.js");
const time = importFile("time.js");
const optionsMenu = importFile("optionsMenu.js");
const emails = importFile("emails.js");
const timetable = importFile("timetable.js");

/***********************
*   Initialise functions
***********************/
animation.init();
time.init();
emails.init();
timetable.init();
