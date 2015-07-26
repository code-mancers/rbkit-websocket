class Header extends React.Component {
  render() {
    return(
      <div className="header">
        <div className="pure-g">
          <div className="pure-u-1-5 logo">
            <img className="rbkit-logo" src="/rbkit/assets/images/rbkit-48.png" alt="Rbkit logo" />
            <span className="rbkit-logo-text">Rbkit</span>
          </div>
          <div className="pure-u-2-5"></div>
          <div className="pure-u-1-5">
            <div className="sample-count">
              CPU Samples collected: {this.props.sampleCount}
            </div>
          </div>
          <div className="pure-u-1-5">
            <CpuProfilingButton active={this.props.rbkitStatus.cpuProfilingEnabled} toggleCpuProfiling={this.props.rbkitCommands.toggleCpuProfiling}/>
          </div>
        </div>
      </div>
    );
  }
}
