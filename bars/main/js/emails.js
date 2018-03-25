/**********
*   Imports
**********/
const imap = require("imap");
const fs = require("fs");

/**********
*   Globals
**********/
// Configuration file
const configFile = JSON.parse(fs.readFileSync("./userConfig.json", {encoding: "utf8"}));
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
// If the connection state has changed the color of the connection dot will be changed
function updateConnectionState() {
    if (connected != previous.connected) {
        // Inverts the classes
        let states = connected == false ? ["disconnected", "connected"] : ["connected", "disconnected"];
        emailConnectionDot.classList.add(states[0]);
        emailConnectionDot.classList.remove(states[1]);
    }
}

// Updates the unread email count
function updateUnreadEmailCount(unreadEmails) {
    if (unreadEmails != previous.unreadEmails) {
        // Ensures proper English is used
        const unreadEmailString = ((unreadEmails == 0) ? "no unread emails" : (
            (unreadEmails == 1) ? "1 unread email" : `${unreadEmails} unread emails`
        ));
        unreadEmailCount.innerHTML = unreadEmailString;
        previous.unreadEmails = unreadEmailCount;
    }
}

// Creates and appends an email preview
function addEmailPreview(emailId, sender, subject) {
    // Makes sure that there's no duplicates in the list
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

// Removes the email preview of a certain email
function removeEmailPreview(emailId) {
    if (emailId != undefined) {
        let emailPosition = previewedEmailIds.indexOf(emailId);
        emailPreviews.removeChild(emailPreviews.children[emailPosition]);
        previewedEmailIds.splice(emailPosition, 1);
    }
}

/******************
*   Email functions
******************/
// Checks the amount of unread emails on the server, and adds them to the preview list
function checkUnread() {
    if (connected) {
        account.search(["UNSEEN"], (err, unreadEmails) => {
            if (JSON.stringify(unreadEmails) != JSON.stringify(previous.unreadEmails)) {
                const unreadEmailCount = unreadEmails.length;
                let emailId = undefined;
                // Update the count
                updateUnreadEmailCount(unreadEmailCount);
                // Preview the emails
                for (emailId of unreadEmails) {
                    getEmail(emailId);
                }
                // Remove read emails
                for (emailId of previewedEmailIds) {
                    if (unreadEmails.indexOf(emailId) == -1) {
                        removeEmailPreview(emailId);
                    }
                }
                previous.unreadEmails = unreadEmails;
            }
        });
    }
}

// Gets the sender and subject of an email
function getEmail(emailId) {
    if (emailId != undefined && emailId != previous.lastEmailFetched && previewedEmailIds.indexOf(emailId) == -1) {
        // Creates the request to the server
        const emailRequest = account.fetch(emailId, {bodies: "HEADER.FIELDS (FROM SUBJECT)"});
        // A message object is returned from the server
        emailRequest.on("message", (msg) => {
            // Stream returned by server
            msg.on("body", (stream) => {
                let message = "";
                // Data send from stream
                stream.on("data", (chunk) => {
                    message += chunk.toString("utf8");
                });
                // Stream finished
                stream.once("end", () => {
                    sender = /From: (.+) </.exec(message)[1];
                    subject = /Subject: ([\S\s]+)/.exec(message)[1];
                    // Preview the email
                    addEmailPreview(emailId, sender, subject);
                });
            });
        });
        previous.lastEmailFetched = emailId;
    }
}

/*********************
*   Interval functions
*********************/
// Function run every second, which calls other functions
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

// Changes the connection state and changes the previous state to reflect it
function changeConnectionState(newState) {
    [connected, previous.connected] = newState == "connected" ? [true, false] : [false, true];
}

// Connect to the account
account.connect();
