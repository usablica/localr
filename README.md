# Localr
 :computer: Map localhost ports to localr.io


# Install

Install using `npm`:

```
npm install localr -g
```

# Getting Started

```
localr add 8080 webserver.localr.io
```

and then browse `http://webserver.localr.io`. Easy, isn't it?


## API 

```js
var Localr = require('localr');

var localr = new Localr();

// connect test.localr.io to local port 9090
localr.add('test', 'http', '127.0.0.1', 9090);

localr.on('error', function (msg) {
  console.log('error', msg);
});

localr.listen();
```


# Authors

Amir Mohammad Said  
Afshin Mehrabani

# License

MIT. 
