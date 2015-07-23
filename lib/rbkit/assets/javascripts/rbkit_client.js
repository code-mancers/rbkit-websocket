module = angular.module('rbkitClient', []);

module.controller('applicationController', ['$scope', function($scope){

  $scope.rbkit = {
    profiling: false,
    sampleCount: 0,
    frames: []
  };


  var idMap = {};

  var addFrames = function(frames) {
    if(frames == undefined)
      return; // TODO: we need to find if this really happens and remove this check
    addFrame(frames[0], true);
    for(var i = 1; i < frames.length; i++) {
      //addFrame(frames[i], true); // Commented cos angular fails with a lot of frames
    }
  }

  var addFrame = function(frame, isSelf) {
    var file = frame[6];
    var line = frame[7];
    var selfTime, totalTime;
    if(idMap[file] == undefined) {
      idMap[file] = {};
    }
    var index = idMap[file][line];
    if(index == undefined) {
      var newFrame = [frame[12], frame[13], frame[6], frame[7], 0, 0];
      index = $scope.rbkit.frames.push(newFrame) - 1;
      idMap[file][line] = index;
    }
    if(isSelf == true)
      ++ $scope.rbkit.frames[index][4];
    ++ $scope.rbkit.frames[index][5];
  }

  var onMessageHandler = function(event) {
    var type = event.data[0];
    var message = event.data.slice(1);
    var unescaped_message = unescape(message);
    if(unescaped_message == "ok") {
      console.log('Got ack for command');
      $scope.rbkit.socket.send('handshake');
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
      $scope.$apply(function(){
        $scope.rbkit.profiling = handshake_response[2]['cpu_profiling_enabled'] == 1;
      });
      return;
    }
    // Handle profiling data
    if(type == 1){
      var event_collection = msgpack.unpack(unescaped_message);
      var payload = event_collection[2];
      for (var i = 0; i < payload.length; i++) {
        if(payload[i][0] == 9) {
          $scope.$apply(function(){
            $scope.rbkit.sampleCount++;
          });
          addFrames(payload[i][2]);
        }
      }
      return;
    }
  }

  var ws_protocol = location.protocol == 'https:' ? 'wss://' : 'ws://';
  $scope.rbkit.socket = new WebSocket(ws_protocol + location.host, ['rbkit']);
  $scope.rbkit.socket.onmessage = onMessageHandler;
  $scope.rbkit.socket.onopen = function() {
    console.log('Connected to Rbkit server');
    $scope.rbkit.socket.send('handshake');
  }
}]);

module.controller('buttonController', ['$scope', function($scope){
  $scope.clickHandler = function() {
    if($scope.rbkit.profiling) {
      console.log('Sending stop command');
      $scope.rbkit.socket.send('stop_cpu_profiling');
    } else {
      console.log('Sending start command');
      $scope.rbkit.socket.send('start_cpu_profiling');
    }
  }

  $scope.getButtonText = function(){
    return ($scope.rbkit.profiling ? 'Stop' : 'Start') + ' CPU Profiling';
  }
}]);

module.controller('resultsController', ['$scope', function($scope){
  $scope.getSelfTime = function(frame) {
    return(100 * frame[4]/$scope.rbkit.sampleCount);
  }
  $scope.getTotalTime = function(frame) {
    return(100 * frame[5]/$scope.rbkit.sampleCount);
  }
  $scope.getMethodName = function(frame) {
    return(frame[0]);
  }

  $scope.getMethodInfo = function(frame){
    return(frame[2] + ':' + frame[3]);
  }

  $scope.sortedFrames = function() {
    return $scope.rbkit.frames.sort(function(a, b){
      return b[4] - a[4];
    });
  }
}]);

module.filter('orderByTime', function () {
  return function (frames) {
    return frames.sort(function(a, b){
      return (b[4] - a[4]);
    });
  }
});
