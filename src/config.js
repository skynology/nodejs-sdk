var fs = require('fs');
var path = require('path');
var os = require('os');
var md5 = require('MD5');
var mkdirp = require('mkdirp');
var request = require("request");
var LocalStorage = require('node-localstorage').LocalStorage;


var ERROR_INIT_REQUEST = "You need to call initialize before use SKCloud",
	ERROR_REQUIRE_APPID = "applicationId required";

var _applicationId, _installationId, _requestSign, _timestamp,_sessionId, _useMasterKey = false,
	_localStorage
    ;

var _applicationIdHeader = 'SKCloud-Application-Id',
	_requestSignHeader = 'SKCloud-Request-Sign',
	_sessionIdHeader = 'SKCloud-Session-Id',
	_installationIdHeader = 'SKCloud-Installation-Id',
	_clientVersionHeader = 'SKCloud-Client-Version'
	;


var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'package.json')));
var ua = function(){
    return 'SKCloudNodejs/' + pkg.version + ' (' + os.type() + '; ' + os.platform() + '; ' + os.arch() + '; )';
};

exports.localStorage = _localStorage;

// 签名规则请参考文档:
exports.initialize  = function(applicationId, applicationKey, masterKey){
	if (!applicationId) {
		throw new Error(ERROR_REQUIRE_APPID);
	};

	_applicationId = applicationId;
	_timestamp = (new Date()).getTime();
	var _signString = _timestamp+""+(masterKey||applicationKey);
	var _sign = md5(_signString)+","+_timestamp;
	if (masterKey) {
		_useMasterKey = true;
		_sign += ",master";
	}
	_requestSign = _sign;

	var _path = './skcloud/'+applicationId;
	if(!fs.existsSync(_path)){
        try {
			mkdirp.sync(_path);
        } catch (e){
            throw e;
        }
	}


	_localStorage = new LocalStorage(_path);
}

exports.getApplicationId = function(){
	if (!_applicationId) throw Error(ERROR_INIT_REQUEST);
	return _applicationId;
};
exports.getTimestamp = function(){
	if (!_timestamp) throw Error(ERROR_INIT_REQUEST);
	return _timestamp;
};
exports.getRequestSign = function(){
	if (!_requestSign) throw Error(ERROR_INIT_REQUEST);
	return _requestSign;
};
exports.getInstallationId = function(){
	if (!_applicationId) throw new Error(ERROR_INIT_REQUEST);
	return createInstalllationId();
};
exports.getSessionId = function(){
	var _sessionId = _localStorage.getItem("sessionId");
	if(!id){
		return null;
	}
	return _sessionId;
};

var createInstalllationId = function(){
	if(_installationId) {
		return _installationId;
	}
	var _key = "installationId";
	_installationId = _localStorage.getItem(_key);
	if(!_installationId || _installationId === ""){
        var hexOctet = function() {
            return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
        };
        _installationId = (
            hexOctet() + hexOctet() + "-" +
            hexOctet() + "-" +
            hexOctet() + "-" +
            hexOctet() + "-" +
            hexOctet() + hexOctet() + hexOctet()
        );
        _localStorage.setItem(_key, _installationId);
	}

    return _installationId;
};

exports.getClientVersion = function(){
	return 'nodejs' + pkg.version;
};

exports.getRequestOptions = function() {
	var _headers = {'User-Agent': this.USER_AGENT};
	_headers[_applicationIdHeader] = this.getApplicationId();
	_headers[_requestSignHeader] = this.getRequestSign();
	_headers[_clientVersionHeader] = this.getClientVersion();
	var options = {
		url: this.API_HOST,
		headers: _headers,
		json: true,
		method: 'GET'
	};

	return options;
};

exports.USER_AGENT = ua();
exports.API_HOST = "http://localhost:3000";
