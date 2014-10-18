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
    _.each(buildProps, function(propVal, prop) {
      // Only accepting 'trait: true' as syntax
      if (propVal !== true) {return;}

      var matchedTrait = getTraitProps(factoryName, prop);
      if ( _.isObject(matchedTrait) ) {
        _.extend(traitProps, matchedTrait);
        delete buildProps[prop];
      }
    });
    return traitProps;
  }

  function enforce(definedProps, traitProps, props, factoryName) {
    var propsMinusBuildLength = _.keys(_.extend({}, definedProps, traitProps))
    // TODO: Check if xor is actually the thing we want...
    var difference = _.xor(propsMinusBuildLength, _.keys(props));
    if (difference.length) {
      throw new Error('Couldnn\'t add unregistered attributes ' + difference.join(',') + 'in a build of factory' + factoryName);
    }
  }

  function getDefinedProps(factoryName) {
    return sharedRegistry[factoryName];
  }

  function getTraitProps(factoryName, trait) {
    return sharedTraits[factoryName][trait];
  }

  function splitFunctions(props) {
    var funcProps = {};
    _.each(props, function (propVal, prop) {
      if ( _.isFunction(propVal) ) {
        funcProps[prop] = propVal;
        delete props[prop];
      }
    });
    return funcProps;
  }

  function calculateProps(factoryName, buildProps) {
    var definedProps = getDefinedProps(factoryName);
    // this removes traits from buildProps
    var traitProps = splitTraits(factoryName, buildProps);
    var props = _.extend({}, definedProps, traitProps, buildProps);

    if (config.enforce) {
      enforce(definedProps, traitProps, props, factoryName);
    }

    // this removed functions from props
    var funcProps = splitFunctions(props);
    _.each(funcProps, function (propVal, prop) {
      props[prop] = propVal(props, sharedIndicies[factoryName]);
    });

    // Removing for now, as there are issues we'll need to deal with around passing arguments to certain faker attrs.

    // fakerize(props);

    sharedIndicies[factoryName]++;

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

  function fakerize(props) {
    // Look for faker values
    _.each(props, function(propVal, prop) {
      // Only accepting Faker calls as strings with "faker | fakerAttr " syntax for now.
      if(!_.isString(propVal)) {return;}

      var regex = /(faker)\s*\|?\s*(\w*)/i;
      var matches = propVal.match(regex);
      var attr;
      if (matches) {
        // The regex has two capture groups. But the first item of the array is always the input itself.
        // So we want to look at slots 1 and 2. The first is always "faker", the second is the arg to faker.
        // So we're either taking the second group (the arg), or just 'faker' if no second group was captured.
        attr = matches[2] ? matches[2] : matches[1];
      }

      props[prop] = attr ? getFaker(attr, prop) : propVal;
    });
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
