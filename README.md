replicator
==========

***Basic Usage***

// Define name of factory, and any trait variations.
Replicator.define('user', {
  name: "Bruce Wayne",
  age: "15",
  email: "bruce@wayne_enterprises.com"
  is_confirmed: false
})
  .trait("confirmed", {
    is_confirmed: true
  })
  .trait("withBatCar", {
    has_bat_car: true
  });

// Create an instance of the factory. This returns a **function**
var bruce = Replicator.build('user');

// The returned function can be invoked with attributes that always override the defaults.

$httpBackend.whenGET('/user').respond(bruce({age: 35}) );



***Cool Stuff***

***Enforcement!***
  Replicator, by default, ensures that you don't override any of your factories with traits you haven't registered. This is helpful
  so that when your API changes, you can change the factory trait in one place, and all your tests should start breaking, even if you
  had written some random override somewhere in one of your tests. siiiick. 


***Faker.js***!
Replicator comes baked in with easy, complete access to Faker.js (https://github.com/FotoVerite/faker.js)

Just pass in "faker | [faker attributes]" to any field, and we'll create a faker instance of that field for you, like so...
Replicator.define('user', {
  user_email: "faker | email" // returns eg. "joe.smith287@gmail.com" or whatever faker gives you.
});


You can base any trait on any other trait you pass in, like so...

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
  }
});

** Make more!! **
Replicator.define('user', {name: "bruce wayne"}, 3); 
// The above would return a function, that, when invoked, returns [{name: "bruce"}, {name: "bruce"}, {name: "bruce"}];


By default, Replicator will throw an error if the overriden attribute has not been "registered" with that factories
definition or with any of it's traits. This is to help give you one source of truth for what fields your API should return,
while still giving you easy flexibility to modify attributes on the fly in your tests.

