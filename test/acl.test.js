var sk = require('../');
var should = require('should');
var _ = require("lodash");

describe('test acl -->', function() {
    describe('initalize-->', function () {
        it('init with user should be ok',function(){
            var userId = '5451f3c39d40a887a100000a';
            var user = sk.User(userId);
            var acl = sk.ACL(user);
            acl.getReadAccess(userId).should.be.true;
            acl.getWriteAccess(userId).should.be.true;
        });
        it('init with json should be ok',function(){
            var _acls = {
                '5451f3c39d40a887a100000a':{
                    read: true, write:true
                },
                'role:admin':{
                    read:true,write:false
                }
            };

            var acl = sk.ACL(_acls);
            console.log(acl.toJSON());
            acl.getRoleReadAccess("admin").should.be.true;
            acl.getRoleWriteAccess("admin").should.be.false;
        });

    });
});
