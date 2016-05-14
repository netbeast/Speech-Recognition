var netbeast = require('netbeast')

window.SpeechRecognition = window.SpeechRecognition ||
                         window.webkitSpeechRecognition ||
                         window.mozSpeechRecognition ||
                         window.msSpeechRecognition ||
                         window.oSpeechRecognition ||
                          null

if (window.SpeechRecognition === null) {
  document.getElementById('ws-unsupported').classList.remove('hidden')
  document.getElementById('button-onoff').setAttribute('disabled', 'disabled')
} else {
  var recognizer = new window.SpeechRecognition()
  var transcription = document.getElementById('texto')
  var log = document.getElementById('log')

  var aux = 1
  recognizer.continuous = true

// Start recognising
  recognizer.onresult = function (event) {
    transcription.textContent = ''

    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        transcription.textContent = event.results[i][0].transcript
        var aux = event.results[i][0].transcript
        var colora = analyze(aux)
        netbeast(colora[0]).set(colora[1])
        .then(function (data) {
          console.log(data.body)
        })
      } else {
        transcription.textContent += event.results[i][0].transcript
      }
    }
  }

// Listen for errors
recognizer.onerror = function (event) {
  log.innerHTML = 'Recognition error: ' + event.message + '<br />' + log.innerHTML
}
document.getElementById('button-onoff').addEventListener('click', function () {
  // Set if we need interim results
  recognizer.interimResults = 'interim'
  if (aux === 0) {
    aux = 1
    recognizer.stop()
    log.innerHTML = 'Recognition stopped' + '<br />' + log.innerHTML
  } else {
    try {
      transcription.textContent = ''
      log.textContent = ''
      recognizer.lang = 'en-UK'
      recognizer.start()
      log.innerHTML = 'Recognition started' + '<br />' + log.innerHTML
    } catch (ex) {
      log.innerHTML = 'Recognition error: ' + ex.message + '<br />' + log.innerHTML
    }
    aux = 0
  }
})
}

function analyze(cadena) {

  if (cadena.search('light') !== -1)
  {
    if (cadena.search('color') !== -1)
    {
      var color
      if (cadena.search('blue') !== -1)
      {
        color = '#0000B3'
      }
      else if (cadena.search('yellow') !== -1) {
        color = '#FFFF00'
      }
      else if (cadena.search('pink') !== -1) {
        color = '#F00080'
      }

      var arg= ['lights', {color: color}]
    } else if (cadena.search('turn')){
      var power
      if (cadena.search('on')) {
        power = 'on'
      } else if (cadena.search('off')) {
        power = 'off'
      }
      var arg= ['lights', {power: power}]
    }
    return arg
  }
}
