import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import City from "./pages/City";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/city/:name" element={<City />} />
      </Routes>
    </HashRouter>
  );
}
