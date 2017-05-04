var path = require('path');
var env = process.env.WEBPACK_ENV;

module.exports = {
	entry: './src/rails.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: env=='build' ? 'rails.js' : 'rails.min.js',
		library: 'Rails',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [{
			test: /(\.jsx|\.js)$/,
			loader: 'babel-loader',
			exclude: /(node_modules|bower_components)/
		}]
	},
};
