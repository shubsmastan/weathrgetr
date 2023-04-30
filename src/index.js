import axios from "axios";
import "./style.css";
import API_KEY from "./utils/key.js";

const weather = (function () {
  let units = localStorage.getItem("units")
    ? localStorage.getItem("units")
    : "C";
  let currentLocation = "london";

  const getLocation = function () {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        weather.currentLocation = `${latitude},${longitude}`;
        weather.fetchWeather(weather.currentLocation);
        return;
      },
      () => {
        alert("Location permission denied - showing weather in London.");
        weather.fetchWeather("london");
      }
    );
  };

  const fetchWeather = async function (loc) {
    try {
      const key = API_KEY;
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${loc}&days=3`
      );

      const { data } = response;
      const { day } = response.data.forecast.forecastday[1];
      weather.displayWeather(data, day);
    } catch (err) {
      weather.logError();
      console.log(err);
    }
  };

  const displayWeather = function (today, tomorr) {
    document.querySelector(".error").style.display = "none";
    document.querySelector(".loading").style.display = "none";
    document.querySelector(".weather").style.visibility = "visible";
    document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url("https://source.unsplash.com/1600x900/?${today.location.name}")`;
    weather.writeData(".city", today.location.name);
    weather.writeData(
      ".temp",
      `${
        weather.units === "C"
          ? today.current.temp_c + "\u00b0C"
          : today.current.temp_f + "\u00b0F"
      }`
    );
    weather.writeData(".icon", today.current.condition.icon);
    weather.writeData(".description", today.current.condition.text);
    weather.writeData(".humidity", `${today.current.humidity}%`);
    weather.writeData(".wind", `${today.current.wind_mph} mph`);

    weather.writeData(
      ".temp-tomorrow",
      `${
        weather.units === "C"
          ? tomorr.avgtemp_c + "\u00b0C"
          : tomorr.avgtemp_f + "\u00b0F"
      }`
    );
    weather.writeData(".icon-tomorrow", tomorr.condition.icon);
    weather.writeData(".description-tomorrow", tomorr.condition.text);
    weather.writeData(".humidity-tomorrow", `${tomorr.avghumidity}%`);
    weather.writeData(".wind-tomorrow", `${tomorr.maxwind_mph} mph`);
  };

  const writeData = function (className, data) {
    const element = document.querySelector(className);
    if (element.nodeName === "IMG") {
      element.src = data;
      return;
    }
    element.textContent = data;
  };

  const logError = function () {
    document.querySelector(".loading").style.display = "none";
    document.querySelector(".error").style.display = "block";
  };

  const getUnits = function () {
    const toggle = document.getElementById("toggle-units");
    if (localStorage.getItem("units") === "F") {
      toggle.checked = true;
      document.querySelector(".units").innerText = weather.units;
    }
    toggle.addEventListener("click", () => {
      if (toggle.checked) {
        weather.units = "F";
        weather.fetchWeather(weather.currentLocation);
        document.querySelector(".units").innerText = weather.units;
        localStorage.setItem("units", "F");
      } else {
        weather.units = "C";
        weather.fetchWeather(weather.currentLocation);
        document.querySelector(".units").innerText = weather.units;
        localStorage.setItem("units", "C");
      }
    });
  };

  const search = function () {
    const searchBtn = document.getElementById("search-btn");
    searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const location = document.getElementById("search-box").value;
      if (location === "") return;
      weather.currentLocation = location;
      weather.fetchWeather(location);
    });
  };

  const toggleDay = function () {
    const toggleDay = document.getElementById("toggle-day");
    toggleDay.addEventListener("click", function () {
      const today = document.querySelector(".weather");
      const tomorr = document.querySelector(".weather-tomorrow");
      document.querySelector(".weather-tomorrow").style.visibility = "visible";
      today.classList.toggle("active");
      tomorr.classList.toggle("inactive");
      toggleDay.classList.toggle("active");
      if (toggleDay.classList.contains("active"))
        toggleDay.textContent = "Tomorrow";
      else toggleDay.textContent = "Today";
    });
  };

  return {
    units,
    currentLocation,
    getLocation,
    fetchWeather,
    displayWeather,
    writeData,
    logError,
    getUnits,
    search,
    toggleDay,
  };
})();

weather.getUnits();
weather.search();
weather.toggleDay();
weather.getLocation();
