# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rbkit/websocket/version'

Gem::Specification.new do |spec|
  spec.name          = "rbkit-websocket"
  spec.version       = Rbkit::Websocket::VERSION
  spec.authors       = ["Emil Soman"]
  spec.email         = ["emil.soman@gmail.com"]

  spec.summary       = %q{Rbkit extension to use websocket on Rack servers}
  spec.description   = %q{Rbkit extension to use websocket on Rack servers}
  spec.homepage      = nil

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_dependency "faye-websocket", "~> 0.10.0"
  spec.add_development_dependency "bundler", "~> 1.10"
  spec.add_development_dependency "rake", "~> 10.0"
end
