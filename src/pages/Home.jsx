import "../styles/ui.css";
import { cities } from "../data/cities";

import Screen from "../components/layout/Screen";
import Card from "../components/layout/Card";
import Globe from "../components/Home/Globe";
import CityGrid from "../components/Home/CityGrid";

export default function Home() {
  return (
    <Screen>
      <Card>
        <h1 className="title">Weather</h1>
        <p className="subtitle">Select a city</p>

        <Globe />
        <CityGrid cities={cities} />
      </Card>
    </Screen>
  );
}
