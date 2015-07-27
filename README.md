# teamspeak-bot

## Functions

**AFK** will move any client idle for more then 2 hours to a specific channel (or default channel).

## Config

```json
{
    "host": "localhost", // Teamspeak server ip/hostname
    "port": 10011, // Teamspeak server port
    "server": 1, // Server id usually 1
    "login": "admin", // ServerQuery login
    "pwd": "password", // ServerQuery password
    "afk": { // afk function
        "channel": 13, // channel id to move afk clients to
        "idle_time": 60 // idle time after client will be move (in minutes) default 60
    }
}
```

## Usage

`npm start` start bot


`npm stop` stop bot


You will need to install [forever](https://www.npmjs.com/package/forever) if you want to use `npm start` & `npm stop`