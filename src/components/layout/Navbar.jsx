import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
	const location = useLocation();

	return (
		<nav className="navbar" role="navigation" aria-label="Main navigation">
			<div className="nav-brand">
				<span className="nav-globe-icon" aria-hidden="true">🌍</span>
				<h2 className="nav-title">Atmos</h2>
				<span className="nav-tagline">Weather Portal</span>
			</div>

			<div className="nav-links">
				<Link to="/" className={`nav-link${location.pathname === "/" ? " active" : ""}`}>
					<span aria-hidden="true">🌤</span> Current
				</Link>
				<Link
					to="/historical"
					className={`nav-link${location.pathname === "/historical" ? " active" : ""}`}
				>
					<span aria-hidden="true">📅</span> Historical
				</Link>
			</div>
		</nav>
	);
};

export default Navbar;
