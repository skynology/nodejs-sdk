
var config = require('./config');

var request = require("request");
var _ = require("lodash");

var ERROR_REQUIRED_NAME = 'The paramter name is required!',
    ERROR_WRONG_ARGUMENT = 'Invalid argument',
    ERROR_INVALID_OBJECT_ID = 'Invalid object id'
    ;


var SKObject = function(resourceName, id) {
    if (!resourceName || typeof(resourceName) !== 'string') {
        throw new Error(ERROR_REQUIRED_NAME)
    }
    this.resourceName = resourceName||null;
    this.objectId = null;
    this.createdAt = null;
    this.updatedAt = null;
    this._data = {};
    this._changed = {};
    if(id){
        if(_.isString(id)){
          if(!isValidObjectId(id)) throw new Error(ERROR_INVALID_OBJECT_ID);
            this.objectId = id;
        } else if (_.isPlainObject(id)){
            this._data = id;
            if(isValidObjectId(this._data.objectId)) this.objectId = this._data.objectId;
            if(this._data.createdAt) this.createdAt = new Date(this._data.createdAt);
            if(this._data.updatedAt) this.updatedAt = new Date(this._data.updatedAt);
        }
    }
};

SKObject.prototype._setJSONData = function(data){
    if (!data || !obj) return;
    if (!obj.objectId && data.objectId) obj.objectId = data.objectId;
    if(data.createdAt) obj.createdAt = new Date(data.createdAt);
    if(data.updatedAt) obj.updatedAt = new Date(data.updatedAt);
    this._data = data;
};

SKObject.prototype.toJSON = function(){
    return _.clone(this._data);
};
SKObject.prototype.clear = function(){
    this._data = {};
    this._changed = {};
    this.createdAt = null;
    this.updatedAt = null;
};
SKObject.prototype.get = function(key){
    if(_.isUndefined(this._data[key])){
        return this._changed[key];
    }
    return this._data[key];
};

// 支持传入两种类型值, 1: data=key, value=value, 2: data=json, value不传
// 如 set('name', 'william');
//   set({'name':'william'});
SKObject.prototype.set = function(data, value) {
    if(!_.isPlainObject(data) && !_.isString(data) || (_.isString(data) && _.isUndefined(value))) {
        throw new Error(ERROR_WRONG_ARGUMENT);
    }
    var _data = {}, _formated = {};
    if(_.isPlainObject(data)){
        _data = data;
    } else {
        _data[data] = value;
    }

    _.forIn(_data, function(value, key){
        var _value = value;
        if(value instanceof SKObject){
            _value = value.objectId;
        }
        _formated[key] = _value;

        switch (key){
            case 'objectId':
                if(!isValidObjectId(value)) throw new Error(ERROR_INVALID_OBJECT_ID);
                self.objectId = value;
                break;
            case 'createdAt':
                self.createdAt = new Date(value);
                break;
            case 'updatedAt':
                self.updatedAt = new Date(value);
                break;
            default :
        }
    });

    _.assign(this._changed, _formated);
    return this;
};

SKObject.prototype.increment = function(attr, amount) {
    if(_.isUndefined(amount) || _.isNull(amount) || isNaN(amount)) {
        amount = 1;
    }
    this.set(attr, {"__op":"Increment", "amount":amount})
    return this;
};

SKObject.prototype._setArray = function(type, attr, value){
    checkUndefinedAndNull(value);
    var _value = getArrayValue(value);
    var _exists = this.get(attr);
    if(!_.isUndefined(_exists)){
        if(!_.isUndefined(_exists["__op"]) && _exists["__op"] == type && _.isArray(_exists["objects"])){
            if(type === "AddUnique" || type == "Remove"){
                _value = _.union(_exists["objects"], _value);
            } else if (type == "Add"){
                var _temp = _.clone(_exists["objects"]);
                _.forEach(_value, function(v){
                    _temp.push(v);
                });
                _value = _temp;
            }
        }
    }

    this.set(attr, {"__op":type, "objects":_value});
};

SKObject.prototype.addUniqueToArray = function(attr, value) {
    this._setArray("AddUnique", attr, value);
    return this;
};
SKObject.prototype.addToArray = function(attr, value) {
    this._setArray("Add", attr, value);
    return this;
};
SKObject.prototype.removeFromArray = function(attr, value) {
    this._setArray("Remove", attr, value);
    return this;
};
SKObject.prototype.save = function(success, error){
    var _options = {
        method:(this.objectId && 'PUT' || 'POST'),
        body: this._changed
    };
    this._request(_options, success, error);
};
SKObject.prototype.delete = function(success, error){
    this._request({method:'DELETE'}, success, error);
};
SKObject.prototype.fetch = function(success, error){
    throw new Error("need to implement!!!");
};
SKObject.prototype._request = function(options, success, fail){
    var _options = getOptions(this),
        _self = this;
    _.assign(_options, options);
    request(_options, function(error, response, body){
        if (!error && response.statusCode >= 200 && response.statusCode <= 300) {
            _self._setJSONData(body);
            success && success(body);
        } else {
            fail && fail(body);
        }
    });
};

SKObject.prototype.getACL = function(){
    var _acl = this.get('ACL');
    if (!_.isUndefined(_acl) || !_.isPlainObject(_acl)){
        return null;
    }
    _acl = new ACL(_acl);
    return _acl;
};
SKObject.prototype.setACL = function(acl){
    var _acl = acl;
    if(acl instanceof ACL){
        _acl = acl.toJSON();
    }
    this.set('ACL',_acl);
    return this;
};

// ----------------------------------------- //
var isValidObjectId = function(id) {
    if (!id || !_.isString(id)) return false;
    if(id.length != 24) return false;
    return true;
};


var getOptions = function(obj, method){
    method = method || 'GET';
    var options = config.getRequestOptions();
    options.url = getUrl(options, obj.resourceName, obj.objectId);
    options.method = method;
    return options;
};
var getUrl = function(options, resourceName, id){
    var _url = options.url;
    _url += '/resources/'+resourceName;
    if(id) {
        _url += ('/' + id);
    }
    return _url;
};

var checkUndefinedAndNull = function(value){
    if(_.isUndefined(value) || _.isNull(value) ){
        throw new Error(ERROR_WRONG_ARGUMENT);
    }
}
// 数组相关
var getArrayValue = function(value){
    var _value = []
    if(_.isArray(value)){
        return value;
    }
    _value.push(value);
    return _value;
};

module.exports  = SKObject;
