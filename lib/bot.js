var TeamSpeak = require('node-teamspeak-api'),
    _ = require('underscore'),
    async = require('async'),
    moment = require('moment'),
    utility = require('./utility');

function BOT(config) {
    var self = this,
        default_config = {
            host: 'localhost',
            port: '10011',
            server: 1
        };

    if (!config) config = {};

    self.config = _.extend(default_config, config);
    self.client = new TeamSpeak(self.config.host, self.config.port);
    self.logger = utility.logger('bot');

    return self;
}

BOT.prototype.connect = function() {
    var self = this,
        args = utility.parse_args(arguments);

    var server_id = args.v[2] || self.config.server,
        bot_name = 'TeamSpeak Bot';

    async.waterfall([
        function(cb) {
            self.client.api.login({
                client_login_name: args.v[0],
                client_login_password: args.v[1]
            }, function(err, resp) {
                console.log(err);
                if (err) self.logger.error("failed to login using '%s': %s", args.v[0], err.message);
                cb(err);
            });
        },
        function(cb) {
            self.logger.info("logged in using '%s'", args.v[0]);

            self.client.api.use({
                sid: server_id
            }, function(err, resp) {
                if (err) self.logger.error("failed to connect to server: : %s" + server_id, err.message);
                cb(err);
            });
        },
        function(cb) {
            self.logger.info("connected to server " + server_id);

            self.client.api.clientupdate({
                client_nickname: bot_name
            }, function(err, resp) {
                if (err) self.logger.error("failed to update bot name: : %s", err.message);
                cb(err);
            });
        },
    ], function(err) {
        if (!err) self.logger.info("bot name updated to '%s'", bot_name);
        args.cb(err);
    });

    return self;
};

BOT.prototype.disconnect = function() {
    var self = this;

    self.logger.info("disconnecting");

    self.client.disconnect();

    return self;
};

BOT.prototype.afk = function(arg0, arg1) {
    var self = this,
        channel = arg0,
        idle = arg1 || 60,
        idle_ms = moment.duration(idle, 'minutes').asMilliseconds();

    function move(whoami, afkChannel) {
        self.logger.debug("moving afk clients");

        self.client.api.clientlist(['times', 'away', 'info'], function(err, resp) {
            if (err) {
                self.logger.error(err.message);
                return;
            }

            var clients = resp.data;

            async.each(clients, function(client, callback) {
                if (client.clid != whoami.client_id) {
                    if (client.cid != afkChannel && (client.client_idle_time > idle_ms || client.client_away === 1)) {
                        self.client.api.clientmove({
                            clid: client.clid,
                            cid: afkChannel
                        }, function(err, resp) {
                            if (!err) {
                                self.logger.info("moving '%s' to afk channel", client.client_nickname);
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
                if (err) self.logger.error(err.message);

                setTimeout(function() {
                    move(whoami, afkChannel);
                }, moment.duration(10, 'minutes').asMilliseconds());
            });

        });
    }

    async.parallel({
            channels: function(cb) {
                self.client.api.channellist(['flags'], function(err, resp) {
                    if (err) self.logger.error(err.message);
                    cb(err, resp);
                });
            },
            whoami: function(cb) {
                self.client.api.whoami(function(err, resp) {
                    if (err) self.logger.error(err.message);
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