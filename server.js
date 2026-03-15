import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const PORT = process.env.port || 3001

const server = express()
server.use(cors())
server.use(express.json())
server.use(express.static('dist'))

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

server.post('/api/translate', async (req, res) => {

  const { language, textToTranslate } = req.body

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

  const translatedText = response.output_text

  res.json({ translatedText })
})

server.use((req, res) => {
  res.sendFile(new URL('./dist/index.html', import.meta.url).pathname)
})

server.listen(PORT, () => console.log(`Server running. Listening on port ${PORT}`))