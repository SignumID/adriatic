// Version: 1.50

var SnTUtils = {};

SnTUtils.Debuging = false;
SnTUtils.Audit = [];

SnTUtils.Language = 'HR';
SnTUtils.CsrfIdentifierControlId = "CsrfIdentifier";

$(function () {

    try {
        SnTUtils.Elements = {

            Body: typeof (theForm) != 'undefined' && theForm && $(theForm).parents ? $(theForm).parents("body:first") : $(":not('iframe')").find("body")
        };

        var body = SnTUtils.Elements.Body;

        SnTUtils.Ajax.Initialize();

        SnTUtils.UI.SetFocusOnFirstElement();
    }
    catch (e) {
        SnTUtils.HandleException(e.message, "SnTUtils.ready()");
    }
});

SnTUtils.Helper =
    {
        IsObject: function (obj) {

            if (Object.prototype.toString.call(obj) !== "[object Object]") {
                return false;
            }
            var key;
            for (key in obj) { }
            return !key || Object.prototype.hasOwnProperty.call(obj, key);
        },
        IncludeScript: function (url, onScriptLoaded) {
            var firstScript = document.getElementsByTagName('script')[0];

            var js = document.createElement('script');
            js.src = url;

            if (typeof (onScriptLoaded) == 'function') {
                js.onload = function () {
                    // do stuff with dynamically loaded script				
                    onScriptLoaded();
                };
            }

            firstScript.parentNode.insertBefore(js, firstScript);
        }
    };

SnTUtils.RegisterNameSpace = function (namespacePath) {

    var baseNS = window;
    var namespaceParts = namespacePath.split('.');

    for (var i = 0; i < namespaceParts.length; i++) {

        var currentPart = namespaceParts[i];
        var ns = baseNS[currentPart];

        if (!ns) {

            ns = baseNS[currentPart] = {};
        }
        baseNS = ns;
    }
};

SnTUtils.MessageControl = function (messageControlId, settings) {

    this.settings = $.extend({
        messageControlId: "dvMessageContainer",
        customHtmlEnabled: false,
        divPortalMessageMessageId: 'divPortalMessageMessage',
        divPortalMessageErrorId: 'divPortalMessageError',
        divPortalMessageInfoId: 'divPortalMessageInfo',
        divPortalMessageOverlyId: 'divPortalMessageOverlay',
        showMessageClass: "msg",
        showErrorClass: "msgErr",
        showInfoClass: "msgInfo",
        overlayShowMessageClass: "msgbox-2016-green",
        overlayShowErrorClass: "msgbox-2016-red",
        overlayShowInfoClass: "msgbox-2016-orange",
        labelSelector: "span.PortalMessageLabel",
        labelSelectorOverlay: "p.PortalMessageLabel",
        serviceUrl: "/App_Modules__SnT.Cms.Modules.Core.Package__SnT.Cms.Modules.Core.PortalMessage.PortalMessageService.asmx",
        openOverlay: OpenOverlay,
        closeOverlay: CloseOverlay,
        overlaySettings: {
            type: 'inline',
            content: null,
            autoSize: true,
            closeBtn: true
        }
    }, settings || {});

    this.ViewType = $.extend({}, SnTUtils.BaseEnum,
        {
            Inline: 1,
            Modal: 2
        });

    var _me = this;
    var _dvMessageContainer = null;
    var _divPortalMessageMessage = null;
    var _divPortalMessageError = null;
    var _divPortalMessageInfo = null;

    this.MessageType = $.extend({}, SnTUtils.BaseEnum,
        {
            Message: 1,
            Error: 2,
            Info: 3
        });

    if (typeof messageControlId != undefined) {
        _me.settings = $.extend(_me.settings, { messageControlId: messageControlId } || {});
    }

    var _Init = function () {

        _dvMessageContainer = $("div[id*='" + _me.settings.messageControlId + "']");
        _divPortalMessageMessage = $("div[id*='" + _me.settings.divPortalMessageMessageId + "']");
        _divPortalMessageError = $("div[id*='" + _me.settings.divPortalMessageErrorId + "']");
        _divPortalMessageInfo = $("div[id*='" + _me.settings.divPortalMessageInfoId + "']");

        _divPortalMessageInfo.removeClass(_me.settings.showInfoClass).addClass(_me.settings.showInfoClass);
        _divPortalMessageError.removeClass(_me.settings.showErrorClass).addClass(_me.settings.showErrorClass);
        _divPortalMessageMessage.removeClass(_me.settings.showMessageClass).addClass(_me.settings.showMessageClass);
    };

    this.Init = function () {
        _Init();
    };

    this.Clear = function () {
        _dvMessageContainer.hide().find(_me.settings.labelSelector).html("");
        _divPortalMessageInfo.hide().find(_me.settings.labelSelector).html("");
        _divPortalMessageError.hide().find(_me.settings.labelSelector).html("");
        _divPortalMessageMessage.hide().find(_me.settings.labelSelector).html("");

        _me.settings.closeOverlay();
    };

    this.ShowMessage = function (message, redirect, redirectUrl, viewType) {

        if (viewType && viewType == _me.ViewType.Modal) {
            _me.settings.openOverlay(_me.MessageType.Message, message);
        }
        else {
            SetMessage(_me.MessageType.Message, message, redirect, redirectUrl);
        }
    };
    this.ShowInfo = function (message, redirect, redirectUrl, viewType) {

        if (viewType && viewType == _me.ViewType.Modal) {
            _me.settings.openOverlay(_me.MessageType.Info, message);
        } else {
            SetMessage(_me.MessageType.Info, message, redirect, redirectUrl);
        }
    };
    this.ShowError = function (message, redirect, redirectUrl, viewType) {

        if (viewType && viewType == _me.ViewType.Modal) {
            _me.settings.openOverlay(_me.MessageType.Error, message);
        } else {
            SetMessage(_me.MessageType.Error, message, redirect, redirectUrl);
        }
    };

    var SetMessage = function (messageType, message, redirect, redirectUrl) {

        _me.Clear();

        if (redirect === true) {

            redirectUrl = typeof redirectUrl != 'undefined' ? redirectUrl : window.location.href;

            if (redirectUrl.indexOf('#') > -1) {

                redirectUrl = redirectUrl.substring(0, redirectUrl.indexOf("#"));
            }

            if (SnTUtils.MessageControl.ShowLoaderOnRedirect === true) {

                SnTUtils.Loader.Show();
            }

            SnTUtils.Ajax(_me.settings.serviceUrl + "/PutMessageInSession", { message: message, redirectUrl: redirectUrl, type: messageType }, function (response) {

                if (SnTUtils.MessageControl.ShowLoaderOnRedirect === true) {

                    SnTUtils.HttpContext.Redirecting = true;
                }

                window.location.href = redirectUrl;
            });
        }
        else {

            if (_me.settings.customHtmlEnabled) {
                switch (messageType) {
                    case _me.MessageType.Message:
                        _divPortalMessageMessage.find(_me.settings.labelSelector).html(message);
                        _divPortalMessageMessage.show();
                        break;
                    case _me.MessageType.Error:
                        _divPortalMessageError.find(_me.settings.labelSelector).html(message);
                        _divPortalMessageError.show();
                        break;
                    case _me.MessageType.Info:
                        _divPortalMessageInfo.find(_me.settings.labelSelector).html(message);
                        _divPortalMessageInfo.show();
                        break;
                }
            }
            //backward compatibility
            else {
                _dvMessageContainer.removeClass("class");

                switch (messageType) {
                    case _me.MessageType.Message:
                        _dvMessageContainer.removeAttr("class").addClass(_me.settings.showMessageClass);
                        break;
                    case _me.MessageType.Error:
                        _dvMessageContainer.removeAttr("class").addClass(_me.settings.showErrorClass);
                        break;
                    case _me.MessageType.Info:
                        _dvMessageContainer.removeAttr("class").addClass(_me.settings.showInfoClass);
                        break;
                }
                _dvMessageContainer.find("span").html(message);
                _dvMessageContainer.show();
            }
        }

        if (SnTUtils.MessageControl.ScrollToTopOnShow) {

            $(window).scrollTop(0);
        }
    };

    function OpenOverlay(messageType, message) {
        _me.Clear();

        _me.settings.overlaySettings.content = message;

        SnTUtils.UI.Popup.Open(_me.settings.overlaySettings)
    };

    function CloseOverlay() {
        SnTUtils.UI.Popup.Close(_me.settings.overlaySettings)
    };

    this.GetMesasgeControl = function () {
        return $(String.Format("#{0}", _me.settings.divPortalMessageOverlyId));
    };
    _Init();
};

SnTUtils.MessageControl.ScrollToTopOnShow = true;
SnTUtils.MessageControl.ShowLoaderOnRedirect = false;

SnTUtils.QueryString = new function () {

    var _items = new Array();
    var that = this;

    this.Parse = function (query, ignoreCase) {

        if (query != null) {

            var ignoreCase = typeof ignoreCase != 'undefined' ? ignoreCase : true;

            var qs = (query.indexOf("?") != -1 ? query.substr(query.indexOf("?") + 1) : query).split('&');

            var items = new Object();
            if (qs != null && qs.length > 0) {

                for (var i = 0; i < qs.length; ++i) {
                    var item = qs[i].split('=');
                    if (item != null && item != '') {

                        var key = ignoreCase ? item[0].toLowerCase() : item[0];
                        var value = decodeURIComponent(item[1]);

                        items[key] = value;
                    }
                }
            }
            return items;
        }

        return new Array();
    };
    GetItems = function () {

        if (that._items == null || that._items.length == 0) {
            that._items = that.Parse(window.location.search);
        }
        return that._items;
    };
    this.Items = that.Parse(window.location.search)
};

SnTUtils.HttpContext =
    {
        Request: new function (target) {
            var _that = this;
            this.Target = target ? target : document;
            this.Href = new String(this.Target.location.href);

            this.QueryString = function (key, ignoreCase) {
                var ignoreCase = typeof ignoreCase != 'undefined' ? ignoreCase : true;

                var value = SnTUtils.QueryString.Parse(_that.Target.location.search, ignoreCase)[key];

                if (!value) {
                    return null;
                }

                return value;
            }
        },
        Response:
        {
            Redirect: function (redirectUrl) {

                SnTUtils.HttpContext.Redirecting = true;
                window.location.href = redirectUrl;
            },
            Refresh: function () {

                SnTUtils.HttpContext.Response.Redirect(window.location.href);
            }
        },
        Redirecting: false
    };

SnTUtils.Web =
    {
        Cookies:
        {
            Set: function (name, value, days, path) {

                var expires = new String();

                if (days) {

                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = ";expires=" + date.toGMTString();
                }
                else {
                    expires = "";
                }

                if (path) {
                    path = ';path=' + path;
                } else {
                    path = "";
                }

                document.cookie = name + "=" + value + expires + path;
            },
            Get: function (name, defaultValue) {
                var nameEQ = name + "=";
                var cookies = document.cookie.split(';');

                for (var i = 0; i < cookies.length; i++) {

                    var cookie = cookies[i];
                    while (cookie.charAt(0) == ' ') {
                        cookie = cookie.substring(1, cookie.length);
                    }
                    if (cookie.indexOf(nameEQ) == 0) {

                        return cookie.substring(nameEQ.length, cookie.length);
                    }
                }
                return defaultValue;
            },
            Remove: function (name) {

                document.cookie = name + "=" + escape('') + "; expires=Fri, 31 Dec 1999 23:59:59 GMT;";
            }
        }
    }

SnTUtils.QueryStringManager = function (query) {

    var _that = this;
    var _coll = new Array();

    QueryStringManager = function (query) {
        if (typeof query == 'undefined') {

            _coll = SnTUtils.QueryString.Items;
        }
        else if (query != null) {

            _coll = SnTUtils.QueryString.Parse(query);
        }
    };

    this.GetItem = function (name) {
        return this.ContainsKey(name.toLowerCase()) ? _coll[name.toLowerCase()] : null;
    };

    this.SetItem = function (name, value) {
        var isItemSetted = false;
        if (name != null && name != "") {
            _coll[name.toLowerCase()] = value;

            isItemSetted = true;
        }

        return isItemSetted;
    };

    this.RemoveItem = function (name) {

        var removed = false;
        var coll = new Array();
        for (var key in _coll) {

            if (key.toLowerCase() != name.toLowerCase())
                coll[key.toLowerCase()] = _coll[key.toLowerCase()];
            else
                removed = true;
        }
        _coll = coll;

        return removed;
    };

    this.ContainsKeyWithValue = function (name) {
        if (name != null && name != "") {
            for (var key in _coll) {
                if (key != null && key != "" && name.toLowerCase() == key.toLowerCase()) {
                    return !_coll[name.toLowerCase()] != null && _coll[name.toLowerCase()] != "";
                }
            }
        }
        return false;
    };

    this.ContainsKey = function (name) {
        return _coll[name.toLowerCase()] != undefined;
    };

    this.ToString = function (prefixWithQuestionMark) {

        //default false
        prefixWithQuestionMark = (typeof prefixWithQuestionMark == 'undefined') ? false : prefixWithQuestionMark;

        var queryStrings = "";
        if (_coll != null && _coll[""] != "undefined") {
            var pairs = new Array();
            for (var key in _coll) {

                pairs.push(key + "=" + encodeURIComponent(_coll[key]));
            }
            queryStrings = prefixWithQuestionMark ? "?" : "";
            queryStrings += pairs.join("&");
        }

        if (queryStrings == "?") {

            queryStrings = "";
        }
        return queryStrings;
    };

    QueryStringManager(query);
};

SnTUtils.Hash = function () {
    this.length = 0;
    this.items = new Array();
    for (var i = 0; i < arguments.length; i += 2) {
        if (typeof (arguments[i + 1]) != 'undefined') {
            this.items[arguments[i]] = arguments[i + 1];
            this.length++;
        }
    }

    this.removeItem = function (in_key) {
        var tmp_previous;
        if (typeof (this.items[in_key]) != 'undefined') {
            this.length--;
            var tmp_previous = this.items[in_key];
            delete this.items[in_key];
        }

        return tmp_previous;
    }

    this.getItem = function (in_key) {
        return this.items[in_key];
    }

    this.setItem = function (in_key, in_value) {
        var tmp_previous;
        if (typeof (in_value) != 'undefined') {
            if (typeof (this.items[in_key]) == 'undefined') {
                this.length++;
            }
            else {
                tmp_previous = this.items[in_key];
            }

            this.items[in_key] = in_value;
        }

        return tmp_previous;
    }

    this.hasItem = function (in_key) {
        return typeof (this.items[in_key]) != 'undefined';
    }

    this.clear = function () {
        for (var i in this.items) {
            delete this.items[i];
        }

        this.length = 0;
    }
};

String.prototype.beginsWith = function (str) {
    return (this.match("^" + str) == str);
};
String.prototype.endsWith = function (str) {
    return (this.match(str + '$') == str);
};

String.prototype.trim = function (trimChars) {

    trimChars = typeof trimChars != "undefined" ? trimChars : "";

    return this.replace(/^\s+|\s+$/g, trimChars);
};

String.prototype.trimLeft = function (trimChars) {

    trimChars = typeof trimChars != "undefined" ? trimChars : "";

    return this.replace(/^\s+/, trimChars);
};

String.prototype.trimRight = function (trimChars) {

    trimChars = typeof trimChars != "undefined" ? trimChars : "";

    return this.replace(/\s+$/, trimChars);
};

if (typeof (String.contains) == 'undefined') {

    String.prototype.contains = function (value) {

        return this.indexOf(value) > -1
    };
};

String.prototype.padLeft = function (padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
};

String.prototype.padRight = function (padString, length) {
    var str = this;
    while (str.length < length)
        str = str + padString;
    return str;
};

String.IsNullOrEmpty = function (value) {

    return ((typeof value == "undefined") || (value == null) || (value.length == 0));
};
String.IsNullOrWhiteSpace = function (value) {

    return ((typeof value == "undefined") || (value == null) || (value.length == 0) || (value.toString().trim().length == 0));
};

String.Format = function (value) {

    var i = arguments.length;

    while (i-- > 0) {

        value = value.replace(new RegExp('\\{' + (i - 1) + '\\}', 'gm'), arguments[i]);
    }

    return value;
};

String.Join = function (separator, value, startIndex, count) {

    if (!separator) separator = "";
    if (!startIndex) startIndex = 0;
    if (!count) count = value.length;
    if (count == 0) return "";
    var length = 0;
    var end = (startIndex + count) - 1;
    var s = new String();
    for (var i = startIndex; i <= end; i++) {
        if (i > startIndex) s += separator;
        s += value[i];
    }
    return s;
};

function StringPadLeft(text, size, char) {

    var t = text.toString();

    var paddedString = '';
    try {

        while ((paddedString.length + t.length) < size) {

            paddedString += char;
        }

        paddedString += t;
    }
    catch (e) {

        paddedString = text;
    }
    return paddedString;
}

SnTUtils.Text =
    {
        StringBuilder: function (value) {

            var _parts = new Array();

            this.Append = function (value) {
                var results = true;

                if (typeof (value) == 'undefined') {
                    results = false;
                } else {
                    _parts.push(value);
                }
                return results;
            };
            this.AppendLine = function (value) {
                return this.Append(value + '\r\n');
            };
            this.AppendFormat = function (value) {

                this.Append(String.Format.apply(value, arguments));
            };
            this.Clear = function () {
                if (_parts.length > 0) {
                    _parts.splice(0, _parts.length);
                }
            };
            this.IsEmpty = function () {
                return (_parts.length == 0);
            };
            this.ToString = function (delimiter) {
                return _parts.join(delimiter || '');
            };
            this.ToArray = function (delimiter) {
                return _parts;
            };
            this.Init = function () {
                if (value) this.Append(value);
            };
            this.Init();
        },
        ToCamelCase: function (value) {

            var regExp = new RegExp("([A-Z])([A-Z]+)", "ig");

            function ConvertCase(a, b, c) {

                return b.toUpperCase() + c.toLowerCase();
            };

            var result = value.replace(regExp, ConvertCase);

            return result;
        },
        HtmlSymbolCodes: {

            0x0022: "quot",
            0x0026: "amp",
            0x003c: "lt",
            0x003e: "gt",
            0x00a0: "nbsp",
            0x00a1: "iexcl",
            0x00a2: "cent",
            0x00a3: "pound",
            0x00a4: "curren",
            0x00a5: "yen",
            0x00a6: "brvbar",
            0x00a7: "sect",
            0x00a8: "uml",
            0x00a9: "copy",
            0x00aa: "ordf",
            0x00ab: "laquo",
            0x00ac: "not",
            0x00ad: "shy",
            0x00ae: "reg",
            0x00af: "macr",
            0x00b0: "deg",
            0x00b1: "plusmn",
            0x00b2: "sup2",
            0x00b3: "sup3",
            0x00b4: "acute",
            0x00b5: "micro",
            0x00b6: "para",
            0x00b7: "middot",
            0x00b8: "cedil",
            0x00b9: "sup1",
            0x00ba: "ordm",
            0x00bb: "raquo",
            0x00bc: "frac14",
            0x00bd: "frac12",
            0x00be: "frac34",
            0x00bf: "iquest",
            0x00c0: "Agrave",
            0x00c1: "Aacute",
            0x00c2: "Acirc",
            0x00c3: "Atilde",
            0x00c4: "Auml",
            0x00c5: "Aring",
            0x00c6: "AElig",
            0x00c7: "Ccedil",
            0x00c8: "Egrave",
            0x00c9: "Eacute",
            0x00ca: "Ecirc",
            0x00cb: "Euml",
            0x00cc: "Igrave",
            0x00cd: "Iacute",
            0x00ce: "Icirc",
            0x00cf: "Iuml",
            0x00d0: "ETH",
            0x00d1: "Ntilde",
            0x00d2: "Ograve",
            0x00d3: "Oacute",
            0x00d4: "Ocirc",
            0x00d5: "Otilde",
            0x00d6: "Ouml",
            0x00d7: "times",
            0x00d8: "Oslash",
            0x00d9: "Ugrave",
            0x00da: "Uacute",
            0x00db: "Ucirc",
            0x00dc: "Uuml",
            0x00dd: "Yacute",
            0x00de: "THORN",
            0x00df: "szlig",
            0x00e0: "agrave",
            0x00e1: "aacute",
            0x00e2: "acirc",
            0x00e3: "atilde",
            0x00e4: "auml",
            0x00e5: "aring",
            0x00e6: "aelig",
            0x00e7: "ccedil",
            0x00e8: "egrave",
            0x00e9: "eacute",
            0x00ea: "ecirc",
            0x00eb: "euml",
            0x00ec: "igrave",
            0x00ed: "iacute",
            0x00ee: "icirc",
            0x00ef: "iuml",
            0x00f0: "eth",
            0x00f1: "ntilde",
            0x00f2: "ograve",
            0x00f3: "oacute",
            0x00f4: "ocirc",
            0x00f5: "otilde",
            0x00f6: "ouml",
            0x00f7: "divide",
            0x00f8: "oslash",
            0x00f9: "ugrave",
            0x00fa: "uacute",
            0x00fb: "ucirc",
            0x00fc: "uuml",
            0x00fd: "yacute",
            0x00fe: "thorn",
            0x00ff: "yuml",
            0x0152: "OElig",
            0x0153: "oelig",
            0x0160: "Scaron",
            0x0161: "scaron",
            0x0178: "Yuml",
            0x0192: "fnof",
            0x02c6: "circ",
            0x02dc: "tilde",
            0x0391: "Alpha",
            0x0392: "Beta",
            0x0393: "Gamma",
            0x0394: "Delta",
            0x0395: "Epsilon",
            0x0396: "Zeta",
            0x0397: "Eta",
            0x0398: "Theta",
            0x0399: "Iota",
            0x039a: "Kappa",
            0x039b: "Lambda",
            0x039c: "Mu",
            0x039d: "Nu",
            0x039e: "Xi",
            0x039f: "Omicron",
            0x03a0: "Pi",
            0x03a1: "Rho",
            0x03a3: "Sigma",
            0x03a4: "Tau",
            0x03a5: "Upsilon",
            0x03a6: "Phi",
            0x03a7: "Chi",
            0x03a8: "Psi",
            0x03a9: "Omega",
            0x03b1: "alpha",
            0x03b2: "beta",
            0x03b3: "gamma",
            0x03b4: "delta",
            0x03b5: "epsilon",
            0x03b6: "zeta",
            0x03b7: "eta",
            0x03b8: "theta",
            0x03b9: "iota",
            0x03ba: "kappa",
            0x03bb: "lambda",
            0x03bc: "mu",
            0x03bd: "nu",
            0x03be: "xi",
            0x03bf: "omicron",
            0x03c0: "pi",
            0x03c1: "rho",
            0x03c2: "sigmaf",
            0x03c3: "sigma",
            0x03c4: "tau",
            0x03c5: "upsilon",
            0x03c6: "phi",
            0x03c7: "chi",
            0x03c8: "psi",
            0x03c9: "omega",
            0x03d1: "thetasym",
            0x03d2: "upsih",
            0x03d6: "piv",
            0x2002: "ensp",
            0x2003: "emsp",
            0x2009: "thinsp",
            0x200c: "zwnj",
            0x200d: "zwj",
            0x200e: "lrm",
            0x200f: "rlm",
            0x2013: "ndash",
            0x2014: "mdash",
            0x2018: "lsquo",
            0x2019: "rsquo",
            0x201a: "sbquo",
            0x201c: "ldquo",
            0x201d: "rdquo",
            0x201e: "bdquo",
            0x2020: "dagger",
            0x2021: "Dagger",
            0x2022: "bull",
            0x2026: "hellip",
            0x2030: "permil",
            0x2032: "prime",
            0x2033: "Prime",
            0x2039: "lsaquo",
            0x203a: "rsaquo",
            0x203e: "oline",
            0x2044: "frasl",
            0x20ac: "euro",
            0x2111: "image",
            0x2118: "weierp",
            0x211c: "real",
            0x2122: "trade",
            0x2135: "alefsym",
            0x2190: "larr",
            0x2191: "uarr",
            0x2192: "rarr",
            0x2193: "darr",
            0x2194: "harr",
            0x21b5: "crarr",
            0x21d0: "lArr",
            0x21d1: "uArr",
            0x21d2: "rArr",
            0x21d3: "dArr",
            0x21d4: "hArr",
            0x2200: "forall",
            0x2202: "part",
            0x2203: "exist",
            0x2205: "empty",
            0x2207: "nabla",
            0x2208: "isin",
            0x2209: "notin",
            0x220b: "ni",
            0x220f: "prod",
            0x2211: "sum",
            0x2212: "minus",
            0x2217: "lowast",
            0x221a: "radic",
            0x221d: "prop",
            0x221e: "infin",
            0x2220: "ang",
            0x2227: "and",
            0x2228: "or",
            0x2229: "cap",
            0x222a: "cup",
            0x222b: "int",
            0x2234: "there4",
            0x223c: "sim",
            0x2245: "cong",
            0x2248: "asymp",
            0x2260: "ne",
            0x2261: "equiv",
            0x2264: "le",
            0x2265: "ge",
            0x2282: "sub",
            0x2283: "sup",
            0x2284: "nsub",
            0x2286: "sube",
            0x2287: "supe",
            0x2295: "oplus",
            0x2297: "otimes",
            0x22a5: "perp",
            0x22c5: "sdot",
            0x2308: "lceil",
            0x2309: "rceil",
            0x230a: "lfloor",
            0x230b: "rfloor",
            0x2329: "lang",
            0x232a: "rang",
            0x25ca: "loz",
            0x2660: "spades",
            0x2663: "clubs",
            0x2665: "hearts",
            0x2666: "diams"
        },
        HtmlChars: {}
    };

for (var property in SnTUtils.Text.HtmlSymbolCodes) {

    var name = SnTUtils.Text.HtmlSymbolCodes[property];
    SnTUtils.Text.HtmlChars[name] = String.fromCharCode(property);
}

SnTUtils.DisableTextSelection = function (target) {

    if (typeof target.onselectstart != "undefined") {

        target.onselectstart = function () { return false }
    }
    else if (typeof target.style.MozUserSelect != "undefined") {

        target.style.MozUserSelect = "none"
    }
    else {

        target.onmousedown = function () { return false }
    }
    target.style.cursor = "default"
};

SnTUtils.Loader = {

    Enabled: true,
    Text: '<img src="/WebResources/Images/ajax-loader.gif" title="..." />',
    StartHandler: null,
    StopHandler: null,
    CssClass: 'loader',
    AddInlineCss: true,
    Html: null,
    Delay: 0,
    Instance: null,
    IgnoreRedirectState: false,
    BeforeShow: null,
    Show: function () {

        if (SnTUtils.Loader.StartHandler != null) {

            SnTUtils.Loader.StartHandler();
        }
        else {

            if (SnTUtils.Loader.Enabled) {

                if (SnTUtils.Loader.BeforeShow != null) {

                    SnTUtils.Loader.BeforeShow();
                }

                var ajaxLoader = $("." + SnTUtils.Loader.CssClass);
                if (!ajaxLoader.length) {

                    if (SnTUtils.Loader.Html) {

                        ajaxLoader = $(SnTUtils.Loader.Html);
                    }
                    else {

                        ajaxLoader = $(String.Format('<div class="{0}">{1}</div>', SnTUtils.Loader.CssClass, SnTUtils.Loader.Text));

                        if (SnTUtils.Loader.AddInlineCss) {
                            ajaxLoader.css({
                                position: 'fixed',
                                width: '20px',
                                height: '20px',
                                zIndex: '1',
                                left: '5px',
                                bottom: '5px'
                            });
                        }
                    }
                    ajaxLoader.appendTo(SnTUtils.Elements.Body);
                }

                SnTUtils.Loader.Instance = ajaxLoader;

                if (SnTUtils.Loader.Delay > 0) {

                    var instanceId = SnTUtils.Guid.NewGuid().ToString();

                    var timerId = setTimeout(function () {
                        if (SnTUtils.Loader.Instance.data('instanceId') === instanceId) {
                            SnTUtils.Loader.Instance.show();
                        }
                    }, SnTUtils.Loader.Delay);

                    SnTUtils.Loader.Instance.data('timerId', timerId);
                    SnTUtils.Loader.Instance.data('instanceId', instanceId);
                }
                else {
                    SnTUtils.Loader.Instance.show();
                }
            }
        }
    },
    Hide: function () {

        if (!SnTUtils.HttpContext.Redirecting === true) {
            var loader = SnTUtils.Loader.Instance;
            if (loader) {

                var timerId = SnTUtils.Loader.Instance.data('timerId');
                if (timerId) {

                    clearTimeout(SnTUtils.Loader.Instance.data('timerId'));

                    SnTUtils.Loader.Instance.data('timerId', undefined);
                    SnTUtils.Loader.Instance.data('instanceId', undefined);
                }
            }

            if (!SnTUtils.Loader.IgnoreRedirectState && SnTUtils.HttpContext.Redirecting === false) {

                if (typeof (SnTCms) != 'undefined' && typeof (SnTCms.SessionLease) != 'undefined' && typeof (SnTCms.SessionLease.Reset) != 'undefined') {

                    //session refreshed
                    SnTCms.SessionLease.Reset();
                }

                if (SnTUtils.Loader.StopHandler != null) {

                    SnTUtils.Loader.StopHandler();
                }
                else {

                    if (loader) {

                        loader.hide();
                    }
                }
            }
        }
    },
    DisableDelay: function () {
        SnTUtils.Loader.Delay = 0;
    }
};

SnTUtils.GetDataFromJson = function (jsonData) {

    try {

        if (jsonData.hasOwnProperty('d')) {
            return jsonData.d;
        } else {
            return jsonData;
        }
    }
    catch (e) {

        var message = "The data is not retrieved, check the URL for the web service. \n" + e.message;

        SnTUtils.HandleException(message, "SnTUtils.GetDataFromJson");
    }
    return null;
};

SnTUtils.Ajax = function (url, paramsdata, onSucessFn, onErrorFn, optionCallBack, optionCallbackData, options) {

    var jsonData = SnTUtils.JSONOrginal.stringify(paramsdata);

    var success = function (jsonData, stat) {

        if (options != null && typeof (options.senderElement) != 'undefined') {
            $(options.senderElement).removeClass('disabled');
        }

        if (stat == "success") {

            try {
                var parsedJsonData = SnTUtils.GetDataFromJson(jsonData);

                onSucessFn(parsedJsonData, optionCallBack, optionCallbackData);
            }
            catch (e) {

                SnTUtils.HandleException(e, "SnTUtils.Ajax.SuccessCallback");

                if (typeof onErrorFn != 'undefined') {

                    onErrorFn(e);
                }
            }
        }
    };
    var error = function (data, textStatus) {

        if (options != null && typeof (options.senderElement) != 'undefined') {
            $(options.senderElement).removeClass('disabled');
        }

        SnTUtils.HandleAspNetException(data, "Ajax.error");

        if (typeof onErrorFn != 'undefined') {

            onErrorFn(data.responseText, data);
        }
    };

    var config = $.extend({}, {
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        data: jsonData,
        dataType: "json",
        success: success,
        error: error,
        senderElement: null,
        beforeSend: SnTUtils.Ajax.BeforeSend
    }, options);

    var xhr = $.ajax(config);

    return xhr;
};

SnTUtils.Ajax.OnAjaxStartActions = new Array();
SnTUtils.Ajax.OnAjaxStopActions = new Array();

SnTUtils.Ajax.Initialize = function () {

    SnTUtils.Ajax.OnAjaxStartActions.push(SnTUtils.Loader.Show);
    SnTUtils.Ajax.OnAjaxStopActions.push(SnTUtils.Loader.Hide);

    SnTUtils.Elements.Body.ajaxStart(SnTUtils.Ajax.OnAjaxStart);
    SnTUtils.Elements.Body.ajaxStop(SnTUtils.Ajax.OnAjaxStop);
};

SnTUtils.Ajax.OnAjaxStart = function () {
    SnTUtils.Ajax.ExecuteAjaxActions(SnTUtils.Ajax.OnAjaxStartActions);
}

SnTUtils.Ajax.OnAjaxStop = function () {
    SnTUtils.Ajax.ExecuteAjaxActions(SnTUtils.Ajax.OnAjaxStopActions);
}

SnTUtils.Ajax.ExecuteAjaxActions = function (actions) {
    try {
        for (var i = 0; i < actions.length; i++) {

            var action = actions[i];

            if (action != null) {
                actions[i]();
            }
        }
    } catch (e) {
        console.log(e);
    }
}

SnTUtils.Ajax.RemoveAction = function (actions, action) {
    if (actions != null) {
        var actionIndex = actions.indexOf(action);

        if (actionIndex >= 0) {
            actions.splice(actionIndex, 1);
        }
    }
}

SnTUtils.Ajax.ShowAlertOnError = false;
SnTUtils.Ajax.HeaderNames =
    {
        AjaxRequestIdentifier: "X-AjaxRequest",
        CsrfIdentifier: "X-CsrfIdentifier",
        ParentRequestId: "X-ParentRequestId"
    };
SnTUtils.Ajax.BeforeSend = function (xhr) {

    var shouldSend = true;
    var $element;

    if (this.senderElement) {
        $element = $(this.senderElement);
    } else if (this instanceof jQuery) {
        $element = this;
    } else if (this.nodeName) {
        $element = $(this);
    }

    if ($element && $element.hasClass('disabled')) {
        return false;
    }

    if ($element) {
        $element.addClass('disabled');
    }

    if (xhr && xhr.setRequestHeader) {

        xhr.setRequestHeader(SnTUtils.Ajax.HeaderNames.AjaxRequestIdentifier, true);

        if (SnTUtils.HttpContext.Request.Id) {
            xhr.setRequestHeader(SnTUtils.Ajax.HeaderNames.ParentRequestId, SnTUtils.HttpContext.Request.Id);
        }

        var csrfIdentifierControl = $("#" + SnTUtils.CsrfIdentifierControlId);
        if (csrfIdentifierControl.length) {

            xhr.setRequestHeader(SnTUtils.Ajax.HeaderNames.CsrfIdentifier, csrfIdentifierControl.val());
        }

        if (SnTUtils.Ajax.HttpHeaders) {

            for (var header in SnTUtils.Ajax.HttpHeaders) {
                var headerValue = SnTUtils.Ajax.HttpHeaders[header];

                xhr.setRequestHeader(header, headerValue);
            }
        }
    }
};

SnTUtils.Ajax.OnError = function (message) {

    SnTUtils.Audit.push(
        {
            Time: SnTUtils.DateTime.Now().ToString("dd.MM.yyyy. hh:ss.fff"),
            Message: message
        });

    if (typeof (console) != 'undefined' && typeof (console.log) != 'undefined') {

        console.log(message);
    }
    else if (SnTUtils.Ajax.ShowAlertOnError) {

        alert(message);
    }
};

SnTUtils.Ajax.InsertContent = function (serviceUrlOrOptions, destinationContainerId) {

    var options = null;

    if (SnTUtils.Helper.IsObject(serviceUrlOrOptions)) {

        options = serviceUrlOrOptions;
    }
    else {

        options = { Url: serviceUrlOrOptions };
    }

    var manager = new SnTUtils.AjaxContentManager(options);

    var xhr = manager.InsertContent(destinationContainerId);

    return xhr;
};

SnTUtils.AjaxContentManager = function (options) {

    var _me = this;
    var _ajaxLoaderInstance = null;

    this.Context = $.extend({}, SnTUtils.AjaxContentManager.Defaults, options || {});

    var _constructor = function () {

        SnTUtils.Elements.Body.trigger("ajaxcontentmanagerinit", [_me]);
    };

    this.InsertContent = function (destinationContainerId) {

        var container = $(String.Format("#{0}", destinationContainerId))

        container.addClass(_me.Context.LoadingCssClass);

        if (_me.Context.EmptyContainerOnAjaxStart) {
            container.empty();
        }

        if (_me.Context.ShowLoader) {

            _me.ShowLoader(container);
        }

        if (_me.Context.OnAjaxStart) {

            _me.Context.OnAjaxStart(container, this);
        }

        SnTUtils.Ajax.RemoveAction(SnTUtils.Ajax.OnAjaxStartActions, SnTUtils.Loader.Show);
        SnTUtils.Ajax.RemoveAction(SnTUtils.Ajax.OnAjaxStopActions, SnTUtils.Loader.Hide);

        var onComplete = function (content, status, jqXHR) {

            SnTUtils.Ajax.OnAjaxStartActions.push(SnTUtils.Loader.Show);
            SnTUtils.Ajax.OnAjaxStopActions.push(SnTUtils.Loader.Hide);

            _me.HideLoader();

            container.removeClass(_me.Context.LoadingCssClass);

            if (_me.Context.OnAjaxStopDeleteContainer == true) {
                container.replaceWith(content);
            }
            else {
                container.html(content);
            }

            if (_me.Context.OnAjaxStopShowContainer === true && _me.Context.ShowContainerFunction != null) {
                _me.Context.ShowContainerFunction.call(container);
            }

            if (_me.Context.OnAjaxStop) {

                _me.Context.OnAjaxStop(container.length ? container : content, this, content, status, jqXHR);
            }

            SnTUtils.Elements.Body.trigger("ajaxcontentmanagercomplete", [_me, container, status, jqXHR]);
        };

        var xhr = null;

        if (_me.Context.UseJqueryGetMethod === true) {
            xhr = $.ajax({
                url: _me.Context.Url,
                success: onComplete,
                beforeSend: SnTUtils.Ajax.BeforeSend
            });
        }
        else {

            xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {

                if (((this.DONE && this.readyState == this.DONE) || (!this.DONE && this.readyState === 4))) {

                    if (this.status == 200) {
                        onComplete(this.responseText, this.status, xhr);
                    }
                    else if (_me.Context.Handle480 && this.status == 480) {

                        _me.Context.Handle480Callback.apply(this, [this.responseText]);
                    }
                }
            };

            if (!_me.Context.Cache) {
                _me.Context.Url += (_me.Context.Url.contains("?") ? "&" : "?") + "ajaxRequestId=" + SnTUtils.Guid.NewGuid().ToString();
            }

            xhr.open("GET", _me.Context.Url);

            SnTUtils.Ajax.BeforeSend(xhr);

            xhr.send();
        }

        return xhr;
    };

    this.ShowLoader = function (container) {

        container = container || SnTUtils.Elements.Body;

        _ajaxLoaderInstance = $(_me.Context.LoaderHtml);

        if (_me.Context.Delay > 0) {

            var instanceId = SnTUtils.Guid.NewGuid().ToString();

            var timerId = setTimeout(function () {
                if (_ajaxLoaderInstance.data('instanceId') === instanceId) {
                    _ajaxLoaderInstance.appendTo(container);
                }
            }, _me.Context.Delay);

            _ajaxLoaderInstance.data('timerId', timerId);
            _ajaxLoaderInstance.data('instanceId', instanceId);
        }
        else {
            _ajaxLoaderInstance.appendTo(container);
        }

    };

    this.HideLoader = function () {

        if (_ajaxLoaderInstance) {

            var timerId = _ajaxLoaderInstance.data('timerId');
            if (timerId) {

                clearTimeout(_ajaxLoaderInstance.data('timerId'));

                _ajaxLoaderInstance.data('timerId', undefined);
                _ajaxLoaderInstance.data('instanceId', undefined);
            }

            _ajaxLoaderInstance.remove();
        }
    };

    _constructor();
};

SnTUtils.AjaxContentManager.Defaults =
    {
        Url: null,
        EmptyContainerOnAjaxStart: false,
        ShowLoader: SnTUtils.Loader.Enabled,
        ShowContainerFunction: $.fn.fadeIn,
        OnAjaxStart: null,
        OnAjaxStop: null,
        OnAjaxStopShowContainer: true,
        OnAjaxStopDeleteContainer: false,
        LoaderHtml: SnTUtils.Loader.Text,
        LoadingCssClass: "ajax-loading",
        UseJqueryGetMethod: false,
        Cache: false,
        Handle401: false,
        Handle480: true,
        Handle480Callback: function (responseText) {

            SnTUtils.Loader.DisableDelay();

            SnTUtils.Loader.Show();

            window.location.reload();
        }
    };

SnTUtils.ServiceProxy = function (url, options) {

    var _me = this;
    this.Url = url;
    this.Xhr = null;
    this.IsAsync = true;
    this.Config = null;
    this.DefaultErrorMessage = "Ajax poziv:\nDogodila se greška.";
    this.Loader = true;

    this.Abort = function () {

        if (_me.Xhr != null && _me.Xhr.abort) {

            _me.Xhr.abort();
        }
    };
    this.OnError = function (message, data) {

        if (_me.Config.Handle401 === true && data && data.status == 401) {
            var loginUrl = String.Format("/UserLogin.aspx?ReturnUrl={0}", SnTUtils.HttpUtility.UrlEncode(window.location.href));

            window.location.href = loginUrl;
        }
        else if (_me.Config.Handle480 === true && data && data.status == 480) {

            SnTUtils.AjaxContentManager.Defaults.Handle480Callback.apply(this, [message]);
        }
        else if (!String.IsNullOrEmpty(message)) {

            message = String.Format("{0}\n'{1}'", _me.DefaultErrorMessage, message);
        }
        else {
            message = _me.DefaultErrorMessage;
        }

        SnTUtils.Ajax.OnError(message);
    };

    this.Invoke = function (methodName, params, successFn, errorFn, options) {

        var url = null;

        if (!String.IsNullOrEmpty(_me.Url)) {
            if (_me.Url.toLowerCase().endsWith("controller")) {

                url = String.Format("{0}&action={1}", _me.Url, methodName)
            }
            else {
                url = String.Format("{0}/{1}", _me.Url, methodName);
            }
        }
        else {
            url = methodName;
        }

        errorFn = typeof errorFn != 'undefined' && errorFn != null ? errorFn : _me.OnError;

        var config = $.extend({}, _me.Config, options);

        var isLoaderEnabled = SnTUtils.Loader.Enabled;

        SnTUtils.Loader.Enabled = config.Loader;

        _me.Xhr = SnTUtils.Ajax(url, params, successFn, errorFn, null, null, config);

        SnTUtils.Loader.Enabled = isLoaderEnabled;

        if (!config.async) {
            return SnTUtils.GetDataFromJson($.parseJSON(_me.Xhr.responseText));
        }
    };

    this.SyncInvoke = function (methodName, params, options) {

        var config = $.extend({}, {
            async: false
        }, options);

        var result = _me.Invoke(methodName, params, function (result) { }, _me.OnError, config);

        return result;
    };

    function Init() {

        _me.Config = $.extend({}, {
            async: _me.IsAsync,
            Loader: _me.Loader,
            Handle401: SnTUtils.ServiceProxy.Defaults.Handle401,
            Handle480: SnTUtils.ServiceProxy.Defaults.Handle480
        }, options);
    };

    Init();
};

SnTUtils.ServiceProxy.Defaults =
    {
        Handle401: false,
        Handle480: true
    };

SnTUtils.ConsoleClear = function () {

    $("div#debugConsole table.consoleData tr:not('table.consoleData tr:last')").remove();
};

SnTUtils.ConsolePrint = function (text) {

    var time = new Date();

    text = StringPadLeft(time.getHours(), 2, '0') + ':' + StringPadLeft(time.getMinutes(), 2, '0') + ':' + StringPadLeft(time.getSeconds(), 2, '0') + ':' + StringPadLeft

        (time.getMilliseconds(), 3, '0') + '  ' + text;

    SnTUtils.Audit.push(text);

    if (SnTUtils.Debuging) {

        if ($.browser.mozilla) {

            console.log(text);

            $("div#debugConsole").hide();
        }
        else {

            var debugConsole = $("div#debugConsole");

            if (!debugConsole.length) {

                debugConsole = $('<div id="debugConsole" Style="z-index:5000;vertical-align:top;overflow:auto;display:none;position:absolute;width:100%;height:100px;bottom:10px;color:Black;margin-left:5px !important;margin-right:5px !important;border: 1px dotted #BBBBBB;background-color:White;"><span><a href="#" style="color:black; float:right; width:30px;" onclick="SnTUtils.ConsoleClear(); return false">Clear</a></span><table width="100%" class="consoleData"><tr><td>&nbsp;&nbsp;</td></tr></table></div>');

                $("body").append(debugConsole);

                debugConsole.width($(window).width() - 20);

                debugConsole.show();
            }
            var consoleData = debugConsole.find("table.consoleData");

            text = text.replace('\n', '<br/>')

            var tr = $('<tr><td style="color:black;">' + text + '</td></tr>');

            consoleData.prepend(tr);
        }
    }
};

SnTUtils.HandleException = function (e, methodName) {

    var message = methodName != undefined ? "Method: " + methodName + "\n" : '';

    if (typeof e == 'object') {
        message += ("File: " + e.fileName + "\n");
        message += ("Line Number: " + e.lineNumber + "\n");
        message += "Type: " + e.name + "\n";
        message += "Message: " + e.message + "\n";
        message += "Stack Trace: " + e.stack + "\n";
    }
    else {
        message += e;
    }

    SnTUtils.ConsolePrint(message);
};

SnTUtils.HandleAspNetException = function (e, methodName) {

    var ex = $.parseJSON(e.responseText);

    if (ex == null) {

        SnTUtils.HandleException(e, methodName);
    }
    else {

        var message = methodName != undefined ? "Method: " + methodName + "\n" : '';

        if (SnTUtils.Helper.IsObject(ex)) {
            message += "Type: " + ex.ExceptionType + "\n";
            message += "Message: " + ex.Message + "\n";
            message += "Stack Trace: " + ex.StackTrace + "\n";
        }

        SnTUtils.ConsolePrint(message);
    }
};

SnTUtils.Debug = function (message) {

    SnTUtils.ConsolePrint(message);
};

jQuery.expr[':'].data = function (elem, index, m) {

    m[0] = m[0].replace(/:data\(|\)$/g, '');

    var regex = new RegExp('([\'"]?)((?:\\\\\\1|.)+?)\\1(,|$)', 'g'),
        key = regex.exec(m[0])[2],
        val = regex.exec(m[0])[2];

    return val ? jQuery(elem).data(key) == val : !!jQuery(elem).data(key);
};

jQuery.expr[":"].asp = function (a, i, m) {

    var id = $(a).attr('id');

    return id && id.endsWith("_" + m[3]);
};

SnTUtils.Parser =
    {
        Parse: function (object, value) {

            var result = null;
            switch (typeof (object)) {
                case "number":
                    result = SnTUtils.Parser.TryParseFloat(value);
                    break;
                case "string":
                    result = value;
                    break;
                case "boolean":
                    result = SnTUtils.Parser.TryParseBoolean(value);
                    break;
                case "object":
                    if (typeof (object["getDate"]) == "function") {

                        result = SnTUtils.Parser.TryParseDateTimeNullable(value);
                    }
                    else {
                        result = value;
                    }
                    break;
                default:
                    result = value;
                    break;
            }
            return result;
        },
        TryParseInt: function (strValue, defaultValue) {

            var defaultVal = typeof defaultValue != 'undefined' ? SnTUtils.Parser.TryParseInt(defaultValue) : 0;

            var retValue = SnTUtils.Parser.TryParseIntNullable(strValue);

            if (retValue == null) {

                retValue = defaultVal;
            }

            return retValue;
        },
        TryParseIntNullable: function (strValue) {

            var retValue = null;

            if (typeof strValue != "undefined" && strValue != null && !String.IsNullOrWhiteSpace(strValue) && !isNaN(strValue)) {

                retValue = parseInt(strValue);
            }

            return retValue;
        },
        TryParseFloat: function (strValue, defaultValue) {

            var defaultVal = typeof defaultValue != 'undefined' ? SnTUtils.Parser.TryParseFloatNullable(defaultValue) : 0.0;

            var retValue = SnTUtils.Parser.TryParseFloatNullable(strValue);

            if (retValue == null) {

                retValue = defaultVal;
            }

            return retValue;
        },
        TryParseFloatNullable: function (strValue) {

            var retValue = null;

            if (typeof strValue != "undefined" && strValue != null && !String.IsNullOrWhiteSpace(strValue) && !isNaN(strValue)) {

                retValue = parseFloat(strValue);
            }

            return retValue;
        },
        TryParseBoolean: function (value) {

            var results = new String(value).toLowerCase();
            if (results == "true" || results == "1" || results == "-1" || results == "on" || results == "yes") {

                return true;
            }

            return false;
        },
        TryParseBooleanNullable: function (strValue) {

            if (strValue == null || strValue == "") {
                return null;
            }
            else {

                return SnTUtils.Parser.TryParseBoolean(strValue);
            }
        },
        TryParseDateTimeNullable: function (o) {

            var retValue = null;

            if (typeof o != "undefined" && o != null) {

                if (o.startsWith("/Date(")) {
                    retValue = new Date(parseInt(o.replace('/Date(', '')));
                }
                else {
                    retValue = result = new Date().GetFromString(o);
                }

                if (retValue != null && retValue.getYear() == -1901) {

                    retValue = null;
                }
            }

            return retValue;
        }
    };

SnTUtils.Parser.TryParseDouble = SnTUtils.Parser.TryParseFloat;
SnTUtils.Parser.TryParseDoubleNullable = SnTUtils.Parser.TryParseFloatNullable;

SnTUtils.ExecutionQueue = function (autoStart) {

    var _that = this;
    var _items = [];
    var _counter = 0;
    var _executing = typeof autoStart == 'undefined' ? false : !autoStart;

    this.Enqueue = function (callback) {

        //SnTUtils.Debug("SnTUtils.ExecutionQueue.Enqueue");

        _items[_items.length] = callback;
        if (_executing == false) {

            _that.Dequeue();
        }
    };
    this.Dequeue = function () {

        //SnTUtils.Debug("SnTUtils.ExecutionQueue.Dequeue");

        if (_items[_counter]) {

            _executing = true;
            _items[_counter]();
            delete _items[_counter];
            _counter++;

            setTimeout(_that.Dequeue, 1)
        }
        else {

            _executing = false
        }
    };
    this.ForceDequeue = function () {

        _executing = false;

        _that.Dequeue();
    };
    this.Flush = function () {

        _items = [];
        _counter = 0;
        _executing = false;
    }
};

SnTUtils.HttpUtility =
    {
        HtmlDecode: function (s) {
            var out = "";
            if (s != null) {
                var l = s.length;
                for (var i = 0; i < l; i++) {
                    var ch = s.charAt(i);
                    if (ch == '&') {
                        var semicolonIndex = s.indexOf(';', i + 1);
                        if (semicolonIndex > 0) {
                            var entity = s.substring(i + 1, semicolonIndex);
                            if (entity.length > 1 && entity.charAt(0) == '#') {
                                if (entity.charAt(1) == 'x' || entity.charAt(1) == 'X') {
                                    ch = String.fromCharCode(eval('0' + entity.substring(1)));
                                } else {
                                    ch = String.fromCharCode(eval(entity.substring(1)));
                                }
                            } else {
                                ch = SnTUtils.Text.HtmlChars[entity] ? SnTUtils.Text.HtmlChars[entity] : '';
                            }
                            i = semicolonIndex;
                        }
                    }
                    out += ch;
                }
            }
            return out;
        },
        HtmlEncode: function (html) {

            var div = document.createElement("div");
            var text = document.createTextNode(html);
            div.appendChild(text);
            html = div.innerHTML;
            delete div;

            return html;
        },
        UrlEncode: function (url) {

            url = (url + '').toString();

            url = encodeURIComponent(url).replace(/!/g, '%21')
                .replace(/'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29')
                .replace(/\*/g, '%2A')
                .replace(/%20/g, '+');
            return url;
        },
        UrlDecode: function (url) {

            url = decodeURIComponent(url.replace(/\+/g, ' '));

            return url;
        },
        ParseQueryString: SnTUtils.QueryString.Parse
    };

SnTUtils.Random = function () {

    this.Next = function (minValue, maxValue) {
        switch (arguments.length) {
            case 0:
                maxValue = Math.pow(2, 31);
                minValue = 0;
                break;
            case 1:
                maxValue = arguments[0];
                minValue = 0;
                break;
            case 2:
                break;
            default:
                return 0;
                break;
        }
        var number = minValue;
        if (maxValue > minValue) {
            number = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
        }
        return number;
    };
    this.NextBytes = function (buffer) {
        var length = buffer.length;
        for (var i = 0; i < length; i++) {
            buffer[i] = this.Next(0, 256);
        }
        return buffer;
    };
};

SnTUtils.Guid = function (guid) {
    this.Type = "Guid";
    this.Bytes = new Array;
    this.ByteOrder = [3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 14, 15];

    this.ToString = function (format) {

        format = format ? format : "D";
        var addHyphens = ("DBP".indexOf(format) > -1);
        var guid = new String;
        for (var i = 0; i < 16; i++) {
            if (addHyphens) guid += (i == 4 || i == 6 || i == 8 || i == 10 ? "-" : "");
            var pos = this.ByteOrder[i];
            guid += this.numberToHex(this.Bytes[pos]);
        }
        if (format == "B") guid = "{" + guid + "}";
        if (format == "P") guid = "(" + guid + ")";
        return guid;
    };
    this.toString = this.ToString;

    this.ToByteArray = function () {
        return this.Bytes;
    };
    this.Equals = function (value) {
        var guid = value;
        var results = true;
        if (typeof (value) != "object") {
            guid = new SnTUtils.Guid(value);
        }
        for (var i = 0; i < 16; i++) {
            if (this.Bytes[i] != guid.Bytes[i]) {
                results = false;
                break;
            }
        }
        return results;
    };
    this.numberToHex = function (value) {
        var hex = ((value <= 0xF) ? "0" : "");
        hex += value.toString(16);
        return hex;
    };
    this.GuidStringToBytes = function (value) {

        var regExp = new RegExp("[{}\(\)-]", "g");
        var guid = value.replace(regExp, "");

        var bytes = new Array();
        for (var i = 0; i < 16; i++) {
            var pos = this.ByteOrder[i];
            var b1 = guid.charAt(pos * 2);
            var b2 = guid.charAt(pos * 2 + 1);
            bytes.push(unescape("%" + b1 + b2).charCodeAt(0));
        }
        return bytes;
    };
    this.Init = function () {
        this.Bytes = new Array();

        var a0 = arguments[0];
        switch (typeof (a0)) {
            case "null":
                for (var i = 0; i < 16; i++) this.Bytes.push(0);
                break;
            case "undefined":
                for (var i = 0; i < 16; i++) this.Bytes.push(0);
                break;
            case "string":
                this.Bytes = this.GuidStringToBytes(a0);
                break;
            case "object":
                if (a0.Type && a0.Type == "Guid") {

                    for (var i = 0; i < 16; i++) {
                        this.Bytes.push(a0.Bytes[i]);
                    }
                }
                else {
                    for (var i = 0; i < 16; i++) {
                        this.Bytes.push(a0[i]);
                    }
                }
                break;
            default:
                break;
        }
    }
    this.Init.apply(this, arguments);
};

SnTUtils.Guid.Empty = new SnTUtils.Guid("00000000-0000-0000-0000-000000000000");

SnTUtils.Guid.NewGuid = function () {

    var bytes = new Array();
    for (var i = 0; i < 16; i++) {

        var dec = Math.floor(Math.random() * 0xFF);
        bytes.push(dec);
    }
    var guid = new SnTUtils.Guid(bytes);
    return guid;
};

Math.ShiftRight = function (number, positions) {

    var h = Math.pow(2, positions);
    var d = number & (h - 1);
    var n = number - d;
    return n / h;
};

Math.ShiftLeft = function (number, positions) {
    return number * Math.pow(2, positions);
};

SnTUtils.DateTime = {};

SnTUtils.DateTime.Now = function () {

    return new Date();
}

SnTUtils.DateTime.Globalization =
    {
        HR:
        {
            Separator: ".",
            YearMin: 1900,
            YearMax: 2100,
            DateFormat: "dd.MM.yyyy",
            XFormat: "dd.MM.yyyy HH:mm:ss.fffzzz",
            OutlookFormat: "dd.MM.yyyy HH:mm",
            www: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
            ddd: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
            dddd: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"],
            MMM: ["Sij", "Velj", "Ožu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"],
            MMMM: ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"],
            Expression: new RegExp("([0-9][0-9]).(0[1-9]|1[012]).(0[1-9]|[12][0-9]|3[01])"),
            ExpressionUtcDate: new RegExp("(0[1-9]|[12][0-9]|3[01]).(0[1-9]|1[012]).([0-9][0-9][0-9][0-9])"),
            ExpressionUtcDatePositions: { Year: '$3', Month: '$2', Day: '$1' },
            ExpressionUtcTime: new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])"),
            ExpressionUtcMs: new RegExp("\.([0-9]+)"),
            ExpressionZone: new RegExp("([+-])([01][0-9]|[2][0123]):([012345][0-9])"),
            ExpressionUtc: new RegExp(new RegExp("(0[1-9]|[12][0-9]|3[01]).(0[1-9]|1[012]).([0-9][0-9][0-9][0-9])").toString() + "[T ]" + new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])").toString()),
            Expressions:
            {
                Default: new RegExp("(0[1-9]|1[012])/(0[1-9]|[12][0-9]|3[01])/([0-9][0-9])"),
                UtcDate: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])"),
                UtcTime: new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])"),
                UtcMs: new RegExp("\.([0-9]+)"),
                Zone: new RegExp("([+-])([01][0-9]|[2][0123]):([012345][0-9])"),
                Utc: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])" + "[T ]" + "([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])")
            }
        },
        EN:
        {
            Separator: "/",
            YearMin: 1900,
            YearMax: 2100,
            DateFormat: "dd/mm/yyyy",
            XFormat: "yyyy-MM-ddTHH:mm:ss.fffzzz",
            OutlookFormat: "yyyy-MM-dd HH:mm",
            www: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            ddd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            dddd: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thuesday", "Friday", "Saturday"],
            MMM: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            MMMM: ["January", "February", "March", "April", "May", "June", "July", "Augst", "Sepember", "October", "Novmber", "December"],
            Expression: new RegExp("(0[1-9]|[12][0-9]|3[01]).(0[1-9]|1[012]).([0-9][0-9])"),
            ExpressionUtcDate: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])"),
            ExpressionUtcDatePositions: { Year: '$1', Month: '$2', Day: '$3' },
            ExpressionUtcTime: new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])"),
            ExpressionUtcMs: new RegExp("\.([0-9]+)"),
            ExpressionZone: new RegExp("([+-])([01][0-9]|[2][0123]):([012345][0-9])"),
            ExpressionUtc: new RegExp(new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])").toString() + "[T ]" + new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])").toString()),
            Expressions:
            {
                Default: new RegExp("(0[1-9]|1[012])/(0[1-9]|[12][0-9]|3[01])/([0-9][0-9])"),
                UtcDate: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])"),
                UtcTime: new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])"),
                UtcMs: new RegExp("\.([0-9]+)"),
                Zone: new RegExp("([+-])([01][0-9]|[2][0123]):([012345][0-9])"),
                Utc: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])" + "[T ]" + "([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])")
            }
        }
    };

SnTUtils.DateTime.Now.ToString = function (format) {
    var currentDate = new SnTUtils.DateTime;
    return currentDate.ToString(format);
};
SnTUtils.DateTime.Expressions =
    {
        Default: SnTUtils.DateTime.Globalization[SnTUtils.Language].Expressions.Default,
        UtcDate: SnTUtils.DateTime.Globalization[SnTUtils.Language].Expressions.UtcDate,
        UtcTime: SnTUtils.DateTime.Globalization[SnTUtils.Language].Expressions.UtcTime,
        UtcMs: SnTUtils.DateTime.Globalization[SnTUtils.Language].Expressions.UtcMs,
        Zone: SnTUtils.DateTime.Globalization[SnTUtils.Language].Expressions.Zone,
        Utc: SnTUtils.DateTime.Globalization[SnTUtils.Language].Expressions.Utc
    };
SnTUtils.DateTime.Expression = SnTUtils.DateTime.Globalization[SnTUtils.Language].Expression;
SnTUtils.DateTime.ExpressionUtcDate = SnTUtils.DateTime.Globalization[SnTUtils.Language].ExpressionUtcDate;
SnTUtils.DateTime.ExpressionUtcDatePositions = SnTUtils.DateTime.Globalization[SnTUtils.Language].ExpressionUtcDatePositions;
SnTUtils.DateTime.ExpressionUtcTime = SnTUtils.DateTime.Globalization[SnTUtils.Language].ExpressionUtcTime;
SnTUtils.DateTime.ExpressionUtcMs = SnTUtils.DateTime.Globalization[SnTUtils.Language].ExpressionUtcMs;
SnTUtils.DateTime.ExpressionZone = SnTUtils.DateTime.Globalization[SnTUtils.Language].ExpressionZone;
SnTUtils.DateTime.ExpressionUtc = SnTUtils.DateTime.Globalization[SnTUtils.Language].ExpressionUtc;

SnTUtils.DateTime.SubtractDays = function (days, round) {
    date = this;
    var newDate = new Date(date - new SnTUtils.TimeSpan(days, 0, 0, 0, 0).Ticks);
    // crop hours, minutes seconds.
    var nDate = newDate;
    if (round) {
        nDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    }
    return nDate;
}

SnTUtils.DateTime.SubtractMonths = function (months, round) {
    date = this;
    var totalMonths = (date.getFullYear() * 12) + (date.getMonth());
    totalMonths = totalMonths - months;
    var newYear = Math.floor((totalMonths) / 12);
    var newMonth = totalMonths - newYear * 12;
    date.setFullYear(newYear);
    date.setMonth(newMonth);
    var newDate = date;

    if (round) {
        newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    return newDate;
}

SnTUtils.DateTime.GetFromString = function (dateString, ignoreTimeZoneAndParseAsUtc) {
    date = this;
    var yyyy = 0;
    var MM = 0;
    var dd = 0;
    var dateMatch = dateString.match(SnTUtils.DateTime.ExpressionUtcDate);
    if (dateMatch) {
        yyyy = dateMatch[0].replace(SnTUtils.DateTime.ExpressionUtcDate, SnTUtils.DateTime.ExpressionUtcDatePositions.Year);
        MM = dateMatch[0].replace(SnTUtils.DateTime.ExpressionUtcDate, SnTUtils.DateTime.ExpressionUtcDatePositions.Month);
        dd = dateMatch[0].replace(SnTUtils.DateTime.ExpressionUtcDate, SnTUtils.DateTime.ExpressionUtcDatePositions.Day);
    }
    var hh = 0;
    var mm = 0;
    var ss = 0;
    var timeMatch = dateString.match(SnTUtils.DateTime.ExpressionUtcTime);
    if (timeMatch) {
        hh = timeMatch[0].replace(SnTUtils.DateTime.ExpressionUtcTime, "$1");
        mm = timeMatch[0].replace(SnTUtils.DateTime.ExpressionUtcTime, "$2");
        ss = timeMatch[0].replace(SnTUtils.DateTime.ExpressionUtcTime, "$3");
    }
    var fff = 0;
    var msMatch = dateString.match(SnTUtils.DateTime.ExpressionUtcMs);
    if (msMatch) {
        fff = msMatch[0].replace(SnTUtils.DateTime.ExpressionUtcMs, "$1");
        fff = parseFloat("0." + fff);
        fff = parseInt(fff * 1000);
    }
    var znMatch = dateString.match(SnTUtils.DateTime.ExpressionZone);
    var zn = 0;
    var zh = 0;
    var zm = 0;
    if (znMatch) {
        zn = parseInt(parseFloat(znMatch[0].replace(SnTUtils.DateTime.ExpressionZone, "$1") + "1"));
        zh = parseInt(parseFloat(znMatch[0].replace(SnTUtils.DateTime.ExpressionZone, "$2")) * zn);
        zm = parseInt(parseFloat(znMatch[0].replace(SnTUtils.DateTime.ExpressionZone, "$3")) * zn);
    }
    if (ignoreTimeZoneAndParseAsUtc) {
        date.setUTCFullYear(yyyy, MM - 1, dd);
        date.setUTCHours(hh, mm, ss, fff);
    }
    else {
        var zeroZone = false;
        zeroZone = (zeroZone || (dateString.indexOf("GMT") > -1));
        zeroZone = (zeroZone || (dateString.indexOf("Z") > -1));

        if (zn == 0 && !zeroZone) {
            date.setFullYear(yyyy, MM - 1, dd);
            date.setHours(hh, mm, ss, fff);
        }
        else {
            date.setUTCFullYear(yyyy, MM - 1, dd);
            date.setUTCHours(hh, mm, ss, fff);

            date = new Date(date.getTime() - (zh * 60 + zm) * 60 * 1000);
        }
    }

    return date;
}

SnTUtils.DateTime.GetFromUtcString = function (dateString) {

    date = this;
    date.GetFromString(dateString, true);
    return date;
}


SnTUtils.DateTime.ToString = function (format) {

}

SnTUtils.DateTime.ToString = function (dateTime, format) {
    var date;
    var format;
    switch (arguments.length) {
        case 0:
            date = this;
            format = date.DefaultFormat;
            break;
        case 1:
            date = this;
            format = arguments[0];
            break;
        case 2:
            date = arguments[0];
            format = arguments[1];
            break;
        default:
            return "";
            break
    }
    date.addZero = function (number) { return (number < 10) ? '0' + number : number };

    var wwwArray = SnTUtils.DateTime.Globalization[SnTUtils.Language].www;
    var dddArray = SnTUtils.DateTime.Globalization[SnTUtils.Language].ddd;
    var ddddArray = SnTUtils.DateTime.Globalization[SnTUtils.Language].dddd;
    var MMMArray = SnTUtils.DateTime.Globalization[SnTUtils.Language].MMM;
    var MMMMArray = SnTUtils.DateTime.Globalization[SnTUtils.Language].MMMM;
    if (format == null) { format = date.DefaultFormat };

    if (format == "Outlook") {
        var now = new Date();
        if (date.getFullYear() == now.getFullYear()
            && date.getMonth() == now.getMonth()
            && date.getDate() == now.getDate()) {
            results = "ddd HH:mm";
        } else {
            format = SnTUtils.DateTime.Globalization[SnTUtils.Language].OutlookFormat;
        }
    }
    if (format == "X") { format = SnTUtils.DateTime.Globalization[SnTUtils.Language].XFormat };

    var fff = date.getMilliseconds();
    var yyyy = date.getFullYear();
    var yy = new String(date.addZero(yyyy));
    yy = yy.substr(yy.length - 2, 2);
    var www = wwwArray[date.getDay()]; // Outdated!!!
    var dddd = ddddArray[date.getDay()];
    var ddd = dddArray[date.getDay()];
    var dd = date.addZero(date.getDate());
    var MMMM = MMMMArray[date.getMonth()];
    var MMM = MMMArray[date.getMonth()];
    var MM = date.addZero(date.getMonth() + 1);
    var hAmPm = date.getHours() % 12;
    if (hAmPm == 0) hAmPm = 12;
    var hh = date.addZero(hAmPm); // 12 format
    var HH = date.addZero(date.getHours()); // 24 format
    var mm = date.addZero(date.getMinutes());
    var ss = date.addZero(date.getSeconds());
    var tt = (date.getHours() < 12) ? "AM" : "PM";
    var zzz = date.addZero(date.getTimezoneOffset());
    var offset = date.getTimezoneOffset();
    var negative = (offset < 0);
    if (negative) offset = offset * -1;
    zzz = date.addZero(Math.floor(offset / 60)) + ":" + date.addZero((offset % 60));
    if (negative || offset == 0) {
        zzz = "+" + zzz;
    } else {
        zzz = "-" + zzz;
    }

    var strDate = new String(format);
    strDate = strDate.replace("yyyy", yyyy);
    strDate = strDate.replace("yy", yy);
    strDate = strDate.replace("www", www);
    strDate = strDate.replace("dddd", dddd);
    strDate = strDate.replace("ddd", ddd);
    strDate = strDate.replace("dd", dd);
    strDate = strDate.replace("MMMM", MMMM);
    strDate = strDate.replace("MMM", MMM);
    strDate = strDate.replace("MM", MM);
    strDate = strDate.replace("ss", ss);
    strDate = strDate.replace("hh", hh);
    strDate = strDate.replace("HH", HH);
    strDate = strDate.replace("mm", mm);
    strDate = strDate.replace("ss", ss);
    strDate = strDate.replace("tt", tt);
    strDate = strDate.replace("ffffff", (fff + "000000").substr(0, 6));
    strDate = strDate.replace("fff", (fff + "000").substr(0, 3));
    strDate = strDate.replace("zzz", zzz);
    return strDate;
}
SnTUtils.DateTime.ToUtcString = function (format) {
    var offset = this.getTime() + (this.getTimezoneOffset() * 60000);
    var ss = new Date(offset);
    return ss.toString(format);
}
SnTUtils.DateTime.ToDifferenceString = function (dateOld, dateNew) {
    this.addZero = function (number) { return (number < 10) ? '0' + number : number };
    dateNew = dateNew ? dateNew : new Date();
    var ms = dateNew.getTime() - dateOld.getTime();
    var nd = new Date(ms);
    var ph = nd.getHours();
    var pm = nd.getMinutes();
    var ps = nd.getSeconds();
    var msPassed = 1000 * (60 * (60 * ph + pm) + ps) + nd.getMilliseconds();
    var d = (nd.getTime() - msPassed) / 24 / 60 / 60 / 1000;
    var results = Math.round(d) + "d " + ph + "h " + pm + "m";
    return results;
}
SnTUtils.DateTime.GetDayType = function (d, trimResults) {
    d = (d) ? d : new Date();
    var results = new String();
    if (d.getMonth() == 9 && d.getDate() == 31) results = "Halloween";
    if (d.getMonth() == 11 && d.getDate() == 31) results = "New Year";
    if (trimResults) {
        results = results.replace(" ", "");
    }
    return results;
}

SnTUtils.DateTime.Separator = SnTUtils.DateTime.Globalization[SnTUtils.Language].Separator;
SnTUtils.DateTime.YearMin = SnTUtils.DateTime.Globalization[SnTUtils.Language].YearMin;
SnTUtils.DateTime.YearMax = SnTUtils.DateTime.Globalization[SnTUtils.Language].YearMax;
SnTUtils.DateTime.DateFormat = SnTUtils.DateTime.Globalization[SnTUtils.Language].DateFormat;
SnTUtils.DateTime.Expression = SnTUtils.DateTime.Globalization[SnTUtils.Language].Expression;

SnTUtils.DateTime.StripCharsInBag = function (s, bag) {
    var returnString = "";
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (bag.indexOf(c) == -1) returnString += c;
    }
    return returnString;
}

SnTUtils.DateTime.DaysInFebruary = function (valYear) {
    return (((valYear % 4 == 0) && ((!(valYear % 100 == 0)) || (valYear % 400 == 0))) ? 29 : 28);
}

SnTUtils.DateTime.DaysArray = function (valYear) {
    var arrDays = new Array;
    for (var i = 1; i <= 12; i++) {
        arrDays[i] = 31;
        if (i == 4 || i == 6 || i == 9 || i == 11) { arrDays[i] = 30 };
    }
    // Set February days.
    arrDays[2] = SnTUtils.DateTime.DaysInFebruary(valYear);
    return arrDays;
}

SnTUtils.DateTime.IsDate = function (valDate) {

    var dateString = new String(valDate);
    results = "";

    if (!SnTUtils.DateTime.Expression.test(dateString)) return "Invalid! <span style=\"color: gray;\">Format: mm/dd/yyyy</span>";

    var MM = parseInt(dateString.replace(SnTUtils.DateTime.Expression, "$1"), 10);
    var DD = parseInt(dateString.replace(SnTUtils.DateTime.Expression, "$2"), 10);
    var YY = parseInt(dateString.replace(SnTUtils.DateTime.Expression, "$3"), 10);

    if (YY >= 0 && YY <= 50) YY += 2000;
    if (YY > 50 && YY <= 99) YY += 1900;
    var DaysInMonth = SnTUtils.DateTime.DaysArray(YY)[MM];

    if (MM < 1 || MM > 12) return "Invalid Month";
    if (DD > DaysInMonth) return "Invalid Day";
    if (YY < SnTUtils.DateTime.YearMin || YY > SnTUtils.DateTime.YearMax) return "Invalid Year";
    return results;
}

Date.prototype.GetFromString = SnTUtils.DateTime.GetFromString;
Date.prototype.GetFromUtcString = SnTUtils.DateTime.GetFromUtcString;
Date.prototype.DefaultFormat = SnTUtils.DateTime.Globalization[SnTUtils.Language].DateFormat;
Date.prototype.toString = SnTUtils.DateTime.ToString;
Date.prototype.ToString = SnTUtils.DateTime.ToString;
Date.prototype.toUtcString = SnTUtils.DateTime.ToUtcString;

SnTUtils.BaseEnum = {

    Undefined: 0,
    ToString: function (value) {

        for (var item in this) {

            if (!isNaN(this[item]) && this[item] == value) {

                return item;
            }
        }
        return 'Undefined';
    },
    GetByName: function (itemName) {

        if (this[itemName]) {

            return this[itemName];
        }

        return this.Undefined;
    },
    GetByValue: function (itemValue) {

        for (var item in this.GetNames()) {

            if (this[item] === itemValue) {

                return itemValue;
            }
        }

        return this.Undefined;
    },
    GetNames: function () {

        var names = [];

        for (var item in this) {

            if (!isNaN(this[item])) {

                names.push(item);
            }
        }

        return names;
    },
    IsDefined: function (value) {

        return this[value] != undefined && !isNaN(this[value]);
    },
    Parse: function (itemValue) {

        var value = this.GetByValue(itemValue);

        if (value == this.Undefined) {

            value = this.GetByName(itemValue);
        }

        return value;
    },
    IsFlagOn: function (targetVal, checkVal) {

        return (targetVal & checkVal) == checkVal;
    }
};

SnTUtils.RegisterNameSpace("SnTUtils.UI");

SnTUtils.UI = {

    AutoFocusEnabled: false,
    SetFocusOnFirstElement: function () {

        try {
            if (SnTUtils.UI.AutoFocusEnabled) {

                var body = SnTUtils.Elements.Body;
                var autoFocus = body.find(".autoFocus:first");
                if (!autoFocus.length) {
                    autoFocus = body.find(":text:first");
                }
                autoFocus.focus();
            }
        }
        catch (e) {
            SnTUtils.HandleException(e.message, "SnTUtils.UI.SetFocusOnFirstElement");
        }
    },
    Popup: {

        Open: function (settings) {
            var config = $.extend({},
                {
                    type: 'iframe',
                    padding: 0,
                    margin: 0,
                    width: '95%',
                    height: '95%',
                    closeBtn: false,
                    autoSize: false,
                    openEffect: 'none',
                    closeEffect: 'none'
                }, settings);

            $.fancybox.open(config);
        },
        Close: function (settings) {

            try {
                $.fancybox.close(settings);
            } catch (e) {

                console.log(e);
            }
        }
    }
};

/* json2.js 
* 2008-01-17
* Public Domain
* No warranty expressed or implied. Use at your own risk.
* See http://www.JSON.org/js.html
*/

SnTUtils.RegisterNameSpace("JSON");

//if (!this.JSON) 
{
    SnTUtils.JSONOrginal = function () {

        function f(n) { return n < 10 ? '0' + n : n; }
        Date.prototype.toJSON = function () {
            return this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z';
        };
        var m = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' }; function stringify(value, whitelist) {
            var a, i, k, l, r = /["\\\x00-\x1f\x7f-\x9f]/g, v; switch (typeof value) {
                case 'string': return r.test(value) ? '"' + value.replace(r, function (a) {
                    var c = m[a]; if (c) { return c; }
                    c = a.charCodeAt(); return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                }) + '"' : '"' + value + '"'; case 'number': return isFinite(value) ? String(value) : 'null'; case 'boolean': case 'null': return String(value);

                case 'object': if (!value) { return 'null'; }
                    if (typeof value.toJSON === 'function') { return stringify(value.toJSON()); }
                    a = []; if (typeof value.length === 'number' && !(value.propertyIsEnumerable('length'))) {
                        l = value.length; for (i = 0; i < l; i += 1) { a.push(stringify(value[i], whitelist) || 'null'); }
                        return '[' + a.join(',') + ']';
                    }
                    if (whitelist) {
                        l = whitelist.length; for (i = 0; i < l; i += 1) {
                            k = whitelist[i]; if (typeof k === 'string') {
                                v = stringify(value[k], whitelist); if (v) { a.push(stringify(k) + ':' + v); }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (typeof k === 'string') {
                                v = stringify(value[k], whitelist); if (v) {
                                    a.push

                                        (stringify(k) + ':' + v);
                                }
                            }
                        }
                    }
                    return '{' + a.join(',') + '}';
            }
        }
        return {
            stringify: stringify, parse: function (text, filter) {
                var j; function walk(k, v) {
                    var i, n; if (v && typeof v === 'object') {
                        for (i in v) {
                            if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                                n = walk(i, v[i]); if (n !== undefined) { v[i] = n; }
                            }
                        }
                    }
                    return filter(k, v);
                }
                if (/^[\],:{}\s]*$/.test(text.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { j = eval('(' + text + ')'); return typeof filter === 'function' ? walk('', j) : j; }
                throw new SyntaxError('parseJSON');
            }
        };
    }();

    JSON = $.extend(JSON, SnTUtils.JSONOrginal);
}

SnTUtils.Analytics = {

    UseCustomAnalytics: false,
    TrackPageview: function (url) {
        if (_gaq) {
            if (!String.IsNullOrEmpty(url)) {
                _gaq.push(['_trackPageview', url]);
            }
            else {
                _gaq.push(['_trackPageview']);
            }
        }
    }
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}