var netbeast = require('netbeast')

// search if some SpeechRecognition accept the plataform
window.SpeechRecognition = window.SpeechRecognition ||
                         window.webkitSpeechRecognition ||
                         window.mozSpeechRecognition ||
                         window.msSpeechRecognition ||
                         window.oSpeechRecognition ||
                          null

// If any plataform doesnt accept SpeechRecognition, then desactivate button
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
        var args = analyze(aux)
        alert(args)
        action(args)
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

function analyze (cadena) {
  var app
  var method
  if (cadena.search('set') !== -1) {
    method = 'set'
    if (cadena.search('light') !== -1) {
      app = 'lights'
      if (cadena.search('color') !== -1) {
        var color
        if (cadena.search('blue') !== -1) {
          color = '#0000B3'
        } else if (cadena.search('yellow') !== -1) {
          color = '#FFFF00'
        } else if (cadena.search('pink') !== -1) {
          color = '#F00080'
        }
        var arg = [method, app, {color: color}]
      } else if (cadena.search('power') !== -1) {
        var power
        if (cadena.search('on')) {
          power = 1
        } else if (cadena.search('off')) {
          power = 0
        }
        var arg = [method, app, {power: power}]
      }
    } else if ((cadena.search('switch') !== -1) || (cadena.search('bridge') !== -1)) {
      app = 'switch'
      if (cadena.search('power') !== -1) {
        var power
        if (cadena.search('on')) {
          power = 1
        } else if (cadena.search('off')) {
          power = 0
        }
        var arg = [method, app, {power: power}]
      }
    }
  }

  return arg
}

function action (args) {
  switch (args[0]) {
    case 'set':
      netbeast(args[1]).set(args[2])
      .then(function (data) {
        console.log(data.body)
      })
      break
    default:
  }
}
