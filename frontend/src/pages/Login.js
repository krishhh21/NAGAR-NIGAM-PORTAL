import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaBuilding, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'Civic Issue Reporter',
    subtitle: 'Pothole, Garbage & Streetlight Tracker',
    header: 'Login',
    prompt: 'Enter your account',
    selectRole: 'Select login type:',
    citizen: 'Citizen',
    department: 'Department',
    admin: 'Admin',
    email: 'Email address',
    emailPlaceholder: 'user@example.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Login',
    noAccount: "Don't have an account?",
    register: 'Register',
    error: {
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      passwordRequired: 'Password is required'
    },
    forgotComingSoon: 'Password reset coming soon!'
  },
  hi: {
    title: 'सिविक इश्यू रिपोर्टर',
    subtitle: 'गड्ढा, कचरा और स्ट्रीटलाइट ट्रैकर',
    header: 'लॉगिन करें',
    prompt: 'अपने खाते में प्रवेश करें',
    selectRole: 'लॉगिन प्रकार चुनें:',
    citizen: 'नागरिक',
    department: 'विभाग',
    admin: 'प्रशासन',
    email: 'ईमेल पता',
    emailPlaceholder: 'user@example.com',
    password: 'पासवर्ड',
    passwordPlaceholder: '••••••••',
    remember: 'याद रखें',
    forgot: 'पासवर्ड भूल गए?',
    submit: 'लॉगिन करें',
    noAccount: 'खाता नहीं है?',
    register: 'पंजीकरण करें',
    error: {
      emailRequired: 'ईमेल आवश्यक है',
      emailInvalid: 'ईमेल अमान्य है',
      passwordRequired: 'पासवर्ड आवश्यक है'
    },
    forgotComingSoon: 'पासवर्ड रीसेट जल्द ही उपलब्ध होगा!'
  }
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [activeRole, setActiveRole] = useState(null);
  const { login } = useAuth();
  const { language } = useLanguage();
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let val = translations[language];
    for (const k of keys) {
      if (val && val[k] !== undefined) val = val[k];
      else return key;
    }
    if (typeof val === 'string') {
      Object.keys(params).forEach(p => { val = val.replace(`{${p}}`, params[p]); });
    }
    return val;
  };
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t('error.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('error.emailInvalid');
    if (!formData.password) newErrors.password = t('error.passwordRequired');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) navigate('/dashboard');
  };

  const handleQuickSelect = (role) => {
    setActiveRole(role);
    let sampleEmail = '';
    switch(role) {
      case 'citizen': sampleEmail = 'citizen@example.com'; break;
      case 'department': sampleEmail = 'team@example.com'; break;
      case 'admin': sampleEmail = 'admin@example.com'; break;
      default: break;
    }
    setFormData({ email: sampleEmail, password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Product Banner */}
        <div className="bg-blue-800 text-white rounded-t-xl p-6 text-center mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-blue-200">{t('subtitle')}</p>
        </div>
        <div className="bg-white rounded-b-xl shadow-lg p-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('header')}</h2>
              <p className="text-gray-600">{t('prompt')}</p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">{t('selectRole')}</p>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => handleQuickSelect('citizen')} className={`p-3 rounded-lg border-2 flex flex-col items-center transition-all ${activeRole === 'citizen' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <FaUser className={`w-5 h-5 mb-1 ${activeRole === 'citizen' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-xs font-medium">{t('citizen')}</span>
                </button>
                <button type="button" onClick={() => handleQuickSelect('department')} className={`p-3 rounded-lg border-2 flex flex-col items-center transition-all ${activeRole === 'department' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <FaBuilding className={`w-5 h-5 mb-1 ${activeRole === 'department' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-xs font-medium">{t('department')}</span>
                </button>
                <button type="button" onClick={() => handleQuickSelect('admin')} className={`p-3 rounded-lg border-2 flex flex-col items-center transition-all ${activeRole === 'admin' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <FaUserTie className={`w-5 h-5 mb-1 ${activeRole === 'admin' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-xs font-medium">{t('admin')}</span>
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="h-5 w-5 text-gray-400" /></div>
                  <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`} placeholder={t('emailPlaceholder')} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-400" /></div>
                  <input id="password" name="password" type="password" autoComplete="current-password" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`} placeholder={t('passwordPlaceholder')} />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">{t('remember')}</label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">{t('forgot')}</Link>
                </div>
              </div>

              <div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">{t('submit')}</button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">{t('noAccount')} <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">{t('register')}</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
