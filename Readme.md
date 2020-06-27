Pino is a library written in pure JS, in order to understand it I've had to destroy it's approach to using symbols to represent properties, flatstr and a lot of the nuance used to create private properties.

In this project we ignore complexity where possible, remove options to add custom serializers, custom formatters and levels because it does not serve my purpose of understanding Pino as it is.

The project has been bulldozed into a series of ES6 classes, a few helper functions and some constants.

Why the heck are we doing this?

Many observability vendors provide magical support for using pino and many other libraries by automatically finding them and shimming them upon init.

While looking at `dd-trace`, I noticed that that they replace the `asJson` method on pino and inject some logs as long as `DD_TRACE_INJECT_LOGS` is enabled.

What this function does is simple:

1. convert various formats to strings `"safely"` using serializers for `req`, `res` and `Error` types which have also been simplified.

It takes these things and puts them together into a string that is json like.

---

Going a little further, dd-trace relies on this library `OpenTracing` which we can use with a few enhancements I reckon.

---

To use the jaeger example to illustrate a microservice architecture deployed with tracing.

```
$  ci/jaeger-platform.sh
```

The Observability platform is at http://localhost:16686/ and the frontend application is at http://localhost:8080/ 
