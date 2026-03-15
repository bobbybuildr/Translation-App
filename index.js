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
    let loading
    setTimeout(() => loading = setLoading(), 500)
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
      if (!response) {
        throw new Error("No response from API request")
      }
      const data = await response.json()

      appendText("assistant", data.translatedText)
    } catch(err) {
      console.error(err)
      appendText("assistant", "Unable to process the translation at this time, please try again.")
    } finally {
      clearInterval(loading.interval)
      loading.el.remove()
    }
  }
}

function appendText(author, text) {
  const newEl = document.createElement('div')
  author === "user" ? newEl.classList.add('user-chat') : newEl.classList.add('assistant-chat')
  newEl.textContent = text
  chatWindow.append(newEl)
  chatWindow.scrollTop = chatWindow.scrollHeight
}

function setLoading() {
  const newEl = document.createElement('div')
  newEl.classList.add('assistant-chat')
  newEl.classList.add('italic')
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