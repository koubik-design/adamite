import './style.css'

const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const apodEndpoint = 'https://api.nasa.gov/planetary/apod'
const imageSearchEndpoint = 'https://images-api.nasa.gov/search'

const extensions = [
  { id: 'starglow', name: 'Starglow', description: 'Adds a soft star glow to the browser.' },
  { id: 'focus', name: 'Focus lens', description: 'Provides a clean view for images.' },
  { id: 'bookmark', name: 'Orbit bookmarks', description: 'Lets you save a discovery locally.' },
]

const installed = new Set(JSON.parse(localStorage.getItem('adamite-extensions') || '[]'))
let currentApod = null
let currentDate = ''
let currentView = 'apod'

const symbols = {
  back: 'Back',
  refresh: 'Reload',
  search: 'Search',
  close: 'Close',
  external: 'Open',
  calendar: 'Date',
  home: 'Today',
}

document.querySelector('#app').innerHTML = `
  <main class="browser ${installed.has('starglow') ? 'has-starglow' : ''}" id="browser">
    <header class="browser-chrome">
      <div class="tab-strip">
        <div class="window-controls" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="active-tab"><span class="tab-orb">A</span><span>New discovery</span><button class="tab-close" aria-label="Close tab">x</button></div>
        <button class="new-tab" title="New tab" aria-label="New tab">+</button>
        <div class="chrome-spacer"></div>
        <button class="chrome-menu" aria-label="Browser menu">Menu</button>
      </div>
      <div class="tool-strip">
        <div class="nav-actions">
          <button class="icon-button text-icon" id="back-button" title="Previous APOD" aria-label="Previous APOD">${symbols.back}</button>
          <button class="icon-button text-icon" id="reload-button" title="Reload" aria-label="Reload">${symbols.refresh}</button>
        </div>
        <form class="address-bar" id="search-form">
          <span class="address-lock">NASA</span>
          <input id="address-input" autocomplete="off" aria-label="Search NASA or enter an APOD date" placeholder="Search NASA or enter an APOD date" />
          <button type="submit" class="address-submit" aria-label="Search">${symbols.search}</button>
        </form>
        <button class="extensions-button" id="extensions-button" aria-expanded="false" aria-controls="extensions-popover">
          Extensions <b id="extension-count">${installed.size || ''}</b>
        </button>
        <div class="profile">A</div>
      </div>
    </header>

    <section class="stage" id="stage" aria-live="polite">
      <div class="star-field" aria-hidden="true"></div>
      <div class="media-layer" id="media-layer"><div class="loader"><span></span><p>Finding today's view of the universe</p></div></div>
      <div class="gradient-wash" aria-hidden="true"></div>

      <div class="stage-header">
        <div class="source-badge"><span class="live-dot"></span><span id="source-label">NASA ASTRONOMY PICTURE OF THE DAY</span></div>
        <div class="stage-actions">
          <button class="round-action text-icon" id="focus-button" title="Toggle focus mode" aria-label="Toggle focus mode">View</button>
          <button class="round-action text-icon" id="favorite-button" title="Save this discovery" aria-label="Save this discovery">Save</button>
        </div>
      </div>

      <article class="apod-details" id="apod-details">
        <p class="eyebrow"><span id="apod-date">LOADING</span><span class="eyebrow-dot">/</span><span id="apod-credit">NASA OPEN DATA</span></p>
        <h1 id="apod-title">A window into the cosmos</h1>
        <p class="description" id="apod-description">Connecting to NASA's Astronomy Picture of the Day archive.</p>
        <div class="detail-actions">
          <button class="text-button" id="read-button">Read story</button>
          <a class="text-button" id="source-link" href="https://apod.nasa.gov" target="_blank" rel="noreferrer">View source</a>
        </div>
      </article>

      <div class="bottom-dock">
        <button class="dock-home" id="today-button">${symbols.home}</button>
        <div class="dock-divider"></div>
        <label class="date-picker"><span>${symbols.calendar}</span><input id="date-input" type="date" aria-label="Choose an APOD date" max="${new Date().toISOString().slice(0, 10)}" /></label>
        <button class="dock-discover" id="discover-button">Explore archive</button>
      </div>
    </section>

    <aside class="extensions-popover" id="extensions-popover" hidden>
      <div class="popover-heading"><div><p class="tiny-label">CURATED FOR ADAMITE</p><h2>Orbital extension repo</h2></div><button class="popover-close" id="popover-close" aria-label="Close extensions">x</button></div>
      <p class="repo-copy">Small tools made for space exploration.</p>
      <div class="extension-list" id="extension-list"></div>
      <a class="repo-link" href="https://github.com/nasa" target="_blank" rel="noreferrer">Browse the NASA GitHub page</a>
    </aside>

    <dialog class="story-dialog" id="story-dialog"><button class="dialog-close" id="dialog-close" aria-label="Close story">x</button><p class="tiny-label">THE FULL STORY</p><h2 id="dialog-title"></h2><p id="dialog-description"></p></dialog>
  </main>
`

const $ = (selector) => document.querySelector(selector)
const mediaLayer = $('#media-layer')

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function setLoading(label = 'Finding a new view of the universe') {
  currentView = 'loading'
  mediaLayer.innerHTML = `<div class="loader"><span></span><p>${escapeHtml(label)}</p></div>`
  $('#apod-date').textContent = 'CONNECTING TO NASA'
  $('#apod-title').textContent = 'Opening a new window'
  $('#apod-description').textContent = 'Please wait while the image loads.'
}

function renderApod(data) {
  currentView = 'apod'
  currentApod = data
  currentDate = data.date
  $('#date-input').value = data.date
  $('#address-input').value = `apod.nasa.gov ${data.date}`
  $('#source-label').textContent = 'NASA ASTRONOMY PICTURE OF THE DAY'
  $('#apod-date').textContent = formatDate(data.date).toUpperCase()
  $('#apod-credit').textContent = data.copyright ? `COPYRIGHT ${data.copyright}` : 'NASA OPEN DATA'
  $('#apod-title').textContent = data.title
  $('#apod-description').textContent = data.explanation
  $('#dialog-title').textContent = data.title
  $('#dialog-description').textContent = data.explanation
  $('#source-link').href = data.hdurl || data.url || 'https://apod.nasa.gov'
  $('#source-link').textContent = data.hdurl ? 'Open HD image' : 'Open source'

  if (data.media_type === 'video') {
    mediaLayer.innerHTML = `<iframe class="space-video" src="${escapeHtml(data.url)}" title="${escapeHtml(data.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
  } else {
    const imageUrl = data.hdurl || data.url
    mediaLayer.innerHTML = `<img class="space-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.title)}" />`
  }
}

function renderError(message) {
  currentView = 'error'
  mediaLayer.innerHTML = `<div class="stage-error"><h2>The signal dropped</h2><p>${escapeHtml(message)}</p><button id="retry-button">Try again</button></div>`
  $('#apod-title').textContent = 'NASA is out of reach'
  $('#apod-description').textContent = 'Check your connection or reload to reconnect with the archive.'
}

async function loadApod(date = '') {
  setLoading(date ? `Opening the archive for ${date}` : 'Finding today\'s view of the universe')
  const params = new URLSearchParams({ api_key: apiKey })
  if (date) params.set('date', date)
  try {
    const response = await fetch(`${apodEndpoint}?${params}`)
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      throw new Error(detail.error?.message || `NASA returned ${response.status}`)
    }
    renderApod(await response.json())
  } catch (error) {
    renderError(error.message || 'Unable to load the picture of the day.')
  }
}

async function searchNasa(query) {
  setLoading(`Searching NASA's image archive for "${query}"`)
  try {
    const response = await fetch(`${imageSearchEndpoint}?q=${encodeURIComponent(query)}&media_type=image&page_size=12`)
    if (!response.ok) throw new Error(`NASA returned ${response.status}`)
    const results = (await response.json()).collection?.items || []
    currentView = 'search'
    $('#source-label').textContent = 'NASA IMAGE AND VIDEO LIBRARY'
    $('#apod-date').textContent = 'NASA IMAGE LIBRARY'
    $('#apod-credit').textContent = `${results.length} RESULTS`
    $('#apod-title').textContent = `Results for "${query}"`
    $('#apod-description').textContent = 'Select an image to bring it into your viewing window.'
    $('#source-link').href = `https://images.nasa.gov/search?q=${encodeURIComponent(query)}`
    $('#source-link').textContent = 'Open library'
    $('#address-input').value = query
    mediaLayer.innerHTML = results.length ? `<div class="search-results">${results.map((item) => {
      const data = item.data?.[0] || {}
      const thumb = item.links?.[0]?.href
      return `<button class="result-card" data-image="${escapeHtml(thumb || '')}" data-title="${escapeHtml(data.title || 'NASA image')}" data-description="${escapeHtml(data.description || '')}" data-date="${escapeHtml(data.date_created || '')}">${thumb ? `<img src="${escapeHtml(thumb)}" alt="" />` : '<span class="result-placeholder">NASA</span>'}<span>${escapeHtml(data.title || 'Untitled discovery')}</span></button>`
    }).join('')}</div>` : `<div class="stage-error"><h2>No images found</h2><p>Try a different subject, mission, or celestial object.</p></div>`
  } catch (error) {
    renderError(error.message || 'NASA image search is unavailable.')
  }
}

function openSearchImage(button) {
  const image = button.dataset.image
  if (!image) return
  currentView = 'library-image'
  const title = button.dataset.title || 'NASA image'
  const description = button.dataset.description || "From NASA's image and video library."
  $('#source-label').textContent = 'NASA IMAGE AND VIDEO LIBRARY'
  $('#apod-date').textContent = button.dataset.date ? new Date(button.dataset.date).getFullYear() : 'NASA ARCHIVE'
  $('#apod-credit').textContent = 'NASA OPEN DATA'
  $('#apod-title').textContent = title
  $('#apod-description').textContent = description
  $('#dialog-title').textContent = title
  $('#dialog-description').textContent = description
  $('#source-link').href = image
  $('#source-link').textContent = 'Open image'
  mediaLayer.innerHTML = `<img class="space-image" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" />`
}

function renderExtensions() {
  $('#extension-list').innerHTML = extensions.map((extension) => {
    const isInstalled = installed.has(extension.id)
    return `<article class="extension"><div class="extension-icon ${extension.id}">A</div><div><h3>${extension.name}</h3><p>${extension.description}</p></div><button class="extension-install ${isInstalled ? 'installed' : ''}" data-extension="${extension.id}">${isInstalled ? 'Installed' : 'Install'}</button></article>`
  }).join('')
  $('#extension-count').textContent = installed.size || ''
  $('#browser').classList.toggle('has-starglow', installed.has('starglow'))
}

function toggleExtension(id) {
  if (installed.has(id)) installed.delete(id)
  else installed.add(id)
  localStorage.setItem('adamite-extensions', JSON.stringify([...installed]))
  renderExtensions()
}

function searchFromInput() {
  const query = $('#address-input').value.trim()
  if (!query || query.startsWith('apod.nasa.gov')) return loadApod(currentDate)
  if (/^\d{4}-\d{2}-\d{2}$/.test(query)) return loadApod(query)
  return searchNasa(query.replace(/^https?:\/\//, ''))
}

$('#search-form').addEventListener('submit', (event) => { event.preventDefault(); searchFromInput() })
$('#reload-button').addEventListener('click', () => currentView === 'apod' ? loadApod(currentDate) : currentView === 'search' ? searchFromInput() : loadApod())
$('#back-button').addEventListener('click', () => { const date = new Date(`${currentDate || new Date().toISOString().slice(0, 10)}T12:00:00`); date.setDate(date.getDate() - 1); loadApod(date.toISOString().slice(0, 10)) })
$('#today-button').addEventListener('click', () => loadApod())
$('#discover-button').addEventListener('click', () => { $('#address-input').focus(); $('#address-input').select() })
$('#date-input').addEventListener('change', (event) => event.target.value && loadApod(event.target.value))
$('#focus-button').addEventListener('click', () => $('#browser').classList.toggle('focus-mode'))
$('#favorite-button').addEventListener('click', (event) => { event.currentTarget.classList.toggle('saved'); if (currentApod) localStorage.setItem('adamite-favorite', JSON.stringify(currentApod)) })
$('#read-button').addEventListener('click', () => $('#story-dialog').showModal())
$('#dialog-close').addEventListener('click', () => $('#story-dialog').close())
$('#extensions-button').addEventListener('click', () => { const popover = $('#extensions-popover'); popover.hidden = !popover.hidden; $('#extensions-button').setAttribute('aria-expanded', String(!popover.hidden)) })
$('#popover-close').addEventListener('click', () => { $('#extensions-popover').hidden = true; $('#extensions-button').setAttribute('aria-expanded', 'false') })

document.addEventListener('click', (event) => {
  const extensionButton = event.target.closest('[data-extension]')
  if (extensionButton) toggleExtension(extensionButton.dataset.extension)
  const imageButton = event.target.closest('.result-card')
  if (imageButton) openSearchImage(imageButton)
  if (event.target.closest('#retry-button')) loadApod(currentDate)
})

renderExtensions()
loadApod()
