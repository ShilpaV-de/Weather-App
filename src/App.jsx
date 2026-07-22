import { useState } from 'react'
// import Button from '@mui/material/Button';
// import DeleteIcon from '@mui/icons-material/Delete';
import WeatherApp from './WeatherApp.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <WeatherApp />

    </>
  )
}

export default App