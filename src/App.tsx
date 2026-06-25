import { useEffect, useState } from 'react';
import {  Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LogIn, Menu, X, ArrowRight, Hamburger } from 'lucide-react';
import burger1 from './assets/burger1.png';
import burger2 from './assets/burger2.png';
import aldis from './assets/aldis.jpg';
import Login from './components/LoginRegister';
import PesanBurger from './pages/pesanburger';

// 1. Komponen Utama Landing Page (Dipisah agar Routing rapi)
function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const burgerImages = [ burger1,aldis, burger2];
  const [currentBurgerIndex, setCurrentBurgerIndex] = useState(0);
  
  // Hook untuk navigasi via tombol/fungsi programmatic
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBurgerIndex((prevIndex) => (prevIndex + 1) % burgerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [burgerImages.length]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md shadow-orange-600/20">
                <Hamburger className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Aldi's <span className="text-orange-600">Burger</span>
              </span>
            </div>

            {/* Tombol Aksi Kanan Atas */}
            <div className="hidden md:flex items-center gap-4">
              {/* MENGGUNAKAN <Link> UNTUK NAVIGASI HALAMAN */}
              <Link
                to="/login"
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-600/20"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Sisi Kiri: Teks & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Burger Premium, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                Kustomisasi Sesukamu.
              </span>
            </h1>
            
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Pilih kombinasi patty daging yang juicy, keju lumer, dan sayuran segar favoritmu. Dipanggang sempurna sesaat setelah dipesan, lalu diantar hangat langsung ke depan pintumu.
            </p>

            {/* Tombol Aksi / CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* MENGGUNAKAN useNavigate() SAAT TOMBOL DIKLIK */}
              <button 
                onClick={() => navigate('/pesanburger')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
              >
                Mulai Racik Burgermu <ArrowRight className="w-5 h-5 text-orange-400" />
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Area Visual */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-orange-100/50 to-amber-100/30 rounded-[2.5rem] flex items-center justify-center p-8 border border-orange-100/30">
              <div className="absolute w-72 h-72 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
              <div className="w-full h-full bg-white/70 backdrop-blur-sm rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/80 flex flex-col items-center justify-center text-center group hover:shadow-2xl transition duration-300">
                <div className="relative w-full h-72 rounded-[1.75rem] overflow-hidden mb-4 bg-slate-100">
                  {burgerImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Burger ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                        index === currentBurgerIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// 2. Pembungkus Navigasi Utama Aplikasi
export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login onClose={() => window.history.back()} />} />
        <Route path="/pesanburger" element={<PesanBurger />} />
      </Routes>
    
  );
}