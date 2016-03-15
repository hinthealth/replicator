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
    _(buildProps)
      .pickBy(function(propValue) {
      return propValue === true;
    }).each(function(propValue, propName) {
      var matchedTrait = getPropsForOneTrait(factoryName, propName);
      if ( _.isObject(matchedTrait) ) {
        _.extend(traitProps, matchedTrait);
      }
    });
    return traitProps;
  }

  function enforce(definedProps, traitProps, props, factoryName) {
    var propsMinusBuildLength = _.keys(_.extend({}, definedProps, traitProps))
    // TODO: Check if xor is actually the thing we want...
    var difference = _.xor(propsMinusBuildLength, _.keys(props));
    if (difference.length) {
      throw new Error('Couldnn\'t add unregistered attributes ' + difference.join(',') + ' in a build of factory ' + factoryName);
    }
  }

  function getDefinedProps(factoryName) {
    return sharedRegistry[factoryName];
  }

  function getOverrideProps(factoryName, props) {
    return _.pickBy(props, function(propVal, propName) {
      return !getPropsForOneTrait(factoryName, propName);
    })
  };

  function getPropsForOneTrait(factoryName, trait) {
    // Shouldn't be needed. Just to be paranoid.
    sharedTraits[factoryName] = sharedTraits[factoryName] || {};
    return sharedTraits[factoryName][trait];
  }

  function evaluateDynamicProperties(props, count) {
    _.each(props, function(propVal, propName) {
      if(_.isFunction(propVal)) {
        props[propName] = propVal(props, count)
      }
    })
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

  function getFaker(attr, prop) {
    var fakerContainers = ['Name', 'Address', 'PhoneNumber', 'Internet', 'Company', 'Image', 'Lorem', 'Helpers', 'Tree', 'Date', 'random', 'definitions'];
    var fakeValue;
    // Defaul to the keys value if they only passed in 'faker'.
    attr = attr.toLowerCase() == 'faker' ? prop : attr;
    _.each(fakerContainers, function(container) {
      if (faker[container][attr]) {
        fakeValue = faker[container][attr]();
      }
    });
    if (fakeValue) {
      return fakeValue;
    }
    throw new Error(attr + " is not a valid attribute for faker.js");
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
