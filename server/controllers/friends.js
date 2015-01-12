/*// make an immediate function that gives back an object that has methods
// that handle our requests and responses
// require mongoose so that we can acess the mondel
var mongoose = require('mongoose');
var friend = mongoose.model('Friend');
module.exports = (function() {
	// return because we want to put an objet into the variable for whatever requires this
	return {
		// we are not in restful right now
		// show is a property of the object we return so we can call it on the variable
		show: function(req, res){
			// res.send(JSON.stringify([{name: 'Jay', age: 22}]))
			friend.find({}, function(err, results){
				if(err){
					console.log(err)
				}else{
					// or res.json(results);
					console.log('hey')
					res.send(JSON.stringify(results));
				}
			})
		},
		add: function(req, res){
			 var test = new friend(req.body)
			 test.save()
			//friend.insert({name: req.body.name, age: req.body.age})
		}
	}
})();*/