# Replicator

### Install

`bower install replicator`

### Basic Usage

```
// Define name of factory, and any trait variations.
Replicator
  .define('user', {
    first_name: "Bruce",
    last_name: "Wayne",
    age: "15",
    has_card: false
  })
  .trait("withCard", { // Reference other factories!
    has_card: true,
    credit_card: Replicator.embed("credit_card")
  }) // Traits can be chained!
  .trait("withEmail", {
    email: function(props, i) { // Reference traits from within the same factory, or return arbitrary things!
      return props.first_name + props.last_name + i + "@gmail.com" // returns "BruceWayne1@gmail.com"
    }
  });

// Then call it either by doing...
var user = Replicator.build('user') // Just auto invokes makeFactory.

// Or...
var userFactory = Replicator.makeFactory('user') // Returns a function that can be called to produce a 'user'
var user = userFactory() // returns a new default `user`. This also allows you to pass overrides as an object to the factory.

```

### Methods

***#define***
```

Replicator
  .define(factoryName, attrs) // Returns object with 'trait' method.
  .trait(moreAttrs)

```
Use these together to succinctly define your factories. Like so...

```
Replicator
  .define('user', {
    name: "Bruce"
  })
  .trait('withFriend', {
    friend: "Alfred"
  };
```

***#makeFactory***
```
// Creates an instance of the factory. This returns a **function** (like a mini-factory)
Replicator.makeFactory(factoryName, attrOverrides, numberOfCopies)

// Note: numberOfCopies defaults to 1. If you pass in more than that, you get back a funciton that would return
// an array filled with the number of objects you specified.

// The returned function can be invoked with attributes that always override the defaults (or the traits), like so...
var bruceFactory = Replicator.makeFactory('user');
$httpBackend.whenGET('/user').respond(bruceFactory({age: 35}) );

// Use with traits and overrides
var batCarBruceFactory = Replicator.makeFactory('user', {withBatCar: true, age: 25});

// Because of enforcment, if you try to override a trait that doesn't exist, Replicator will throw an error. woo!
bruceFactory({badAttr: "blah"}) // Throws an error!

// This way, if you've been using test-specific overrides in your tests, and then your API changes, just change
// The trait on the definition of the factory, and your tests will start failing. Hot damn!

```

***#build***
```
// This is just sugar for makeFactory. It automatically invokes makeFactory. Good for when you know you won't need
overrides. Like so...
var bruce = Replicator.build('user')
```

***#embed***
```
Replicator.embed(factoryName, attrs, numberOfCopies)
// This helps ensure order independence when you're defining factories. All it really does is wrap the build function
in a function, but that helps a lot! Check this out...

Replicator.define('user', {
  name: 'Bruce',
  friend: Replicator.build('friend')
});

Replicator.define('friend', {
  name: 'Alfred'
});

```
This actually errors because 'friend' was not defined when the user definition function got ran! `embed` is the solution.

```
Replicator.define('user', {
  name: 'Bruce',
  friend: Replicator.embed('friend')
});

Replicator.define('friend', {
  name: 'Alfred'
});

```
This succeeds, because embed just returns `function() { Replicator.build('friend') }` and functions only get called
during `build` or `makeFactory` calls (presumably after you've defined everything). See below for more details on using functions.

### Use functions to create factory values!
You can base any trait on any other trait you pass in, like so...

```
Replicator.define('user', {
  first_name: "bruce"
  last_name: "wayne",
  name: function(props, i) {
    return props.first_name + props.last_name;
  },
  email: function(props, i {
    return props.first_name + i + "@gmail.com";
  },
  id: function(props, i) {
    // i is the sequence number for this particular factory. It increments as you make more.
    return i;
  },
  credit_card: Replicator.embed('credit_card') //Unlike build, embed immediatley returns the object for that factory, not a function.
});

```

#### Enforcement!
  Replicator, by default, ensures that you don't override any of your factories with traits you haven't registered. This is helpful  so that when your API changes, you can change the factory trait in one place, and all your tests should start breaking, even if you had written some random override somewhere in one of your tests. siiiick.
