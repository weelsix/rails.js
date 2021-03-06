class Rails {
	constructor( options, callback ) {
		// Setting up proprieties
		this.container = null;
		this.registered = [];
		this.urlBase = '';
		this.activePage = null;
		this.cache = null;

		// Proprieties from parameters
		options = options || { };
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
		this.container = document.querySelectorAll( this.containerSelector )[0];
		this.cache = new RailsCache( this.cacheDuration, this.cacheIsPersistent );
		if( !this.container ) throw 'No valid container';
		if( this.manageAnchors ) this.handleAnchors();
		if( this.managePopState ) this._handlePopstate();

		typeof callback == 'function' && callback();
	}

	init( paths, origin ) {
		if( origin && origin.length > 1 && origin.match(/^(http|https)\:\/\/([a-zA-z0-9:]+)\/$/i) ) {
			this.urlBase = origin;
		} else {
			throw 'Origin must match a correct url pattern';
		}
		// Register a path for each path in paths
		if( typeof paths !== 'object' || paths.length < 0 ) throw 'Expected Array as paths list';
		paths.forEach((current, index) => {
			if (typeof current === 'object') this.registerPath( current );
			else throw 'Unable to register a non-object page';
		} );
		// Then navigate to the setted url location when called init, if none navigate to the first registered
		if( document.location.href[document.location.href.length - 1] == '/' ) {
			this.go( paths[0].namespace );
		} else {
			this.go( document.location.href );
		}
	}

	go( destination, addState ) {
		// Determinate if to add a stete to history or not
		// needed to fix navigation history
		if (typeof addState == 'undefined') addState = true;
		// This is the core, go will hadle all the history stuff,
		// is the function called anytime you need railst to handle
		// an url change
		var parsed = this._parseUrl( destination );
		var page = parsed.page;
		var parameters = parsed.parameters;
		// Now let's look for the registered page to load
		var found = false;
		this.registered.forEach( element => { if( element.namespace == page ) found = element; } );
		if( found ) {
			// The onleave method must return a promise resolved on animation complete
			if( this.activePage ) {
				var outPromise = this.activePage.onLeave();
				if (typeof outPromise.then != 'function') {
					throw 'onLeave function must return a then-able oject, like a Promise or a polyfill';
				}
			} else {
				// If this is the first load there is no active page, promise resolved
				var outPromise = new Promise((resolve) => { resolve(); });
			}
			// And we also create a load promise
			let url = this.baseDirectory + found.namespace + this.baseExtension;
			// Let's make the ajax request for the file stored in the page namespace
			var loadPromise = this.cache.getPage( url );
			// Data are loaded and out animation is performed
			Promise.all([outPromise, loadPromise])
			.then((values) => {
				var parsed = values[1];
				var toAppend = '';
				toAppend += '<div class=\'rails-view\' data-view=\'' + found.namespace + '\'>';
				toAppend += parsed;
				toAppend += '</div>';
				// If needed clean the main rails container
				if( this.autoClearContainer ) this.container.innerHTML = '';
				// Append loaded HTML
				this.container.innerHTML += toAppend;
				// Set the current view
				found.view = document.querySelector('.rails-view[data-view="' + found.namespace + '"]');
				// Setup parameters
				found.parameters = parameters ? parameters.match( found.parametersRegexp ) : '';
				found.parametersString = parameters ? parameters : '';
				// Add the popstate, set active page and start in animation
				addState && window.history.pushState(
					{ location: page + (parameters ? ('/' + parameters) : '') },
					found.title,
					this.urlBase + page + (parameters ? ('/' + parameters) : '')
				);
				this.activePage = found;
				document.title = this.activePage.title;
				this.activePage.onEnter();
			})
			.catch((error) => {
				throw error;
			});
		} else
			throw 'Loading a non register path';
	}

	registerPath( page ) {
		if(typeof page === 'undefined') throw 'Cannot register undefined page';
		else this.registered.push( page );
	}

	handleAnchors( context ) {
		context = context || document;
		// This will be called every time we put content in the page
		var anchors = context.querySelectorAll('a');
		for (var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			// According to documentation is not necessary to remove
			// duplicated event listeners
			// anchor.removeEventListener('click', this.navigate);
			anchor.addEventListener('click', (event) => { this._handleClick(event); }, false);
		}
	}

	_parseUrl( url ) {
		let parsed = {
			page: '',
			parameters: ''
		};
		if( url.indexOf('http') >= 0 || url.indexOf('https') >= 0 ) {
			// Assuming thath url is absolute, with protocol and host
			if( url.indexOf(this.urlBase) >= 0 ) {
				// Is absolute but with the base url
				let parts = url.match(/(http|https)+:\/\/([a-zA-Z:0-9\.]+)\/([a-zA-Z]+)[\/]?(.*)/i);
				parsed.page = parts[3];
				parsed.parameters = parts[4];
			} else {
				// Is absolute but from enother origin
				window.open( url );
			}
		} else {
			// Assuming that url is relative to the document origin (urlBase)
			let parts = url.match(/([a-zA-Z]+)[\/]?(.*)/i);
			parsed.page = parts[1];
			parsed.parameters = parts[2];
		}
		return parsed;
	}

	_handleClick( event ) {
		event.preventDefault();
		this.go( event.target.href );
	}

	_handlePopstate() {
		window.onpopstate = (event) => {
			// If state is not set, this entry is not handled by rails,
			// so let's do nothing and go to the first registered path
			if ( event.state ) this.go( event.state.location, false );
			else this.go( this.registered[0].namespace );
		}
	}
}

class RailsPage {
	constructor() {
		this.view = null;
		this.namespace = '';
		this.title = '';
		this.parameters = [];
		this.parametersRegexp = /^(.*)$/i;
		this.parametersString = '';
	}

	onEnter() {
		// Animazione per l'ingresso della pagina
	}

	onLeave() {
		// Animazione di uscita
	}
}

class RailsCache {
	constructor( duration, persistent ) {
		this.duration = duration || 0;
		this.persistent = persistent || false;
		this.cache = [
			// Main array of objects to store cache entries
			// { url: '', content: '', timestam: time() }
		];
		if( this.persistent ) {
			this.cache = window.localStorage._railsCache ? JSON.parse(window.localStorage._railsCache) : [];
			this.writeInLocalStorage();
		}
	}

	getPage( url ) {
		return new Promise(( resolve, reject ) => {
			const retrived = this.getEntry( url );
			if( retrived ) {
				// Element is in cache and is not expired, resolve the promise with the content in cache
				resolve( retrived.content );
			} else {
				// Element is not in cache or is expired
				window.fetch(url, {
					method: 'get',
					headers: {
						'x-rails': 'true'
					}
				})
				.then((result) => {
					result.text().then((parsed) => {
						// Prevent storing element if cache is disabled
						if(this.duration > 0) {
							this.store({
								url: url,
								content: parsed,
								time: Date.now()
							});
						}
						resolve( parsed );
					});
				})
				.catch((error) => {
					reject(error);
				});
			}
		});
	}

	getEntry( url, ignoreExpiration = false ) {
		var found = false;
		for (let i = 0; i < this.cache.length && !found; i++) {
			var entry = this.cache[i];
			if( ignoreExpiration ) {
				if( entry.url == url )
					found = entry;
			} else {
				if( entry.url == url && (( Date.now() - entry.time ) <= this.duration) )
					found = entry;
			}
		}
		return found;
	}

	prefetch( url ) {
		window.fetch(url, {
			method: 'get',
			headers: {
				'x-rails': 'true'
			}
		})
		.then((result) => {
			result.text().then((parsed) => {
				if(this.duration > 0) {
					this.store({
						url: url,
						content: parsed,
						time: Date.now()
					});
				}
			});
		})
		.catch((error) => {
			throw error;
		});
	}

	store( entry ) {
		var retrived = this.getEntry( entry.url, true );
		if( retrived ) {
			// This url is already in cache, update content but not url
			retrived.content = entry.content;
			retrived.time = Date.now();
		} else {
			this.cache.push(entry);
		}
		if( this.persistent ) this.writeInLocalStorage();
	}

	writeInLocalStorage() {
		window.localStorage._railsCache = JSON.stringify(this.cache);
	}
}

module.exports = {
	Rails: Rails,
	RailsPage: RailsPage
};
