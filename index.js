/**********
*   Imports
**********/
const electron = require("electron");
const url = require("url");
const fs = require("fs");

/***********
*    Globals
***********/
// To be filled when electron ready
let screenSize;

// Makes the window and loads it with the file
function makeWindow() {
    const windowOptions = {
        width: screenSize.width,
        height: screenSize.height,
        x: 0,
        y: 0,
        // Keeps the window in the background and so the user can't change the size
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        frame: false,
        focusable: false
    }

    // Loads the color scheme and encodes it
    let content = encodeURIComponent(replaceColors(`view/index.html`));

    // Makes the window and loads it
    let win = new electron.BrowserWindow(windowOptions);
    win.loadURL(`data:text/html;charset=UTF-8,${content}`, {baseURLForDataURL: `file://${__dirname}/view/`});
}

// Finds the names of colors and replaces them with the theme color
function replaceColors(file) {
    const colors = JSON.parse(fs.readFileSync("colors.json", {encoding: "utf8"}));
    const colorNames = Object.keys(colors);
    let contents = fs.readFileSync(file, {encoding: "utf8"});

    // Iterate over all the color names and search with a regex
    for (color of colorNames) {
        let regex = new RegExp(`(: |")${color}(;|";)`, "g");
        contents = contents.replace(regex, `$1${colors[color]}$2`);
    }
    return contents;
}

// When electron is ready
electron.app.on("ready", () => {
    // Get the height and width
    screenSize = electron.screen.getPrimaryDisplay().size;

    // Starts the window loading
    makeWindow();
});
