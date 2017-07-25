(function ($) {
	var gui = require('nw.gui'),
		win = gui.Window.get(),
		i18n = require('i18n'),
		doT = require('dot'),
		path = require('path');

	window.locale = {
		init: function() {
			i18n.configure({
				locales: ['en', 'zh-cn', 'zh-tw'],
				directory: path.join(process.cwd(), '/app/locales'),
				defaultLocale: 'en',
				fallbacks: {
					'en-us': 'en',
					'en-uk': 'en',
					'zh_cn': 'zh-cn',
					'zh-hans': 'zh-cn',
					'zh-hans-cn': 'zh-cn',
					'zh_tw': 'zh-tw',
					'zh_hant': 'zh-tw',
					'zh-hant-tw': 'zh-tw',
				},
				updateFiles: false
			});
			var currentLocale = this.getLocale();
			if (!currentLocale) {
				currentLocale = this.checkLocale();
			}
			this.setLocale(currentLocale);

			var i18nTemplateSettings = {
				evaluate:    /\[\[([\s\S]+?(\]?)+)\]\]/g,
				interpolate: /\[\[=([\s\S]+?)\]\]/g,
				encode:      /\[\[!([\s\S]+?)\]\]/g,
				use:         /\[\[#([\s\S]+?)\]\]/g,
				useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\[[^\]]+\])/g,
				define:      /\[\[##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\]\]/g,
				defineParams:/^\s*([\w$]+):([\s\S]+)/,
				conditional: /\[\[\?(\?)?\s*([\s\S]*?)\s*\]\]/g,
				iterate:     /\[\[~\s*(?:\]\]|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\]\])/g,
				varname:	"i18n",
				strip:		false,
				append:		false,
				selfcontained: false,
				doNotSkipEncoded: false
			};

			var viewPath = path.join(process.cwd(), '/app/views');
			var doTs = doT.process({
				path: viewPath,
				templateSettings: i18nTemplateSettings
			});
			var bodyTmpl = doTs.index;
			var bodyHtml = bodyTmpl(i18n);
			$(document.body).html(bodyHtml);
		},
		getLocale: function() {
			return window.localStorage.getItem('locale');
		},
		setLocale: function(locale) {
			if (!locale) return;
			i18n.setLocale(locale);
			window.localStorage.setItem('locale', i18n.getLocale());
		},
		checkLocale: function() {
			var language = window.navigator.language;
			var locale;
			if (language) {
				locale = language.toLowerCase();
			} else {
				locale = process.env.LANG.split('.')[0].toLowerCase();
			}
			return locale;
		},
		changeLocale: function(locale) {
			if (!locale) return;
			this.setLocale(locale);
			win.reload();
		}
	};
})(jQuery);