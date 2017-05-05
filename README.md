# Rails - rails-js
An easy to use, indipendent, home-made javascript utility library to route your single page application.

## How to use Rails
First you simply need to install Rails with npm, by doing:
```
$ npm install rails-js --save
```
*Otherwise you can clone this repo, or also grab the unminified or minified version of the umd from the dist folder*

__BE CAREFUL: Rails uses modern web technologies such as *fetch API* and *Promises* so if you are planning to support old browsers in your project make sure to use necessary polyfils. Last but not least for now Rails is distributed primarly as a module, it respect commonJS exports and you can import it with commonJS imports or ES6 imports but if you're not using a bundling system (like webpack or browserify) you'll need one, or you have to use the umd version of the library (inside the *dist* folder, you can find the babel-es2015-preset transpilation, full or minified). In this case you cannot take advantage from the extendable class system, but your page objects must contain all the necessary properties and methods, even tho you can still use the *RailsPage* object as a prototype.__

Once done, just import the main rails object like this

```javascript
import railsjs from 'rails-js';
```

This object contains two classes, the first one is the rails router and the second one is the extendable one for the rails page you'll have to provide to the router.

Let's setup the router

```javascript
const rails = new railsjs.Rails();
```
```javascript
// Or you can also pass a configuration object
const config = {
	manageAnchors: true,
	managePopState: true,
	autoClearContainer: true,
	containerSelector: '#rails-page',
	baseDirectory: '/pages/',
	baseExtension: '.html',
	cacheDuration: 0,
	cacheIsPersistent: false
};
const rails = new railsjs.Rails( config );
```

The configuration object accepts these properties:
- __manageAnchors__: if true, when rails is created all the clicks on available anchors outside the rails container are automatically handled by rails, for future hadles insiede the rails container additional custom code is always needed ( for exeple to prevent default link behaviour ).
- __managePopstate__: if true, rails will handle the push and pop state from the history api for you. This will make your navigation between pages automated and there is going to be no need to chage the url. Change this behaviour only if you're planning to use your custom code to hadle urls and links loading.
- __autoClearContainer__: if true, when the previous *onLeave* page promise is resolved in addition to all the operations performed by rails to load the new page, the setted container will be automatically cleaned from the child nodes.
- __containerSelector__: the css selector that matches the root DOM node for the rails application. This can be a custo div, or the entire body. Even tho is always suggested to use a custom div also in a full page rails app case.
- __baseDirectory__: the directory suffix to add to the routed file for the XHR request. For example if *baseDirectory* is set to his default '/page/' the request for the home route will be '[host]/page/home.[baseExtension]'. Always remember the '/' before and after the *baseDirectory* string. (If you're rewriting urls server side, like you're supposed to to on a single page application, remember not to rewrite __baseDirectory__ urls).
- __baseExtension__: the default file extension for the XHR request. Always remember the dot before the extension.
- __cacheDuration__: indicates how long __in milliseconds__ cache entries will be considered valid. If this is set to 0, cache will be disabled (preventing Rails from storing all the fetch request at all). If a cache entry is valid this will be used to populate the container without doing any network request, this will also prevent your service worker from serving the page, so if you are planning to use a caching system with service workers, be aware.
- __cacheIsPersistent__: If this is set to true, cache will be sotred in your page local storage and will persist among page navigation, browser closing and reloading.

After all the setup you need to create a class that extends the RailsPage class. This is mainly because your custom page class need to have three important properties: *namespace*, *onEnter*, *onLeave*. The first one indicates the url extensions you'll want to associate this page to, the second and the third are two functions respectively called after the HTML has been loaded in the container or the old page has been replaced. Mainly the *onLeave* callback is called when the XHR request is prepared and __must__ return a promise resolved when  all your stuff is done. This promise will tell rails when the old DOM code is ready to be replaced and there is no going back. Therefore the workflow is the following: get your promise, start a new promise for the XHR request, then when both are resolved, remove the old DOM and append the new one, then call *onEnter*.

```javascript
class Homepage extends railsjs.RailsPage {
	constructor() {
		super();
		this.namespace = 'homepage';
	}

	onEnter() {
		// Perform a simple in animation with GSAP
		TweenMax.fromTo(this.view, 0.3, {opacity: 0}, {opacity: 1});
	}

	onLeave() {
		// Return the promise, resolved at the end of the animation
		return new Promise((resolve, reject) => {
			TweenMax.fromTo(this.view, 0.3, {opacity: 1}, {
				opacity: 0,
				onComplete: function() {
					// ... do some other stuff
					resolve();
				}
			});
		});
	}
}
```
One you have all your pages, you simply need to call *init* on the rails instance and pass an array with all the pages you need to register. Each page is registered with the reference to its namespace.

```javascript
const homepage = new Homepage();
const about = new About();
rails.init([
	// Pages list
	homepage,
	about,
	// ...
]);
```
## Rails and RailsPage APIs

Inside the *Rails* instance you have access to the some useful properties and methods:
- __rails.go( *string* destination )__: force rails router to navigate to a destination.
- __rails.registerPath( *RailsPage* page )__: add a new page to previously registered collection. From now on this page can be used as a destination.
- __rails.handleAnchors( *HTMLElement* contex )__: add event listeners to all the *a* tags inside the context and bind the click to the internal rails router. Always check you context when you call this method, 'case listeners will be added not removed. *document* is the default context and this method is automatically invoched if manageAnchors is set to true inside the rails constructor.
- __rails.container__: is the node element reference of the current container.
- __rails.activePage__: is the reference to the active *RailsPage* object.
You can also read or set these *RailsPage* properties:
- __railsPage.view__: this property contains the DOM reference to the current page view root HTMLElement. Is automatically filled by rails every time the page is loaded.
- __railsPage.namespace__: the namespace associated with the page, can be changed later on, but is not raccomanded.
- __railsPage.title__: the document title you want rails to set when the page is loaded.
- __railsPage.parametersRegexp__: a *RegExp* js object used to split the parameters string according to rails parameters pattern: 
```
(protocol)://(domain)[:(port)]/(pagenamespace)[/(parameters)]
```
- __railsPage.parameters__: an array of objects rappresenting the result of the match with the given *parametersRegexp* and the filled *parametersString*. This property should be read-only because it's automatically filled when the page is loaded, as well as the *parametersString* property.
- __railsPage.parametersString__: the read-only filled property containing the full parameters string.
