import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaBuilding, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    banner: 'CIVIC ISSUE REPORTER',
    title: 'Civic Issue Reporter',
    subtitle: 'Pothole, Garbage & Streetlight Tracker',
    dashboard: 'Dashboard',
    community: 'Community',
    newComplaint: 'New Complaint',
    admin: 'Admin',
    logout: 'Logout',
    login: 'Login'
  },
  hi: {
    banner: 'CIVIC ISSUE REPORTER',
    title: 'सिविक इश्यू रिपोर्टर',
    subtitle: 'गड्ढा, कचरा और स्ट्रीटलाइट ट्रैकर',
    dashboard: 'डैशबोर्ड',
    community: 'समुदाय',
    newComplaint: 'नई शिकायत दर्ज करें',
    admin: 'प्रशासन',
    logout: 'लॉगआउट',
    login: 'लॉगिन'
  }
};

const UPGovHeader = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = (key) => translations[language][key] || key;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="bg-white text-blue-800 py-1.5 text-center text-xs md:text-sm font-bold border-b border-gray-200">
        {t('banner')}
      </div>
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center space-x-4 mb-2 md:mb-0 hover:opacity-90 transition-opacity">
            <div className="bg-white p-1.5 rounded-full shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">CIR</div>
            </div>
            <div className="border-l border-blue-400 pl-4">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">{t('title')}</h1>
              <p className="text-blue-200 text-xs md:text-sm tracking-wide uppercase font-medium">{t('subtitle')}</p>
            </div>
          </Link>
          <nav className="flex flex-wrap justify-center gap-2">
            {user && (
              <>
                <Link to="/dashboard" className="flex items-center space-x-2 px-3 py-2 bg-blue-900/50 rounded-lg hover:bg-blue-700 transition-colors border border-blue-700">
                  <FaHome className="text-sm" /><span className="text-sm">{t('dashboard')}</span>
                </Link>
                <Link to="/community" className="flex items-center space-x-2 px-3 py-2 bg-blue-900/50 rounded-lg hover:bg-blue-700 transition-colors border border-blue-700">
                  <FaBuilding className="text-sm" /><span className="text-sm">{t('community')}</span>
                </Link>
              </>
            )}
            {user?.role === 'citizen' && (
              <Link to="/new-complaint" className="flex items-center space-x-2 px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors font-bold shadow-lg">
                <span className="text-sm">{t('newComplaint')}</span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center space-x-2 px-3 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                <FaChartBar className="text-sm" /><span className="text-sm">{t('admin')}</span>
              </Link>
            )}
          </nav>
          <div className="flex items-center space-x-3">
            <button onClick={toggleLanguage} className="px-3 py-1 bg-blue-700 rounded-md text-sm font-medium hover:bg-blue-600 border border-blue-500">
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            {user ? (
              <>
                <div className="hidden lg:flex items-center space-x-2 bg-blue-900/80 px-3 py-1.5 rounded-lg border border-blue-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><FaUser className="text-blue-800 text-sm" /></div>
                  <div className="text-left"><p className="text-xs font-bold leading-none">{user.name}</p><p className="text-[10px] text-blue-300 uppercase mt-1">{user.role}</p></div>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-100 rounded-lg border border-red-500 transition-all">
                  <FaSignOutAlt className="text-sm" /><span className="text-sm font-medium">{t('logout')}</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-white text-blue-800 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md">{t('login')}</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UPGovHeader;
