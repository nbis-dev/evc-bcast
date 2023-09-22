module.exports.isNullObject = (obj) => {
    return obj === null || obj === undefined;
};

/*
 * string startsWith
 */
if (!String.prototype.startsWith) {
    (function () {
        "use strict"; // needed to support `apply`/`call` with `undefined`/`null`
        var defineProperty = (function () {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                var result =
                    $defineProperty(object, object, object) && $defineProperty;
            } catch (error) {}
            return result;
        })();
        var toString = {}.toString;
        var startsWith = function (search) {
            if (this == null) {
                throw TypeError();
            }
            var string = String(this);
            if (search && toString.call(search) == "[object RegExp]") {
                throw TypeError();
            }
            var stringLength = string.length;
            var searchString = String(search);
            var searchLength = searchString.length;
            var position = arguments.length > 1 ? arguments[1] : undefined;
            // `ToInteger`
            var pos = position ? Number(position) : 0;
            if (pos != pos) {
                // better `isNaN`
                pos = 0;
            }
            var start = Math.min(Math.max(pos, 0), stringLength);
            // Avoid the `indexOf` call if no match is possible
            if (searchLength + start > stringLength) {
                return false;
            }
            var index = -1;
            while (++index < searchLength) {
                if (
                    string.charCodeAt(start + index) !=
                    searchString.charCodeAt(index)
                ) {
                    return false;
                }
            }
            return true;
        };
        if (defineProperty) {
            defineProperty(String.prototype, "startsWith", {
                value: startsWith,
                configurable: true,
                writable: true,
            });
        } else {
            String.prototype.startsWith = startsWith;
        }
    })();
}

if (!String.prototype.endsWith) {
    (function () {
        "use strict"; // needed to support `apply`/`call` with `undefined`/`null`
        var defineProperty = (function () {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                var result =
                    $defineProperty(object, object, object) && $defineProperty;
            } catch (error) {}
            return result;
        })();
        var toString = {}.toString;
        var endsWith = function (search) {
            if (this == null) {
                throw TypeError();
            }
            var string = String(this);
            if (search && toString.call(search) == "[object RegExp]") {
                throw TypeError();
            }
            var stringLength = string.length;
            var searchString = String(search);
            var searchLength = searchString.length;
            var pos = stringLength;
            if (arguments.length > 1) {
                var position = arguments[1];
                if (position !== undefined) {
                    // `ToInteger`
                    pos = position ? Number(position) : 0;
                    if (pos != pos) {
                        // better `isNaN`
                        pos = 0;
                    }
                }
            }
            var end = Math.min(Math.max(pos, 0), stringLength);
            var start = end - searchLength;
            if (start < 0) {
                return false;
            }
            var index = -1;
            while (++index < searchLength) {
                if (
                    string.charCodeAt(start + index) !=
                    searchString.charCodeAt(index)
                ) {
                    return false;
                }
            }
            return true;
        };
        if (defineProperty) {
            defineProperty(String.prototype, "endsWith", {
                value: endsWith,
                configurable: true,
                writable: true,
            });
        } else {
            String.prototype.endsWith = endsWith;
        }
    })();
}

module.exports.isObject = (obj) => {
    var type = typeof obj;
    return type === "function" || (type === "object" && !!obj);
};

module.exports.cloneObject = (src) => {
    return JSON.parse(JSON.stringify(src));
};

module.exports.isEmptyObject = (obj) => {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
};
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, "g"), replacement);
    };
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var formatted = this,
            i = 0;
        while (/%s/.test(formatted))
            formatted = formatted.replace("%s", arguments[i++]);
        return formatted;
    };
}
