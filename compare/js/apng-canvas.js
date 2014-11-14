/**
 * @preserve
 * APNG-canvas
 *
 * @author David Mzareulyan
 * @copyright 2011 David Mzareulyan
 * @link https://github.com/davidmz/apng-canvas
 * @license https://github.com/davidmz/apng-canvas/blob/master/LICENSE (MIT License)
 */
(function() {
    /************************* PUBLIC ***************************/

    var global = (function(){ return this; })();
    var $ = global.jQuery || null;
    var cssCanvasEnabled = !!document.getCSSCanvasContext;

    var APNG = global.APNG = {};

    var featuresD = null;
    APNG.checkNativeFeatures = function(callback) {
        var firstCall = !featuresD;
        var d = firstCall ? (featuresD = new Deferred()) : featuresD;
        if (callback) d.promise().done(callback);
        if (!firstCall) return d.promise();

        var res = { canvas: false, apng: false };
        var canvas = document.createElement("canvas");
        if (typeof canvas.getContext == "undefined") {
            // canvas is not supported
            d.resolve(res);
        } else {
            // canvas is supported
            res.canvas = true;
            // see http://eligrey.com/blog/post/apng-feature-detection
            var img = new Image();
            img.onload = function() {
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                if (ctx.getImageData(0, 0, 1, 1).data[3] === 0 ) {
                    res.apng = true;
                    d.resolve(res);
                } else {
                    d.resolve(res);
                }
            };
            // frame 1 (skipped on apng-supporting browsers): [0, 0, 0, 255]
            // frame 2: [0, 0, 0, 0]
            img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
        }
        return d.promise();
    };

    var neededD = null;
    APNG.ifNeeded = function(callback) {
        var firstCall = !neededD;
        var d = firstCall ? (neededD = new Deferred()) : neededD;
        if (callback) d.promise().done(callback);
        if (!firstCall) return d.promise();

        if (location.protocol != "http:" && location.protocol != "https:") {
            d.reject("apng-canvas doesn't work on pages loaded by '" + location.protocol + "' protocol");
            return d.promise();
        }

        this.checkNativeFeatures().done(function(f) {
            if (f.canvas && !f.apng) {
                d.resolve();
            } else {
                if (!f.canvas) d.reject("Browser doesn't support canvas");
                if (f.apng) d.reject("Browser has native APNG support");
            }
        }).done(function() { d.reject(); });
        return d.promise();
    };

    APNG.createAPNGCanvas = function(url, callback) {
        var d = new Deferred();
        if (callback) d.promise().done(callback);

        Animation.createFromUrl(url).done(function() {
            d.resolve(this.addCanvas());
        }).fail(proxy(d.reject, d));

        return d.promise();
    };

    APNG.animateImage = function(img) {
        if (cssCanvasEnabled) {
            var d = new Deferred();
            if (img.hasAttribute("data-is-apng")) {
                d.reject("Image already animated");
            } else {
               
                img.setAttribute("data-is-apng", "progress");
                Animation.createFromUrl(img.src).done(function() {

                    var ctxName = this.getCSSCanvasContextName();
                    if (!img.hasAttribute("width") && !img.style.width)
                        img.style.width = global.getComputedStyle(img).width;
                    if (!img.hasAttribute("height") && !img.style.height)
                        img.style.height = global.getComputedStyle(img).height;
                    img.setAttribute("data-is-apng", "yes");
            
                    img.style.content = "-webkit-canvas(" + ctxName + ")";
                
                    d.resolve();
                }).fail(function() {
                    console.log(1)
                    img.setAttribute("data-is-apng", "no");
                }).fail(proxy(d.reject, d));
            }
            return d.promise();
        } else {
            return this.replaceImage(img);
        }
    };

    APNG.replaceImage = function(img) {
        if (img.hasAttribute("data-is-apng")) {
            var d = new Deferred();
            d.reject("Image already animated");
            return d.promise();
        } else {
            img.setAttribute("data-is-apng", "progress");
            return APNG.createAPNGCanvas(img.src).done(function(canvas) {
                for (var i = 0; i < img.attributes.length; i++) {
                    var attr = img.attributes[i];
                    if (["alt","src","usemap","ismap"].indexOf(attr.nodeName) == -1) {
                        canvas.setAttributeNode(attr.cloneNode());
                    }
                }
                canvas.setAttribute("data-apng-src", img.src);
                /**
                 * Если в системе есть jQuery, копируем привязанные обработчики событий
                 */
                if ($) {
                    var events = $(img).data("events");
                    if (events) {
                        for ( var type in events ) {
                            for ( var j = 0, l = events[type].length; j < l; j++ ) {
                                var h = events[type][j];
                                $(canvas).bind(type + (h.namespace ? "." : "") + h.namespace, h.data, h.handler);
                            }
                        }
                    }
                }
                var p = img.parentNode;
                p.insertBefore(canvas, img);
                p.removeChild(img);
            }).fail(function() {
                img.setAttribute("data-is-apng", "no");
            });
        }
    };

    /************************* HELPERS ***************************/

    // "\x89PNG\x0d\x0a\x1a\x0a"
    var PNG_SIGNATURE = String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);

    var ctxNamePrefix = "apng-canvas-css-", ctxNameCounter = 1;

    var readDWord = function(data) {
        var x = 0;
        for (var i = 0; i < 4; i++) x += (data.charCodeAt(i) << ((3 - i) * 8));
        return x;
    };

    var readWord = function(data) {
        var x = 0;
        for (var i = 0; i < 2; i++) x += (data.charCodeAt(i) << ((1 - i) * 8));
        return x;
    };

    var writeChunk = function(type, data) {
        var res = "";
        res += writeDWord(data.length);
        res += type;
        res += data;
        res += writeDWord(crc32(type + data));
        return res;
    };

    var writeDWord = function(num) {
        return String.fromCharCode(
                ((num >> 24) & 0xff),
                ((num >> 16) & 0xff),
                ((num >> 8) & 0xff),
                (num & 0xff)
        );
    };

    var DataBuilder = function() {
        this.parts = [];
    };
    DataBuilder.prototype.append = function(data) {
        this.parts.push(data);
    };
    DataBuilder.prototype.getUrl = function(contentType) {
        if (global.btoa) {
            return "data:" + contentType + ";base64," + btoa(this.parts.join(""));
        } else { // IE
            return "data:" + contentType + "," + escape(this.parts.join(""));
        }
    };

    var proxy = function(method, context) { return function() { return method.apply(context, arguments); }; };

    /************************* INTERNALS ***************************/

    if (
            typeof XMLHttpRequest.prototype.responseBody != 'undefined'
            && typeof document.addEventListener != 'undefined'
    ) {
        // создаём VBScript-функцию для IE9
        // see http://miskun.com/javascript/internet-explorer-and-binary-files-data-access/
        document.addEventListener("DOMContentLoaded", function() {
            var script = document.createElement("script");
            script.setAttribute('type','text/vbscript');
            script.text =   "Function APNGIEBinaryToBinStr(Binary)\r\n" +
                            "   APNGIEBinaryToBinStr = CStr(Binary)\r\n" +
                            "End Function\r\n";
            document.body.appendChild(script);
        });
    }

    // requestAnimationFrame over setTimeout
    var rafList = [];
    (function() {
        if (rafList.length) {
            var list = rafList.splice(0, rafList.length), t = new Date().getTime();
            while (list.length) list.shift().call(null, t);
        }
        setTimeout(arguments.callee, 1000 / 60);
    })();

    var requestAnimationFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame ||
	    global.mozRequestAnimationFrame || global.oRequestAnimationFrame ||
        function(callback) { rafList.push(callback); };

    // Main animation loop
    var tick = function(t) {
        if (typeof t != "number") t = t.getTime(); // webOS
        for (var i = 0; i < allAnimations.length; i++) {
            var anim = allAnimations[i];
            while (anim.isActive && anim.nextRenderTime <= t) anim.renderFrame(t);
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    var Animation = function() {
        var thisAnimation = this;

        this.isActive = false;
        this.nextRenderTime = 0;

        this.width  = 0;
        this.height = 0;
        this.numPlays   = 0;
        this.frames     = [];
        this.playTime   = 0; // продолжительность одного цикла анимации

        var d = new Deferred();
        this.whenReady = proxy(d.promise, d);

        this.parsePNGData = function(imageData) {
            if (imageData.substr(0, 8) != PNG_SIGNATURE) {
                d.reject("Invalid PNG file signature");
                return d.promise();
            }

            var headerData, preData = "", postData = "", isAnimated = false;

            var off = 8, frame = null;
            do {
                var length = readDWord(imageData.substr(off, 4));
                var type = imageData.substr(off + 4, 4);
                var data;

                switch (type) {
                    case "IHDR":
                        data = imageData.substr(off + 8, length);
                        headerData = data;
                        this.width = readDWord(data.substr(0, 4));
                        this.height = readDWord(data.substr(4, 4));
                        break;
                    case "acTL":
                        isAnimated = true;
                        this.numPlays = readDWord(imageData.substr(off + 8 + 4, 4));
                        break;
                    case "fcTL":
                        if (frame) this.frames.push(frame);
                        data = imageData.substr(off + 8, length);
                        frame = {};
                        frame.width     = readDWord(data.substr(4, 4));
                        frame.height    = readDWord(data.substr(8, 4));
                        frame.left      = readDWord(data.substr(12, 4));
                        frame.top       = readDWord(data.substr(16, 4));
                        var delayN      = readWord(data.substr(20, 2));
                        var delayD      = readWord(data.substr(22, 2));
                        if (delayD == 0) delayD = 100;
                        frame.delay = 1000 * delayN / delayD;
                        // see http://mxr.mozilla.org/mozilla/source/gfx/src/shared/gfxImageFrame.cpp#343
                        if (frame.delay <= 10) frame.delay = 100;
                        this.playTime += frame.delay;
                        frame.disposeOp = data.charCodeAt(24);
                        frame.blendOp   = data.charCodeAt(25);
                        frame.dataParts = [];
                        break;
                    case "fdAT":
                        if (frame) frame.dataParts.push(imageData.substr(off + 8 + 4, length - 4));
                        break;
                    case "IDAT":
                        if (frame) frame.dataParts.push(imageData.substr(off + 8, length));
                        break;
                    case "IEND":
                        postData = imageData.substr(off, length + 12);
                        break;
                    default:
                        preData += imageData.substr(off, length + 12);
                }
                off += 12 + length;
            } while(type != "IEND" && off < imageData.length);
            if (frame) this.frames.push(frame);

            // Вариант неанимированного PNG
            if (!isAnimated) {
                d.reject("Non-animated PNG");
                return d.promise();
            }

            // Собираем кадры
            var loadedImages = 0, self = this;
            for (var i = 0; i < this.frames.length; i++) {
                var img = new Image();
                frame = this.frames[i];
                frame.img = img;
                img.onload = function() {
                    loadedImages++;
                    if (loadedImages == self.frames.length) d.resolveWith(thisAnimation);
                };
                img.onerror = function() { d.reject("Image creation error"); };

                var db = new DataBuilder();
                db.append(PNG_SIGNATURE);
                headerData = writeDWord(frame.width) + writeDWord(frame.height) + headerData.substr(8);
                db.append(writeChunk("IHDR", headerData));
                db.append(preData);
                for (var j = 0; j < frame.dataParts.length; j++)
                    db.append(writeChunk("IDAT", frame.dataParts[j]));
                db.append(postData);
                img.src = db.getUrl("image/png");
                delete frame.dataParts;
            }
            return d.promise();
        };

        var contexts = [];
        this.addCanvas = function() {
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext("2d");
            contexts.push(ctx);
            if (contexts.length > 1) {
                requestAnimationFrame(function() {
                    ctx.putImageData(contexts[0].getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                });
            }
            this.isActive = true;
            return canvas;
        };

        var contextName = null;
        this.getCSSCanvasContextName = function() {
            if (!contextName) {
                contextName = ctxNamePrefix + (ctxNameCounter++);
                var ctx = document.getCSSCanvasContext("2d", contextName, this.width, this.height);
                contexts.push(ctx);
                if (contexts.length > 1) {
                    requestAnimationFrame(function() {
                        ctx.putImageData(contexts[0].getImageData(0, 0, thisAnimation.width, thisAnimation.height), 0, 0);
                    });
                }
                this.isActive = true;
            }
            return contextName;
        };

        var fNum = 0;
        var prevF = null;
        var eachCanvas = function(method, args) {
            for (var i = 0; i < contexts.length; i++) contexts[i][method].apply(contexts[i], args);
        };

        this.renderFrame = function(now) {
            if (contexts.length == 0) return;
            var f = fNum++ % this.frames.length;
            var frame = this.frames[f];

            if (f == 0) {
                eachCanvas("clearRect", [0, 0, this.width, this.height]);
                prevF = null;
                if (frame.disposeOp == 2) frame.disposeOp = 1;
            }

            if (prevF && prevF.disposeOp == 1) {
                eachCanvas("clearRect", [prevF.left, prevF.top, prevF.width, prevF.height]);
            } else if (prevF && prevF.disposeOp == 2) {
                eachCanvas("putImageData", [prevF.iData, prevF.left, prevF.top]);
            }
            prevF = frame;
            prevF.iData = null;
            if (prevF.disposeOp == 2) {
                prevF.iData = contexts[0].getImageData(frame.left, frame.top, frame.width, frame.height);
            }
            if (frame.blendOp == 0) eachCanvas("clearRect", [frame.left, frame.top, frame.width, frame.height]);
            eachCanvas("drawImage", [frame.img, frame.left, frame.top]);

            if (this.numPlays == 0 || fNum / this.frames.length < this.numPlays) {
                if (this.nextRenderTime == 0) this.nextRenderTime = now;
                while (now > this.nextRenderTime + this.playTime) this.nextRenderTime += this.playTime;
                this.nextRenderTime += frame.delay;
            } else {
                this.isActive = false;
            }
        };
    };

    /**
     * Загрузка двоичных данных как строки с символами \x00 - \xff
     * @param url
     */
    var loadBinaryData = function(url) {
        var d = new Deferred();

        var xhr = new XMLHttpRequest();

        var BlobBuilder = (global.BlobBuilder || global.WebKitBlobBuilder);
        // IE9
        var useResponseBody = (typeof xhr.responseBody != "undefined");
        // Chrome
        var useResponseType = (typeof xhr.responseType != "undefined" && typeof BlobBuilder != "undefined");
        // Safari
        var useXUserDefined = (typeof xhr.overrideMimeType != "undefined" && !useResponseType);

        xhr.open('GET', url, true);
        if (useResponseType) { // chrome
            xhr.responseType = "arraybuffer";
        } else if (useXUserDefined) { // FF & old Safari
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
        xhr.onreadystatechange = function(e) {
            if (this.readyState == 4 && this.status == 200) {
                if (useResponseType) { // XHR 2
                    var bb = new BlobBuilder();
                    bb.append(this.response);
                    var reader = new FileReader();
                    reader.onload = function() { d.resolve(this.result); };
                    reader.readAsBinaryString(bb.getBlob());
                } else {
                    var res = "";
                    if (useResponseBody) { // IE
                        // see http://miskun.com/javascript/internet-explorer-and-binary-files-data-access/
                        var raw = APNGIEBinaryToBinStr(this.responseBody);
                        for (var j = 0, l = raw.length; j < l; j++) {
                            var c = raw.charCodeAt(j);
                            res += String.fromCharCode(c & 0xFF, (c >> 8) & 0xFF);
                        }
                    } else { // FF?
                        var binStr = this.responseText;
                        for (var i = 0, len = binStr.length; i < len; ++i)
                            res += String.fromCharCode(binStr.charCodeAt(i) & 0xff);
                    }
                    d.resolve(res);
                }
            } else if (this.readyState == 4) {
                d.reject(xhr);
            }
        };
        xhr.send();

        return d.promise();
    };

    var allAnimations = [], urlToAnimation = {};
    Animation.createFromUrl = function(url) {
        var a;
        if (url in urlToAnimation) {
            a = urlToAnimation[url];
        } else {
            a = new Animation();
            urlToAnimation[url] = a;
            allAnimations.push(a);
            Deferred.pipeline(url) ( loadBinaryData, proxy(a.parsePNGData, a));
        }
        return a.whenReady();
    };

})();
