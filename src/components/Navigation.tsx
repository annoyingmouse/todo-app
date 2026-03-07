import { Link } from "react-router-dom";
const Navigation = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex gap-4" aria-label="Site navigation">
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className="hover:underline">
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
};
export default Navigation;
