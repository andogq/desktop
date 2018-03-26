/**********
*   Globals
**********/
let optionsMenuOpen = false;
let menuClicked = false;

/*************
*   Global DOM
*************/
const time = document.getElementById("time");
const optionsMenu = document.getElementById("optionsMenu");
const optionCloseWindow = document.getElementById("optionCloseWindow");
const optionDevTools = document.getElementById("optionDevTools");
const optionRelaunchWindow = document.getElementById("optionRelaunchWindow");

/****************
*   DOM Functions
****************/
// Toggles the option menu and updates the tracking variable. dontOpen makes sure that it only closes the menu
function toggleOptionsMenu(dontOpen) {
    [optionsMenu.style.top, optionsMenuOpen] = !optionsMenuOpen && dontOpen != true ? ["7%", true] : ["-50%", false];
}

// Closes all the windows and exits
function closeWindow() {
    require("electron").remote.app.exit();
}

// Relaunches the window
function relaunchWindow() {
    require("electron").remote.app.relaunch();
    closeWindow();
}

// Opens developer tools
function openDevTools() {
    require("electron").remote.getCurrentWindow().toggleDevTools();
}

/******************
*   Event Listeners
******************/
time.addEventListener("click", () => {
    menuClicked = true;
    toggleOptionsMenu();
});
optionCloseWindow.addEventListener("click", closeWindow);
optionDevTools.addEventListener("click", openDevTools);
optionRelaunchWindow.addEventListener("click", relaunchWindow);

// Lets the menu close when clicked off
document.addEventListener("click", () => {
    if (!menuClicked) {
        toggleOptionsMenu(true);
    }
    menuClicked = false;
})
optionsMenu.addEventListener("click", () => {
    menuClicked = true;
});
