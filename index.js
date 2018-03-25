const electron = require("electron");
const url = require("url");
const fs = require("fs");

// Globals
let screenHeight, screenWidth;
const colors = JSON.parse(fs.readFileSync("colors.json", {encoding: "utf8"}));

// Returns the screen size
function getScreenSize() {
    const screenSize = electron.screen.getPrimaryDisplay().size;
    return [screenSize.height, screenSize.width];
}

// Makes a bar
function makeBar(x, y, height, width, content, directory) {
    const percantageRegex = /(\d+)%/;

    if (height.match(percantageRegex)) {
        height = Math.round(screenHeight * (percantageRegex.exec(height)[1] / 100));
    }
    if (width.match(percantageRegex)) {
        width = Math.round(screenWidth * (percantageRegex.exec(width)[1] / 100));
    }
    if (x.toString().match(percantageRegex)) {
        x = Math.round(screenWidth * (percantageRegex.exec(x)[1] / 100));
    }
    if (y.toString().match(percantageRegex)) {
        y = Math.round(screenHeight * (percantageRegex.exec(y)[1] / 100));
    }

    const windowOptions = {
        width: width,
        height: height,
        x: x,
        y: y,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        frame: false,
        focusable: false
    }

    let win = new electron.BrowserWindow(windowOptions);
    win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(content)}`, {baseURLForDataURL: `file://${__dirname}/bars/${directory}/`});

    return win;
}

// Finds the names of colors and replaces them with the theme color
function replaceColors(file) {
    const colorNames = Object.keys(colors);
    let contents = fs.readFileSync(file, {encoding: "utf8"});

    for (color of colorNames) {
        let regex = new RegExp(`(: |")${color}(;|";)`, "g");
        console.log(`${color}: ${contents.match(regex)}`);
        contents = contents.replace(regex, `$1${colors[color]}$2`);
    }
    return contents;
}

// Loads the bars with their contents
function loadBar() {
    fs.readdir("./bars", (err, files) => {
        for (directory of files) {
            let config = JSON.parse(fs.readFileSync(`./bars/${directory}/config.json`));
            let content = replaceColors(`bars/${directory}/index.html`);
            makeBar(config.position.x, config.position.y, config.dimensions.height, config.dimensions.width, content, directory);
        }
    });
}

electron.app.on("ready", () => {
    [screenHeight, screenWidth] = getScreenSize();

    loadBar();
});
