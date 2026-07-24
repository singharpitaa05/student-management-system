import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import './Layout.css';

export const ProtectedLayout = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
