const APIKEY = 'b950d81051f4b3509b239c9b96a7e35f';
const APIURL = (city) =>
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}`;
const APIURLID = (id) =>
  `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${APIKEY}`;

const navbar = document.getElementById('navbar');
const checkbox = document.getElementById('checkbox');
const main = document.getElementById('main');
const form = document.getElementById('form');
const inputEl = document.getElementById('input');
const matchEl = document.getElementById('city-list');
const cityBtn = document.querySelectorAll('.city-btn');
const favCities = document.getElementById('fav-cities');

getWeather('Antalya');
fetchFavCities();

async function getWeather(city) {
  const resp = await fetch(APIURL(city), { origin: 'cors' });
  const respData = await resp.json();

  console.log(respData);

  createWeatherCard(respData);
}

async function getWeatherById(id) {
  const resp = await fetch(APIURLID(id), { origin: 'cors' });
  const respData = await resp.json();

  const city = respData.name;

  return city;
}

// Dark Mode Toggler
checkbox.addEventListener('change', () => {
  document.body.classList.toggle('white');
  navbar.classList.toggle('black');
});

//Show Weather of Popular Cities in Weather Card
cityBtn.forEach((city) => {
  city.addEventListener('click', () => {
    const favCityText = city.innerText;
    getWeather(favCityText);
  });
});

// Search cities.json and filter it
async function searchCities(searchText) {
  const resp = await fetch('./cities-tr.json');
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

// Show Search Results in Autocomplete Box
const outputHtml = (matches) => {
  if (matches.length > 0) {
    const html = matches
      .map(
        (match) => `
          <h4 id='autocompCity'>${match.name}</h4>
          <small>Country: ${match.country} - Lat: ${match.lat} / Lang:  ${match.lng}</small>
    `
      )
      .join('');

    matchEl.innerHTML = html;

    // Clicking Autocomplete City
    const autocompCity = matchEl.querySelectorAll('#autocompCity');

    autocompCity.forEach((city) => {
      city.addEventListener('click', () => {
        const autocompValue = city.innerText;
        getWeather(autocompValue);
        inputEl.value = '';
        matchEl.classList.remove('active');
      });
    });
  }
};

// Creating Weather Card
function createWeatherCard(data) {
  const temp = KtoC(data.main.temp);

  const cardHTML = `
    <img
         src='https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png'
         class='card-img'
       />
       <div class='card-info'>
         <div class='card-info-header'>
           <h1>${data.name}, (${data.sys.country}) ${temp}°C</h1>
         </div>
         <div class='card-info-body'>
           <p>${today}</p>
           <p>Weather: ${data.weather[0].description}</p>
         </div>
       </div>
       <div class='favorites'>
         <button class='fav-btn'>
           <i class='fas fa-heart'></i>
         </button>
         <small>Add to Favorite Cities</small>
       </div>
  `;

  main.innerHTML = cardHTML;

  const btn = main.querySelector('.fav-btn');

  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) {
      removeCitiesLS(data.id);
      btn.classList.remove('active');
    } else {
      addCitiesLS(data.id);
      btn.classList.add('active');
    }
  });
}

// Converting Kelvin to Celcius
function KtoC(K) {
  return Math.floor(K - 273.15);
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

  if (city) {
    getWeather(city);

    inputEl.value = '';
  }

  matchEl.classList.remove('active');
});

// Getting Todays Date
let today = new Date().toISOString().slice(0, 10);

// Add Local Storage
function addCitiesLS(cityId) {
  const cityIds = getCitiesLS();

  localStorage.setItem('cityIds', JSON.stringify([...cityIds, cityId]));
}

// Remove Local Storage
function removeCitiesLS(cityId) {
  const cityIds = getCitiesLS();

  localStorage.setItem(
    'cityIds',
    JSON.stringify(cityIds.filter((city) => city !== cityId))
  );
}

// Get Local Storage
function getCitiesLS() {
  const cityIds = JSON.parse(localStorage.getItem('cityIds'));

  return cityIds === null ? [] : cityIds;
}

// Fetching Favourite City
async function fetchFavCities() {
  const cityIds = getCitiesLS();

  for (let i = 0; i < cityIds.length; i++) {
    const cityId = cityIds[i];

    city = await getWeatherById(cityId);

    addCityToFavContainer(city);
  }
}

// Adding Favorite City to Html
function addCityToFavContainer(city) {
  const favCity = document.createElement('div');

  favCity.innerHTML = `
    <button class="city-btn">${city}</button>
  `;

  favCities.appendChild(favCity);

  const cityBtn = favCities.querySelectorAll('.city-btn');

  cityBtn.forEach((city) => {
    city.addEventListener('click', () => {
      const favCityText = city.innerText;
      getWeather(favCityText);
    });
  });
}
