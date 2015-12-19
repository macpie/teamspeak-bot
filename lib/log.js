(function() {
    var bunyan = require('bunyan');

    var logDir = '/var/log/teamspeak-bot',
        level = process.env.LOG || 'trace';

    module.exports = function(opts) {
        return bunyan.createLogger({
            name: opts.name || 'default',
            req_id: opts.req_id,
            src: opts.src || false,
            streams: [{
                type: 'rotating-file',
                path: logDir + '/bot.log',
                period: '1d',
                count: 10,
                level: level
            }, {
                type: 'rotating-file',
                path: logDir + '/bot-err.log',
                period: '1d',
                count: 10,
                level: 'error'
            }, {
                stream: process.stdout,
                level: level
            }]
        });
    };

})();