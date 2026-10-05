import './style.css'

const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`

document.querySelector('#app').innerHTML = `
<div class="apod-container">
  <header>
    <h1>Adamite </h1>
    <p class="subtitle">Astronomy Picture of the Day</p>
  </header>
  <main id="apod-content">
   <p class="loading">Loading...</p>
  </main>
</div>
`

async function fetchAPOD() {
  const contentDiv = document.querySelector('#apod-content')
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    contentDiv.innerHTML = `
      <h2>${data.title}</h2>
      <p class="date">${data.date}</p>
      ${
        data.media_type === 'image' 
          ? `<img src="${data.url}" alt="${data.title}" class="apod-image" />`
          : `<iframe src="${data.url}" frameborder="0" allowfullscreen class="apod-video"></iframe>`
      }
      <p class="explanation">${data.explanation}</p>
    `
  } catch (error) {
    contentDiv.innerHTML = `<p class="error">Nepodařilo se načíst snímek: ${error.message}</p>`
  }
}

fetchAPOD()