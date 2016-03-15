(function () {
  'use strict';
  // Data Stores
  var sharedRegistry = {};
  var sharedTraits = {};
  var factoryCounts = {};
  var config = {
    enforce: true
  };


  function getAllTraitProps(factoryName, buildProps) {
    var traitProps = {};

    var traitNames = _.map(buildProps, function(val, key) { if (val === true) { return key; } });
    _.each(traitNames, function(propName) {
      var matchedTrait = getPropsForOneTrait(factoryName, propName);
      if ( _.isObject(matchedTrait) ) {
        _.extend(traitProps, matchedTrait);
      }
    });
    return traitProps;
  }

  function enforce(definedProps, traitProps, props, factoryName) {
    var propsMinusBuildLength = _.keys(_.extend({}, definedProps, traitProps));
    // TODO: Check if xor is actually the thing we want...
    var difference = _.xor(propsMinusBuildLength, _.keys(props));
    if (difference.length) {
      throw new Error(
        'Couldn\'t add unregistered attributes ' +
        difference.join(',') +
        ' in a build of factory ' +
        factoryName
      );
    }
  }

  function getDefinedProps(factoryName) {
    return sharedRegistry[factoryName];
  }

  function getOverrideProps(factoryName, props) {
    return _.pick(props, function(propVal, propName) {
      return !getPropsForOneTrait(factoryName, propName);
    });
  }

  function getPropsForOneTrait(factoryName, trait) {
    // Shouldn't be needed. Just to be paranoid.
    sharedTraits[factoryName] = sharedTraits[factoryName] || {};
    return sharedTraits[factoryName][trait];
  }

  function evaluateDynamicProperties(props, count) {
    _.each(props, function(propVal, propName) {
      if(_.isFunction(propVal)) {
        props[propName] = propVal(props, count);
      }
    });
  }

  function calculateProps(factoryName, buildProps) {
    var definedProps = getDefinedProps(factoryName);
    var traitProps = getAllTraitProps(factoryName, buildProps);
    var overrideProps = getOverrideProps(factoryName, buildProps);

    var props = _.extend({}, definedProps, traitProps, overrideProps);

    if (config.enforce) {
      enforce(definedProps, traitProps, props, factoryName);
    }

    var count = factoryCounts[factoryName];
    evaluateDynamicProperties(props, count);

    factoryCounts[factoryName]++;

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
    factoryCounts[factoryName] = 1;
    sharedTraits[factoryName] = {};

    return factory;
  }

  function makeFactory(factoryName, props, copies) {
    copies = copies || 1;
    if ( !_.isString(factoryName) ) {
      throw new Error('A factory name is required.');
    }
    if ( !sharedRegistry[factoryName] ) {
      throw new Error('Can\'t build ' + factoryName + '. It has not been defined');
    }

    var result = [];
    _.each(_.range(copies), function(){
      result.push(calculateProps(factoryName, props));
    });

    if (copies === 1) { result = result[0]; }

    return function(overrideProps) {
      return overrideProps ? makeFactory(factoryName, overrideProps)() : result;
    };
  }

  function embed(factoryName, props, copies) {
    return function() {
      return Replicator.build(factoryName, props, copies);
    };
  }

  var Replicator = {
    define: define,
    makeFactory: makeFactory,
    build: function(factoryName, props, copies) {
      return this.makeFactory(factoryName, props, copies)();
    },
    embed: embed,
    config: function(opts) {
      if (!opts) { return config; }
      // check opts for actual config keys
      _.extend(config, opts);
    }
  };

  window.Replicator = Replicator;
})();
