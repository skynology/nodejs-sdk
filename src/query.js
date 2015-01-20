
var config = require('./config');
var object = require('./object');

var request = require("request");
var _ = require("lodash");

var ERROR_REQUIRED_NAME = 'The paramter name is required!',
    ERROR_INVALID_ARGUMENT = 'Invalid argument',
    ERROR_INVALID_OBJECT_ID = 'Invalid object id'
    ;


var SKQuery = function(resourceName) {
    if (!resourceName || typeof(resourceName) !== 'string') {
        throw new Error(ERROR_REQUIRED_NAME)
    }

    var self = this,
        _where = {},
        _order = [],
        _select = [],
        _skip = 0,
        _take = 10,
        _count = false
        ;

    this.select = function(){
        if(!arguments) return;
        _.forEach(arguments, function(v){
            _select.push(v);
        });
        return self;
    };

    this.count = function(value){
        _count = value ? 1:0;
        return self;
    };
    this.skip = function(skip){
        if(isNaN(skip)) throw new Error(ERROR_INVALID_ARGUMENT);
        _skip = skip;
        return self;
    };
    this.take = function(take){
        if(isNaN(take)) throw new Error(ERROR_INVALID_ARGUMENT);
        if(take > 1000 || take <=0 ) take = 10;
        _take = take;
        return self;
    };
    this.orderBy = function(){
        _.forEach(arguments, function(name){
            if(!_.isString(name)) throw new Error(ERROR_INVALID_ARGUMENT);
            _order.push(name);
        });
        return self;
    };
    this.orderByDescending = function(){
        _.forEach(arguments, function(name) {
            if (!_.isString(name)) throw new Error(ERROR_INVALID_ARGUMENT);
            _order.push("-" + name);
        });
        return self;
    };
    this.where = function(opr, key, value){
        if(!opr){
            _where[key] = value;
            return;
        }
        var _value = {};
        _value[opr] = value;
        _where[key] = _value;
        return self;
    };
    this.generateQuery = function(){
        var _url = [];
        if(_count) _url.push('count='+_count);
        if(_skip) _url.push('skip='+_skip);
        if(_take) _url.push('take='+_take);
        if(_order.length) {
            _url.push('order='+_order.join(","));
        }
        if(_select.length){
            _url.push('select='+_select.join(','));
        }
        if(!_.isEmpty(_where)){
            _url.push('where='+JSON.stringify(_where));
        }
        return _url.join('&');
    };
};

SKQuery.prototype.equal = function(key, value){
    var _value = value;
    if(value instanceof SKQuery){
        _value = value.objectId;
    }
    this.where(null, key, _value);
    return this;
};
SKQuery.prototype.notEqual = function(key, value){
    var _value = value;
    if(value instanceof SKQuery){
        _value = value.objectId;
    }
    this.where("$ne", key, _value);
    return this;
};
SKQuery.prototype.greaterThan = function(key, value){
    this.where("$gt",key,value);
    return this;
};
SKQuery.prototype.greaterOrEqual = function(key, value){
    this.where("$gte",key,value);
    return this;
};
SKQuery.prototype.lessThan = function(key, value){
    this.where("$lt",key,value);
    return this;
};
SKQuery.prototype.lessOrEqual = function(key, value){
    this.where("$lte",key,value);
    return this;
};
SKQuery.prototype.between = function(key, from, to){
    if(isNaN(from) || isNaN(to)){
        throw new Error(ERROR_INVALID_ARGUMENT);
    }
    if(from > to){
        throw new Error(ERROR_INVALID_ARGUMENT);
    }
    var _value = {"$gte":from, "$lte":to};
    this.where(null,key,_value);
    return this;
};
SKQuery.prototype.in = function(key, value){
    if(!_.isArray(value)){
        throw new Error(ERROR_INVALID_ARGUMENT);
    }
    this.where("$in",key,value);
    return this;
};
SKQuery.prototype.notIn = function(key, value){
    if(!_.isArray(value)){
        throw new Error(ERROR_INVALID_ARGUMENT);
    }
    this.where("$nin",key,value);
    return this;
};
SKQuery.prototype.matchAll = function(key, value){
    if(!_.isArray(value)){
        throw new Error(ERROR_INVALID_ARGUMENT);
    }
    this.where("$all",key,value);
    return this;
};

SKQuery.prototype.exist = function(){
    var _self = this;
    _.forEach(arguments, function(v){
        if(!_.isString(v)) throw new Error(ERROR_INVALID_ARGUMENT);
        _self.where("$exists",v,true);
    });
    return _self;
};
SKQuery.prototype.notExist = function(key){
    var _self = this;
    _.forEach(arguments, function(v){
        if(!_.isString(v)) throw new Error(ERROR_INVALID_ARGUMENT);
        _self.where("$exists",v,false);
    });
    return _self;
};

SKQuery.prototype.contains = function(key, value){
    var _value = "/"+value+"/";
    this.where("$regex",key,_value);
    return this;
};
SKQuery.prototype.startWith = function(key, value){
    var _value = "/^"+value+"/";
    this.where("$regex",key,_value);
    return this;
};
SKQuery.prototype.endWith = function(key, value){
    var _value = "/"+value+"$/";
    this.where("$regex",key,_value);
    return this;
};

// success(data, count)
SKQuery.prototype.first = function(success, error){
    var self = this;
    var _options = getOptions(this);
    request(_options, function(err, res, body){
        if (!error && response.statusCode >= 200 && response.statusCode <= 300) {
            var _result = getObjectFromJSON(self, body.results[0]);
            success(_result, body.count);
        } else {
            fail(body);
        }
    });
};

SKQuery.prototype.find = function(success, error){
    var self = this;
    var _options = getOptions(this);
    request(_options, function(err, res, body){
        if (!error && response.statusCode >= 200 && response.statusCode <= 300) {
            var _result = getObjectFromJSON(self, body.results);
            success(_result, body.count);
        } else {
            fail(body);
        }
    });
};

var getObjectFromJSON = function(obj, data){
    if(_.isArray(data)){
        var _result = [];
        _.forEach(data, function(v){
            _result.push(object(obj.resourceName, v));
        });
        return _result;
    } else {
        return object(obj.resourceName, data);
    }
};

var getOptions = function(obj){
    var options = config.getRequestOptions();
    var _url = options.url + '/resources/' + obj.resourceName;
    _url = (_url + '?' +  obj.generateQuery());
    options.url = _url;
    options.method = 'GET';
    options.json = true;
    return options;
};

module.exports  = SKQuery;
