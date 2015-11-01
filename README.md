# teamspeak-bot

## Functions

**AFK** will move any client idle for more then 2 hours to a specific channel (or default channel).

## Events

You can subscribe to events like

* `connected`/`disconnected` : bot connected/disconnected
* `afk` : bot moved client to afk channel

```javascript
bot.events.on('connected', function() {
    console.log('bot connected!');
});

bot.events.on('disconnected', function() {
    console.log('bot disconnected!');
});

bot.events.on('afk', function(client) {
    console.log(client.client_nickname, + " moved!");
});
```

## Config

```json
// Rename to config.json
{
    "host": "localhost", // Teamspeak server ip/hostname
    "port": 10011, // Teamspeak server port
    "server": 1, // Server id usually 1
    "login": "admin", // ServerQuery login
    "pwd": "password", // ServerQuery password
    "botName": "TeamSpeak Bot", // Bot name
    "afk": { // afk function
        "channel": 13, // channel id to move afk clients to
        "idle_time": 60 // idle time after client will be move (in minutes) default 60
    }
}
```

## Usage

`npm start` start bot
