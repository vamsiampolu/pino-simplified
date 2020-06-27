Jaeger is a platform created by Uber and open sourced to collect tracing data across multiple micro-services. The docker image `jaegertracing/all-in-one` does not setup or use certain components such as Elasticsearch and Cassandra.

The UDP port `6831` is used to receive tracing data with a fallback http port of `14268` provided in case there are any issues with UDP packet limits.

The Jaeger UI (built pleasingly in React) is available at `localhost:16686`.

> The Jaeger UI is managed by the jaeger-query microservice, reloading the component multiple times will show traces for jaeger-query.

---

The HOTRoD Example Application:

An example ride sharing application is provided as an example:

```
docker run --rm -it \
    --link jaeger \
    -p8080-8083:8080-8083 \
    jaegertracing/example-hotrod:1.6 \
    all \
    --jaeger-agent.host-port=jaeger:6831
```

> The tracing platform can illustrate the architecture of the microservices as a Directed Acyclic Graph (DAG).

Each trace has a timeline view which represents all the spans within the transaction, each span can either be a call internal to a microservice or calls between microservices.

Logs are collected with contextual tracing information within each span. 

Each span can have `tags` and `logs`, both of these contain contextual information

Tags are contextual information applied to the whole span. Span logs are events that occured during a span's execution. Each log has a timestamp to record when the event occured.

> Semantic Data Conventions are provided by the OpenTracing Spec, some well known tags are described there.

Use these spans to check latency on the timeline view.

---


