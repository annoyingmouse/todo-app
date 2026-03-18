import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/trash", label: "Trash" },
  { to: "/data", label: "Data" },
  { to: "/about", label: "About" },
];

const Navigation = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex gap-4" aria-label="Site navigation">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="hover:underline"
              aria-current={pathname === to ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
