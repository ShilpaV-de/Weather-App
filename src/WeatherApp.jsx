
import SearchBox from './SearchBox.jsx'
import InfoBox from './InfoBox.jsx'
import { useState } from 'react'



export default function WeatherApp() {
    let [weatherInfo, setWeatherInfo] = useState({
        city: "",
        feelsLike: "",
        humidity: "",
        temp: "",
        tempMax: "",
        tempMin: "",
        weather: "",
    })
    let [showWeather, setShowWeather] = useState(false);
    let [error, setError] = useState(false);


    function handleError() {
        setError(true);
    }

    function updateWeather(newInfo) {
        setError(false)
        setWeatherInfo(newInfo);
        setShowWeather(true)
    }

    return (
        <>
            <SearchBox updateWeather={updateWeather} handleError={handleError} />
            {error ? <h2 style={{ color: 'red', textAlign: 'center', margin: '100px' }}>No such place exist</h2> : showWeather && <InfoBox info={weatherInfo} />}
        </>
    )
}