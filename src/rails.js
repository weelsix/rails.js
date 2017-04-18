class Rails {
	constructor( options, callback ) {
		// Native proprieties
		this.container = null;
		this.registered = [];
		this.activePage = null;

		// Proprieties from parameters
		options = options || { };
		this.manageAnchors = options.manageAnchors || true;
		this.managePopState = options.managePopState || true;
		this.autoClearContainer = options.autoClearContainer || true;
		this.containerSelector = options.containerSelector || '#rails-page';
		this.baseDirectory = options.baseDirectory || '/pages/';
		this.baseExtension = options.baseExtension || '.html';

		// Perform all the required tasks in options
		// or setup variables
		this.container = document.querySelectorAll( this.containerSelector )[0];
		if( !this.container ) throw 'No valid container';
		if( this.manageAnchors ) this.handleAnchors();
		if( this.managePopState ) this.handlePopstate();

		typeof callback == 'function' && callback();
	}

	init( paths ) {
		// Register a path for each path in paths
		if( typeof paths !== 'object' || paths.length < 0 ) throw 'Expected Array as paths list';
		paths.forEach((current, index) => {
			if (typeof current === 'object') this.registerPath( current );
			else throw 'Unable to register a non-object page';
		} );
		// Then navigate to the setted url location when called init, if none navigate to the first registered
		var parts = document.location.href.match(/(http|https):\/\/(.*):(.*)\/(.*)/i);
		if( typeof parts[4] !== 'undefined' && parts[4].length > 1 ) {
			this.go( parts[4] );
		} else {
			this.go( paths[0].namespace );
		}
	}

	go( destination, addState ) {
		// Determinate if to add a stete to history or not
		// needed to fix navigation history
		if (typeof addState == 'undefined') addState = true;
		// This is the core, go will hadle all the history stuff,
		// is the function called anytime you need railst to handle
		// an url change
		var protocol = false;
		var domain = false;
		var port = false;
		var page = false;
		var parts = destination.match(/(http|https):\/\/(.*):(.*)\/(.*)/i);
		if( parts ) {
			// In this case the url contain full uri string
			protocol = parts[1];
			domain = parts[2];
			port = parts[3];
			page = parts[4];
		} else {
			// In this case the url probably came from popstate
			page = destination;
		}
		// Now let's look for the registered page to load
		var found = false;
		this.registered.forEach( element => { if( element.namespace == page ) found = element; } );
		if( found ) {
			// The onleave method must return a promise resolved on animation complete
			if( this.activePage ) {
				var outPromise = this.activePage.onLeave();
			} else {
				// If this is the first load there is no active page, promise resolved
				var outPromise = new Promise((resolve) => { resolve(); });
				// TODO: check if the returned value is a promise, otherwise throw error
			}
			// And we also create a load promise
			let url = this.baseDirectory + found.namespace + this.baseExtension;
			// Let's make the ajax request for the file stored in the page
			var loadPromise = window.fetch(url, {
				method: 'get',
				headers: {
					'x-rails': 'true'
				}
			});
			// Data are loaded and out animation is performed
			Promise.all([outPromise, loadPromise])
			.then((values) => {
				values[1].text().then((parsed) => {
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
					// Add the popstate, set active page and start in animation
					addState && window.history.pushState({ location: page }, page.toUpperCase(), page);
					this.activePage = found;
					this.activePage.onEnter();
				})
				.catch((error) => {
					throw error;
				});
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
			anchor.addEventListener('click', (event) => { this.handleClick(event); }, false);
		}
	}

	handleClick( event ) {
		event.preventDefault();
		this.go( event.target.href );
	}

	handlePopstate() {
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
		// Empty constructor
		this.view = null;
		this.namespace = '';
	}

	onEnter() {
		// Animazione per l'ingresso della pagina
	}

	onLeave() {
		// Animazione di uscita
	}
}

module.exports = {
	Rails: Rails,
	RailsPage: RailsPage
};
