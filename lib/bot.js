var TeamSpeak = require('node-teamspeak-api'),
    _ = require('underscore'),
    async = require('async'),
    moment = require('moment'),
    winston = require('winston'),
    utility = require('./utility');

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            colorize: true,
            timestamp: true
        }),
        new(winston.transports.DailyRotateFile)({
            datePattern: '.yyyy-MM-dd',
            filename: 'log/bot.log',
            json: false,
            level: 'silly'
        })
    ]
});

var default_config = {
    host: 'localhost',
    port: '10011',
    server: 1
};

function BOT(config) {
    var self = this;

    if (!config) config = {};

    self.config = _.extend(default_config, config);
    self.client = new TeamSpeak(self.config.host, self.config.port);

    return self;
}

BOT.prototype.connect = function() {
    var self = this,
        args = utility.parse_args(arguments);

    self.client.api.login({
        client_login_name: args.v[0],
        client_login_password: args.v[1]
    }, function(err, resp, req) {
        if (err) {
            logger.error("failed to login using '%s'", args.v[0]);
            args.cb(err, resp, req);
        } else {
            var id = args.v[2] || self.config.server;

            logger.debug("logged in using '%s'", args.v[0]);

            logger.info("connecting to server " + id);

            self.client.api.use({
                sid: id
            }, args.cb);
        }

    });

    return self;
};

BOT.prototype.disconnect = function() {
    var self = this;

    logger.info("disconnecting");

    self.client.disconnect();

    return self;
};

BOT.prototype.afk = function(arg0, arg1) {
    var self = this,
        channel = arg0,
        idle = arg1 || moment.duration(60, 'minutes').asMilliseconds();

    function move(whoami, afkChannel) {
        logger.debug("moving afk clients");

        self.client.api.clientlist(['times', 'away', 'info'], function(err, resp) {
            if (err) {
                logger.error(err.message);
                return;
            }

            var clients = resp.data,
                moved = function(err, resp) {
                    if (err) return;
                    console.log(resp);
                };

            async.each(clients, function(client, callback) {

                if (client.clid != whoami.client_id) {
                    if (client.client_idle_time > idle && client.cid != afkChannel) {

                        self.client.api.clientmove({
                            clid: client.clid,
                            cid: afkChannel
                        }, function(err, resp) {
                            if (!err) {
                                logger.info("moving '%s' to afk channel", client.client_nickname);
                            }
                            callback(err);
                        });
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }

            }, function(err) {
                if (err) logger.error(err.message);

                setTimeout(function() {
                    move(whoami, afkChannel);
                }, moment.duration(10, 'minutes').asMilliseconds());
            });

        });
    }

    async.parallel({
            channels: function(cb) {
                self.client.api.channellist(['flags'], function(err, resp) {
                    if (err) logger.error(err.message);
                    cb(err, resp);
                });
            },
            whoami: function(cb) {
                self.client.api.whoami(function(err, resp) {
                    if (err) logger.error(err.message);
                    cb(err, resp);
                });
            }
        },
        function(err, results) {
            if (err) return;

            var whoami = results.whoami.data,
                channels = results.channels.data,
                default_channel = _.findWhere(channels, {
                    channel_flag_default: 1
                }),
                afkChannel = channel || default_channel.cid;

            move(whoami, afkChannel);
        }
    );

    return self;
};

module.exports = BOT;