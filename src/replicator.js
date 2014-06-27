(function () {
  var Replicator = {
    build: function (name, props, copies) {
      if (!name) { throw new Error('A factory name is required.'); }
      console.log('build', arguments);
    },
    define: function (name, props) {
      console.log('define', arguments);
    },
    config:{}
  };

  window.Replicator = Replicator;
})();
