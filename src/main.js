import './style.css'

const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`

document.querySelector('#app').innerHTML = `
  <div class="apod-container">
    <header>
      <h1>Adamite 🌌</h1>
      <p class="subtitle">NASA Astronomy Picture of the Day</p>
    </header>
    <main id="apod-content">
      <p class="loading">Načítám dnešní snímek z vesmíru...</p>
    </main>
  </div>
`

async function fetchAPOD() {
  const contentDiv = document.querySelector('#apod-content')
  try {
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = errorData.error?.message || errorData.msg || `Chyba HTTP ${response.status}`
      throw new Error(msg)
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
    contentDiv.innerHTML = `
      <div class="error-card">
        <h3>Nepodařilo se načíst data z NASA</h3>
        <p class="error-msg">${error.message}</p>
        <p class="hint">Pokud používáš <code>DEMO_KEY</code>, vygeneruj si vlastní zdarma klíč na <a href="https://api.nasa.gov/" target="_blank">api.nasa.gov</a> a vlož ho do souboru <code>.env</code>.</p>
      </div>
    `
  }
}

fetchAPOD()