# teamspeak-bot

## Functions

**AFK** will move any client idle for more then 2 hours to a specific channel (or default channel).

## Config

```json
// Rename to config.json
{
    "host": "localhost",
    "port": 10011,
    "server": 1,
    "login": "admin",
    "pwd": "password",
    "afk": {
        "channel": 1,
        "idle_time": 60
    }
}
```

## Usage

`npm start` start bot


`npm stop` stop bot


You will need to install [forever](https://www.npmjs.com/package/forever) if you want to use `npm start` & `npm stop`