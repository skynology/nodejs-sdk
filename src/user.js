
var request = require("request");
var util = require('util');
var _ = require("lodash");

var config = require('./config');
var object = require('./object');

module.exports  = User;

var User = function(id){
    User.super_.call(this, '_User', id);
    this._sessionToken = null;
    this._CURRENT_USER_KEY = 'currentUser';
    this._currentUser = null;
};
User.prototype.register = function(success, error){
    var _self = this;
    var _options = {
        method:'POST',
        url: config.API_HOST + '/users',
        body: this._changed
    };
    this._request(_options, function(user){
        _self._saveCurrentUser(user);
        success && success(user);
    }, error);
};

User.prototype.logIn = function(username, password, success, error){
    var _options = {
        method:'POST',
        url: config.API_HOST + '/login',
        body: {username:username, password:password}
    };
    this._request(_options, function(user){
        _self._saveCurrentUser(user);
        success && success(user);
    }, error);
};
User.prototype.logOut = function(){
    this._currentUser = null;
    config.localStorage.removeItem(this._CURRENT_USER_KEY);
};

User.prototype.changePassword = function(oldPassword, newPassword){
    var _options = {
        method:'POST',
        url: config.API_HOST + '/users/' + this.objectId + '/changePassword',
        body: {'old_password':oldPassword, 'new_password':newPassword}
    };
    this._request(_options, success, error);
};

User.prototype.getUsername = function(){
    return this.get('username');
};

User.prototype.current = function(){
    if(this._currentUser != null){
        return this._currentUser;
    }
    var _user = config.localStorage.getItem(this._CURRENT_USER_KEY);
    if(_user) {
        try{
           _user = JSON.parse(_user);
        }catch (e){
            return null;
        }
        return _user;
    }
    return null;
};

User.prototype._saveCurrentUser = function(user){
    this.logOut();
    this._currentUser = user;
    var _user = JSON.stringify(user);
    config.localStorage.setItem(this._CURRENT_USER_KEY, _user);
};

util.inherits(User,object);


module.exports = User;
