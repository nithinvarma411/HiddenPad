import { HashRouter, Routes, Route } from "react-router-dom"
import Notes from "./Notes"

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Notes/>} />
      </Routes>
    </HashRouter>
  )
}

export default App