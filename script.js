const apiKey = '1add424e2b346ee4756a6b35249fbfef';
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const geolocationBtn = document.getElementById('geolocation-btn');
const historyList = document.getElementById('history-list');

// Función para obtener clima por ciudad
async function getWeather(city) {
    showSpinner(true); // Mostrar spinner
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=es`);
        const data = await response.json();
        if (data.cod === '404') throw new Error('Ciudad no encontrada');
        updateUI(data);
    } catch (error) {
        alert(error.message);
    } finally {
        showSpinner(false); // Ocultar spinner
    }
}

function showSpinner(show) {
    document.getElementById('spinner').style.display = show ? 'block' : 'none';
}

// Función para obtener clima por geolocalización
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=es`
        );
        const data = await response.json();
        updateUI(data);
        saveToHistory(data.name);
    } catch (error) {
        console.error('Error al obtener el clima:', error);
    }
}

// Actualizar la interfaz
function updateUI(data) {
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `Humedad: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Viento: ${data.wind.speed} km/h`;
}

// Eventos
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) getWeather(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

geolocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                alert('No se pudo obtener tu ubicación. Error: ' + error.message);
            }
        );
    } else {
        alert('Tu navegador no soporta geolocalización.');
    }
});
const suggestionsDiv = document.getElementById('suggestions');

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
        const cities = await response.json();
        showSuggestions(cities);
    } catch (error) {
        console.error('Error al buscar ciudades:', error);
    }
});

function showSuggestions(cities) {
    if (cities.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    suggestionsDiv.innerHTML = cities.map(city => `
        <div onclick="selectCity('${city.name}, ${city.country}')">
            ${city.name}, ${city.country}
        </div>
    `).join('');
    suggestionsDiv.style.display = 'block';
}

function selectCity(cityName) {
    searchInput.value = cityName;
    suggestionsDiv.style.display = 'none';
    getWeather(cityName.split(',')[0]); // Busca el clima al seleccionar
}