$(function() {
  
  var $document = $(document);
  var $rangeslider = $('input[type=range]');
  var $output = $('output');
  var timelinePosition = 0;
  var mediaPlayerState;
  
  // Simulate process of a media player 
  var tick = function(callback) {
    mediaPlayerState = window.setTimeout(function() {
      timelinePosition++
      callback();
    }, 1000 / 60);
    return mediaPlayerState;
  };
  
  // Start the pseudo media player
  var mediaPlayerPlay = function() {
    tick(mediaPlayerPlay);
    updateTimeline(timelinePosition);
  };
  
  // Pause the pseudo media player
  var mediaPlayerPause = function() {
    clearTimeout(mediaPlayerState);
  };
  
  // Update the timeline (time elapsed etc.)
  var updateTimeline = function(value) {
    $rangeslider.val(value).change();
  };
  
  // Initialize rangeslider.js
  $rangeslider.rangeslider({
    polyfill: false
  });

  $document
    .on('input', 'input[type="range"]', function(e) {
      // Update timelinePosition, output
      timelinePosition = e.currentTarget.value;
      $output[0].innerHTML = e.currentTarget.value;
    })
    .on('mousedown', '.rangeslider', function() {
      mediaPlayerPause();
    })
    .on('mouseup', function() {
      mediaPlayerPlay();
    });
  
  mediaPlayerPlay();
});