import { Users, ShoppingBag } from 'lucide-react';
import './globals.css';

export const metadata = {
  title: 'Los Bermudos',
  description: 'Gestión de cuentas de socios para la barra de la caseta',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <NavBar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          <span>Los <span className="brand-accent">Bermudos</span></span>
        </a>
        <div className="navbar-links">
          <a href="/" className="nav-link">
            <Users size={18} /> Socios
          </a>
          <a href="/productos" className="nav-link">
            <ShoppingBag size={18} /> Productos
          </a>
        </div>
      </div>
    </nav>
  );
}
