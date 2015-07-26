class RbkitClient {
  constructor(options) {
    this.cpuProfilingEnabled = false;
    this.onCpuProfilingStatusChangeCallback = options.onCpuProfilingStatusChange;
    this.socket = this._createWebSocket();
    this.sampleCollection = new SampleCollection();
  }

  _createWebSocket() {
    var ws_protocol = location.protocol == 'https:' ? 'wss://' : 'ws://';
    var ws = new WebSocket(ws_protocol + location.host, ['rbkit']);
    ws.onopen = (event) => {
      this.sendHandshake();
      console.log('Connected to Rbkit server');
    }
    ws.onmessage = this._handleMessage.bind(this);
    return ws;
  }

  _handleMessage(event) {
    var type = event.data[0];
    var message = event.data.slice(1);
    var unescaped_message = unescape(message);
    if(unescaped_message == "ok") {
      console.log('Got ack for command');
      this.sendHandshake();
      return;
    }
    if(unescaped_message.match(/client_count/)) {
      console.warn("Losing connection to new client!");
      console.log(unescaped_message);
      return;
    }
    // Handle handshake response
    if(type == 0){
      var handshake_response = msgpack.unpack(unescaped_message);
      console.log("Got handshake response");
      let newCpuProfilingEnabled = handshake_response[2]['cpu_profiling_enabled'];
      if(this.cpuProfilingEnabled != newCpuProfilingEnabled) {
        this.cpuProfilingEnabled = newCpuProfilingEnabled;
        this.onCpuProfilingStatusChangeCallback(newCpuProfilingEnabled);
      }
      return;
    }
    // Handle profiling data
    if(type == 1){
      var event_collection = msgpack.unpack(unescaped_message);
      var payload = event_collection[2];
      for (var i = 0; i < payload.length; i++) {
        if(payload[i][0] == 9) {
          //this.onNewCpuSampleCallback();
          let sample = payload[i][2];
          this.sampleCollection.addSample(sample);
          //addFrames(payload[i][2]);
        }
      }
      return;
    }
  }

  startCpuProfiling() {
    console.log('Sending start_cpu_profiling');
    this.socket.send('start_cpu_profiling');
  }

  stopCpuProfiling() {
    console.log('Sending stop_cpu_profiling');
    this.socket.send('stop_cpu_profiling');
  }

  sendHandshake() {
    this.socket.send('handshake');
  }

  get status() {
    return {
      cpuProfilingEnabled: this.cpuProfilingEnabled
    }
  }

  get sampleCount() {
    return this.sampleCollection.sampleCount;
  }

  get cpuFrames() {
    return this.sampleCollection.frameList;
  }
}

class App extends React.Component {
  constructor() {
    this.rbkitClient = new RbkitClient({
      onCpuProfilingStatusChange: (isEnabled) => {
        this.setState({
          rbkitStatus: {
            cpuProfilingEnabled: isEnabled
          }
        });
        console.log("Setting cpu frames");
        this.setState({cpuFrames: this.rbkitClient.cpuFrames, sampleCount: this.rbkitClient.sampleCount});
      }
    });
    this.state = {
      rbkitStatus: {
        cpuProfilingEnabled: false
      },
      sampleCount: 0,
      cpuFrames: []
    }
  }

  get rbkitCommands() {
    return {
      toggleCpuProfiling: () => {
        if(this.state.rbkitStatus.cpuProfilingEnabled){
          this.rbkitClient.stopCpuProfiling();
        } else {
          this.rbkitClient.startCpuProfiling();
        }
      }
    }
  }

  //componentDidMount() {
    //this.timer = setInterval(() => {
      ////this.setState({sampleCount: this.rbkitClient.sampleCount});
    //}, 1000);
  //}

  //componentWillUnmount() {
    //clearInterval(this.timer);
  //}

  render() {
    return(
      <div>
        <Header rbkitStatus={this.state.rbkitStatus} rbkitCommands={this.rbkitCommands} sampleCount={this.state.sampleCount}/>
        <div className="body">
          <CpuProfilingResults cpuFrames={this.state.cpuFrames} sampleCount={this.state.sampleCount}/>
        </div>
      </div>
    );
  }
}

function init() {
  React.render(<App/>, document.getElementById('react-container'));
}
if (document.readyState != 'loading'){
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
