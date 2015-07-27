var config = require('./config'),
    Bot = require('./lib/bot');


var bot = new Bot(config);

bot.connect(config.login, config.pwd, function() {
    bot.afk(config.afk.channel, conmfig.afk.idle_time);
});