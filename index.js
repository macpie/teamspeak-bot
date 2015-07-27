var config = require('./config'),
    Bot = require('./lib/bot');


var bot = new Bot({
    host: config.host,
    port: config.port
});

bot.connect(config.login, config.pwd, function() {
    bot.afk(13);
});