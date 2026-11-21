const $ = (selector) => document.querySelector(selector);
const icons = {
  camera:'<path d="M4 7h4l2-3h4l2 3h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/>',
  home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 21v-7h6v7"/>',
  route:'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h8"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
  language:'<path d="M3 5h12M9 3v2m3 0c0 5-4 9-9 11m2-8c1 3 3 5 6 7m2 6 4-10 4 10m-6.5-3h5"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 5-4 4 3 4-5 5 5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2"/>',
  spark:'<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10z"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>'
};
const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
document.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = icon(node.dataset.icon); });
const catalog = {
  Hyderabad: [
    ['Charminar','Heritage','Morning light for street and architecture shots.',55,'charminar',17.3616,78.4747,45,'07:00'],
    ['Hussain Sagar','Nature','Lake views, reflections, and wide-angle frames.',0,'lake',17.4239,78.4738,50,'08:00'],
    ['Golconda Fort','Heritage','Stone arches and hilltop views.',45,'fort',17.3833,78.4011,75,'09:00'],
    ['Laad Bazaar','Markets','Colorful lanes lined with bangles and textiles.',0,'bazaar',17.3615,78.4732,45,'11:00'],
    ['Salar Jung Museum','Museums','A collection of art and decorative objects.',50,'',17.3714,78.4804,75,'10:00']
  ],
  Jaipur: [
    ['Hawa Mahal','Heritage','Photograph the pink sandstone facade in morning light.',50,'',26.9239,75.8267,45,'09:00'],
    ['Jal Mahal','Nature','Take waterfront photos and look for reflections.',0,'',26.9535,75.8462,40,'17:00'],
    ['Johari Bazaar','Markets','Explore colorful storefronts and street scenes.',0,'',26.9188,75.8266,45,'11:00'],
    ['Albert Hall Museum','Museums','Look for architectural details and arched galleries.',40,'',26.9117,75.8195,65,'09:00']
  ],
  Delhi: [
    ['Humayun’s Tomb','Heritage','Frame the symmetry of the tomb and garden paths.',40,'',28.5933,77.2507,60,'08:00'],
    ['Lodhi Garden','Nature','Tree-lined paths and garden views.',0,'',28.5931,77.2197,45,'07:00'],
    ['Chandni Chowk','Markets','Photograph shopfronts and busy old-city lanes.',0,'',28.6560,77.2310,50,'11:00'],
    ['National Rail Museum','Museums','Explore historic trains and outdoor exhibits.',50,'',28.5856,77.1824,65,'10:00']
  ]
};
for (const city of Object.keys(catalog)) {
  catalog[city] = catalog[city].map(([name,category,tip,cost,photo,lat,lon,duration,start]) =>
    ({name,category,tip,cost,photo,lat,lon,duration,start,city}));
}
const categories = ['Any category','Heritage','Nature','Markets','Museums'];
let selectedCategory = categories[0];
const element = (tag, content, className) => {
  const node = document.createElement(tag);
  if (content !== undefined) node.textContent = content;
  if (className) node.className = className;
  return node;
};
function action(label, handler, style='secondary') {
  const button = element('button',label,'button '+style);
  button.type = 'button';
  button.addEventListener('click',handler);
  return button;
}
function link(label, href, className='text-link') {
  const anchor = element('a',label,className);
  anchor.href = href;
  return anchor;
}
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem('snaproute-'+key)) ?? fallback; }
  catch { return fallback; }
}
function persist(key, value) {
  try { localStorage.setItem('snaproute-'+key,JSON.stringify(value)); return true; }
  catch { return false; }
}
let profile = read('profile',{name:'',city:'Hyderabad',interest:'Any category'});
let trips = read('trips',[]);
const planForm = $('#plan-form');
const exploreCity = $('#explore-city');
let currentPlan;
function closeMenu() {
  $('.sidebar').classList.remove('open');
  $('#menu').setAttribute('aria-expanded','false');
}
$('#menu').addEventListener('click',() => {
  const open = $('.sidebar').classList.toggle('open');
  $('#menu').setAttribute('aria-expanded',String(open));
});
const routes = Object.fromEntries([...document.querySelectorAll('[data-nav]')].map(node => [node.dataset.nav,node.textContent.trim()]));
function route() {
  const page = location.hash.slice(1);
  const active = Object.hasOwn(routes,page) ? page : 'home';
  document.querySelectorAll('.page').forEach(node => { node.hidden = node.id !== active; });
  document.querySelectorAll('[data-nav]').forEach(node => {
    if (node.dataset.nav === active) node.setAttribute('aria-current','page');
    else node.removeAttribute('aria-current');
  });
  $('#crumb').textContent = routes[active];
  document.title = routes[active]+' | SnapRouteAI';
  closeMenu();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
function updateStops() {
  const stops = catalog[$('#city').value];
  $('#stop').replaceChildren(...stops.map(place => new Option(place.name,place.name)));
}
function setPlannerPlace(place) {
  $('#city').value = place.city;
  updateStops();
  $('#stop').value = place.name;
  $('#interest').value = place.category;
  location.hash = 'planner';
}
function placeCard(place) {
  const card = element('article',undefined,'card');
  const placeholder = element('div',undefined,'card-placeholder');
  placeholder.innerHTML = icon('pin');
  if (place.photo) {
    const image = element('img',undefined,'card-image');
    image.alt = place.name+' travel illustration';
    image.src = 'assets/'+place.photo+'.webp';
    image.addEventListener('error',() => image.replaceWith(placeholder),{once:true});
    card.append(image);
  } else card.append(placeholder);
  const copy = element('div',undefined,'card-copy');
  const pick = action('Plan a visit',() => setPlannerPlace(place));
  pick.className = 'text-link card-action';
  copy.append(element('span',place.category,'badge'),element('h3',place.name),element('p',place.tip),pick);
  card.append(copy);
  return card;
}
function renderExplore() {
  const places = catalog[exploreCity.value].filter(place => selectedCategory === categories[0] || place.category === selectedCategory);
  $('#places').replaceChildren(...places.map(placeCard));
  document.querySelectorAll('#categories button').forEach(button => button.setAttribute('aria-pressed',String(button.textContent === selectedCategory)));
}
for (const category of categories) {
  $('#categories').append(action(category,() => { selectedCategory = category; renderExplore(); }));
}
exploreCity.addEventListener('change',renderExplore);
$('#city').addEventListener('change',updateStops);
$('#featured').replaceChildren(...catalog.Hyderabad.slice(0,4).map(placeCard));

const toMinutes = (time) => {
  const [hours,minutes] = time.split(':').map(Number);
  return 60*hours+minutes;
};
const clock = (minutes) => [Math.floor(minutes/60),minutes%60].map(value => String(value).padStart(2,'0')).join(':');
function distance(a,b) {
  return 111 * Math.hypot(a.lat-b.lat,(a.lon-b.lon)*Math.cos((a.lat+b.lat)*Math.PI/360));
}
function createPlan(values) {
  const {city,stop,time,hours,budget,mode,interest} = values;
  const spots = catalog[city];
  const first = spots.find(place => place.name === stop);
  const speeds = {'Walking':4,'Public transit':14,'Own vehicle':20,'Cab':18};
  const travelCost = {'Walking':0,'Public transit':5,'Own vehicle':9,'Cab':19};
  let cursor = toMinutes(time);
  const end = Math.min(cursor+Number(hours)*60,24*60);
  let previous;
  let total = 0;
  const stops = [];
  const candidates = spots.filter(place => place !== first && (interest === categories[0] || place.category === interest));
  const append = (place) => {
    const kilometers = previous ? 1.25*distance(previous,place) : 0;
    const travel = Math.ceil(kilometers/speeds[mode]*60);
    const cost = place.cost + Math.ceil(kilometers*travelCost[mode]) + (mode === 'Cab' && previous ? 35 : 0);
    const arrival = Math.max(cursor+travel,toMinutes(place.start));
    const finish = arrival+place.duration;
    if (finish > end || finish > 21*60 || total+cost > Number(budget)) return false;
    stops.push({name:place.name,time:clock(arrival),travel,cost,tip:place.tip,lat:place.lat,lon:place.lon});
    cursor = finish;
    total += cost;
    previous = place;
    return true;
  };
  if (append(first)) {
    while (candidates.length && stops.length < 4) {
      const arrivalEstimate = (place) => Math.max(cursor + 75*distance(previous,place)/speeds[mode],toMinutes(place.start));
      candidates.sort((a,b) => arrivalEstimate(a)-arrivalEstimate(b));
      append(candidates.shift());
    }
  }
  return {...values,stops,total,id:globalThis.crypto?.randomUUID?.() ?? String(Date.now())};
}
function mapLink(lat,lon) {
  return 'https://www.openstreetmap.org/?mlat='+lat+'&mlon='+lon+'#map=16/'+lat+'/'+lon;
}
function renderPlan(plan) {
  const result = $('#plan-result');
  result.replaceChildren(element('h2','Your itinerary'));
  if (!plan.stops.length) {
    result.append(element('p','Your priority stop falls outside the sample hours, travel window, or budget. Try another time, a longer visit, or a higher budget.','tip'));
    return;
  }
  const list = element('ol',undefined,'itinerary');
  for (const stop of plan.stops) {
    const item = element('li');
    item.append(element('strong',stop.time+' · '),link(stop.name,mapLink(stop.lat,stop.lon)),element('small',stop.tip+' Entry and local travel estimate ₹'+stop.cost+(stop.travel ? ' · '+stop.travel+' min from previous stop' : '')));
    list.append(item);
  }
  const morning = toMinutes(plan.time) < 10*60;
  result.append(element('p',plan.city+' · '+plan.date+' · '+plan.mode,'muted'),list,element('strong','Estimated total ₹'+plan.total+' per person'),element('p',morning ? 'Photo tip: Try open shade or use side light for architectural detail. Check the local forecast before leaving.' : 'Photo tip: For warmer light, check sunset time and leave room for a stop near golden hour.','tip'),element('p','Demo estimates use sample hours and straight-line distances as a starting point. Confirm venue hours, fares, and directions before travel.','muted'));
  const status = element('p',undefined,'muted');
  status.setAttribute('role','status');
  const saved = trips.some(trip => trip.id === plan.id);
  const save = action(saved ? 'Saved to profile' : 'Save trip',() => {
    const next = [plan,...trips];
    if (!persist('trips',next)) { status.textContent = 'Browser storage is unavailable. The trip could not be saved.'; return; }
    trips = next;
    renderTrips();
    renderPlan(plan);
  },'primary');
  save.disabled = saved;
  result.append(save,status);
}
function renderTrips() {
  for (const selector of ['#home-trips','#profile-trips']) {
    const target = $(selector);
    target.replaceChildren();
    if (!trips.length) target.append(element('p','No saved trips yet. Build an itinerary and save it here.','muted'));
    for (const trip of trips) {
      const item = element('article',undefined,'saved-item');
      const details = element('div');
      details.append(element('strong',trip.city+' · '+trip.stop),element('p',trip.date+' · '+trip.stops.length+' stops · ₹'+trip.total+' estimated'));
      item.append(details,action('Open trip',() => {
        for (const field of ['city','date','time','hours','budget','mode','interest']) planForm.elements[field].value = trip[field];
        updateStops();
        planForm.elements.stop.value = trip.stop;
        currentPlan = trip;
        renderPlan(trip);
        location.hash = 'planner';
      }));
      if (selector === '#profile-trips') item.append(action('Remove',() => {
        const next = trips.filter(saved => saved.id !== trip.id);
        if (!persist('trips',next)) {
          item.append(element('p','Browser storage is unavailable. The trip could not be removed.','muted'));
          return;
        }
        trips = next;
        renderTrips();
        if (currentPlan?.id === trip.id) renderPlan(currentPlan);
      }));
      target.append(item);
    }
  }
}
planForm.addEventListener('submit',event => {
  event.preventDefault();
  currentPlan = createPlan(Object.fromEntries(new FormData(planForm)));
  renderPlan(currentPlan);
});
function renderProfile() {
  const name = profile.name || 'Traveler';
  $('.display-name').textContent = name;
  document.querySelectorAll('.avatar').forEach(node => { node.textContent = [...name][0].toUpperCase(); });
  for (const field of ['city','interest','name']) $('#profile-form').elements[field].value = profile[field];
}
$('#profile-form').addEventListener('submit',event => {
  event.preventDefault();
  const next = Object.fromEntries(new FormData(event.target));
  next.name = next.name.trim();
  if (!next.name) { $('#profile-status').textContent='Enter your name.'; return; }
  if (!persist('profile',next)) { $('#profile-status').textContent='Browser storage is unavailable.'; return; }
  profile = next;
  renderProfile();
  $('#profile-status').textContent = 'Profile saved. Preferences will be used when you next open the app.';
});
const localDate = new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
planForm.elements.date.value = localDate;
$('#city').value = profile.city;
$('#interest').value = profile.interest;
exploreCity.value = profile.city;
updateStops();
renderExplore();
renderProfile();
renderTrips();
route();

const languages = {en:'English',hi:'Hindi',te:'Telugu',ta:'Tamil',kn:'Kannada',ml:'Malayalam',mr:'Marathi',bn:'Bengali',gu:'Gujarati',pa:'Punjabi',ur:'Urdu'};
const phrases = [
  ['Hello','नमस्ते','నమస్తే','வணக்கம்','ನಮಸ್ಕಾರ','നമസ്കാരം','नमस्कार','নমস্কার','નમસ્તે','ਸਤ ਸ੍ਰੀ ਅਕਾਲ','سلام'],
  ['Thank you','धन्यवाद','ధన్యవాదాలు','நன்றி','ಧನ್ಯವಾದಗಳು','നന്ദി','धन्यवाद','ধন্যবাদ','આભાર','ਧੰਨਵਾਦ','شکریہ'],
  ['How much does this cost?','इसकी कीमत कितनी है?','దీని ధర ఎంత?','இதன் விலை என்ன?','ಇದರ ಬೆಲೆ ಎಷ್ಟು?','ഇതിന്റെ വില എത്രയാണ്?','याची किंमत किती आहे?','এর দাম কত?','આની કિંમત કેટલી છે?','ਇਸ ਦੀ ਕੀਮਤ ਕਿੰਨੀ ਹੈ?','اس کی قیمت کتنی ہے؟'],
  ['Where is the nearest metro station?','सबसे नज़दीकी मेट्रो स्टेशन कहाँ है?','దగ్గరలోని మెట్రో స్టేషన్ ఎక్కడ ఉంది?','அருகிலுள்ள மெட்ரோ நிலையம் எங்கே?','ಹತ್ತಿರದ ಮೆಟ್ರೋ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?','അടുത്തുള്ള മെട്രോ സ്റ്റേഷൻ എവിടെയാണ്?','सर्वात जवळचे मेट्रो स्थानक कुठे आहे?','নিকটতম মেট্রো স্টেশন কোথায়?','સૌથી નજીકનું મેટ્રો સ્ટેશન ક્યાં છે?','ਸਭ ਤੋਂ ਨੇੜਲਾ ਮੈਟਰੋ ਸਟੇਸ਼ਨ ਕਿੱਥੇ ਹੈ?','قریب ترین میٹرو اسٹیشن کہاں ہے؟']
];
const codes = Object.keys(languages);
for (const selector of ['#from','#to']) $(selector).replaceChildren(...codes.map(code => new Option(languages[code],code)));
$('#to').value = 'te';
function renderPhrases() {
  const index = codes.indexOf($('#from').value);
  $('#phrases').replaceChildren(...phrases.map(phrase => action(phrase[index],() => {
    $('#source').value = phrase[index];
    $('#translate-form').requestSubmit();
  })));
}
$('#from').addEventListener('change',renderPhrases);
renderPhrases();
let translationRequest;
$('#translate-form').addEventListener('submit',async event => {
  event.preventDefault();
  translationRequest?.abort();
  const controller = new AbortController();
  translationRequest = controller;
  const source = $('#source').value.trim();
  const from = $('#from').value;
  const to = $('#to').value;
  const show = (value) => {
    if (translationRequest === controller) $('#translation').replaceChildren(element('div',value,'result-box'));
  };
  if (!source) { show('Enter text to translate.'); return; }
  const known = phrases.find(row => row[codes.indexOf(from)].toLowerCase() === source.toLowerCase());
  if (from === to || known) { show(known ? known[codes.indexOf(to)] : source); return; }
  if (new TextEncoder().encode(source).length > 500) { show('Shorten the text or translate it in smaller parts.'); return; }
  show('Translating…');
  const timer = setTimeout(() => controller.abort(),8000);
  try {
    const params = new URLSearchParams({q:source,langpair:from+'|'+to});
    const response = await fetch('https://api.mymemory.translated.net/get?'+params,{signal:controller.signal});
    if (!response.ok) throw Error('Translation unavailable');
    const data = await response.json();
    if (Number(data.responseStatus) !== 200 || !data.responseData?.translatedText) throw Error('Translation unavailable');
    show(data.responseData.translatedText);
  } catch { show('Online translation is unavailable. The travel phrase buttons still work offline.'); }
  finally { clearTimeout(timer); }
});

// Read the GPS IFD from standard JPEG EXIF. Invalid or missing metadata falls back to visual suggestions.
function photoGPS(buffer) {
  const bytes = new DataView(buffer);
  try {
    if (bytes.getUint16(0) !== 0xffd8) return null;
    for (let pos=2; pos+4<=bytes.byteLength;) {
      const marker = bytes.getUint16(pos);
      if (marker === 0xffda || marker === 0xffd9) break;
      const length = bytes.getUint16(pos+2);
      const end = pos+2+length;
      if (length < 2 || end > bytes.byteLength) break;
      if (marker === 0xffe1 && length >= 16 && bytes.getUint32(pos+4) === 0x45786966 && bytes.getUint16(pos+8) === 0) {
        const base=pos+10;
        const order=bytes.getUint16(base);
        if (order !== 0x4949 && order !== 0x4d4d) return null;
        const little=order === 0x4949;
        const check=(offset,size) => {
          if (offset < 0 || base+offset+size > end) throw Error('Invalid metadata');
          return base+offset;
        };
        const u16=(offset)=>bytes.getUint16(check(offset,2),little);
        const u32=(offset)=>bytes.getUint32(check(offset,4),little);
        const table=(offset,tag)=>{
          const count=u16(offset);
          check(offset+2,count*12);
          for(let i=0;i<count;i++) {
            const entry=offset+2+i*12;
            if(u16(entry)===tag) return entry;
          }
          return null;
        };
        if (u16(2) !== 42) return null;
        const gps=table(u32(4),0x8825);
        if (gps===null) return null;
        const directory=u32(gps+8);
        function coordinate(refTag,valueTag,positive,negative,max) {
          const reference=table(directory,refTag);
          const entry=table(directory,valueTag);
          if (reference===null || entry===null || u16(entry+2)!==5 || u32(entry+4)!==3) return NaN;
          const sign=String.fromCharCode(bytes.getUint8(check(reference+8,1)));
          if (sign!==positive && sign!==negative) return NaN;
          const start=u32(entry+8);
          const rational=(offset)=>u32(offset)/u32(offset+4);
          const value=rational(start)+rational(start+8)/60+rational(start+16)/3600;
          return value<=max ? value*(sign===negative ? -1 : 1) : NaN;
        }
        const lat=coordinate(1,2,'N','S',90);
        const lon=coordinate(3,4,'E','W',180);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return {lat,lon};
      }
      pos=end;
    }
  } catch { return null; }
  return null;
}
const photoResult = $('#photo-result');
const preview = $('#preview');
let photoRun = 0;
let objectUrl;
function signature(image) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=8;
  const context=canvas.getContext('2d');
  const edge=Math.min(image.naturalWidth,image.naturalHeight);
  context.drawImage(image,(image.naturalWidth-edge)/2,(image.naturalHeight-edge)/2,edge,edge,0,0,8,8);
  return Array.from(context.getImageData(0,0,8,8).data).filter((_,index)=>index%4!==3);
}
function loadImage(url) {
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=reject;
    image.src=url;
  });
}
async function inspectPhoto(url,file) {
  const run=++photoRun;
  preview.src=url;
  preview.hidden=false;
  photoResult.replaceChildren(element('h2','Photo results'),element('p','Checking photo…','muted'));
  try {
    const image=await loadImage(url);
    const coords=file ? photoGPS(await file.arrayBuffer()) : null;
    const imageSignature=signature(image);
    const comparisons=await Promise.allSettled(catalog.Hyderabad.filter(place=>place.photo).map(async place=>{
      const reference=signature(await loadImage('assets/'+place.photo+'.webp'));
      const difference=reference.reduce((total,value,index)=>total+(value-imageSignature[index])**2,0)/reference.length;
      return {place,difference};
    }));
    if (run!==photoRun) return;
    photoResult.replaceChildren(element('h2','Photo results'));
    if (coords) {
      const {lat,lon}=coords;
      const nearest=Object.values(catalog).flat().sort((a,b)=>distance(coords,a)-distance(coords,b))[0];
      photoResult.append(element('p','GPS location from the image: '+lat.toFixed(5)+', '+lon.toFixed(5)),link('Open photo location on map',mapLink(lat,lon)));
      if (distance(coords,nearest)<0.35) photoResult.append(element('p','Nearby catalog spot: '+nearest.name+' · '+nearest.city,'tip'));
    } else photoResult.append(element('p',file ? 'No readable JPEG GPS coordinates were found. The exact location is unknown.' : 'Sample image: Charminar, Hyderabad.','muted'));
    const matches=comparisons.filter(item=>item.status==='fulfilled').map(item=>item.value).sort((a,b)=>a.difference-b.difference).slice(0,2);
    if (matches.length) {
      photoResult.append(element('h3','Similar Hyderabad spots'),element('p','Suggestions compare color and composition with sample images.','muted'));
      for (const {place} of matches) {
        const idea = element('p');
        idea.append(link(place.name,mapLink(place.lat,place.lon)),document.createTextNode(' · '+place.tip));
        photoResult.append(idea);
      }
    }
  } catch {
    if(run===photoRun) {
      preview.hidden=true;
      photoResult.replaceChildren(element('h2','Photo results'),element('p','This image could not be opened. Try a JPEG, PNG, or WebP.','muted'));
    }
  }
}
$('#upload').addEventListener('change',event=>{
  const file=event.target.files[0];
  if (!file) return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl=undefined;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>15*1024*1024) {
    photoRun++;
    preview.hidden=true;
    photoResult.replaceChildren(element('h2','Photo results'),element('p','Choose a JPEG, PNG, or WebP image up to 15 MB.','muted'));
    return;
  }
  objectUrl=URL.createObjectURL(file);
  inspectPhoto(objectUrl,file);
});
$('#sample').addEventListener('click',()=>{
  $('#upload').value='';
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl=undefined;
  inspectPhoto('assets/charminar.webp');
});
