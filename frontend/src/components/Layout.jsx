import Navbar from './Navbar';
import bgImage from '../assets/dashboard-bg.png';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
