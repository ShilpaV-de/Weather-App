import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './SearchBox.css';
import { useState } from 'react';

export default function SearchBox({ updateWeather, handleError }) {
    const [city, setCity] = useState("");

    // Access environment variables
    const API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

    // Fetch weather info from the API
    const getWeatherInfo = async () => {
        try {
            let res = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
            let jsonRes = await res.json();

            if (jsonRes.cod !== 200) {
                throw new Error(jsonRes.message || "Something went wrong.");
            }

            let result = {
                city: city,
                temp: jsonRes.main.temp,
                tempMin: jsonRes.main.temp_min,
                tempMax: jsonRes.main.temp_max,
                humidity: jsonRes.main.humidity,
                feelsLike: jsonRes.main.feels_like,
                weather: jsonRes.weather[0].description
            };

            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleChange = (evt) => {
        setCity(evt.target.value);
    };

    const handleSubmit = async (evt) => {
        try {
            evt.preventDefault();
            if (!city) {
                handleError(); // If no city is provided, handle the error
                return;
            }

            setCity("");

            let info = await getWeatherInfo();
            updateWeather(info);
        } catch (error) {
            handleError();
        }
    };

    return (
        <div className='SearchBox'>
           <h2>Search for weather</h2>
            <form onSubmit={handleSubmit}>
                <TextField
                    id="City"
                    label="City Name"
                    variant="outlined"
                    required
                    value={city}
                    onChange={handleChange}
                />
                <br />
                <br />
                <Button variant="contained" type='submit'>
                    Search 
                </Button>
            </form>
        </div>
    );
}