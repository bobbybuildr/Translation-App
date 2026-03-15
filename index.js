import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

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

    try {
      const language = document.querySelector('input[type="radio"]:checked').value

      const aiInstructions = `You are a ${language} translator.
      You must simply take whatever text is provided and convert it into ${language}.
      The provided text could be as short as a two letter word. Convert whatever is provided into ${language}
      Skip any intos and conclusions. Do not ask any follow up questions.
      If you are unsure, or unable to translate the text provided, inform the user of this in English and explain why`

      const response = await client.responses.create({
        model: "gpt-5-mini",
        instructions: aiInstructions,
        input: textToTranslate
      })

      appendText("assistant", response.output_text)
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
  newEl.textContent = "Thinking"
  chatWindow.append(newEl)
  chatWindow.scrollTop = chatWindow.scrollHeight

  const states = ["Thinking", "Thinking.", "Thinking..", "Thinking..."]
  let i = 0
  const interval = setInterval(() => {
    i = (i + 1) % states.length
    newEl.textContent = states[i]
  }, 400)

  return { el: newEl, interval }
}