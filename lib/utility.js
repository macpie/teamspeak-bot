(function() {
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
})();