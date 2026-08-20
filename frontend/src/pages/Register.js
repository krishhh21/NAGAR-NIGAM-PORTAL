import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaLock, FaUserShield, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'Citizen Registration',
    subtitle: 'Civic Issue Reporter - Online Registration',
    name: 'Full Name *',
    namePlaceholder: 'Rajesh Kumar',
    email: 'Email Address *',
    emailPlaceholder: 'user@example.com',
    phone: 'Mobile Number *',
    phonePlaceholder: '9876543210',
    aadhaar: 'Aadhaar Number',
    aadhaarPlaceholder: '1234 5678 9012',
    address: 'Complete Address *',
    addressPlaceholder: 'House No., Street, Area, City',
    password: 'Password *',
    passwordPlaceholder: '••••••••',
    confirmPassword: 'Confirm Password *',
    confirmPasswordPlaceholder: '••••••••',
    agree: 'I agree to the following terms:',
    term1: 'I have provided correct information',
    term2: 'I will follow the community reporting guidelines',
    term3: 'My Aadhaar number may be used for verification',
    back: 'Back',
    submit: 'Register',
    alreadyRegistered: 'Already registered?',
    login: 'Login',
    error: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Phone number must be 10 digits',
      aadhaarRequired: 'Aadhaar number is required',
      aadhaarInvalid: 'Aadhaar number must be 12 digits',
      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 6 characters',
      confirmRequired: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match'
    }
  },
  hi: {
    title: 'नागरिक पंजीकरण',
    subtitle: 'सिविक इश्यू रिपोर्टर - ऑनलाइन पंजीकरण',
    name: 'पूरा नाम *',
    namePlaceholder: 'राजेश कुमार',
    email: 'ईमेल पता *',
    emailPlaceholder: 'user@example.com',
    phone: 'मोबाइल नंबर *',
    phonePlaceholder: '9876543210',
    aadhaar: 'आधार नंबर *',
    aadhaarPlaceholder: '1234 5678 9012',
    address: 'पूरा पता *',
    addressPlaceholder: 'मकान नंबर, सड़क, क्षेत्र, शहर',
    password: 'पासवर्ड *',
    passwordPlaceholder: '••••••••',
    confirmPassword: 'पासवर्ड की पुष्टि करें *',
    confirmPasswordPlaceholder: '••••••••',
    agree: 'मैं निम्नलिखित शर्तों से सहमत हूं:',
    term1: 'मैंने सही जानकारी प्रदान की है',
    term2: 'मैं सामुदायिक रिपोर्टिंग दिशानिर्देशों का पालन करूंगा',
    term3: 'मेरा आधार नंबर सत्यापन के लिए उपयोग किया जा सकता है',
    back: 'पीछे जाएं',
    submit: 'पंजीकरण करें',
    alreadyRegistered: 'पहले से ही पंजीकृत हैं?',
    login: 'लॉगिन करें',
    error: {
      nameRequired: 'नाम आवश्यक है',
      emailRequired: 'ईमेल आवश्यक है',
      emailInvalid: 'ईमेल अमान्य है',
      phoneRequired: 'फोन नंबर आवश्यक है',
      phoneInvalid: 'फोन नंबर 10 अंकों का होना चाहिए',
      aadhaarRequired: 'आधार नंबर आवश्यक है',
      aadhaarInvalid: 'आधार नंबर 12 अंकों का होना चाहिए',
      passwordRequired: 'पासवर्ड आवश्यक है',
      passwordLength: 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए',
      confirmRequired: 'कृपया पासवर्ड की पुष्टि करें',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते'
    }
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', aadhaar: '', password: '', confirmPassword: '', role: 'citizen'
  });
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const { language } = useLanguage();
  const t = (key) => {
    const keys = key.split('.');
    let val = translations[language];
    for (const k of keys) {
      if (val && val[k] !== undefined) val = val[k];
      else return key;
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
    if (!formData.name.trim()) newErrors.name = t('error.nameRequired');
    if (!formData.email) newErrors.email = t('error.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('error.emailInvalid');
    if (!formData.phone) newErrors.phone = t('error.phoneRequired');
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = t('error.phoneInvalid');
    if (!formData.address.trim()) newErrors.address = t('error.addressRequired');
    if (!formData.aadhaar) newErrors.aadhaar = t('error.aadhaarRequired');
    else if (!/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = t('error.aadhaarInvalid');
    if (!formData.password) newErrors.password = t('error.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('error.passwordLength');
    if (!formData.confirmPassword) newErrors.confirmPassword = t('error.confirmRequired');
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('error.passwordMismatch');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-up-gov-blue to-up-gov-dark-blue p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-lg"><FaUserShield className="text-2xl text-up-gov-blue" /></div>
            <div><h1 className="text-2xl font-bold">{t('title')}</h1><p className="text-up-gov-light-blue">{t('subtitle')}</p></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('name')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="h-5 w-5 text-gray-400" /></div>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('namePlaceholder')} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="h-5 w-5 text-gray-400" /></div>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('emailPlaceholder')} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('phone')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaPhone className="h-5 w-5 text-gray-400" /></div>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('phonePlaceholder')} maxLength="10" />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('aadhaar')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaIdCard className="h-5 w-5 text-gray-400" /></div>
                <input name="aadhaar" type="text" value={formData.aadhaar} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.aadhaar ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('aadhaarPlaceholder')} maxLength="12" />
              </div>
              {errors.aadhaar && <p className="mt-1 text-sm text-red-600">{errors.aadhaar}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('address')}</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none"><FaHome className="h-5 w-5 text-gray-400" /></div>
                <textarea name="address" rows="3" value={formData.address} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('addressPlaceholder')} />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-400" /></div>
                <input name="password" type="password" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('passwordPlaceholder')} />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('confirmPassword')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-400" /></div>
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-up-gov-blue ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder={t('confirmPasswordPlaceholder')} />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <input id="terms" name="terms" type="checkbox" className="mt-1 h-4 w-4 text-up-gov-blue focus:ring-up-gov-blue border-gray-300 rounded cursor-pointer" required />
              <div>
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">{t('agree')}</label>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>• {t('term1')}</li>
                  <li>• {t('term2')}</li>
                  <li>• {t('term3')}</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Link to="/login" className="btn-up-gov-secondary mr-4">{t('back')}</Link>
            <button type="submit" className="btn-up-gov py-3 px-8">{t('submit')}</button>
          </div>
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-gray-600">{t('alreadyRegistered')} <Link to="/login" className="ml-2 text-up-gov-blue font-bold hover:underline">{t('login')}</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
