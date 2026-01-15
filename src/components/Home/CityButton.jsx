import { Link } from "react-router-dom";

export default function CityButton({ name }) {
  return (
    <Link to={`/city/${encodeURIComponent(name)}`} className="cityBtn">
      {name}
    </Link>
  );
}
