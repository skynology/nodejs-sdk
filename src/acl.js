var request = require("request");
var util = require('util');
var _ = require("lodash");

var config = require('./config');
var User = require('./user');
var Role = require('./role');

var PUBLIC_KEY = "*";


var ACL = function(arg1) {
    var _self = this;
    _self.permissionsById = {};
    if(_.isObject(arg1)){
        if(arg1 instanceof User){
            _self.setAccess(arg1, true, true);
        } else {
            if(_.isPlainObject(arg1)){
                _.forEach(arg1, function(accessList, userId){
                    if(!_.isString(userId)){
                        throw "tried to create an ACL with an invalid userId.";
                    }
                    _self.permissionsById[userId] = {};
                    _.forEach(accessList, function(allowed, permission){
                        if (permission !== "read" && permission !== "write") {
                            throw "Tried to create an ACL with an invalid permission type.";
                        }
                        if (!_.isBoolean(allowed)) {
                            throw "Tried to create an ACL with an invalid permission value.";
                        }
                        _self.permissionsById[userId][permission] = allowed;
                    });
                });
            }
        }
    }
};

ACL.prototype.toJSON = function(){
    return _.clone(this.permissionsById);
};

ACL.prototype._setAccess = function(accessType, userId, allowed) {
    if (userId instanceof User) {
        userId = userId.objectId;
    } else if (userId instanceof Role) {
        userId = "role:" + userId.getName();
    }
    if (!_.isString(userId)) {
        throw "userId must be a string.";
    }
    if (!_.isBoolean(allowed)) {
        throw "allowed must be either true or false.";
    }
    var permissions = this.permissionsById[userId];
    if (!permissions) {
        if (!allowed) {
            // The user already doesn't have this permission, so no action needed.
            return;
        } else {
            permissions = {};
            this.permissionsById[userId] = permissions;
        }
    }

    if (allowed) {
        this.permissionsById[userId][accessType] = true;
    } else {
        delete permissions[accessType];
        if (_.isEmpty(permissions)) {
            delete permissions[userId];
        }
    }
};

ACL.prototype._getAccess = function(accessType, userId) {
    if (userId instanceof User) {
        userId = userId.id;
    } else if (userId instanceof Role) {
        userId = "role:" + userId.getName();
    }
    var permissions = this.permissionsById[userId];
    if (!permissions) {
        return false;
    }
    return permissions[accessType] ? true : false;
};

ACL.prototype.getReadAccess = function(userId) {
    return this._getAccess("read", userId);
};
ACL.prototype.getWriteAccess = function(userId) {
    return this._getAccess("write", userId);
};

ACL.prototype.setReadAccess = function(userId, allowed) {
    this._setAccess("read", userId, allowed);
    return this;
};
ACL.prototype.setWriteAccess = function(userId, allowed) {
    this._setAccess("write", userId, allowed);
    return this;
};
ACL.prototype.setPublicReadAccess = function(allowed) {
    this.setReadAccess(PUBLIC_KEY, allowed);
    return this;
};
ACL.prototype.setPublicWriteAccess = function(allowed) {
    this.setWriteAccess(PUBLIC_KEY, allowed);
    return this;
};

ACL.prototype.setAccess = function(userId, allowRead, allowWrite) {
    if(_.isBoolean(allowRead)){
        this._setAccess('read', userId, allowRead);
    }
    if(_.isBoolean(allowWrite)){
        this._setAccess('write', userId, allowWrite);
    }
    return this;
};
ACL.prototype.setPublicAccess = function(allowRead, allowWrite) {
    this._setAccess('write', PUBLIC_KEY, allowWrite);
    return this;
};


ACL.prototype.getRoleReadAccess = function(role) {
    if (role instanceof Role) {
        // Normalize to the String name
        role = role.getName();
    }
    if (_.isString(role)) {
        return this.getReadAccess("role:" + role);
    }
    throw "role must be a SK.Role or a String";
};
ACL.prototype.getRoleWriteAccess = function(role) {
    if (role instanceof Role) {
        // Normalize to the String name
        role = role.getName();
    }
    if (_.isString(role)) {
        return this.getWriteAccess("role:" + role);
    }
    throw "role must be a SK.Role or a String";
};
ACL.prototype.setRoleReadAccess = function(role, allowed) {
    if (role instanceof Role) {
        // Normalize to the String name
        role = role.getName();
    }
    if (!_.isString(role)) {
        throw "role must be a SK.Role or a String";
    }
    this.setReadAccess("role:" + role, allowed);
    return this;
};
ACL.prototype.setRoleWriteAccess = function(role, allowed) {
    if (role instanceof Role) {
        // Normalize to the String name
        role = role.getName();
    }
    if (!_.isString(role)) {
        throw "role must be a SK.Role or a String";
    }
    this.setWriteAccess("role:" + role, allowed);
    return this;

};
ACL.prototype.setRoleAccess = function(role, allowRead, allowWrite){
    if(_.isBoolean(allowRead)){
        this.setRoleReadAccess(role, allowRead);
    }
    if(_.isBoolean(allowRead)){
        this.setRoleWriteAccess(role, allowWrite);
    }

    return this;
};

module.exports = ACL;