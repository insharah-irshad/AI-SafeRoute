import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/10'
  }`;

export default function Navbar() {
  return (
    <header className="border-b border-ink/10 px-4 py-3 flex items-center justify-between">
      <span className="font-semibold tracking-tight">AI SafeRoute</span>
      <nav className="flex gap-1">
        <NavLink to="/" end className={linkClass}>
          Report
        </NavLink>
        <NavLink to="/map" className={linkClass}>
          Map
        </NavLink>
        <NavLink to="/compare" className={linkClass}>
          Compare Routes
        </NavLink>
      </nav>
    </header>
  );
}
