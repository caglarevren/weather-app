const APIKEY = '0ca88a488c3a638511497df737bbae5b';
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

//
async function getWeather(city) {
  const resp = await fetch(APIURL(city), { origin: 'cors' });
  const respData = await resp.json();

  console.log(respData);

  createWeatherCard(respData);

  const humidity = respData.main.humidity;
  getHumidity(humidity);

  const pressure = respData.main.pressure;
  getPressure(pressure);

  const wind = respData.wind.speed;
  getWind(wind);
}

async function getWeatherById(id) {
  const resp = await fetch(APIURLID(id), { origin: 'cors' });
  const respData = await resp.json();

  const city = respData.name;

  return city;
}

// Enable DarkMode
function chooseDarkMode() {
  document.body.classList.add('black');
  document.body.classList.remove('white');

  navbar.classList.add('white');
  navbar.classList.remove('black');
}

// Disable DarkMode
function chooseLightMode() {
  document.body.classList.add('white');
  document.body.classList.remove('black');

  navbar.classList.add('black');
  navbar.classList.remove('white');
}

// Dark Mode Toggler
checkbox.addEventListener('change', (e) => {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    chooseLightMode();
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    chooseDarkMode();
  }
});

// Getting DarkMode From LocalStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);

  if (currentTheme === 'light') {
    checkbox.checked = true;
    chooseLightMode();
  }
}

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

    // Clean the container
    favCities.innerHTML = '';
    fetchFavCities();
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

// Fetching Favorite City
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

// Getting Humidity
getHumidity();

function getHumidity(obj) {
  const humidityChart = document.getElementById('humidity').getContext('2d');

  const chart = new Chart(humidityChart, {
    type: 'doughnut',

    data: {
      labels: ['Humidity', 'Empty'],
      datasets: [
        {
          label: '# of Votes',
          data: [obj, 100 - obj],
          backgroundColor: ['rgba(171, 0, 60, 0.8)', 'rgba(0,0,0, 0.1)'],
          borderColor: ['rgba(113, 128, 150, 1)', 'rgba(113, 128, 150, 1)'],
          borderWidth: 1,
        },
      ],
    },

    options: {
      title: {
        display: true,
        text: `Humidity ${obj}%`,
        fontSize: 25,
        fontColor: '#718096',
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontColor: '#718096',
        },
      },
    },
  });
}

// Getting Pressure
getPressure();

function getPressure(obj) {
  const pressureChart = document.getElementById('pressure').getContext('2d');

  const chart = new Chart(pressureChart, {
    type: 'bar',

    data: {
      labels: ['Pressure'],
      datasets: [
        {
          label: 'Pressure',
          data: [obj],
          backgroundColor: ['rgba(171, 0, 60, 0.8)'],
          borderColor: ['rgba(113, 128, 150, 1)'],
          borderWidth: 1,
        },
      ],
    },

    options: {
      title: {
        display: true,
        text: `Pressure ${obj}Pa`,
        fontSize: 25,
        fontColor: '#718096',
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontColor: '#718096',
        },
      },
    },
  });
}

// Getting Wind
getWind();

function getWind(obj) {
  const windChart = document.getElementById('wind').getContext('2d');

  const chart = new Chart(windChart, {
    type: 'bar',

    data: {
      labels: ['Wind'],
      datasets: [
        {
          label: 'Wind Speed',
          data: [obj],
          backgroundColor: ['rgba(171, 0, 60, 0.8)'],
          borderColor: ['rgba(113, 128, 150, 1)'],
          borderWidth: 1,
        },
      ],
    },

    options: {
      title: {
        display: true,
        text: `Wind ${obj}km/s`,
        fontSize: 25,
        fontColor: '#718096',
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontColor: '#718096',
        },
      },
    },
  });
}
