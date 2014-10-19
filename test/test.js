/* jshint immed: false */
/* globals Replicator, describe, beforeEach, it, xdescribe */

(function () {
'use strict';

describe('Replicator', function() {
  describe('#define', function() {
    describe('invalid arguments', function() {
      it('should throw an error if no name is given', function() {
        (function(){ Replicator.define(); }).should.throw(/name/);
      });
      it('should throw an error if name is not a string', function() {
        (function(){ Replicator.define({}); }).should.throw(/name/);
        (function(){ Replicator.define([]); }).should.throw(/name/);
        (function(){ Replicator.define(4); }).should.throw(/name/);
      });
    });
    describe('when using non registered factories', function() {
      var embeddingFactoriesThatDontExistYet = function() {
        Replicator.define('user', {
          friend: Replicator.embed('friend')
        });
        Replicator.define('friend', {
          name: 'Joe'
        });
      };
      it('should not throw ', function() {
        (function() {
          embeddingFactoriesThatDontExistYet();
        }).should.not.throw();
      });
      it('should still return the correct factory', function() {
        embeddingFactoriesThatDontExistYet();
        Replicator.build('user').friend.should.eql({name: 'Joe'});
      });

    });
    describe('when passed only a name', function() {
      beforeEach(function() {
        Replicator.define('user');
      });
      it('should set an empty object on the registry', function() {
        Replicator.makeFactory('user')().should.eql({});
      });
    });
    describe('when passed a hash', function() {
      beforeEach(function() {
        Replicator.define('user', {first: 'johnny', last: 'appleseed'});
      });
      it('should set key value pairs', function() {
        Replicator.makeFactory('user')().should.eql({first: 'johnny', last: 'appleseed'});
      });
      it('should embed other replicators', function() {
        Replicator.define('bill', {amount: 50});
        Replicator.define('user', {first: 'johnny', last: 'appleseed', bill: Replicator.build('bill')});
        Replicator.makeFactory('user')().should.eql({first: 'johnny', last: 'appleseed', bill: {amount: 50}});
      });
      describe('should accept functions as keys', function() {
        beforeEach(function(){
          Replicator.define('user', {
            name: 'joe',
            email: function(props, index) {
              return props.name + index + '@gmail.com';
            }
          });
        });
        it('should pass the props and an index', function() {
          Replicator.makeFactory('user')().email.should.eql('joe1@gmail.com');
        });
        it('should increment the index', function() {
          Replicator.makeFactory('user')().email.should.eql('joe1@gmail.com');
          Replicator.makeFactory('user')().email.should.eql('joe2@gmail.com');
          Replicator.makeFactory('user')().email.should.eql('joe3@gmail.com');
        });
      });
    });
  }); // define
  describe('#trait', function() {
    describe('with valid arguments', function() {
      it('should override existing attributes', function() {
        Replicator
          .define('user', {name: 'Joe'})
          .trait('namedBob', {name: 'Bob'});

        Replicator.makeFactory('user', {namedBob: true})()
          .should.eql({name: 'Bob'});
      });
      it('should create new attributes', function() {
        Replicator
          .define('user', {name: 'Joe'})
          .trait('withAge', {age: 4});

        Replicator.makeFactory('user', {withAge: true})()
          .should.eql({name: 'Joe', age: 4});
      });
    });

  }); // trait
  describe('#build', function() {
    describe('when there is no factory', function() {
      it('should throw a helpful error message', function() {
        ( function() {
          Replicator.makeFactory('factoryThatDoesntExist')();
        }).should.throw(/factoryThatDoesntExist/);
      });
    });
    describe('when passed a hash', function() {
      describe('with values other than true', function() {
        it('should set them as properties',function() {
          Replicator.define('user', {is_confirmed: false});
          Replicator.makeFactory('user', {is_confirmed: true})().is_confirmed.should.eql(true);
        });
      });
      describe('with true values', function() {
        describe('that match traits', function() {
          it('should set the traits', function() {
            Replicator
              .define('user', {name: 'Joe', is_confirmed: false})
              .trait('is_confirmed', {is_confirmed: true, age: 18});

            Replicator.makeFactory('user', {is_confirmed: true})()
              .should.eql({name: 'Joe', is_confirmed: true, age: 18});
          });
        });
        describe('that don\'t match traits', function() {
          it('should set them as properties',function() {
            Replicator.define('user', {is_confirmed: false});
            Replicator.makeFactory('user', {is_confirmed: true})().is_confirmed.should.eql(true);
          });
        });
      });
    });
    describe("when building multiple versions of the same factory", function() {
      it("should not mutate any existing factories", function() {
        Replicator.define('user', {name: "joe"}).trait("namedBob", {name: "bob"});
        var user1 = Replicator.makeFactory('user')();
        var user2 = Replicator.makeFactory('user', {namedBob: true})();
        user1.name.should.eql("joe");
        user2.name.should.eql("bob");
      });
      it("should be able to build multiple versions in an array", function() {
        Replicator.define('user', {name: "joe"}).trait("namedBob", {name: "bob"});
        var list = [];
        list.push(Replicator.makeFactory('user', {namedBob: true})() );
        list.push(Replicator.makeFactory('user')() );

        list[0].name.should.eql('bob');
        list[1].name.should.eql('joe');

        list.push(Replicator.makeFactory('user')() );

        list[2].name.should.eql('joe');
      });
    });
    describe("result", function() {
      var user;
      beforeEach(function() {
        Replicator.define('user', {name: "joe"});
        user = Replicator.makeFactory('user');
      });
      it("should be able to be passed a hash to override given properties", function() {
        user({name: "bob"}).should.eql({name: "bob"});
      });
      it("should throw a helpful error message if the passed in trait is not registered", function() {
        (function(){ user({age: 5}); }).should.throw(/unregistered/);
        // Should contain the unregistered trait
        (function(){ user({age: 5}); }).should.throw(/age/);
        // Should contain the factory name
        (function(){ user({age: 5}); }).should.throw(/user/);
      });
    });
    xdescribe('with dependent functions', function() {
      // Where one calculated prop depends on another calculated prop
    });
    describe('with enforcement', function() {
      beforeEach(function() {
        Replicator.define('user', {name: 'Joe'});
      });
      it('should throw an error for non registered overrides', function() {
        (function(){ Replicator.makeFactory('user', {age: 5}); }).should.throw(/unregistered/);
      });
    });
    describe('without enforcement', function() {
    });
  }); // build
  xdescribe('with calling real APIs', function() {

  });

});
}());
