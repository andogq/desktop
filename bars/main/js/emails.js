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
// Holds the previous variables, so they can be checked that they're different as to not slow down DOM
let previous = {};
// Has all the IDs of the emails already in the preview
let previewedEmailIds = [];

/*************
*   Global DOM
*************/
const emailConnectionDot = document.getElementById("emailConnectionDot");
const unreadEmailCount = document.getElementById("unreadEmailCount");
const emailPreviews = document.getElementById("emailPreviews");

/****************
*   DOM Functions
****************/
function updateConnectionState() {
    if (connected != previous.connected) {
        let states = connected == false ? ["disconnected", "connected"] : ["connected", "disconnected"];
        emailConnectionDot.classList.add(states[0]);
        emailConnectionDot.classList.remove(states[1]);
    }
}

function updateUnreadEmailCount(unreadEmails) {
    const unreadEmailString = ((unreadEmails == 0) ? "No unread emails" : (
        (unreadEmails == 1) ? "1 unread email" : `${unreadEmails} unread emails`
    ));
    unreadEmailCount.innerHTML = unreadEmailString;
}

function addEmailPreview(emailId, sender, subject) {
    if (previewedEmailIds.indexOf(emailId) == -1) {
        let container = document.createElement("div");
        container.classList.add("email");

        let senderElement = document.createElement("h4");
        senderElement.classList.add("emailSender");
        senderElement.innerHTML = sender;
        container.appendChild(senderElement);

        let subjectElement = document.createElement("h5");
        subjectElement.classList.add("emailSubject");
        subjectElement.innerHTML = subject;
        container.appendChild(subjectElement);

        emailPreviews.appendChild(container);

        previewedEmailIds.push(emailId);
    }
}

/******************
*   Email functions
******************/
function checkUnread() {
    if (connected) {
        account.search(["UNSEEN"], (err, emails) => {
            const unreadEmails = emails.length;
            if (unreadEmails > 0) {
                updateUnreadEmailCount(unreadEmails);
                for (emailId of emails) {
                    getEmail(emailId);
                }
            }
        });
    }
}

function getEmail(emailId) {
    const emailRequest = account.fetch(emailId, {bodies: "HEADER.FIELDS (FROM SUBJECT)"});
    emailRequest.on("message", (msg) => {
        msg.on("body", (stream) => {
            let message = "";
            stream.on("data", (chunk) => {
                message += chunk.toString("utf8");
            });
            stream.once("end", () => {
                [sender, subject] = message.split("\n");
                sender = /From: (.+) </.exec(sender)[1];
                subject = /Subject: (.+)/.exec(subject)[1];

                addEmailPreview(emailId, sender, subject);
            });
        });
    });
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
        changeConnectionState("connected");
        // Ready to do functions
    });
});

// Connection end handler
account.once('end', () => {
  changeConnectionState("disconnected");
});

// Error handler
account.once('error', (err) => {
    console.log(err);
});

function changeConnectionState(newState) {
    [connected, previous.connected] = newState == "connected" ? [true, false] : [false, true];
}

// Connect to the account
account.connect();
