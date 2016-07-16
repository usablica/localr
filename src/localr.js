var http = require('http');
var httpProxy = require('http-proxy');
var debug = require('debug')('localr');
var EventEmitter = require('events');

function Localr (options) {
  options = options || {};

  // to store endpoints
  // e.g. localhost:8000
  this.endpoints = [];
  this.base = options.base || 'localr.io';
  this.port = options.port || 80;
  this.eventEmitter = new EventEmitter();
}

/**
 * Adding a new endpoint
 *
 */
Localr.prototype.add = function (name, protocol, host, port) {
  debug('adding %s - %s %s %s', name, protocol, host, port);

  this.endpoints.push({
    name: name,
    protocol: protocol || 'http',
    host: host || '127.0.0.1',
    port: port || 80
  });
};

/**
 * To render a message on the HTTP server
 *
 */
Localr.prototype.render = function (res, status, msg) {
  res.writeHead(status, {
    'Content-Type': 'text/html'
  });

  res.end('<b>Localr</b> <p>' + msg + '</p>');
};

/**
 * To parse node-proxy's error messages
 *
 */
Localr.prototype.parse = function (error) {
  var msg = '';

  if (error.code == 'ECONNREFUSED') {
    msg = 'Route found but the proxy was unable to connect to the port.';
  }

  return msg;
};

/**
 * Start the reverse proxy server
 *
 */
Localr.prototype.listen = function () {
  var self = this;
  this.proxy = httpProxy.createProxy();

  debug('start listening to %s', this.port);

  var options = {
    router: {}
  };

  // adding routes
  for (var i = 0; i < this.endpoints.length; i++) {
    var endpoint = this.endpoints[i];

    // TODO: changing this to path.join
    options.router[endpoint.name + '.' + this.base] = endpoint.protocol + '://' + endpoint.host + ':' + endpoint.port;
  }

  // start the HTTP server.
  // this server manages all requests
  http.createServer(function (req, res) {

    self.proxy.on('error', function (err, req, res) {
      debug('proxy error %s', err);
      self.eventEmitter.emit('error', err);
      self.render(res, 500, self.parse(err));
    });

    var host = req.headers.host;

    if (host in options.router) {
      var endpoint = options.router[host];

      debug('connecting to %s', endpoint);

      self.proxy.web(req, res, {
        target: endpoint
      });

    } else {
      debug('no route found for %s', host);
      self.eventEmitter.emit('error', 'No route found for ' + host);
      self.render(res, 404, 'No route found for ' + host);
    }
  }).listen(this.port);
};

/**
 * EventEmitter wrapper
 *
 */
Localr.prototype.on = function (type, fn) {
  this.eventEmitter.on(type, fn);
};

module.exports = Localr;
