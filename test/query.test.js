var sk = require('../');
var should = require('should');
var _ = require("lodash");

describe('test query -->', function() {
    describe('test initalize', function () {
        it("should be throw error if not send name param", function () {
            (function () { sk.Query() }).should.throw();
        });
    });
    describe('where', function(){
        it('default take is 10', function() {
            var q = sk.Query('test');
            splitQuery(q.generateQuery()).take.should.equal(10);
        });
        it('count ', function() {
            var q = sk.Query('test').count(true);
            splitQuery(q.generateQuery()).count.should.equal(1);
            q.count(false);
            (splitQuery(q.generateQuery()).count === undefined).should.be.true;
        });
        it('skip / take', function() {
            var q = sk.Query('test').count(true).skip(100).take(20);
            var _result = splitQuery(q.generateQuery());
            _result.count.should.equal(1);
            _result.take.should.equal(20);
            _result.skip.should.equal(100);
        });
        it('order', function(){
            var q = sk.Query('test').orderBy("name","skill").orderByDescending('score','date');
            splitQuery(q.generateQuery()).order.should.equal('name,skill,-score,-date');
        });
        it('equal', function(){
            var q = sk.Query('Test').equal('name', 'skynology').notEqual('author', 'william');
            splitQuery(q.generateQuery()).where.should.have.property('name', 'skynology');
            splitQuery(q.generateQuery()).where.should.have.property('author', {"$ne":'william'});
        });
        it('less/greater',function(){
            var q = sk.Query('test').lessThan('less', 30).lessOrEqual('lessEqual', 50).greaterThan('greater', 10).greaterOrEqual('greaterEqual', 15);
            var _result = splitQuery(q.generateQuery());
            _result.where.should.have.property('less', {'$lt':30});
            _result.where.should.have.property('lessEqual', {'$lte':50});
            _result.where.should.have.property('greater', {'$gt':10});
            _result.where.should.have.property('greaterEqual', {'$gte':15});

        });
        it('in', function(){
            (function(){ sk.Query('test').in('key', 'not array') }).should.throw();
            (function(){ sk.Query('test').in('key', true) }).should.throw();
            (function(){ sk.Query('test').in('key', 30) }).should.throw();
            var q = sk.Query('test').in('skill', ['go','nodejs','oc']).notIn('version',[1,2]);
            splitQuery(q.generateQuery()).where.should.have.property('skill', {'$in':['go','nodejs','oc']});
            splitQuery(q.generateQuery()).where.should.have.property('version', {'$nin':[1,2]});
        });
        it('between', function(){
            (function(){ sk.Query('test').between('key', 'from', 'to') }).should.throw();
            (function(){ sk.Query('test').between('key', 50, 10) }).should.throw();
            var q = sk.Query('test').between('key', 10, 50);
            splitQuery(q.generateQuery()).where.should.have.property('key', {'$gte':10,'$lte':50});
        });
        it('exists',function(){
            var q = sk.Query('test').exist('skill','version').notExist('name','author');
            var _result = splitQuery(q.generateQuery());
            _result.where.should.have.property('skill',{'$exists':true});
            _result.where.should.have.property('version',{'$exists':true});
            _result.where.should.have.property('name',{'$exists':false});
            _result.where.should.have.property('author',{'$exists':false});

        });

    });
});

var splitQuery = function(query){
    //console.log(query);
    var _result = {};
    var _split = query.split("&");
    _.forEach(_split, function(v){
        //if(/(\w+)=([^=]+)/.test(v)){
        //    console.log(RegExp.$1, RegExp.$2);
        //    _result[RegExp.$1] = RegExp.$2;
        //}

        var _temp = v.split('=');
        if(_temp.length == 2 ){
            var _key = _temp[0], _value = _temp[1];
            if(_key == "where"){
                _value = JSON.parse(_temp[1]);
            } else if (_key == 'skip'||_key == 'take'||_key == 'count'){
                _value = _value*1;
            }
            _result[_key] = _value;
        }
    });

    return _result;
};