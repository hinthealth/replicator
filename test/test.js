describe('Replicator', function() {
  describe('#define', function() {
    describe("invalid arguments", function() {
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
      xit("should have #trait method", function() {
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
      describe('should accept functions as keys', function(done) {
        beforeEach(function(){
          Replicator.define('user', {
            name: "joe",
            email: function(props, index) {
              return props.name + index + "@gmail.com";
            }
          });
        });
        it('should pass the props and an index', function() {
          Replicator.build('user')().email.should.eql("joe1@gmail.com");
        });
        it('should increment the index', function() {
          Replicator.build('user')().email.should.eql("joe1@gmail.com");
          Replicator.build('user')().email.should.eql("joe2@gmail.com");
          Replicator.build('user')().email.should.eql("joe3@gmail.com");
        });
      });
    });
  }); // define
  xdescribe('#trait', function() {

  }); // trait
  xdescribe('#build', function() {
    describe('with enforcement', function() {
      describe('when passed a hash', function() {
        describe('with values other than true', function() {
          beforeEach(function() {
            Replicator.define('user', {});
          });
          it('should set them as properties',function() {

          });
        });
        describe('with true values', function() {
          describe('that match traits', function() {
            it('should set the traits', function() {

            });
          });
          describe('that don\'t match traits', function() {
            it('should set as an property', function() {

            });
          });
        });
      });

    });
    describe('without enforcement', function() {
      describe('when passed a hash', function() {
        describe('with values other than true', function() {
          beforeEach(function() {
            Replicator.define('user', {});
          });
          it('should set them as properties',function() {

          });
        });
        describe('with true values', function() {
          describe('that match traits', function() {
            it('should set the traits', function() {

            });
          });
          describe('that don\'t match traits', function() {
            it('should set as an property', function() {

            });
          });
        });
      });
    });

  }); // build

});

