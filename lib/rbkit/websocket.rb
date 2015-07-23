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

    def initialize(app, options={})
      @password = options[:password]
      assets_dir = File.join File.dirname(__FILE__), 'assets'
      # Serve index page at /rbkit
      app = Rack::Static.new(app, {urls: {'/rbkit' => 'index.html'}, root: assets_dir})
      # Serve assets at /rbkit/assets
      @app = Rack::Static.new(app, {urls: ["/rbkit/assets"], root: File.join(assets_dir, '..', '..')})
      # Add a basic auth
      @auth = Rack::Auth::Basic.new(@app) do |username, password|
        password == @password
      end
      if defined? Thin
        Faye::WebSocket.load_adapter('thin')
      end
      @connected_clients = []
    end

    def call(env)
      puts env['PATH_INFO'].inspect
      if Faye::WebSocket.websocket?(env) && env['HTTP_SEC_WEBSOCKET_PROTOCOL'] == 'rbkit'
        ws = Faye::WebSocket.new(env, ['rbkit'], {ping: KEEPALIVE_TIME })

        rbkit_websocket_init(ws)

        # Return async Rack response
        ws.rack_response
      else
        if (!@password.nil? && env['PATH_INFO'].index('/rbkit') == 0)
          @auth.call(env)
        else
          @app.call(env)
        end
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
        @connected_clients.each do |client|
          client.send("#{CHANNELS[:response]}client_count:#{@connected_clients.size + 1}")
        end
        @connected_clients << ws
      end

      ws.on :close do |event|
        puts "Rbkit Closing connection"
        @connected_clients.delete ws
        ws = nil
      end
    end
  end
end
