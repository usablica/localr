var http = require('http');
var httpProxy = require('http-proxy');

function Localr () {
  // to store endpoints
  // e.g. localhost:8000
  this.endpoints = [];
  this.base = 'localr.io';
}

/**
 * Adding a new endpoint
 *
 */
Localr.prototype.add = function (name, protocol, host, port) {
  this.endpoints.push({
    name: name,
    protocol: protocol || 'http',
    host: host || '127.0.0.1',
    port: port || 80
  });
};

/**
 * Start the reverse proxy server
 *
 */
Localr.prototype.listen = function (port) {
  var options = {
    router: {}
  };

  // adding routes
  for (var i = 0; i < this.endpoints.length; i++) {
    var endpoint = this.endpoints[i];

    options.router[endpoint.name + '.' + this.base] = endpoint.protocol + '://' + endpoint.host + ':' + endpoint.port;
  }

  var proxy = httpProxy.createProxy();

  http.createServer(function (req, res) {
    var endpoint = options.router[req.headers.host];
    console.log('connecting to', endpoint);

    proxy.web(req, res, {
      target: endpoint
    });

  }).listen(port || 80);
};

module.exports = Localr;
