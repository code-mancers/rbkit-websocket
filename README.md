# Rbkit::Websocket

![image](https://cloud.githubusercontent.com/assets/1707078/8674602/9b08c150-2a5c-11e5-9368-b71e2539a7fa.png)

This extension allows you to connect to Rbkit server using websockets over
a Rack server. The following servers are supported:

The following web servers will be supported :

* [Goliath](http://postrank-labs.github.com/goliath/)
* [Phusion Passenger](https://www.phusionpassenger.com/) >= 4.0 with nginx >= 1.4
* [Puma](http://puma.io/) >= 2.0
* [Rainbows](http://rainbows.bogomips.org/)
* [Thin](http://code.macournoyer.com/thin/)

Currently only tested with Thin and Puma.

All webservers supported by `faye-websocket` should work.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'rbkit-websocket'
```

And then execute:

    $ bundle

## Usage

### With Rails

Add the following to `config/application.rb` or `config/environments/<environment>.rb`

```ruby
config.middleware.insert_before ActionDispatch::Static, Rbkit::Websocket
```
Replace `ActionDispatch::Static` with whichever middleware comes first in your
Rack middleware stack. Use `RAILS_ENV=<environment> rake middleware` to list
out your middleware stack.
Rbkit::Websocket middleware should come before Rails takes over the request
to avoid websockets being hijacked by other middlewares(if there are any) and
also to avoid the mutex lock over the request added by Rack::Lock.

### With other Rack applications

Add Rbkit::Websocket to your middleware stack:

```ruby
use Rbkit::Websocket
```

## Protocol

### Rbkit Protocol Extension

Websocket clients need to create websocket requests with a protocol extension
named "rbkit". For example, in JS:

```javascript
var ws = new WebSocket('<URL>', ['rbkit']);
```

This is required because we don't want to hijack websockets created for
application users which needs to be passed on to the application.

### Parsing response data

Rbkit server accepts commands from the client and sends out 2 types of data back :

1. Responses to the commands received (synchronous).
2. Profiling data as and when they are ready to be sent.

For this, Rbkit works with 2 ZMQ sockets :

1. RES socket which can accept commands and give synchronous responses.
2. PUB socket which sends out profiling data.

Since websockets make bidirectional communication possible, we can combine both
the request-response as well as the pub-sub channels into a single websocket.
But when we combine these two, the client will no longer be able to differentiate
between responses and profiling data.

For this, rbkit-websocket prepends a 0 in response messages and 1 in messages
with profiling data. For example:

`<MessagePack packed response from rbkit>` becomes
`0<MessagePack packed response from rbkit>`

and

`<MessagePack packed profiling data from rbkit>` becomes
`1<MessagePack packed profiling data from rbkit>`

So what this means is:

1. Clients can send commands to rbkit server over websockets.
2. Clients need to parse data received on websockets and deal with them based
   on whether the first character is 0 or 1.

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/rbkit-websocket.

