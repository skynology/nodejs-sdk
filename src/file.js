
var request = require("request");
var _ = require("lodash");
var config = require('./config');
var user = require('./user');


var File = function(name, data){
    this.name = name;
    this.url = null;
    this._data = {};
    this._uploadTokens = null;

};

File.prototype.get = function(key){

};
File.prototype.getThumbnail = function(width, height, quality, mode, format, interlace){
    if(!this.url){
        throw "Invalid url";
    }
    if(!width || !height || width <=0 || height <=0){
        throw "Invalid width or height value."
    }
    quality = quality || 85;
    if(quality<=0 || quality>100){
        throw "Invalid quality value."
    }
    format = format || "png";
    mode = mode || 0;
    interlace = interlace || 0;
    return this.url() + '?imageView2/' + mode + '/w/' + width + '/h/' + height
        + '/q/' + quality + '/format/' + fmt + '/interlace/' + interlace;
};

File.prototype.saveFromURL = function(url, success, fail){
    var _self = this;
    var _options = config.getRequestOptions();
    _options.url = options.url + '/files/fetchFromURL';
    request(_options, function(error, response, body){
        if (!error && response.statusCode >= 200 && response.statusCode <= 300) {
            _self.url = body.url;
            _self._data = body;
            success && success(body);
        } else {
            fail && fail(body);
        }
    });
};

File.prototype.save = function(success, fail){
    var _self = this;
    var _options = config.getRequestOptions();
    _options.url = options.url + '/files/uploadToken';
    request(_options, function(error, response, body) {
        if (error || response.statusCode < 200 || response.statusCode > 300) {
            fail && fail(body);
            return;
        }
        _self._uploadTokens = body;

    });
};
