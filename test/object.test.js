/**
 *
 * Created by william on 11/1/14.
 */

var sk = require('../');
var should = require('should');
var _ = require("lodash");

describe('test object -->', function(){
    describe('test initalize', function(){
        it("should be throw error if not send name param", function(){
            (function(){ sk.Object() }).should.throw();
        });
    });
    describe('set object value', function () {
        it("should throw error when the first argument is not json or string", function(){
            (function(){ sk.Object('test').set(1) }).should.throw();
            (function(){ sk.Object('test').set('name')}).should.throw();
            (function(){ sk.Object('test').set('key', true)}).should.not.throw();
        });

        it('the object default property is need assigned', function(){
            var o = sk.Object('test');
            o.resourceName.should.equal('test');

            (function(){sk.Object('test1', '520c7e1ae4b0a3ac9ebe326a') }).should.not.throw();
            (function(){sk.Object('test1', 'xxxx') }).should.throw();
            (function(){sk.Object('test1', null) }).should.not.throw();
        });

        it('test increment/decrement function', function(){
            var o = sk.Object('test');
            o.increment('score');
            //(function(){o._changed}).score.amount.should.equal(1);
            o._changed.score["__op"].should.equal("Increment");
            o.increment('score', 3);
            o._changed.score.amount.should.equal(3);
            o.increment('score', -10);
            o._changed.score.amount.should.equal(-10);
        });

        it('add or remove array list', function(){
            var o = sk.Object('test');
            o.addToArray('arrays', [1,10]).addToArray('arrays', [1,10,20,21]);
            o._changed.arrays["__op"].should.equal("Add");
            o._changed.arrays.objects[0].should.equal(1);
            o._changed.arrays.objects[1].should.equal(10);
            o._changed.arrays.objects[2].should.equal(1);
            o._changed.arrays.objects[3].should.equal(10);
            o._changed.arrays.objects[4].should.equal(20);
            o._changed.arrays.objects[5].should.equal(21);

            o.addUniqueToArray('unique', 10).addUniqueToArray('unique', [ 18,10, 19]);
            o._changed.unique["__op"].should.equal("AddUnique");
            o._changed.unique.objects[0].should.equal(10);
            o._changed.unique.objects[1].should.equal(18);
            o._changed.unique.objects[2].should.equal(19);

            o.removeFromArray('remove', 11).removeFromArray('remove', [15,16]);
            o._changed.remove["__op"].should.equal("Remove");
            o._changed.remove.objects[0].should.equal(11);
            o._changed.remove.objects[1].should.equal(15);
            o._changed.remove.objects[2].should.equal(16);
        });

        it('set multi times', function(){
            var o = sk.Object('test');
            o.set('name', 'skcloud').set('address', 'shenzhen').set({"title": "node.js sdk", "content":"just for test"})
                .increment('scope', 10);
            o._changed.name.should.equal('skcloud');
            o._changed.address.should.equal('shenzhen');
            o._changed.title.should.equal('node.js sdk');
            o._changed.content.should.equal('just for test');
            o._changed.scope.amount.should.equal(10);
        });

        it('send a pointer', function(){
            var p = sk.Object('post');
            p.objectId = '520c7e1ae4b0a3ac9ebe326a';
            var c = sk.Object('comment');
            c.set('parent', p);
            c._changed.parent.should.equal('520c7e1ae4b0a3ac9ebe326a');
        });

        it('clear ', function(){
            var t = sk.Object('Test',{name:'william'});
            //console.log(t.get('name'));
            t.get('name').should.equal('william');
            t.clear();
            (t.get('name') === undefined).should.be.true;
        });
        it('save data', function(){
            var t = sk.Object('Test');
            t.set({score:20,name:'william'}).save(function(response){
                done();
            });
        });

        it.skip('refresh function', function(){

        });
    });
});
