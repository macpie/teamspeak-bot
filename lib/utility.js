var moment = require('moment'),
    winston = require('winston');

exports.parse_args = function(a) {
    var args = Array.prototype.slice.call(a),
        values = [],
        callback = null;

    args.forEach(function(item) {
        if (typeof item == 'function') {
            callback = item;
        } else {
            values.push(item);
        }
    });

    return {
        v: values,
        cb: callback
    };
};

exports.logger = function(filename) {

    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)({
                formatter: formatter
            }),
            new(winston.transports.DailyRotateFile)({
                datePattern: '-yyyy-MM-dd.log',
                filename: '/var/log/teamspeak-bot' + filename,
                json: false,
                level: 'silly',
                formatter: formatter
            })
        ]
    });

    function formatter(options) {
        return '[' + moment().format("YYYY/MM/DD HH:mm:ss:SSS") + '] ' +
            '[' + options.level.toUpperCase() + '] ' +
            (undefined !== options.message ? options.message : '') +
            (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');

    }

    return logger;
};