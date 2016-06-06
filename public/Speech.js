// search if some SpeechRecognition accept the plataform
var netbeast = require('netbeast')
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
  var log = document.getElementById('log')
  var aux = 1
  var hidden = 0
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
        choose(auxi)
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

  document.getElementById('taketext').addEventListener('click', function () {
    if (hidden === 1) {
      text += document.getElementById('form').value + '<br>'
      transcription.innerHTML = text
      choose(document.getElementById('form').value)
        document.getElementById('form').style.visibility = 'hidden'
      hidden = 0
    } else {
      document.getElementById('form').style.visibility = 'visible'
      hidden = 1
    }
  })
}

function choose (auxi) {
  if (controller === 0) {
    args = analyze(auxi)
    if (args[0] !== 'empty') {
      if (typeof args[2] === 'number') {
        controller = 1
        text += '     R.- What percent do you want to change it?<br>'
        transcription.innerHTML = text
      } else if (args[3] === 1) {
        text += '     R.- Setting ' + args[1] + ' to the following property:  ' + args[4] + '<br>'
        transcription.innerHTML = text
        controller = 0
        action(args)
      } else if (args[0] === 'get') {
        controller = 0
        action(args)
      } else {
        text += '     R.- I dont understand what you mean.<br>'
        transcription.innerHTML = text
      }
    } else {
      text += 'R.- I dont understand what you mean.<br>'
      transcription.innerHTML = text
    }
  } else {
  // transformar numero en entero, decir que porcentaje quieres cambiarlo.
    percent = parseInt(auxi)
    switch (args[2]) {
      case 0:
        args = [args[0], args[1], {hue: percent}, 'hue to ' + percent + ' %']
        break
      case 1:
        args = [args[0], args[1], {saturation: percent}, 'saturation to ' + percent + ' %']
        break
      case 2:
        args = [args[0], args[1], {brightness: percent}, 'brightness to ' + percent + ' %']
        break
      case 3:
        args = [args[0], args[1], {volume: percent}, 'volume to ' + percent + ' %']
        break
    }
    if (isNaN(percent) === false) {
      text += '     R.- Setting ' + args[1] + ' to the following property:  ' + args[3] + '<br>'
      transcription.innerHTML = text
      action(args)
      controller = 0
    } else {
      text += '     R.- You must tell me a number <br>'
      transcription.innerHTML = text
      controller = 0
    }
  }
}

function analyze (cadena) {
  var app
  var method
  var number = -1
  var action = 0
  var arg
  var property
  if (cadena.search('light') !== -1) {
    app = 'lights'
    if (cadena.search('change') !== -1) {
      if (cadena.search('color') !== -1) {
        var color
        if (cadena.search('blue') !== -1) {
          color = '#0000B3'
          property = 'color blue'
          action = 1
        } else if (cadena.search('yellow') !== -1) {
          color = '#FFFF00'
          property = 'color yellow'
          action = 1
        } else if (cadena.search('pink') !== -1) {
          color = '#F00080'
          property = 'color pink'
          action = 1
        } else if (cadena.search('green') !== -1) {
          color = '#37FF00'
          property = 'color green'
          action = 1
        } else if (cadena.search('white') !== -1) {
          color = '#FFFFFF'
          property = 'color white'
          action = 1
        }
        arg = ['set', app, {color: color}, action, property]
      } else {
        if (cadena.search('hue') !== -1) {
          number = 0
        } else if (cadena.search('saturation') !== -1) {
          number = 1
        } else if (cadena.search('brightness') !== -1) {
          number = 2
        }
        arg = ['set', app, number]
      }
    } else if (cadena.search('turn') !== -1) {
      var power
      if (cadena.search('on')  !== -1) {
        power = 1
        property = 'power on'
        action = 1
      } else if (cadena.search('off') !== -1) {
        power = 0
        property = 'power off'
        action = 1
      }
      arg = ['set', app, {power: power}, action, property]
    } else if (cadena.search('information') !== -1) {
      arg = ['get', app]
    }
  } else if ((cadena.search('switch') !== -1) || (cadena.search('bridge') !== -1)) {
    app = (cadena.search('switch') !== -1) ? 'switch' : 'bridge'
    if (cadena.search('turn') !== -1) {
      if (cadena.search('on')) {
        power = 1
        property = 'power on'
        action = 1
      } else if (cadena.search('off')) {
        power = 0
        property = 'power off'
        action = 1
      }
      arg = ['set', app, {power: power}, action, property]
    }else if (cadena.search('information') !== -1) {
      arg = ['get', app]
    }
  } else if ((cadena.search('music') !== -1) || (cadena.search('video') !== -1)) {
    app = (cadena.search('music') !== -1) ? 'music' : 'video'
    if (cadena.search('volume') !== -1) {
      number = 3
      arg = ['set', app, number]
    } else if (cadena.search('status') !== -1) {
      var value
      if (cadena.search('play') !== -1) {
        value = 'play'
        property = 'status play'
        action = 1
      } else if (cadena.search('pause') !== -1) {
        value = 'pause'
        property = 'status pause'
        action = 1
      } else if (cadena.search('stop') !== -1) {
        value = 'stop'
        property = 'status stop'
        action = 1
      } else if (cadena.search('info') !== -1) {
        value = 'info'
        property = 'status info'
        action = 1
      }
      arg = ['set', app, {status: value}, action, property]
    } else if (cadena.search('information') !== -1) {
      arg = ['get', app]
    }
  } else {
    arg = ['empty']
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
        switch (data[0].topic) {
          case 'lights':
            text += '     R.- Light information: <br>'
            text += '     R.-   Power:' + data[0].result.power + '<br>'
            text += '     R.-   Hue:' + data[0].result.hue + '<br>'
            text += '     R.-   Saturation:' + data[0].result.saturation + '<br>'
            text += '     R.-   Brightness:' + data[0].result.brightness + '<br>'
            break
          case 'switch':
            text += '     R.- Switch information: <br>'
            text += '     R.-   Power:' + data[0].power + '<br>'

            break
          case 'bridge':
            text += '     R.- Bridge information: <br>'
            text += '     R.-   Power:' + data[0].power + '<br>'

            break
          case 'music':
            text += '     R.- Music information: <br>'
            text += '     R.-   Volume:' + data[0].volume + '<br>'
            text += '     R.-   Status:' + data[0].status + '<br>'

            break
          case 'video':
            text += '     R.- Video information: <br>'
            text += '     R.-   Volume:' + data[0].volume + '<br>'
            text += '     R.-   Status:' + data[0].status + '<br>'

            break
          default:
            transcription.innerHTML = text

        }
      })
      break

    default:
  }
}
