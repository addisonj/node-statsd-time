## Wha?
Leverage the excellent nodetime library to take samples, and send it off to statsd!

## How?

``` JavaScript
// make sure this is first!
var StatsdTime = require("statsd-time")
var statsdTime = new StatsdTime("myhost:8025")
statsdTime.profile()
```

## Is it magic?
Nope! Nodetime ties into lots of core node components and makes measurements. It exposes hooks that allow us to get these samples
We ship em off to statsd!

This is a really simple way to get data such as HTTP average request time, Mongodb query counts, etc...

## What about CPU/Heap profiling?
You still need to use nodetime for that, but if you are looking to avoid sending data to an external service, use look (https://github.com/baryshev/look)

## API
By defauly, statsd-time will do the following for any sample:

Send the operation type as a counter.
Send the response time (where applicable)

``` JavaScript
statsdTime.measure("HTTP", function(sample, statsd) {
// do what you want
  statsd.increment("mymetric")

})
// make sure you register BEFORE you call profile!
statsdTime.profile()
```

Initilization Options
statsdTime.profile has the following signature:

``` JavaScript
new StatsdTime(host)
// or
var object = {
  host: "statsdHost", //default: "localhost:8025"
  port: 8025,
  connection: instance, // an open connection to statsD (uses github.com/msiebuhr/node-statsd-client), overrides host
  nodetime_opts: {}, // pased onto nodetime, use stuff like headless: true to turn off external server access
  prefix: "myApp", // default: ""
}
new StatsdTime(object)
// where object is
```
