(function () {
  'use strict';
  // Data Stores
  var sharedRegistry = {};
  var sharedTraits = {};
  var sharedIndicies = {};
  var config = {
    enforce: true
  };


  function splitTraits(factoryName, buildProps) {
    var traitProps = {};
    _.each(buildProps, function(prop, key) {
      // Only accepting 'trait: true' as syntax
      if (prop !== true) {return;}

      var matchedTrait = sharedTraits[factoryName][key];
      if ( _.isObject(matchedTrait) ) {
        _.extend(traitProps, matchedTrait);
        delete buildProps[key];
      }
    });
    return traitProps;
  }

  function enforce(definedProps, traitProps, props) {
    var propsMinusBuildLength = _.keys(_.extend(definedProps, traitProps)).length;
    if (propsMinusBuildLength !== _.keys(props).length) {
      throw new Error('You can\'t add unregistered attributes in a build.');
    }
  }

  function splitFunctions(props) {
    var funcProps = {};
    _.each(props, function (val, key) {
      if ( _.isFunction(val) ) {
        funcProps[key] = val;
        delete props[key];
      }
    });
    return funcProps;
  }

  function calculateProps(name, buildProps) {
    var definedProps = sharedRegistry[name];
    // this removes traits from buildProps
    var traitProps = splitTraits(name, buildProps);
    var props = _.extend({}, definedProps, traitProps, buildProps);

    if (config.enforce) {
      enforce(definedProps, traitProps, props);
    }

    // this removed functions from props
    var funcProps = splitFunctions(props);
    _.each(funcProps, function (val, key) {
      props[key] = val(props, sharedIndicies[name]);
    });

    sharedIndicies[name]++;
    return props;
  }


  function define(factoryName, props) {
    if ( !_.isString(factoryName) ) { throw new Error('A factory name is required.'); }
    // check for props to be object
    props = props || {};

    var trait = function (traitName, traitProps) {
      // enforce string for factoryName
      // enforce object for props
      sharedTraits[factoryName] = sharedTraits[factoryName] || {};
      sharedTraits[factoryName][traitName] = traitProps;
      return factory;
    };

    var factory = {
      trait: trait
    };

    // Set on data store
    sharedRegistry[factoryName] = props;
    sharedIndicies[factoryName] = 1;
    trait[factoryName] = {};

    return factory;
  }

  function build(factoryName, props, copies) {
    copies = copies || 1;
    if ( !_.isString(factoryName) ) { throw new Error('A factory name is required.'); }

    var result = [];
    _.each(_.range(copies), function(){
      result.push(calculateProps(factoryName, props));
    });

    if (copies === 1) { result = result[0]; }

    return function(props) {
      return props ? build(factoryName, props)() : result;
    };
  }

  var Replicator = {
    define: define,
    build: build,
    embed: function(factoryName, props, copies) {
      return this.build(factoryName, props, copies)();
    },
    config: function(opts) {
      if (!opts) { return config; }
      // check opts for actual config keys
      _.extend(config, opts);
    }
  };

  window.Replicator = Replicator;
})();
