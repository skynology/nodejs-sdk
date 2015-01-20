var request = require("request");
var util = require('util');
var _ = require("lodash");

var object = require('./object');
var user = require('./user');

var Role = function(name, acl){
    Role.super_.call(this, '_Role');
    if(_.isString(name)){
        this.set("name", name);
    }
    if(!_.isUndefined(acl)){
        this.setACL(acl);
    }
};

Role.prototype.getName = function(){
    return this.get('name');
};

Role.prototype.addParent = function(parentId) {
    if(parentId instanceof Role){
        parentId =parentId.objectId;
    }
    this.addUniqueToArray('parents', parentId);
    return this;
};

Role.prototype.addUser = function(userId){
    if(userId instanceof user){
        userId = user.objectId;
    }
    this.addUniqueToArray('users', userId);
    return this;
};

util.inherits(Role, object);

module.exports = Role;
