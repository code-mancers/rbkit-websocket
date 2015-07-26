class CpuProfilingButton extends React.Component {

  constructor(props) {
    super(props);
    CpuProfilingButton.defaultProps = { active: false };
    this.clickHandler = this.props.toggleCpuProfiling;
  }

  render() {
    var buttonClass, buttonText;
    if(this.props.active) {
      buttonClass = 'button-running pure-button';
      buttonText = 'Stop Cpu Profiling';
    } else {
      buttonClass = 'button-stopped pure-button';
      buttonText = 'Start Cpu Profiling';
    }

    return(
      <div className="cpu-profiling-button">
        <button className={buttonClass} onClick={this.clickHandler}>{buttonText}</button>
      </div>
    );
  }
}
