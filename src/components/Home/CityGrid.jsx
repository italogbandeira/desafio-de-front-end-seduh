import CityButton from "./CityButton";

export default function CityGrid({ cities }) {
  return (
    <div className="cityGrid">
      {cities.map((c) => (
        <CityButton key={c.name} name={c.name} />
      ))}
    </div>
  );
}
