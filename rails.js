class Rails {
	constructor( paths, options, callback ) {
		// Setup all the rails proprieties
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

	go( to ) {
		// This is the core, go will hadle all the history stuff,
		// is the function called anytime you need railst to handle
		// an url change
		window.history.pushState({ url: to }, to.toUpperCase(), to);
	}

	handleAnchors() {
		// This will be called every time we put content in the page
		var anchors = document.querySelectorAll('a');
		var self = this;
		for (var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			// According to documentation is not necessary to remove
			// duplicated event listeners
			// anchor.removeEventListener('click', this.navigate);
			anchor.addEventListener('click', (event) => { this.handleClick(self, event); }, false);
		}
	}

	handleClick( self, event ) {
		event.preventDefault();
		self.go( event.target.href );
	}
}

export default Rails;
