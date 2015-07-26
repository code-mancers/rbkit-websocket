class SampleCollection {
  constructor() {
    this.idMap = {};
    this.frames = [];
    this._sampleCount = 0;
  }

  addSample(sample) {
    ++ this._sampleCount;
    this.addFrame(sample[0], true);
    for(var i = 1; i < sample.length; i++)
      this.addFrame(sample[i], false);
  }

  addFrame(frame, isSelf) {
    var file = frame[6];
    var line = frame[7];
    if(this.idMap[file] == undefined) {
      this.idMap[file] = {};
    }
    var index = this.idMap[file][line];
    if(index == undefined) {
      var newFrame = {
        methodName: frame[13],
        file: frame[6],
        line: frame[7],
        selfSamples: 0,
        totalSamples: 0
      };
      index = this.frames.push(newFrame) - 1;
      this.idMap[file][line] = index;
    }
    if(isSelf == true)
      ++ this.frames[index].selfSamples;
    ++ this.frames[index].totalSamples;
  }

  get frameList() {
    return this.frames;
  }

  get sampleCount() {
    return this._sampleCount;
  }
}


class CpuProfilingResults extends React.Component {
  constructor() {
    this.state = {
      sortBy: '',
      cpuFrames: []
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({cpuFrames: nextProps.cpuFrames});
  }

  _sortRowsBy(sortKey) {
    var key = (sortKey == 'selfTime') ? 'selfSamples' : 'totalSamples'
    console.log('Sorting by ' + key);
    var frames = this.state.cpuFrames.slice();
    frames.sort((a,b) => {
      return (b[key] - a[key]);
    });

    this.setState({
      cpuFrames: frames,
      sortBy: sortKey
    });
  }

  _renderHeader(label, cellDataKey) {
    return (
      <a onClick={this._sortRowsBy.bind(this, cellDataKey)}>{label}</a>
    );
  }

  _rowGetter(rowIndex) {
    var frame = this.state.cpuFrames[rowIndex];
    return {
      selfTime: (100 * frame.selfSamples / this.props.sampleCount).toFixed(2),
      totalTime: (100 * frame.totalSamples / this.props.sampleCount).toFixed(2),
      methodName: frame.methodName,
      sourceLocation: `${frame.file}:${frame.line}`,
      selfSamples: frame.selfSamples,
      totalSamples: frame.totalSamples
    };
  }

  render() {
    var sortBySelf = () => {
      this.setState({sortBy: 'selfTime'});
    }
    var sortByTotal = () => {
      this.setState({sortBy: 'totalTime'});
    }

    var Table = FixedDataTable.Table;
    var Column = FixedDataTable.Column;
    return(
      <div className="frame-table-container">
        <Table
          rowHeight={50}
          rowGetter={this._rowGetter.bind(this)}
          rowsCount={this.state.cpuFrames.length}
          width={window.innerWidth}
          height={1000}
          headerHeight={50}>
          <Column
            headerRenderer={this._renderHeader.bind(this)}
            label={'Self Time' + (this.state.sortBy === 'selfTime' ?  '↓' : '')}
            width={120}
            dataKey='selfTime'
          />
          <Column
            headerRenderer={this._renderHeader.bind(this)}
            label={'Total Time' + (this.state.sortBy === 'totalTime' ?  '↓' : '')}
            width={120}
            dataKey='totalTime'
          />
          <Column
            label="Method Name"
            width={300}
            dataKey='methodName'
          />
          <Column
            label="Source Location"
            width={650}
            dataKey='sourceLocation'
          />
          <Column
            label="Self samples"
            width={100}
            dataKey='selfSamples'
          />
          <Column
            label="Total samples"
            width={100}
            dataKey='totalSamples'
          />
        </Table>
      </div>
    );
  }
}
