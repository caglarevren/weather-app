const APIKEY = '800180ba651c7de112f51877008acd08';
const APIURL = `http://api.weatherstack.com/current?access_key=${APIKEY}&query=`;

const navbar = document.getElementById('navbar');
const checkbox = document.getElementById('checkbox');
const heart = document.getElementById('heart');

const main = document.getElementById('main');
const form = document.getElementById('form');
const inputEl = document.getElementById('input');
const matchEl = document.getElementById('city-list');

getWeather('Antalya');

async function getWeather(cityName) {
  const resp = await fetch(APIURL + cityName);
  const respData = await resp.json();

  createCard(respData);

  console.log(respData);
}

// Dark Mode Toggler
checkbox.addEventListener('change', () => {
  document.body.classList.toggle('white');
  navbar.classList.toggle('black');
  heart.classList.toggle('black');
});

// Search cities.json and filter it
async function searchCities(searchText) {
  const resp = await fetch('./cities.json');
  const cities = await resp.json();

  // Get cities to the current text
  let matches = cities.filter((city) => {
    const regex = new RegExp(`^${searchText}`, 'gi');
    return city.name.match(regex);
  });

  if (searchText.length === 0) {
    matches = [];
    matchEl.innerHTML = '';
    matchEl.classList.remove('active');
  }

  outputHtml(matches);
}

// Show Results in Html
const outputHtml = (matches) => {
  if (matches.length > 0) {
    const html = matches
      .map(
        (match) => `
          <h4>${match.name}</h4>
          <small>Country: ${match.country} - Lat: ${match.lat} / Lang:  ${match.lng}</small>
    `
      )
      .join('');

    matchEl.innerHTML = html;
  }
};

// Creating Weather Card
function createCard(data) {
  const cardHTML = `
    <img
         src='${data.current.weather_icons}'
         alt=''${data.current.weather_descriptions}'
         class='card-img'
       />
       <div class='card-info'>
         <div class='card-info-header'>
           <h1>${data.location.name} ${data.current.temperature}°C</h1>
         </div>
         <div class='card-info-body'>
           <p>${data.location.localtime}</p>
           <p>Weather: ${data.current.weather_descriptions}</p>
         </div>
       </div>
       <div class='favorites'>
         <button class='fav-btn'>
           <i class='fas fa-heart' id='heart'></i>
         </button>
         <small>Add to Favorite Cities</small>
       </div>
  `;

  main.innerHTML = cardHTML;
}

// Autocomplete
inputEl.addEventListener('input', () => {
  searchCities(inputEl.value);
  matchEl.classList.add('active');
});

// Getting Weather by City Name
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const city = inputEl.value;
  city.charAt(0).toUpperCase();

  if (city) {
    getWeather(city);

    inputEl.value = '';
  }
});
