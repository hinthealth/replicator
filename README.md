replicator
==========

##Install

`bower install replicator`

##Basic Usage

```
// Define name of factory, and any trait variations.
Replicator.define('user', {
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

// Create an instance of the factory. This returns a **function** (like a mini-factory)
var bruce = Replicator.build('user');

// The returned function can be invoked with attributes that always override the defaults (or the traits).
$httpBackend.whenGET('/user').respond(bruce({age: 35}) );

// Use with traits and overrides
var batCarBruce = Replicator.build('user', {withBatCar: true, age: 25});

// Because of enforcment, if you try to override a trait that doesn't exist, Replicator will throw an error. woo!
bruce({badAttr: "blah"}) // Throws an error!

// This way, if you've been using test-specific overrides in your tests, and then your API changes, just change
// The trait on the definition of the factory, and your tests will start failing. Hot damn!
```



##Cool Stuff

###Enforcement!
  Replicator, by default, ensures that you don't override any of your factories with traits you haven't registered. This is helpful
  so that when your API changes, you can change the factory trait in one place, and all your tests should start breaking, even if you
  had written some random override somewhere in one of your tests. siiiick. 


###Faker.js!
Replicator comes baked in with easy, complete access to Faker.js (https://github.com/FotoVerite/faker.js)

Just pass in "faker | [faker attribute]" to any field, and we'll create a faker instance of that field for you, like so...
```
Replicator.define('user', {
  user_email: "faker | email" // returns eg. "joe.smith287@gmail.com" or whatever faker gives you.
});
```
Or... just pass in 'faker', and Replicator will assume you want the field name to be the attribute...
```
Replicator.define('user', {
  email: "faker" // returns eg. "joe.smith287@gmail.com" or whatever faker gives you.
});
```

###Use functions to create factory values!
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

###Make copies!
```
// Just pass in any number you like after the attrs, and Replicator will produce that many. Obvi, it defaults to 1.
Replicator.build('user', {name: "bruce wayne"}, 3); 
// The above would return a function, that, when invoked, returns [{name: "bruce"}, {name: "bruce"}, {name: "bruce"}];
```

