var nodetime = require("nodetime")
var StatsD = require("statsd-client")
var EventEmitter = require('events').EventEmitter

var defaultHandlers = {
  "http" : [
    function(sample, sd) {
      sd.increment("http-status-code." + sample['Status code']) 
    }
  ]
}

function setDefaults(opts) {
  opts = opts || {}
  opts.host = opts.host || "localhost"
  opts.port = opts.port || 8025
  opts.prefix = opts.prefix || ""
  return opts
}

function normalizeType(type) {
  return type.toLowerCase().replace(/ /g, "_")
}

function StatsdTime(opts) {
  if (typeof opts === "String") {
    var host = opts
    opts = {}
    opts.host = host[0]
    opts.port = host[1]
  }
  this.handlers = defaultHandlers
  this.opts = setDefaults(opts)
  this.conn = this.opts.connection || new StatsD({host: opts.host, port: opts.port, prefix: opts.prefix, debug: true})
}

StatsdTime.prototype.__proto__ = EventEmitter.prototype

StatsdTime.prototype.profile = function() {
  console.log("starting profiler")
  var self = this
  nodetime.on("sample", function(sample) {
    self.processSample(sample)
    self.runHandlers(sample)
    self.emit("sample", sample)
  })
  nodetime.profile(this.opts.nodetime_opts || {headless: true})

}

StatsdTime.prototype.registerHandler = function(type, handler) {
  type = normalizeType(type)
  if (this.handlers[type]) {
    this.handlers[type].push(handler)
  } else {
    this.handlers[type] = [handler]
  }
}

StatsdTime.prototype.increment = function(name) {
  this.conn.increment(name)
}

StatsdTime.prototype.time = function(name, time) {
  this.conn.timing(name + ".time", time)
}

StatsdTime.prototype.processSample = function(sample) {
  var type = normalizeType(sample.Type)
  this.increment(type)
  if (sample._ms) this.time(type, sample._ms)
}

StatsdTime.prototype.runHandlers = function(sample) {
  var type = normalizeType(sample.Type)
  var handlers = this.handlers[type]
  if (type) {
    for (var i = 0; i < handlers.length; i++) {
      handlers[i](sample, this.conn)
    }
  }
}

module.exports = StatsdTime
