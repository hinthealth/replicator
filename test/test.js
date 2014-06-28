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
    describe('when passed only a name', function() {
      beforeEach(function() {
        Replicator.define('user');
      });
      xit('should have #trait method', function() {
      });
      it('should set an empty object on the registry', function() {
        Replicator.build('user')().should.eql({});
      });
    });
    describe('when passed a hash', function() {
      beforeEach(function() {
        Replicator.define('user', {first: 'johnny', last: 'appleseed'});
      });
      it('should set key value pairs', function() {
        Replicator.build('user')().should.eql({first: 'johnny', last: 'appleseed'});
      });
      it('should embed other replicators', function() {
        Replicator.define('bill', {amount: 50});
        Replicator.define('user', {first: 'johnny', last: 'appleseed', bill: Replicator.embed('bill')});
        Replicator.build('user')().should.eql({first: 'johnny', last: 'appleseed', bill: {amount: 50}});
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
          Replicator.build('user')().email.should.eql('joe1@gmail.com');
        });
        it('should increment the index', function() {
          Replicator.build('user')().email.should.eql('joe1@gmail.com');
          Replicator.build('user')().email.should.eql('joe2@gmail.com');
          Replicator.build('user')().email.should.eql('joe3@gmail.com');
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

        Replicator.build('user', {namedBob: true})()
          .should.eql({name: 'Bob'});
      });
      it('should create new attributes', function() {
        Replicator
          .define('user', {name: 'Joe'})
          .trait('withAge', {age: 4});

        Replicator.build('user', {withAge: true})()
          .should.eql({name: 'Joe', age: 4});
      });
    });

  }); // trait
  describe('#build', function() {
    describe('when passed a hash', function() {
      describe('with values other than true', function() {
        it('should set them as properties',function() {
          Replicator.define('user', {is_confirmed: false});
          Replicator.build('user', {is_confirmed: true})().is_confirmed.should.eql(true);
        });
      });
      describe('with true values', function() {
        describe('that match traits', function() {
          it('should set the traits', function() {
            Replicator
              .define('user', {name: 'Joe', is_confirmed: false})
              .trait('is_confirmed', {is_confirmed: true, age: 18});

            Replicator.build('user', {is_confirmed: true})()
              .should.eql({name: 'Joe', is_confirmed: true, age: 18});
          });
        });
        describe('that don\'t match traits', function() {
          it('should set them as properties',function() {
            Replicator.define('user', {is_confirmed: false});
            Replicator.build('user', {is_confirmed: true})().is_confirmed.should.eql(true);
          });
        });
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
        (function(){ Replicator.build('user', {age: 5}); }).should.throw(/unregistered/);
      });
    });
    describe('without enforcement', function() {
    });
  }); // build
  xdescribe('with Faker.js', function() {
    Replicator.define('user', {
      // user_email: 'faker | email' string.split(' | ')
    });

  });
  xdescribe('with calling real APIs', function() {

  });

});
}());
