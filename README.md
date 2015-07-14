# Rbkit::Websocket

This extension allows you to connect to Rbkit server using websockets over
a Rack server. The following servers are supported:

The following web servers will be supported :

* [Goliath](http://postrank-labs.github.com/goliath/)
* [Phusion Passenger](https://www.phusionpassenger.com/) >= 4.0 with nginx >= 1.4
* [Puma](http://puma.io/) >= 2.0
* [Rainbows](http://rainbows.bogomips.org/)
* [Thin](http://code.macournoyer.com/thin/)

Currently only tested with Thin

All webservers supported by `faye-websocket` should work.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'rbkit-websocket'
```

And then execute:

    $ bundle

## Usage

Remove Rack::Lock middleware to make sure requests can run concurrently:

### With Rails

Add the following to `config/application.rb` or `config/environments/<environment>.rb`

```ruby
config.middleware.insert_before ActionDispatch::Static, Rbkit::Websocket
```
Rbkit::Websocket middleware should come before Rails takes over the request
to avoid websockets being hijacked by other middlewares(if there are any) and
also to avoid the mutex lock over the request added by Rack::Lock.

### With other Rack applications

Add Rbkit::Websocket to your middleware stack:

```ruby
use Rbkit::Websocket
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/rbkit-websocket.

