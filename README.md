# KumbhMitra

A responsive walking companion for Nashik and Kumbh 2027. Built with plain HTML, CSS and JavaScript, using Leaflet and OpenStreetMap.

## Features

- Search a start and destination and request a walking route with distance and steps.
- Explore initial temples and ghats, and look up mapped essentials in the visible area.
- Save places with tags and landmark notes in browser localStorage.
- Share location links using the native share menu or clipboard.
- Set a home, stay or bus location and request a return walking route using browser geolocation.

## Run locally

No build or package installation is required:

```sh
python3 -m http.server 8080 --directory dist
```

Visit http://localhost:8080. Geolocation requires HTTPS or localhost and browser permission.

## Files

- `dist/index.html`: page structure
- `dist/style.css`: responsive styling
- `dist/app.js`: map, search, routing, saved places and sharing
- `.openai/hosting.json`: original Sites hosting configuration

## Services and limitations

Leaflet and fonts load from public CDNs. Map tiles come from OpenStreetMap, search uses Nominatim, walking routes use routing.openstreetmap.de, and essentials use Overpass. These public services need internet access and can impose rate limits or become unavailable. Configure suitable service providers before large-scale deployment.

Routes and initial landmark coordinates are estimates, not verified Kumbh access routes. There is no live crowd, closure, accessibility or opening-hours feed. Follow local signs and police instructions. Walking time assumes 4.5 km/h and does not account for crowds or rest stops.

Saved places remain in the current browser on the current device. They do not sync or provide offline map/navigation coverage. Sharing generates a URL containing the selected coordinates and name; saved notes are included in native share text when supported. The app does not track other people or vehicles.

## Validation

JavaScript syntax and HTML element references were checked. Place search and the walking route service returned successful responses. Full browser and mobile testing remains outstanding.
