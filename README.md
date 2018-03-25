# Node.js desktop

An alternate desktop built off Node.js and an Electron.

---

## Features

 - Unread email count and preview
 - SIMON timetable integration
 - Random net animation in background
 - Customizable color schemes

---

## Planned features (todo)
 - Evernote todo list integration
 - SIMON assessment checker
 - Weather
 - Calendar

---

## Configuration files

There are some files that need to be created in order for certain things to work.

---

### `/userConfig.json`

This file contains the details for connecting to services.

```
{
    "email": {
        "user": "email address",
        "password": "password",
        "host": "server url",
        "port": "server port",
        "tls": "tls support"
    },
    "simon": {
        "url": "simon url",
        "username": "username",
        "password": "password"
    }
}

```

---

### `/colors.json`

This file outlines all the colors and names that they are associated with. These names can be used in `index.html`. There is no limit to the amount of colors that can be used.

```
{
    "colorName": "colorValue"
}
```
