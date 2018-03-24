const imap = require("imap");
const fs = require("fs");

const configFile = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf8"}));

let schoolMail = new imap(configFile.email);

schoolMail.once("ready", () => {
    console.log("Connected");
    schoolMail.openBox("INBOX", true, (err, box) => {
        if (err) console.log(err);
        schoolMail.search(["UNSEEN"], (err, results) => {
            console.log(`There are ${results.length} unread messages`)
            schoolMail.end();
        });
    });
});

schoolMail.once('error', (err) => {
  console.log(err);
});

schoolMail.once('end', () => {
  console.log('Connection ended');
});

schoolMail.connect();
