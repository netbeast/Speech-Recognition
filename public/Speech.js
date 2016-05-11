require('dotenv').load() // carga variables de entorno
process.env.NETBEAST = 'localhost:8000'
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
    netbeast('lights').set({color: '#FF0080'})
    .then(function (data) {
      transcription.textContent = data
    })
    .catch(function (data) {
      transcription.textContent = data
    })
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
