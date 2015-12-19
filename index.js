var config = require('/etc/teamspeak-bot/config.json'),
    Bot = require(__dirname + '/lib/bot');

var bot = new Bot(config);

bot.connect(config.login, config.pwd, function() {
    bot.afk(config.afk.channel, config.afk.idle_time);
});