(function () {
  var registry = {};
  var traits = {};
  var indicies = {};

  var calculateProps = function (name, buildProps) {
    var definedProps = registry[name];
    var definedTraits = traits[name];


    // Finding all traits
    var traitProps = {};
    _.each(buildProps, function(prop, key) {
      // Only accepting 'trait: true' as syntax
      if (prop !== true) {return;}

      var matchedTrait = definedTraits[key];
      if ( _.isObject(matchedTrait) ) {
        _.extend(traitProps, matchedTrait);
        delete buildProps[key];
      }
    });

    var props = _.extend(definedProps, traitProps, buildProps);

    // put all non functions in the calculatedProps
    var funcProps = {};
    var calculatedProps = {};
    _.each(props, function (val, key) {
      if ( _.isFunction(val) ) {
        funcProps[key] = val;
      } else {
        calculatedProps[key] = val;
      }
    });

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
    var trait = function (traitName, props) {
      traits[name] = traits[name] || {};

      traits[name][traitName] = props;
      return factory;
    };
    // END PUBLIC METHOD

    var factory = {
      trait: trait
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
