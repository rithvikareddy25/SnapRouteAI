"""SnapRouteAI backend (FastAPI).

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
from __future__ import annotations

import io
import math
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

from data import CITIES, INTERESTS, PLACES

try:  # photo analysis is optional
    from PIL import Image, ImageStat
except ImportError:  # pragma: no cover
    Image = None

app = FastAPI(title="SnapRouteAI API", version="0.1.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

PLACE_BY_ID = {p["id"]: p for p in PLACES}
MAX_STOPS = 6
MAX_UPLOAD_BYTES = 8 * 1024 * 1024

# --- travel model (rough, tweak freely) -------------------------------------
SPEED_KMH = {"Transit": 18.0, "Own vehicle": 24.0, "Walking": 4.5}
ROAD_FACTOR = 1.3  # straight-line -> road distance


def travel_cost(mode: str, km: float) -> int:
    if mode == "Walking":
        return 0
    if mode == "Transit":
        return 0 if km < 0.3 else max(10, round(2.0 * km))
    return round(6.0 * km)  # own vehicle: fuel estimate


# --- schemas -----------------------------------------------------------------
class PlanRequest(BaseModel):
    destination: str = "Hyderabad"
    must_visit: list[str] = Field(default_factory=list)
    hours: int = Field(6, ge=1, le=14)
    budget: int = Field(500, ge=0, le=1_000_000)
    mode: Literal["Transit", "Own vehicle", "Walking"] = "Transit"
    interests: list[str] = Field(default_factory=list)
    start_hour: float = Field(7.0, ge=0, lt=24)
    extra_place_ids: list[str] = Field(default_factory=list)  # spots user chose to add

    @field_validator("must_visit", mode="before")
    @classmethod
    def split_must_visit(cls, v):
        if isinstance(v, str):  # frontend sends "Charminar, Hussain Sagar"
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    @field_validator("interests")
    @classmethod
    def max_three(cls, v):
        cleaned = [i.strip().lower() for i in v if i.strip()]
        return cleaned[:3]


# --- helpers -----------------------------------------------------------------
def haversine_km(a: dict, b: dict) -> float:
    r = 6371.0
    p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dphi = p2 - p1
    dl = math.radians(b["lng"] - a["lng"])
    h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def leg(a: dict, b: dict, mode: str) -> tuple[float, int, int]:
    km = haversine_km(a, b) * ROAD_FACTOR
    minutes = round(km / SPEED_KMH[mode] * 60)
    return km, minutes, travel_cost(mode, km)


def fmt_clock(hour_float: float) -> str:
    total = int(round(hour_float * 60)) % (24 * 60)
    h, m = divmod(total, 60)
    suffix = "AM" if h < 12 else "PM"
    return f"{(h % 12) or 12}:{m:02d} {suffix}"


def order_stops(stops: list[dict], mode: str) -> list[dict]:
    """Start at the place with the earliest best-light hour, then nearest neighbour."""
    if len(stops) <= 2:
        return sorted(stops, key=lambda p: p["best_hour"])
    remaining = stops[:]
    cur = min(remaining, key=lambda p: p["best_hour"])
    remaining.remove(cur)
    route = [cur]
    while remaining:
        nxt = min(remaining, key=lambda p: haversine_km(cur, p))
        remaining.remove(nxt)
        route.append(nxt)
        cur = nxt
    return route


def totals(route: list[dict], mode: str) -> tuple[int, int]:
    minutes = sum(p["visit_min"] for p in route)
    spend = sum(p["cost"] for p in route)
    for a, b in zip(route, route[1:]):
        _, m, c = leg(a, b, mode)
        minutes += m
        spend += c
    return minutes, spend


def match_place(query: str, pool: list[dict]) -> dict | None:
    q = query.strip().lower()
    for p in pool:
        names = [p["name"].lower(), *p["aliases"]]
        if any(q == n or q in n or n in q for n in names):
            return p
    return None


def interest_score(p: dict, interests: list[str]) -> float:
    overlap = len(set(p["tags"]) & set(interests))
    # slight bias to less crowded places so the day feels calmer
    return overlap * 3 + (1 - p["popularity"]) * 0.5


def crowd_estimate(p: dict, arrive_hour: float) -> str:
    """Heuristic only: popularity adjusted by distance from the best hour."""
    score = p["popularity"] - 0.08 * abs(arrive_hour - p["best_hour"])
    if arrive_hour < 8:
        score -= 0.2
    return "Low" if score < 0.4 else "Moderate" if score < 0.7 else "High"


def map_points(route: list[dict]) -> list[dict]:
    """Normalised 0-1 coords (x right, y down) so the UI can place pins on its map card."""
    lats = [p["lat"] for p in route]
    lngs = [p["lng"] for p in route]
    lat_span = (max(lats) - min(lats)) or 1e-6
    lng_span = (max(lngs) - min(lngs)) or 1e-6
    pad = 0.1
    return [
        {
            "order": i + 1,
            "x": round(pad + (1 - 2 * pad) * (p["lng"] - min(lngs)) / lng_span, 3),
            "y": round(pad + (1 - 2 * pad) * (max(lats) - p["lat"]) / lat_span, 3),
        }
        for i, p in enumerate(route)
    ]


# --- planner -----------------------------------------------------------------
def build_plan(req: PlanRequest) -> dict:
    city_key = req.destination.strip().lower()
    if city_key not in CITIES:
        raise HTTPException(
            404,
            f"'{req.destination}' isn't supported yet. Available: "
            f"{', '.join(c['name'] for c in CITIES.values())}",
        )
    pool = [p for p in PLACES if p["city"] == city_key]
    limit_min = req.hours * 60
    warnings: list[str] = []

    chosen: list[dict] = []
    for name in req.must_visit:
        p = match_place(name, pool)
        if p is None:
            warnings.append(f"Couldn't find '{name}'; skipped.")
        elif p not in chosen:
            chosen.append(p)
    for pid in req.extra_place_ids:
        p = PLACE_BY_ID.get(pid)
        if p and p not in chosen:
            chosen.append(p)

    route = order_stops(chosen, req.mode)
    minutes, spend = totals(route, req.mode) if route else (0, 0)
    if minutes > limit_min:
        warnings.append("Your must-visit places need more time than you've set.")
    if spend > req.budget:
        warnings.append("Your must-visit places exceed your budget.")

    # greedily add the best-scoring places that still fit time and budget
    candidates = sorted(
        (p for p in pool if p not in chosen),
        key=lambda p: interest_score(p, req.interests),
        reverse=True,
    )
    for cand in candidates:
        if len(route) >= MAX_STOPS:
            break
        if req.interests and not (set(cand["tags"]) & set(req.interests)):
            continue
        trial = order_stops(route + [cand], req.mode)
        t_min, t_spend = totals(trial, req.mode)
        if t_min <= limit_min and t_spend <= req.budget:
            route, minutes, spend = trial, t_min, t_spend

    if not route:
        raise HTTPException(422, "No places fit those constraints. Try more time or budget.")

    # build timed itinerary
    clock = req.start_hour
    stops = []
    for i, p in enumerate(route):
        km = mins = c = 0
        if i:
            km, mins, c = leg(route[i - 1], p, req.mode)
            clock += mins / 60
        arrive = clock
        clock += p["visit_min"] / 60
        stops.append({
            "order": i + 1,
            "id": p["id"],
            "name": p["name"],
            "lat": p["lat"],
            "lng": p["lng"],
            "tags": p["tags"],
            "arrive": fmt_clock(arrive),
            "depart": fmt_clock(clock),
            "visit_minutes": p["visit_min"],
            "travel_minutes_from_previous": mins,
            "travel_km_from_previous": round(km, 1),
            "est_cost": p["cost"] + c,
            "best_light": fmt_clock(p["best_hour"]),
            "crowd_estimate": crowd_estimate(p, arrive),
            "note": p["note"],
        })

    return {
        "title": f"A {CITIES[city_key]['name']} day out",
        "stats": {
            "time_hours": round(minutes / 60, 1),
            "est_spend": spend,
            "stops": len(stops),
            "mode": req.mode,
            "budget": req.budget,
        },
        "itinerary": stops,
        "map_points": map_points(route),
        "warnings": warnings,
        "disclaimer": "Costs, times and crowd levels are estimates.",
    }


# --- photo discovery ---------------------------------------------------------
def analyse_photo(raw: bytes) -> dict:
    """Cheap colour-based mood tags. Runs in memory; nothing is saved.
    Replace with a CLIP/vision model for real visual similarity."""
    if Image is None:
        raise HTTPException(501, "Install Pillow to enable photo analysis.")
    try:
        img = Image.open(io.BytesIO(raw))
        img.verify()
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(400, "That file isn't a readable image.")
    img.thumbnail((96, 96))
    r, g, b = ImageStat.Stat(img).mean
    hsv = ImageStat.Stat(img.convert("HSV")).mean
    brightness = (r + g + b) / 3
    saturation = hsv[1]

    moods: list[str] = []
    if r - b > 25 and brightness > 100:
        moods.append("golden hour")
    if b >= r and b >= g * 0.9:
        moods += ["water", "scenic"]
    if g > r and g > b:
        moods += ["scenic", "quiet"]
    if saturation < 60:
        moods += ["architecture", "quiet"]
    if saturation > 120:
        moods.append("colorful")
    if not moods:
        moods.append("scenic")
    return {
        "moods": list(dict.fromkeys(moods)),
        "avg_rgb": [round(r), round(g), round(b)],
        "brightness": round(brightness),
    }


@app.post("/api/photo/suggestions")
async def photo_suggestions(
    photo: UploadFile = File(...),
    destination: str = Form("Hyderabad"),
    origin_id: str | None = Form(None),
    exclude_ids: str = Form(""),  # comma-separated ids already in the itinerary
    limit: int = Form(2),
):
    if not (photo.content_type or "").startswith("image/"):
        raise HTTPException(400, "Please upload an image (JPG, PNG or WEBP).")
    raw = await photo.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image is too large (max 8 MB).")

    city_key = destination.strip().lower()
    if city_key not in CITIES:
        raise HTTPException(404, "Unsupported destination.")
    analysis = analyse_photo(raw)
    moods = set(analysis["moods"])
    excluded = {s.strip() for s in exclude_ids.split(",") if s.strip()}
    origin = PLACE_BY_ID.get(origin_id or "") or {
        "lat": CITIES[city_key]["center"][0], "lng": CITIES[city_key]["center"][1]
    }

    scored = []
    for p in PLACES:
        if p["city"] != city_key or p["id"] in excluded:
            continue
        overlap = moods & set(p["moods"])
        if overlap:
            scored.append((len(overlap), p, overlap))
    scored.sort(key=lambda t: (-t[0], t[1]["popularity"]))

    out = []
    for _, p, overlap in scored[: max(1, min(limit, 6))]:
        _, mins, _ = leg(origin, p, "Transit")
        label = "GOLDEN HOUR" if "golden hour" in overlap else sorted(overlap)[0].upper()
        out.append({
            "id": p["id"], "name": p["name"], "label": label,
            "blurb": p["note"], "minutes_away": mins,
            "lat": p["lat"], "lng": p["lng"],
        })
    # nothing is persisted and suggestions never alter a plan by themselves
    return {"detected_moods": analysis["moods"], "suggestions": out}


# --- other endpoints ---------------------------------------------------------
@app.post("/api/plan")
def plan(req: PlanRequest):
    return build_plan(req)


@app.get("/api/places")
def places(city: str = "hyderabad"):
    return [p for p in PLACES if p["city"] == city.lower()]


@app.get("/api/config")
def config():
    return {
        "cities": [c["name"] for c in CITIES.values()],
        "interests": INTERESTS,
        "modes": list(SPEED_KMH),
    }


@app.get("/api/health")
def health():
    return {"ok": True, "photo_analysis": Image is not None}


# Serve the frontend (index.html, styles.css, app.js) from ./frontend if present.
FRONTEND = Path(__file__).parent / "frontend"
if FRONTEND.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")
