var libpath = './src';

var newObject = function(resourceName, id){
	var object = require(libpath+'/object.js');
	return new object(resourceName, id);
};
var newQuery = function(resourceName){
	var query = require(libpath+'/query.js');
	return new query(resourceName);
};
var newUser = function(id){
	var user = require(libpath+'/user.js');
	return new user(id);
};

var newRole= function(name){
	var role = require(libpath+'/role.js');
	return new role(name);
};
var newACL = function(arg1){
	var acl = require(libpath+'/acl.js');
	return new acl(arg1);
};


module.exports = {
	Config : require(libpath + '/config.js'),
	Object: newObject,
	Query: newQuery,
	User: newUser,
	Role: newRole,
	ACL: newACL
};