// require mongoose from node_modules
var mongoose = require('mongoose');
// require files system so that we can load up and read all of the model files that we create
var fs = require('fs');

var connect = function(){
	// specify options for when mongoose connects to mongodb
	var options = { server: { socketOptions: { keepAlive: 1 }}}
	// connect to our mongodb database server with options specified above
	mongoose.connect('mongodb://localhost/fullMeanDemo', options)
}

// actually connect to the database!
connect();

// if there is an error while conecting lets console log it
mongoose.connection.on('error', function(err){
	console.log(err)
})

// if we get disconnected from mongoose try to connect again
mongoose.connection.on('disconnected', function(){
	connect();
})

// specify the path to all of the models
var models_path = __dirname + '/../server/models'
//read ll of the files in that path and for each one if the file is a javascript file lets require it
fs.readdirSync(models_path).forEach(function(file){
	if(~file.indexOf('.js')){
		// run all of the models!
		require(models_path + '/' + file);
	}
})