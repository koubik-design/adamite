# Adamite

Adamite is a browser-style website for viewing NASA space images.

The main page loads NASA's Astronomy Picture of the Day as a full-page image. It also has a search field for NASA's image library and a small local extension area.

## Features

- Loads the current NASA Astronomy Picture of the Day
- Shows the image or video across the page
- Lets users select an APOD date
- Lets users search NASA's image library
- Includes a browser-style layout
- Includes a local extension list with install buttons
- Saves installed extensions and the last saved image in browser storage

## Setup

Install packages:

```bash
npm install
```

Create a `.env` file from `.env.example` and add a NASA API key:

```env
VITE_NASA_API_KEY=your_nasa_api_key_here
```

You can get a free key from [NASA API](https://api.nasa.gov/). The app uses `DEMO_KEY` if no key is provided, but that key has limits.

Start the project:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## APIs used

- [NASA APOD API](https://api.nasa.gov/)
- [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf)

## Project files

- `src/main.js` contains the app logic and API requests.
- `src/style.css` contains the responsive browser layout and styles.
- `.env.example` shows the required environment variable.
