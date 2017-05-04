(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Rails", [], factory);
	else if(typeof exports === 'object')
		exports["Rails"] = factory();
	else
		root["Rails"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rails = function () {
	function Rails(options, callback) {
		_classCallCheck(this, Rails);

		// Setting up proprieties
		this.container = null;
		this.registered = [];
		this.urlBase = '';
		this.activePage = null;
		this.cache = null;

		// Proprieties from parameters
		options = options || {};
		this.manageAnchors = options.manageAnchors || true;
		this.managePopState = options.managePopState || true;
		this.autoClearContainer = options.autoClearContainer || true;
		this.containerSelector = options.containerSelector || '#rails-page';
		this.baseDirectory = options.baseDirectory || '/pages/';
		this.baseExtension = options.baseExtension || '.html';
		this.cacheDuration = options.cacheDuration || 0;
		this.cacheIsPersistent = options.cacheIsPersistent || false;

		// Perform all the required tasks in options
		// or setup variables
		this.container = document.querySelectorAll(this.containerSelector)[0];
		this.cache = new RailsCache(this.cacheDuration, this.cacheIsPersistent);
		if (!this.container) throw 'No valid container';
		if (this.manageAnchors) this.handleAnchors();
		if (this.managePopState) this._handlePopstate();

		typeof callback == 'function' && callback();
	}

	_createClass(Rails, [{
		key: 'init',
		value: function init(paths, origin) {
			var _this = this;

			if (origin && origin.length > 1 && origin.match(/^(http|https)\:\/\/([a-zA-z0-9:]+)\/$/i)) {
				this.urlBase = origin;
			} else {
				throw 'Origin must match a correct url pattern';
			}
			// Register a path for each path in paths
			if ((typeof paths === 'undefined' ? 'undefined' : _typeof(paths)) !== 'object' || paths.length < 0) throw 'Expected Array as paths list';
			paths.forEach(function (current, index) {
				if ((typeof current === 'undefined' ? 'undefined' : _typeof(current)) === 'object') _this.registerPath(current);else throw 'Unable to register a non-object page';
			});
			// Then navigate to the setted url location when called init, if none navigate to the first registered
			if (document.location.href[document.location.href.length - 1] == '/') {
				this.go(paths[0].namespace);
			} else {
				this.go(document.location.href);
			}
		}
	}, {
		key: 'go',
		value: function go(destination, addState) {
			var _this2 = this;

			// Determinate if to add a stete to history or not
			// needed to fix navigation history
			if (typeof addState == 'undefined') addState = true;
			// This is the core, go will hadle all the history stuff,
			// is the function called anytime you need railst to handle
			// an url change
			var parsed = this._parseUrl(destination);
			var page = parsed.page;
			var parameters = parsed.parameters;
			// Now let's look for the registered page to load
			var found = false;
			this.registered.forEach(function (element) {
				if (element.namespace == page) found = element;
			});
			if (found) {
				// The onleave method must return a promise resolved on animation complete
				if (this.activePage) {
					var outPromise = this.activePage.onLeave();
					if (typeof outPromise.then != 'function') {
						throw 'onLeave function must return a then-able oject, like a Promise or a polyfill';
					}
				} else {
					// If this is the first load there is no active page, promise resolved
					var outPromise = new Promise(function (resolve) {
						resolve();
					});
				}
				// And we also create a load promise
				var url = this.baseDirectory + found.namespace + this.baseExtension;
				// Let's make the ajax request for the file stored in the page namespace
				var loadPromise = this.cache.getPage(url);
				// Data are loaded and out animation is performed
				Promise.all([outPromise, loadPromise]).then(function (values) {
					var parsed = values[1];
					var toAppend = '';
					toAppend += '<div class=\'rails-view\' data-view=\'' + found.namespace + '\'>';
					toAppend += parsed;
					toAppend += '</div>';
					// If needed clean the main rails container
					if (_this2.autoClearContainer) _this2.container.innerHTML = '';
					// Append loaded HTML
					_this2.container.innerHTML += toAppend;
					// Set the current view
					found.view = document.querySelector('.rails-view[data-view="' + found.namespace + '"]');
					// Setup parameters
					found.parameters = parameters ? parameters.match(found.parametersRegexp) : '';
					found.parametersString = parameters ? parameters : '';
					// Add the popstate, set active page and start in animation
					addState && window.history.pushState({ location: page + (parameters ? '/' + parameters : '') }, found.title, _this2.urlBase + page + (parameters ? '/' + parameters : ''));
					_this2.activePage = found;
					document.title = _this2.activePage.title;
					_this2.activePage.onEnter();
				}).catch(function (error) {
					throw error;
				});
			} else throw 'Loading a non register path';
		}
	}, {
		key: 'registerPath',
		value: function registerPath(page) {
			if (typeof page === 'undefined') throw 'Cannot register undefined page';else this.registered.push(page);
		}
	}, {
		key: 'handleAnchors',
		value: function handleAnchors(context) {
			var _this3 = this;

			context = context || document;
			// This will be called every time we put content in the page
			var anchors = context.querySelectorAll('a');
			for (var i = 0; i < anchors.length; i++) {
				var anchor = anchors[i];
				// According to documentation is not necessary to remove
				// duplicated event listeners
				// anchor.removeEventListener('click', this.navigate);
				anchor.addEventListener('click', function (event) {
					_this3._handleClick(event);
				}, false);
			}
		}
	}, {
		key: '_parseUrl',
		value: function _parseUrl(url) {
			var parsed = {
				page: '',
				parameters: ''
			};
			if (url.indexOf('http') >= 0 || url.indexOf('https') >= 0) {
				// Assuming thath url is absolute, with protocol and host
				if (url.indexOf(this.urlBase) >= 0) {
					// Is absolute but with the base url
					var parts = url.match(/(http|https)+:\/\/([a-zA-Z:0-9\.]+)\/([a-zA-Z]+)[\/]?(.*)/i);
					parsed.page = parts[3];
					parsed.parameters = parts[4];
				} else {
					// Is absolute but from enother origin
					window.open(url);
				}
			} else {
				// Assuming that url is relative to the document origin (urlBase)
				var _parts = url.match(/([a-zA-Z]+)[\/]?(.*)/i);
				parsed.page = _parts[1];
				parsed.parameters = _parts[2];
			}
			return parsed;
		}
	}, {
		key: '_handleClick',
		value: function _handleClick(event) {
			event.preventDefault();
			this.go(event.target.href);
		}
	}, {
		key: '_handlePopstate',
		value: function _handlePopstate() {
			var _this4 = this;

			window.onpopstate = function (event) {
				// If state is not set, this entry is not handled by rails,
				// so let's do nothing and go to the first registered path
				if (event.state) _this4.go(event.state.location, false);else _this4.go(_this4.registered[0].namespace);
			};
		}
	}]);

	return Rails;
}();

var RailsPage = function () {
	function RailsPage() {
		_classCallCheck(this, RailsPage);

		this.view = null;
		this.namespace = '';
		this.title = '';
		this.parameters = [];
		this.parametersRegexp = /^(.*)$/i;
		this.parametersString = '';
	}

	_createClass(RailsPage, [{
		key: 'onEnter',
		value: function onEnter() {
			// Animazione per l'ingresso della pagina
		}
	}, {
		key: 'onLeave',
		value: function onLeave() {
			// Animazione di uscita
		}
	}]);

	return RailsPage;
}();

var RailsCache = function () {
	function RailsCache(duration, persistent) {
		_classCallCheck(this, RailsCache);

		this.duration = duration || 0;
		this.persistent = persistent || false;
		this.cache = [
			// Main array of objects to store cache entries
			// { url: '', content: '', timestam: time() }
		];
		if (this.persistent) {
			this.cache = window.localStorage._railsCache ? JSON.parse(window.localStorage._railsCache) : [];
			this.writeInLocalStorage();
		}
	}

	_createClass(RailsCache, [{
		key: 'getPage',
		value: function getPage(url) {
			var _this5 = this;

			return new Promise(function (resolve, reject) {
				var retrived = _this5.getEntry(url);
				if (retrived) {
					// Element is in cache and is not expired, resolve the promise with the content in cache
					resolve(retrived.content);
				} else {
					// Element is not in cache or is expired
					window.fetch(url, {
						method: 'get',
						headers: {
							'x-rails': 'true'
						}
					}).then(function (result) {
						result.text().then(function (parsed) {
							// Prevent storing element if cache is disabled
							if (_this5.duration > 0) {
								_this5.store({
									url: url,
									content: parsed,
									time: Date.now()
								});
							}
							resolve(parsed);
						});
					}).catch(function (error) {
						reject(error);
					});
				}
			});
		}
	}, {
		key: 'getEntry',
		value: function getEntry(url) {
			var ignoreExpiration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var found = false;
			for (var i = 0; i < this.cache.length && !found; i++) {
				var entry = this.cache[i];
				if (ignoreExpiration) {
					if (entry.url == url) found = entry;
				} else {
					if (entry.url == url && Date.now() - entry.time <= this.duration) found = entry;
				}
			}
			return found;
		}
	}, {
		key: 'prefetch',
		value: function prefetch(url) {
			var _this6 = this;

			window.fetch(url, {
				method: 'get',
				headers: {
					'x-rails': 'true'
				}
			}).then(function (result) {
				result.text().then(function (parsed) {
					if (_this6.duration > 0) {
						_this6.store({
							url: url,
							content: parsed,
							time: Date.now()
						});
					}
				});
			}).catch(function (error) {
				throw error;
			});
		}
	}, {
		key: 'store',
		value: function store(entry) {
			var retrived = this.getEntry(entry.url, true);
			if (retrived) {
				// This url is already in cache, update content but not url
				retrived.content = entry.content;
				retrived.time = Date.now();
			} else {
				this.cache.push(entry);
			}
			if (this.persistent) this.writeInLocalStorage();
		}
	}, {
		key: 'writeInLocalStorage',
		value: function writeInLocalStorage() {
			window.localStorage._railsCache = JSON.stringify(this.cache);
		}
	}]);

	return RailsCache;
}();

module.exports = {
	Rails: Rails,
	RailsPage: RailsPage
};

/***/ })
/******/ ]);
});