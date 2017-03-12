var request = require('ajax-request');

class Rails {
	constructor( options, callback ) {
		// Native proprieties
		this.container = null;
		this.registered = [];
		this.activePage = null;

		// Proprieties from parameters
		this.manageAnchors = options.manageAnchors || true;
		this.contentSelector = options.contentSelector || '#rails-page';
		this.baseDirectory = options.baseDirectory || '/pages/';
		this.baseExtension = options.baseExtension || '.html';
		this.managePopState = options.managePopState || true;

		// Perform all the required tasks in options
		// or setup variables
		this.container = document.querySelectorAll( this.contentSelector )[0];
		if (!this.container) throw 'No valid container';
		this.manageAnchors && this.handleAnchors();
		this.managePopState && this.handlePopstate();

		typeof callback == 'function' && callback();
	}

	init( paths ) {
		// Register a path for each path in paths
		if (typeof paths !== 'object' || paths.length < 0 ) throw 'Expected Array as paths list';
		paths.forEach((current, index) => {
			if (typeof current === 'object') this.registerPath( current );
			else throw 'Unable to register a non-object page';
		} );
		this.go( paths[0].namespace );
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
			// Let's create a load promise
			var loadPromise = new Promise(( resolve, reject ) => {
				// Let's make the ajax request for the file stored in the page
				request({
					url: this.baseDirectory + found.namespace + this.baseExtension,
					method: 'GET',
					headers: {
						'x-rails': 'true'
					}
				}, (error, response, body) => {
					if( error ) {
						throw error;
						reject();
					}
					else {
						var toAppend = '';
						toAppend += '<div class=\'rails-view\' data-view=\'' + found.namespace + '\'>';
						toAppend += body;
						toAppend += '</div>';
						this.container.innerHTML += toAppend;
						found.view = document.querySelector('.rails-view[data-view="' + found.namespace + '"]');
						resolve();
					}
				});
			});

			// Animate out the old page, if there is one 'cause maiby it's the first load
			if( this.activePage ) this.activePage.onLeave( loadPromise );
			addState && window.history.pushState({ location: page }, page.toUpperCase(), page);
			this.activePage = found;
			this.activePage.onEnter( loadPromise );
		} else
			throw 'Loading a non register path';
	}

	registerPath( page ) {
		if(typeof page === 'undefined') throw 'Cannot register undefined page';
		else this.registered.push( page );
	}

	handleAnchors() {
		// This will be called every time we put content in the page
		var anchors = document.querySelectorAll('a');
		for (var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			// According to documentation is not necessary to remove
			// duplicated event listeners
			// anchor.removeEventListener('click', this.navigate);
			anchor.addEventListener('click', (event) => { this.handleClick(this, event); }, false);
		}
	}

	handleClick( self, event ) {
		event.preventDefault();
		self.go( event.target.href );
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
	}

	onEnter() {
		// Animazione per l'ingresso della pagina
	}

	onLeave() {
		// Animazione di uscita
	}
}

export {Rails, RailsPage};
