# Rails - rails-js
An easy to use, indipendent, home-made javascript utility library to route your single page application.

## How to use Rails
First you simply need to install Rails with npm, as always do:
```
$ npm install rails-js --save
```
*Otherwise you can clone this repo, or also grab the raw file from the source folder*

Once done import the main rails object like this

```javascript
import railsjs from 'rails-js';
```

This object contains two classes, the first one is the rails router and the second one is the extendable one for the rails page you'll have to provide to the router.

So let's setup the router

```javascript
rails = new railsjs.Rails();

// Or you can also pass a configuration object
const config = {
	manageAnchors: 	true,
	managePopState: true,
	autoClearContainer: true,
	containerSelector: '#rails-page',
	baseDirectory: '/pages/',
	baseExtension: '.html'
};
rails = new railsjs.Rails( config );
```

The configuration object accepts these properties:
- __manageAnchors__: if true, when rails is created all the clicks on available anchors outside the rails container are automatically handled by rails, for future hadles insiede the rails container additional custom code is always needed ( for exeple to prevent default link behaviour )
- __managePopstate__: if true, rails will handle the push and pop state from the history api for you. This will make your navigation between pages automated and there is going to be no need to chage the url. Change this behaviour only if you're planning to use your custom code to hadle urls and link loading
- __autoClearContainer__: if true, when the previous onLeave page promise is resolved in addition to all the operations performed by rails to load the new page, the setted container will be automatically cleaned from the child nodes.
- __containerSelector__: the css selector that indicates the root DOM node for the rails application. This can be a custo div, or the entire body. By the way is always suggested to use a custom div also in a full page rails app case.
- __baseDirectory__: the directory suffix to add to the routed file for the XHR request. For example if *baseDirectory* is set to his default '/page/' the request for the home route will be '[host]/page/home.[baseExtension]'. Always remember the '/' before and after the *baseDirectory* string
- __baseExtension__: the default file extension for the XHR request. Always remember the dot before the extension.
