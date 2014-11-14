/**
 * @preserve
 * uDeferred library
 *
 * @author David Mzareulyan
 * @copyright 2011 David Mzareulyan
 * @license http://creativecommons.org/licenses/by/3.0/
 */
(function() {

    var global = (function(){ return this; })(), D;

    if (typeof global['jQuery'] !== "undefined" && typeof global['jQuery'].Deferred !== "undefined") {
        D = global.Deferred = global['jQuery'].Deferred;
    } else {
        /** @constructor */
        D = global.Deferred = function() {
            if (!(this instanceof arguments.callee)) return new D();

            var     callbacks = [0, [], []],
                    isFired = 0, // 1 - resolved, 2 - rejected
                    args,
                    promise = null,
                    promiseMethods,
                    deferred = this;

            var setStatus = function(type, newArgs, context) {
                if (isFired) return;
                isFired = type;
                args = newArgs;
                var list = callbacks[type];
                while (list.length) list.shift().apply(context, args);
                callbacks = null;
                return deferred;
            };
            var addCallback = function(onStatus, callback) {
                if (isFired == onStatus) {
                    callback.apply(this, args);
                } else if (!isFired) {
                    callbacks[onStatus].push(callback);
                }
                return this;
            };

            // Deferred object methods
            deferred.promise = function(target) {
                if (!target && promise) return promise;
                promise = target ? target : promise ? promise : {};
                for (var k in promiseMethods)
                    if (promiseMethods.hasOwnProperty(k))
                        promise[k] = promiseMethods[k];
                return promise;
            };
            deferred.resolve = function() { return setStatus(1, arguments, promise); };
            deferred.reject  = function() { return setStatus(2, arguments, promise); };
            deferred.resolveWith = function() {
                var args = Array.prototype.slice.call(arguments);
                var ctx = args.shift();
                return setStatus(1, args, ctx);
            };
            deferred.rejectWith = function() {
                var args = Array.prototype.slice.call(arguments);
                var ctx = args.shift();
                return setStatus(2, args, ctx);
            };

            // Promise object methods
            promiseMethods = {
                done:   function(callback) { return addCallback.call(this, 1, callback); },
                fail:   function(callback) { return addCallback.call(this, 2, callback); },

                then:   function(callbackDone, callbackFail) {
                    return this.done(callbackDone).fail(callbackFail);
                },
                always: function(callback) {
                    return this.then(callback, callback);
                },

                isResolved: function() { return (isFired == 1); },
                isRejected: function() { return (isFired == 2); },

                promise:    function() { return this; }
            };
        };
    }

    var proxy = function(method, context) { return function() { return method.apply(context, arguments); }; };

    D.pipeline = function() {
        var d;
        var initArgs = arguments;
        var calls;
        var execCall = function() {
            if (calls.length) {
                var res = calls.shift().apply(null, arguments);
                if (typeof res.promise == "function") {
                    res.promise().then(execCall, proxy(d.reject, d));
                } else {
                    // просто вернули значение — передаём дальше по цепочке
                    execCall.apply(null, [res]);
                }
            } else {
                d.resolve.apply(d, arguments);
            }
        };
        return function() {
            d = new D();
            calls = Array.prototype.slice.call(arguments);
            execCall.apply(null, initArgs);
            return d.promise();
        };
    };

})();