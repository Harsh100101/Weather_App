import { BrowserRouter, Routes, Route } from "react-router-dom";

import CurrentWeather from "./pages/CurrentWeather";
import HistoricalWeather from "./pages/HistoricalWeather";

import Navbar from "./components/layout/Navbar";

function App() {
	return (
		<BrowserRouter>
			<Navbar />

			<Routes>
				<Route path="/" element={<CurrentWeather />} />
				<Route path="/historical" element={<HistoricalWeather />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
