// src/components/Navigation.js
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/list">List</Link>
    </nav>
  );
}

export default Navigation;
