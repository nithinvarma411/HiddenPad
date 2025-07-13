import { BrowserRouter, Routes, Route } from "react-router-dom"
import Notes from "./Notes"

function App() {

  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Notes/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
