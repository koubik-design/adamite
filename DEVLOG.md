# Development log

## NASA image browser update

### What was added

- Connected the site to the NASA Astronomy Picture of the Day API.
- Added a full-page image or video area for the APOD result.
- Added loading and error states.
- Added date selection for older APOD images.
- Added a search field that searches the NASA image library.
- Added a browser-style top bar with tabs, an address field, navigation buttons, and a profile area.
- Added a focus view button for hiding the browser controls.
- Added a save button that stores the current APOD in the browser.
- Added an extension panel called Orbital extension repo.
- Added install and remove buttons for local extensions. Their installed state is saved in the browser.
- Added responsive styles for phones and desktop screens.

### Documentation

- Added a project README with setup steps, commands, and API links.
- Added this development log.

### Notes

- Add a personal NASA API key to `.env` for normal use.
- The default `DEMO_KEY` can be rate limited by NASA.
