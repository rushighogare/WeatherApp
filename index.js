const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const error=document.querySelector(".error");

// initially variable need?

let oldTab = userTab;
const API_KEY = "818db2f8f3d27398512222e7579bb3d9";
oldTab.classList.add("current-tab");
getfromSessionStorage();

// tab switch function
//ek kaam or pending hai - (initially latitude & longitude is present or if not present then it will get it grant access will done)

function switchTab(newTab)
{
    if(newTab != oldTab)
    {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active"))
        {
            // kya search form wla container invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else
        {
            // main pehle search wale tab pr tha, ab your weather tab visible krna hai
            searchForm.classList.remove("active");
            searchForm.classList.remove("active");

            //ab main your weather tab me aagya hun, toh weather bhi display karna padega, so let's check local storage first --
            // --for coordinate, if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => 
{
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => 
{
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if coordinates are allready present in session storage
function getfromSessionStorage()
{
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates)
    {
        // agr local coordinates nahi mila to 
        grantAccessContainer.classList.add("active");
    }
    else
    {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates)
{
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");

    // make loader visible
    loadingScreen.classList.add("active");


    // API call krte hai
    try
    {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        //now remove loader after fetching the data
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");      //you have to display info after closing the loader
        renderWeatherInfo(data);                        //function to add updated information dynamically

    }
    catch(err)
    {
        loadingScreen.classList.remove("active");
        // khud se kr lena bhai kuch revise wagera kr lena acche se
        // userInfoContainer.classList.remove("active");
        // error.classList.add("active");
    }
}


function renderWeatherInfo(weatherInfo)
{
    // firstly we have to fetch the elements

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    //fetch values from weatherInfo object and put it UI elements
    //below used is optional chaining --> (It means that you can go in depth of the API response object to fetch the value using .attribute method)
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation()
{
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else
    {
        //hw - show an alert for no geolocation support available
        alert('No geolocation support');
    }
}

function showPosition(position)
{
    const userCoordinates = 
    {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => 
{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName ==="")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

//response.json() --> It converts response from API to json format
//json.parse(response)  --> Here parse converts json string to json objects

async function fetchSearchWeatherInfo(city)
{
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try
    {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err)
    {
        loadingScreen.classList.remove("active");
        //hw
        // error.classList.add("active");
        // userInfoContainer.remove("active");
    }
}