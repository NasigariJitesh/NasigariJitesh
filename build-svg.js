let fs = require('fs')
let got = require('got')
let qty = require('js-quantities')
let formatDistance = require('date-fns/formatDistance')

let WEATHER_DOMAIN = 'http://dataservice.accuweather.com'

const LAT = '17.3850'
const LON = '78.4867'
let url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,weathercode&timezone=auto`

const today = new Date()
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(today)

// Cheap, janky way to have variable bubble width
const dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
}

got(url)
  .then((response) => {
    let json = JSON.parse(response.body)

    const degC = Math.round(json.daily.temperature_2m_max[0])
    const weatherCode = json.daily.weathercode[0]

    // Map Open-Meteo WMO codes to emojis
    let iconEmoji = '🌤' // default
    if (weatherCode === 0) iconEmoji = '☀️'
    else if (weatherCode >= 1 && weatherCode <= 3) iconEmoji = '🌤'
    else if (weatherCode === 45 || weatherCode === 48) iconEmoji = '🌫'
    else if (weatherCode >= 51 && weatherCode <= 67) iconEmoji = '🌧'
    else if (weatherCode >= 71 && weatherCode <= 77) iconEmoji = '❄️'
    else if (weatherCode >= 80 && weatherCode <= 82) iconEmoji = '🌧'
    else if (weatherCode >= 85 && weatherCode <= 86) iconEmoji = '❄️'
    else if (weatherCode >= 95) iconEmoji = '⛈'

    // Static Bio Phrase (Simple & Robust)
    // Covers: Full Stack, AI/LLMs, Cloud/Infra
    // Note: XML requires & to be escaped as &amp;
    const bioLine1 = 'I’m a Full-Stack &amp; AI Engineer.'
    const bioLine2 = 'Building scalable apps &amp; agentic AI systems'
    const bioLine3 = 'using React, Node.js, Python, &amp; AWS.'

    fs.readFile('template.svg', 'utf-8', (error, data) => {
      if (error) {
        console.error(error)
        return
      }

      data = data.replace('{degC}', degC)
      data = data.replace('{weatherEmoji}', iconEmoji)
      data = data.replace('{todayDay}', todayDay)
      data = data.replace('{dayBubbleWidth}', dayBubbleWidths[todayDay])

      // Inject Bio
      data = data.replace('{bioLine1}', bioLine1)
      data = data.replace('{bioLine2}', bioLine2)
      data = data.replace('{bioLine3}', bioLine3)

      fs.writeFile('chat.svg', data, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
    })
  })
  .catch((error) => {
    console.error(error)
  })
