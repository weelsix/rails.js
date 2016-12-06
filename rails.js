class Rails {
	constructor( paths, options, callback ) {
		// Native proprieties
		this.container = null;
		this.registered = [];

		// Proprieties from parameters
		this.manageAnchors = options.manageAnchors || true;
		this.contentSelector = options.contentSelector || '#rails-page';

		// Perform all the required tasks in options
		// or setup variables
		this.conteiner = document.querySelectorAll( this.contentSelector )[0];
		this.manageAnchors && this.handleAnchors();

		// Register a path for each path in paths
		for (var i = 0; i < paths.length; i++) {
			var path = paths[i];
			this.registerPath( path );
		}

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
		if( found )
			window.history.pushState({ url: page }, page.toUpperCase(), page);
		else
			throw "Loading a non registered path";
	}

	registerPath( path ) {
		var page = new Page();
		this.registered.push( {
			path: path,
			page: page
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
	contruct() {
		// Set up the page here
	}
}

export default Rails;
