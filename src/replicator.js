(function () {
  var registry = {};
  var traits = {};
  var indicies = {};

  var calculateProps = function (name, buildProps) {
    var definedProps = registry[name];
    // var definedTraits = traits[name]
    var props = _.extend(definedProps, buildProps);

    var funcProps = {};
    var calculatedProps = {};
    // put all non functions in the calculatedProps
    _.each(props, function (val, key) {
      if ( _.isFunction(val) ) {
        funcProps[key] = val;
      } else {
        calculatedProps[key] = val;
      }
    });

    // apply the traits

    // now that all non funcs are copied, call the funcs
    _.each(funcProps, function (val, key) {
      calculatedProps[key] = val(calculatedProps, indicies[name]);
    });

    indicies[name]++;
    return calculatedProps;
  };

  var define = function (name, props) {
    // check args
    if ( !_.isString(name) ) { throw new Error('A factory name is required.'); }
    props = props || {};

    // PUBLIC METHOD
    var trait = function () {
      return name;
    };
    // END PUBLIC METHOD

    var factory = {
      trait: trait,
    };

    // set to factory registry
    registry[name] = props;
    indicies[name] = 1;
    // return self
    return factory;
  };


  var Replicator = {
    define: define,
    build: function (name, props, copies) {
      copies = copies || 1;
      if ( !_.isString(name) ) { throw new Error('A factory name is required.'); }

      var result = [];
      _.each(_.range(copies), function(){
        result.push(calculateProps(name, props));
      });

      if (copies === 1) { result = result[0]; }

      return function() { return result; };
    },
    embed: function(name, props, copies) {
      return this.build(name, props, copies)();
    },
    config:{}
  };

  window.Replicator = Replicator;
})();
