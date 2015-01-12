// we are requiring a controller file thatwill do stuff when a route is triggered
var friends = require('./../server/controllers/friends.js')
module.exports = function(app){
	// these routes are all going to return json
	// don't want to redner/redirect at all we just want to respond with data
	app.get('/friends_json', function(req, res){
		//res.send(JSON.stringify([{name: 'Jay', age: 22}]))
		friends.show(req, res);
	})
	app.post('/addfriend_json', function(req, res){
		friends.add(req, res)
	})

	// create a route to handle adding friends
}