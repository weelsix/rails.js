var request = require('ajax-request');

class Rails {
	constructor( paths, options, callback ) {
		// Native proprieties
		this.container = null;
		this.registered = [];

		// Proprieties from parameters
		this.manageAnchors = options.manageAnchors || true;
		this.contentSelector = options.contentSelector || '#rails-page';
		this.baseDirectory = options.baseDirectory || '/pages/';
		this.baseExtension = options.baseExtension || '.html';

		// Perform all the required tasks in options
		// or setup variables
		this.container = document.querySelectorAll( this.contentSelector )[0];
		this.manageAnchors && this.handleAnchors();

		// Register a path for each path in paths
		paths.forEach((current, index) => {
			if (typeof current == 'object') {
				if (typeof current.path == 'undefined') throw "No propriety path in object";
				if (typeof current.page == 'undefined') throw "No propriety page in object";
				this.registerPath( current.path, current.page );
			}
			if (typeof current == 'string') {
				this.registerPath( current );
			}
		} );

		typeof callback == 'function' && callback();
	}

	go( destination ) {
		// This is the core, go will hadle all the history stuff,
		// is the function called anytime you need railst to handle
		// an url change
		var parts = destination.match(/(http|https):\/\/(.*):(.*)\/(.*)/i);
		var protocol = parts[1];
		var domain = parts[2];
		var port = parts[3];
		var page = parts[4];
		var found = false;
		this.registered.forEach( element => { if( element.path == page ) found = element; } );
		if( found ) {
			window.history.pushState({ url: page }, page.toUpperCase(), page);
			found.page.loadPage();
		} else
			throw "Loading a non registered path";
	}

	registerPath( path, page ) {
		if( !page ) {
			var pageref = new Page( this.baseDirectory + path + this.baseExtension, this );
		} else {
			var pageref = page;
		}
		this.registered.push( {
			path: path,
			page: pageref
		} );
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
}

class Page {
	constructor( file, rails ) {
		if( typeof file == 'undefined' ) throw "Undefined file propriety";
		if( typeof rails == 'undefined' ) throw "Undefined rails instance";
		// Get the file path for the html to laod
		this.file = file;
		// Rails param is the reference to the rails instance
		// witch the page belongs to
		this.rails = rails;
	}

	loadPage() {
		request({
			url: this.file,
			method: 'GET'
		}, (error, response, body) => {
			if( error ) throw error;
			this.rails.container.innerHTML = body;
		});
	}

	animateIn() {
		// Fancy animation for getting the page in here
	}

	animateOut() {
		// Fany animation out here
	}

	remove() {
		// Remove the page HTML from the rails container
		this.rails.container.innerHTML = '';
	}
}

export default Rails;
