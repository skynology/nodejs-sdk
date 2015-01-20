var sk = require('../');
var should = require('should');
var path = require('path');

var c = sk.Config;

describe('test config -->', function(){
	describe('test initialize -->', function(){
        it("should be throw error if not initialize", function(){
            (function(){ c.getRequestSign() }).should.throw();
        });
        it("initialize with appid and appkey", function(){
            //
            c.initialize('mdx1l0uh1p08tdpsk8ffn4uxjh2bbhl86rebrk3muph08qx7','n35a5fdhawz56y24pjn3u9d5zp9r1nhpebrxyyu359cq0ddo')
            c.getTimestamp().should.match(/\d+/)
            c.getApplicationId().should.equal('mdx1l0uh1p08tdpsk8ffn4uxjh2bbhl86rebrk3muph08qx7')
            c.getApplicationId().should.not.equal('xx-xx-mdx1l0uh1p08tdpsk8ffn4uxjh2bbhl86rebrk3muph08qx7')
        });
        it("installation id should be return correctly", function(){
            var t = c.getInstallationId()
            t.length.should.equal(36);
        });

        it('get request options ', function(){
            var ops = c.getRequestOptions();
            ops.headers['SKCloud-Application-Id'].should.equal('mdx1l0uh1p08tdpsk8ffn4uxjh2bbhl86rebrk3muph08qx7');
        });
	});
});

