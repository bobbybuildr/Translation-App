const chatWindow = document.getElementById('chat-window')
const inputText = document.getElementById('text-box')
const submitBtn = document.getElementById('submit-btn')

submitBtn.addEventListener('click', processTranslation)

async function processTranslation(e) {
  e.preventDefault()
  const textToTranslate = inputText.value
  
  if (textToTranslate && textToTranslate.length > 1) {
    appendText("user", textToTranslate)
    inputText.value = ""
    const loading = setLoading()
    const language = document.querySelector('input[type="radio"]:checked').value

    try {
      const response = await fetch('/api/translate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language,
          textToTranslate
        })
      })
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = await response.json()

      appendText("assistant", data.translatedText, language)
    } catch(err) {
      console.error(err)
      appendText("assistant", "Unable to process the translation at this time, please try again.")
    } finally {
        clearInterval(loading.interval)
        loading.el.remove()
    }
  }
}

function appendText(author, text, language) {
  const newEl = document.createElement('div')
  newEl.textContent = text
  if (author === "user") {
    newEl.classList.add('user-chat')
  }
  if (author === "assistant") {
    newEl.classList.add('assistant-chat')
    if (language) {
      const listenButton = document.createElement('button')
      listenButton.textContent = '🔉'
      listenButton.addEventListener('click', () => {
        speakText(text, language)
      })
      newEl.append(listenButton)
    }
  }
  chatWindow.append(newEl)
  chatWindow.scrollTop = chatWindow.scrollHeight
}

function setLoading() {
  const newEl = document.createElement('div')
  newEl.classList.add('assistant-chat')
  newEl.classList.add('italic')
  newEl.classList.add('hide-element')
  setTimeout(() => newEl.classList.remove('hide-element'), 500)
  newEl.textContent = "translating"
  chatWindow.append(newEl)
  chatWindow.scrollTop = chatWindow.scrollHeight

  const states = ["translating", "translating.", "translating..", "translating..."]
  let i = 0
  const interval = setInterval(() => {
    i = (i + 1) % states.length
    newEl.textContent = states[i]
  }, 400)

  return { el: newEl, interval }
}

function speakText(text, lang) {
  let language = 'en'
  if (lang === 'french') { language = 'fr'}
  if (lang === 'spanish') { language = 'es'}
  if (lang === 'japanese') { language = 'ja'}
  const utterThis = new SpeechSynthesisUtterance(text)
  utterThis.lang = language
  window.speechSynthesis.speak(utterThis)
}