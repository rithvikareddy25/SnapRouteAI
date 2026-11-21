# SnapRouteAI

A photography-first travel frontend based on the SnapRouteAI hackathon deck. It uses plain HTML, CSS, and JavaScript.

## Run in VS Code

1. Extract the ZIP and open the SnapRouteAI folder in VS Code.
2. Open a terminal in VS Code and run `python -m http.server 5500`. On Windows, you can use `py -m http.server 5500`.
3. Open http://localhost:5500 in a browser.

## Demo walkthrough

- Open **Trip Planner** and select Hyderabad, Charminar, 07:00, six hours, and a ₹500 budget. Build the itinerary and save it.
- Find the saved itinerary on **Home** or **My Profile**. Profile settings and trips persist in the same browser.
- Open **Explore Places**, select a category, and click **Plan a visit** on a place card.
- Open **Translator**, select English and Telugu, and click a travel phrase. Built-in phrases work offline. Custom text is sent to the MyMemory translation service and depends on its availability.
- In **Photo Locator**, try the sample image or upload an original GPS-tagged JPEG. Embedded GPS provides a map location. For photos without readable GPS, the app compares colors and composition with four curated Hyderabad sample images and offers suggestions. Images are processed locally and never modify the itinerary.

The destination catalog covers sample locations in Hyderabad, Jaipur, and Delhi. Travel times, fares, and visit hours are illustrative estimates. The bundled landmark visuals are generated travel illustrations.

## Short demo script

“I built SnapRouteAI as a photo-first trip planner. The sidebar lets me switch between planning, exploring places, translating travel phrases, and finding photo locations. I’ll pick Charminar, choose a start time and budget, and save the itinerary to my profile. Then I’ll try the photo locator, which reads coordinates when the photo has GPS information and otherwise suggests similar places.”
