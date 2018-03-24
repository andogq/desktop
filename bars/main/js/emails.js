/**********
*   Imports
**********/
const imap = require("imap");
const fs = require("fs");

/**********
*   Globals
**********/
// Configuration file
const configFile = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf8"}));
// True or false depending on whether there is a connection or not
let connected = false;

/*************
*   Global DOM
*************/
const emailConnectionDot = document.getElementById("emailConnectionDot");
const unreadEmailCount = document.getElementById("unreadEmailCount");

/****************
*   DOM Functions
****************/
function updateConnectionState() {
    let states = connected == false ? ["disconnected", "connected"] : ["connected", "disconnected"];
    emailConnectionDot.classList.add(states[0]);
    emailConnectionDot.classList.remove(states[1]);
}

function updateUnreadEmailCount(unreadEmails) {
    const unreadEmailString = ((unreadEmails == 0) ? "No unread emails" : (
        (unreadEmails == 1) ? "1 unread email" : `${unreadEmails} unread emails`
    ));
    unreadEmailCount.innerHTML = unreadEmailString;
}

/******************
*   Email functions
******************/
function checkUnread() {
    if (connected) {
        account.search(["UNSEEN"], (err, results) => {
            const unreadEmails = results.length;
            if (unreadEmails > 0) {
                console.log(unreadEmails);
                updateUnreadEmailCount(unreadEmails);
            }
        });
    }
}

/*********************
*   Interval functions
*********************/
function intervalFunction() {
    checkUnread();
    updateConnectionState();
}
setInterval(intervalFunction, 1000);

/*************
*   IMAP Setup
*************/
// Make the account object
let account = new imap(configFile.email);

// Connection handler
account.once("ready", () => {
    account.openBox("INBOX", true, (err, box) => {
        console.log("Connected");
        connected = true;
        // Ready to do functions
    });
});

// Connection end handler
account.once('end', () => {
  console.log('Connection ended');
  connected = false;
});

// Error handler
account.once('error', (err) => {
    console.log(err);
});

// Connect to the account
account.connect();
