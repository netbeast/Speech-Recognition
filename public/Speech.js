// search if some SpeechRecognition accept the plataform
var netbeast = require('netbeast')
var fs = require('fs')
window.SpeechRecognition = window.SpeechRecognition ||
                         window.mozSpeechRecognition ||
                         window.webkitSpeechRecognition ||
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
  var contest = document.getElementById('contest')
  var log = document.getElementById('log')
  var aux = 1
  var controller = 0
  var percent
  var args
  var text = ''

  recognizer.continuous = true

// Start recognising
  recognizer.onresult = function (event) {
    transcription.textContent = ''
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        text += event.results[i][0].transcript + '<br>'
        transcription.innerHTML = text
        var auxi = event.results[i][0].transcript
        alert(controller)
        if (controller === 0) {
           args = analyze(auxi)
          if (args[2] >= 0) {
            controller = 1
            text += 'A cuanto quieres cambiar el porcentaje ?<br>'
            transcription.innerHTML = text
          } else {
            controller = 0
            action(args)
          }
        } else {
        // transformar numero en entero, decir que porcentaje quieres cambiarlo.
          percent = parseInt(auxi)
          alert(args)
          alert(percent)
          switch (args[2]) {
            case 0:
              args = [args[0], args[1], {hue: percent}]
              break
            case 1:
              args = [args[0], args[1], {brightness: percent}]
              break
            case 2:
              args = [args[0], args[1], {brightness: percent}]
              break
            case 3:
              args = [args[0], args[1], {volume: percent}]
              break
          }
          action(args)
          controller = 0
          contest.textContent = ''
        }
      } else {
        transcription.innerHTML = text
        transcription.innerHTML += event.results[i][0].transcript
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
        text = ''
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
  var number = -1
  var arg
  if (cadena.search('light') !== -1) {
    app = 'lights'
    if (cadena.search('change') !== -1) {
      if (cadena.search('color') !== -1) {
        var color
        if (cadena.search('blue') !== -1) {
          color = '#0000B3'
        } else if (cadena.search('yellow') !== -1) {
          color = '#FFFF00'
        } else if (cadena.search('pink') !== -1) {
          color = '#F00080'
        }
        arg = ['set', app, {color: color}]
      } else {
        if (cadena.search('hue') !== -1) {
          number = 0
        } else if (cadena.search('saturation') !== -1) {
          number = 1
        } else if (cadena.search('brightness') !== -1) {
          number = 2
        }
        alert('this is a number' + number)
        arg = ['set', app, number]
      }
    } else if (cadena.search('turn') !== -1) {
      var power
      if (cadena.search('on')) {
        power = 1
      } else if (cadena.search('off')) {
        power = 0
      }
      arg = ['set', app, {power: power}]
    } else if (cadena.search('information') !== -1) {
      arg = ['get', app]
    }
  } else if ((cadena.search('switch') !== -1) || (cadena.search('bridge') !== -1)) {
    app = (cadena.search('switch') !== -1) ? 'switch' : 'bridge'
    if (cadena.search('turn') !== -1) {
      if (cadena.search('on')) {
        power = 1
      } else if (cadena.search('off')) {
        power = 0
      }
      arg = ['set', app, {power: power}]
    }else if (cadena.search('information') !== -1) {
      arg = ['get', app]
    }
  } else if ((cadena.search('music') !== -1) || (cadena.search('video') !== -1)) {
    app = (cadena.search('music') !== -1) ? 'music' : 'video'
    if (cadena.search('volume') !== -1) {
      number = 3
      alert('this is a number' + number)
      arg = ['set', app, number]
    } else if (cadena.search('status') !== -1) {
      var value
      if (cadena.search('play') !== -1) {
        value = 'play'
      } else if (cadena.search('pause') !== -1) {
        value = 'pause'
      } else if (cadena.search('stop') !== -1) {
        value = 'stop'
      } else if (cadena.search('info') !== -1) {
        value = 'info'
      }
      arg = ['set', app, {status: value}]
    } else if (cadena.search('information') !== -1) {
      arg = ['get', app]
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
    case 'get':
      netbeast(args[1]).get()
      .then(function (data) {
        console.log(data.body)
      })
      break

    default:
  }
}
