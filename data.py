"""Seed data. Costs are rough per-person estimates in INR (verify before production).
Swap this for a database / Places API later; the planner only needs these fields."""

CITIES = {
    "hyderabad": {"name": "Hyderabad", "country": "India", "center": (17.3850, 78.4867)},
}

# interests the frontend chips map to
INTERESTS = ["heritage", "scenic views", "local food", "markets", "architecture"]

PLACES = [
    {
        "id": "charminar", "city": "hyderabad", "name": "Charminar",
        "aliases": ["char minar"], "lat": 17.3616, "lng": 78.4747,
        "tags": ["heritage", "architecture", "markets"], "moods": ["architecture", "crowded", "golden hour"],
        "visit_min": 60, "cost": 25, "best_hour": 7.0, "popularity": 0.95,
        "note": "Arrive early for soft light on the arches before the crowds build.",
    },
    {
        "id": "mecca-masjid", "city": "hyderabad", "name": "Mecca Masjid",
        "aliases": [], "lat": 17.3604, "lng": 78.4736,
        "tags": ["heritage", "architecture"], "moods": ["architecture", "quiet"],
        "visit_min": 30, "cost": 0, "best_hour": 8.0, "popularity": 0.6,
        "note": "Dress modestly; check prayer timings before visiting.",
    },
    {
        "id": "laad-bazaar", "city": "hyderabad", "name": "Laad Bazaar",
        "aliases": ["lad bazaar", "choodi bazaar"], "lat": 17.3612, "lng": 78.4733,
        "tags": ["markets", "local food"], "moods": ["colorful", "crowded"],
        "visit_min": 45, "cost": 150, "best_hour": 10.5, "popularity": 0.8,
        "note": "Famous for bangles; shops open mid-morning.",
    },
    {
        "id": "nimrah-cafe", "city": "hyderabad", "name": "Nimrah Cafe & Bakery",
        "aliases": ["nimrah"], "lat": 17.3610, "lng": 78.4743,
        "tags": ["local food"], "moods": ["colorful"],
        "visit_min": 30, "cost": 80, "best_hour": 8.0, "popularity": 0.7,
        "note": "Irani chai with Osmania biscuits, right by Charminar.",
    },
    {
        "id": "chowmahalla", "city": "hyderabad", "name": "Chowmahalla Palace",
        "aliases": ["chowmahalla"], "lat": 17.3578, "lng": 78.4717,
        "tags": ["heritage", "architecture"], "moods": ["architecture", "quiet", "golden hour"],
        "visit_min": 75, "cost": 80, "best_hour": 10.0, "popularity": 0.5,
        "note": "Courtyards and chandeliers; usually calmer than the old-city streets.",
    },
    {
        "id": "salar-jung", "city": "hyderabad", "name": "Salar Jung Museum",
        "aliases": ["salarjung"], "lat": 17.3713, "lng": 78.4804,
        "tags": ["heritage"], "moods": ["quiet", "architecture"],
        "visit_min": 90, "cost": 20, "best_hour": 11.0, "popularity": 0.55,
        "note": "Large collection; closed on Fridays.",
    },
    {
        "id": "tank-bund", "city": "hyderabad", "name": "Hussain Sagar & Tank Bund",
        "aliases": ["hussain sagar", "hussainsagar", "tank bund", "buddha statue"],
        "lat": 17.4239, "lng": 78.4738,
        "tags": ["scenic views"], "moods": ["water", "scenic", "golden hour"],
        "visit_min": 60, "cost": 0, "best_hour": 17.5, "popularity": 0.8,
        "note": "Best at sunset with the Buddha statue silhouetted on the lake.",
    },
    {
        "id": "birla-mandir", "city": "hyderabad", "name": "Birla Mandir",
        "aliases": ["birla temple"], "lat": 17.4062, "lng": 78.4691,
        "tags": ["scenic views", "architecture", "heritage"], "moods": ["architecture", "scenic", "quiet"],
        "visit_min": 45, "cost": 0, "best_hour": 16.5, "popularity": 0.6,
        "note": "White marble hilltop temple with a city view; no cameras inside the sanctum.",
    },
    {
        "id": "qutb-shahi-tombs", "city": "hyderabad", "name": "Qutb Shahi Tombs",
        "aliases": ["qutb shahi", "qutub shahi tombs"], "lat": 17.3945, "lng": 78.3953,
        "tags": ["heritage", "architecture", "scenic views"], "moods": ["architecture", "quiet", "golden hour"],
        "visit_min": 75, "cost": 20, "best_hour": 16.0, "popularity": 0.35,
        "note": "Quiet arches and domes; lovely in late-afternoon light.",
    },
    {
        "id": "golconda", "city": "hyderabad", "name": "Golconda Fort",
        "aliases": ["golkonda", "golconda"], "lat": 17.3833, "lng": 78.4011,
        "tags": ["heritage", "scenic views", "architecture"], "moods": ["architecture", "scenic", "golden hour"],
        "visit_min": 120, "cost": 25, "best_hour": 8.0, "popularity": 0.75,
        "note": "Climb to the Bala Hissar at the top for panoramic views.",
    },
    {
        "id": "durgam-cheruvu", "city": "hyderabad", "name": "Secret Lake Viewpoint",
        "aliases": ["secret lake", "durgam cheruvu", "durgamcheruvu"], "lat": 17.4361, "lng": 78.3919,
        "tags": ["scenic views"], "moods": ["water", "scenic", "golden hour", "quiet"],
        "visit_min": 45, "cost": 0, "best_hour": 17.0, "popularity": 0.45,
        "note": "Soft light over the lake with the cable bridge in view.",
    },
    {
        "id": "paradise-biryani", "city": "hyderabad", "name": "Paradise Biryani (Secunderabad)",
        "aliases": ["paradise"], "lat": 17.4417, "lng": 78.4863,
        "tags": ["local food"], "moods": ["colorful"],
        "visit_min": 60, "cost": 350, "best_hour": 13.0, "popularity": 0.9,
        "note": "Hyderabadi biryani classic; expect a queue at peak lunch.",
    },
]
