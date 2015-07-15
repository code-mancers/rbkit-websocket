require "rbkit/websocket/version"
require 'faye/websocket'
require 'cgi'

module Rbkit
  class Websocket
    KEEPALIVE_TIME = 15 # in seconds

    CHANNELS = {
      response: '0',
      publish: '1'
    }

    def initialize(app)
      @app = app
      if defined? Thin
        Faye::WebSocket.load_adapter('thin')
      end
    end

    def call(env)
      if Faye::WebSocket.websocket?(env) && env['HTTP_SEC_WEBSOCKET_PROTOCOL'] == 'rbkit'
        ws = Faye::WebSocket.new(env, ['rbkit'], {ping: KEEPALIVE_TIME })

        rbkit_websocket_init(ws)

        # Return async Rack response
        ws.rack_response
      else
        @app.call(env)
      end
    end

    def rbkit_websocket_init(ws)
      server = Rbkit.server
      if server.nil?
        ws.close(nil, 'Closing websocket because Rbkit server is not running')
        return
      end

      server.publish_callback = -> (message) {
        ws.send(CHANNELS[:publish] + CGI.escape(message))
      }

      server.respond_callback = -> (message) {
        ws.send(CHANNELS[:response] + CGI.escape(message))
      }

      ws.on :message do |event|
        server.process_incoming_request(event.data)
      end

      ws.on :open do |e|
        puts "Rbkit opening connection"
      end

      ws.on :close do |event|
        puts "Rbkit Closing connection"
        ws = nil
      end
    end
  end
end
