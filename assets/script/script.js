//global scope variables

var cDateEl = document.getElementById("date");
var sCity = document.getElementById("searchCity");
var sState = document.getElementById("state-select");
var sCountry = document.getElementById("country-select");
var state = "Colorado";
var country = "840";
// var state = sState.value;
// var country = sCountry.value;
var cCity = document.getElementById("currentCity")
var cTemp = document.getElementById("cTemp");
var cWind = document.getElementById("cWind");
var cHumid = document.getElementById("cHumid");
var cUVI = document.getElementById("cUVI");
var cIcon = document.getElementById("cIcon");
var searchBtn = document.getElementById("search-form");
var ulEl = document.getElementById("historyContainer");
var searchHistory = [];
//delete key once this is deployed?
var apiKey = "e605ccbbdf38f9e3d18b351610bc6724"
var part = "";
var savedLoc = {
    city: "",
    lat: "",
    lon: "",
};

var currentObj = {
    time: "",
    temp: "",
    wind: "",
    humidity: "",
    uvi: "",
    icon: "",
};

var forecastObj = [
    {
        day: 1,
        time: "",
        temp: "",
        wind: "",
        humidity: "",
        icon: "",
    },
    {
        day: 2,
        time: "",
        temp: "",
        wind: "",
        humidity: "",
        icon: "",
    },
    {
        day: 3,
        time: "",
        temp: "",
        wind: "",
        humidity: "",
        icon: "",
    },
    {
        day: 4,
        time: "",
        temp: "",
        wind: "",
        humidity: "",
        icon: "",
    },
    {
        day: 5,
        time: "",
        temp: "",
        wind: "",
        humidity: "",
        icon: "",
    },
];

function searchButtonHandler(event) {
    event.preventDefault();
    // console.log(event.target)
  
    var city = sCity.value.trim();
    console.log(city)
    if (city) {
      getGeo(city);
      sCity.value = "";
    } return city;
}

var getGeo = function (city) {
    var geoRequest = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
    fetch(geoRequest).then(function (geoResponse) {
        if (geoResponse.ok) {
            geoResponse.json().then (function (geoData) {
                //console.log(geoData);
                var lat = geoData[0].lat;
                var lon = geoData [0].lon;
                saveGeo(city, lat, lon);
                console.log(searchHistory);
                getStoredHistory();
                clearCards(ulEl);
                renderStoredHistory();
                getWeather(city, lat, lon)
            })
        } else {
            alert(`Error ${geoResponse.statusText}`);
        }
    })
}

var getWeather = function (city, lat, lon) {
    var weatherRequest = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}` 
    fetch(weatherRequest).then(function (weatherResponse) {
        if (weatherResponse.ok) {
            weatherResponse.json().then (function (weatherData) {
                // console.log(weatherData)
                Object.defineProperties(currentObj, {
                    time: {value: weatherData.current.dt},
                    temp: {value: weatherData.current.temp},
                    wind: {value: weatherData.current.wind_speed},
                    humidity: {value: weatherData.current.humidity},
                    uvi: {value: weatherData.current.uvi},
                    icon: {value: weatherData.current.weather[0].icon},
                });
                renderWeather(city);
                for (let ind1 = 0; ind1 < weatherData.daily.length; ind1++) {
                    const dailyData = weatherData.daily[ind1];
                    if (ind1===0 || ind1 > 5) { continue; }
                    Object.defineProperties(forecastObj[ind1-1], {
                        time: {value: dailyData.dt},
                        temp: {value: dailyData.temp.max},
                        wind: {value: dailyData.wind_speed},
                        humidity: {value: dailyData.humidity},
                        icon: {value: dailyData.weather[0].icon}
                    });
                }
                renderForecast(city);
            })
        } else {
            alert(`Error: ${weatherResponse.status}`);
        }
    })
}


function saveGeo(city, lat, lon) {
    var newSavedLoc = Object.create(savedLoc);
    newSavedLoc.city = city;
    newSavedLoc.lat = lat;
    newSavedLoc.lon = lon;
    // if (!searchHistory.contains(newSavedLoc))
    searchHistory.push(newSavedLoc);
    localStorage.setItem("searches", JSON.stringify(searchHistory));  
}

function getStoredHistory() {
    var storedHistory = JSON.parse(localStorage.getItem("searches"));
    if (storedHistory !== null) {
        searchHistory = storedHistory;
    }
};

function renderStoredHistory() {
    for (let ind3 = 0; ind3 < searchHistory.length; ind3++) {
        var historyItem = searchHistory[ind3];
        var newLi = document.createElement("li");
        var newBtn = document.createElement("button");
        newBtn.innerText = `${historyItem.city}`
        ulEl.append(newLi);
        ulEl.classList.add("noStyle")
        newLi.append(newBtn);
        var newLiClasses = ["col", "s12", "m12", "noStyle"];
        for (let ind4 = 0; ind4 < newLiClasses.length; ind4++) {
            const addClass = newLiClasses[ind4];
            newLi.classList.add(addClass);
        };
        var newBtnClasses = ["btn", "waves-effect", "waves-light","hButt"];
        for (let ind5 = 0; ind5 < newBtnClasses.length; ind5++) {
            const btnClasses = newBtnClasses[ind5];
            newBtn.classList.add(btnClasses);    
        }
        newBtn.setAttribute("data-lat", historyItem.lat);
        newBtn.setAttribute("data-lon", historyItem.lon);
    }
};

function clearCards(x) {
    while (x.firstChild) {
        x.removeChild(x.firstChild);
        console.log("element removed");
    };
}

function renderWeather(city) {
    var newDate = new Date(currentObj.time * 1000).toDateString();
    cDateEl.innerText = newDate;
    cCity.innerText = city;
    cTemp.innerText = `Temp: ${currentObj.temp} \xB0`;
    cWind.innerText = `Wind: ${currentObj.wind} MPH`;
    cHumid.innerText = `Humidity: ${currentObj.humidity} %`;
    cUVI.innerText = `UVI: ${currentObj.uvi}`;
    removeUVI();
    if (currentObj.uvi <= 2) {
        cUVI.classList.add("uvLow")
    } else if (2 < currentObj.uvi <= 5) {
        cUVI.classList.add("uvMod")        
    } else if (5 < currentObj.uvi <= 7) {
        cUVI.classList.addC("uvHigh")
    } else if (5 < currentObj.uvi <= 7) {
        cUVI.classList.add("uvVHi")
    } else {cUVI.classList.add("uvExt")};
    cIcon.setAttribute("src", `http://openweathermap.org/img/w/${currentObj.icon}.png`)
};

function removeUVI() {
    cUVI.classList.remove("uvLow", "uvMod", "uvHigh", "uvVHi", "uvExt");
}

function renderForecast(city) {
    for (let ind2 = 0; ind2 < forecastObj.length; ind2++) {
        const foreDay = forecastObj[ind2].day;
        var foreDateEl = document.getElementById(`day${foreDay}`);
        var foreTempEl = document.getElementById(`f${foreDay}Temp`);
        var foreWindEl = document.getElementById(`f${foreDay}Wind`);
        var foreHumidEl = document.getElementById(`f${foreDay}Humid`);
        var foreIconEl = document.getElementById(`f${foreDay}Icon`);
        var newForeDate = new Date(forecastObj[ind2].time * 1000).toDateString();
        foreDateEl.innerText = newForeDate;
        foreTempEl.innerText = `Temp: ${forecastObj[ind2].temp} \xB0`;
        foreWindEl.innerText = `Wind: ${forecastObj[ind2].wind} MPH`;
        foreHumidEl.innerText = `Humidity ${forecastObj[ind2].humidity} %`;
        foreIconEl.setAttribute("scr", `http://openweathermap.org/img/w/${forecastObj[ind2].icon}.png`);
    }
};




M.AutoInit();
getStoredHistory();
renderStoredHistory();

//event listeners

document.getElementById("search-form").addEventListener("submit", searchButtonHandler);

ulEl.addEventListener('click', function (e) {
    e.preventDefault()
    if (e.target.classList.contains("hButt")) {
    var city=e.target.innerText;
    var lat=e.target.dataset.lat;
    var lon=e.target.dataset.lon;
    getWeather(city, lat, lon);
    // var namedBtn = e.target.parent;
    // clearCards(namedBtn);
    }
});
