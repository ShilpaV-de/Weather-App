import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import "./InfoBox.css";

import hotImg from "./assets/hot.jpg";
import coldImg from "./assets/cold.jpg";
import rainImg from "./assets/rain.jpg";
import cloudImg from "./assets/cloud.jpg";
import defaultImg from "./assets/default.jpg";

export default function InfoBox({ info }) {

  let weatherImg = defaultImg;

  if (info.humidity > 80) {
    weatherImg = rainImg;
  } else if (info.temp > 30) {
    weatherImg = hotImg;
  } else if (info.temp < 10) {
    weatherImg = coldImg;
  } else {
    weatherImg = cloudImg;
  }


  return (
    <div className="InfoBox">
      <div className="card">
        <Card sx={{ maxWidth: 345 }}>
          <CardMedia
            component="img"
            height="180"
            image={weatherImg}
            alt="Weather Image"
          />

          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {info.city}
            </Typography>

            <Typography variant="body2" color="text.primary">
              <p>Temperature = {info.temp}&deg;C</p>
              <p>Humidity = {info.humidity}</p>
              <p>Min Temp = {info.tempMin}&deg;C</p>
              <p>Max Temp = {info.tempMax}&deg;C</p>
              <p>
                The weather can be described as <i>{info.weather}</i> and
                feels like {info.feelsLike}&deg;C
              </p>
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}