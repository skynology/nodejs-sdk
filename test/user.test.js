var sk = require('../');
var should = require('should');
var _ = require("lodash");

describe('test user -->', function() {
    describe('initalize-->', function () {
        it("inherits from object", function () {
            var u = sk.User({'name':'skynology'});
            u.resourceName.should.equal('_User');
            u.get('name').should.equal('skynology');
        });
    });
});
