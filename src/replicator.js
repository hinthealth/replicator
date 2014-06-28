(function () {
  'use strict';
  // Data Stores
  var registry = {};
  var traits = {};
  var indicies = {};
  var config = {
    enforce: true
  };


  function splitTraits(name, buildProps) {
    var traitProps = {};
    _.each(buildProps, function(prop, key) {
      // Only accepting 'trait: true' as syntax
      if (prop !== true) {return;}

      var matchedTrait = traits[name][key];
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
    var definedProps = registry[name];
    // this removes traits from buildProps
    var traitProps = splitTraits(name, buildProps);
    var props = _.extend({}, definedProps, traitProps, buildProps);

    if (config.enforce) {
      enforce(definedProps, traitProps, props);
    }

    // this removed functions from props
    var funcProps = splitFunctions(props);
    _.each(funcProps, function (val, key) {
      props[key] = val(props, indicies[name]);
    });

    indicies[name]++;
    return props;
  }


  function define(name, props) {
    if ( !_.isString(name) ) { throw new Error('A factory name is required.'); }
    // check for props to be object
    props = props || {};

    var trait = function (traitName, props) {
      // enforce string for name
      // enforce object for props
      traits[name] = traits[name] || {};
      traits[name][traitName] = props;
      return factory;
    };

    var factory = {
      trait: trait
    };

    // Set on data store
    registry[name] = props;
    indicies[name] = 1;
    trait[name] = {};

    return factory;
  }

  function build(name, props, copies) {
    copies = copies || 1;
    if ( !_.isString(name) ) { throw new Error('A factory name is required.'); }

    var result = [];
    _.each(_.range(copies), function(){
      result.push(calculateProps(name, props));
    });

    if (copies === 1) { result = result[0]; }

    return function() { return result; };
  }

  var Replicator = {
    define: define,
    build: build,
    embed: function(name, props, copies) {
      return this.build(name, props, copies)();
    },
    config: function(opts) {
      if (!opts) { return config; }
      // check opts for actual config keys
      _.extend(config, opts);
    }
  };

  window.Replicator = Replicator;
})();
