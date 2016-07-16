var Localr = require('../src/localr.js');

var localr = new Localr();

// connect test.localr.io to local port 9090
localr.add('test', 'http', '127.0.0.1', 9090);

localr.on('error', function (msg) {
  console.log('error', msg);
});

localr.listen();
