describe('Replicator', function() {
  describe('#define', function() {
    describe('when passed only a name', function() {
      beforeEach(function() {
        Replicator.define('user');
      });
      it('should return an empty object', function() {
        Replicator.build('user')().should.eql({});
      });
    });
    describe('when not passed a name', function() {
      it('should throw an error', function() {
        (function(){ Replicator.build(); }).should.throw(/name/);
      });
    });
    xdescribe('when passed a hash', function() {
      it('should set key value pairs', function() {

      });
      it('should embed other replicators', function() {

      });
      describe('should accept functions as keys', function() {
        it('should pass the obj and an index as arguments', function() {

        });
        it('should set the returned value as a property', function() {

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

