var TeamSpeak = require('node-teamspeak-api'),
    _ = require('underscore'),
    async = require('async'),
    moment = require('moment'),
    events = require('events'),
    util = require('util'),
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
    self.events = new events.EventEmitter();

    return self;
}

BOT.prototype.connect = function() {
    var self = this,
        args = utility.parse_args(arguments),
        server_id = args.v[2] || self.config.server,
        bot_name = self.config.botName || 'TeamSpeak Bot';

    async.waterfall([
        function(cb) {
            self.client.api.login({
                client_login_name: args.v[0],
                client_login_password: args.v[1]
            }, function(err, resp) {
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
        if (!err) {
            self.logger.info("bot name updated to '%s'", bot_name);
            self.events.emit('connected');
            self.keep_alive();
        }
        args.cb(err);
    });

    return self;
};

BOT.prototype.keep_alive = function(stop) {
    var self = this;

    if (stop) {
        clearInterval(self.keepalive);
        self.keepalive = null;
        self.logger.info('stoping keepalive');
    } else {
        if (!self.keepalive) {
            self.logger.info('starting keepalive');
            self.keepalive = setInterval(function() {
                self.client.api.whoami(function() {
                    self.logger.debug('keepalive');
                });
            }, 60000);
        }
    }

    return self;
};

BOT.prototype.disconnect = function() {
    var self = this;

    self.logger.info("disconnecting");


    self.keep_alive(true);
    self.client.disconnect();
    self.events.emit('disconnected');

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
                var meTest = client.clid != whoami.client_id,
                    channelTest = client.cid != afkChannel,
                    idleTest = client.client_idle_time > idle_ms,
                    awayTest = client.client_away === 1;

                if (meTest && channelTest && (idleTest || awayTest)) {
                    self.client.api.clientmove({
                        clid: client.clid,
                        cid: afkChannel
                    }, function(err, resp) {
                        if (!err) {
                            self.logger.info("moving '%s' to afk channel", client.client_nickname);
                            client.cid = afkChannel;
                            self.events.emit('afk', client);
                        }
                        callback(err);
                    });
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