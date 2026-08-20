import React, { useState } from 'react';
import { FaBullhorn, FaCalendar, FaNewspaper, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'Important Notices',
    subtitle: 'Updates for civic issue reports',
    important: 'Important',
    event: 'Event',
    info: 'Info',
    system: 'Notice System',
    howTo: 'How to receive notices',
    sms: 'Register for SMS alerts',
    email: 'Subscribe to email notifications',
    whatsapp: 'Join WhatsApp channel',
    board: 'View civic updates board',
    contact: 'Contact Information',
    officer: 'Support Desk: 9876543210',
    emailContact: 'Email: info@example.com',
    hours: 'Support hours: 10:00 AM to 5:00 PM',
    helpline: 'Toll-free helpline: 1800-XXX-XXXX',
    sample1: {
      title: 'Aadhaar Verification Campaign',
      desc: 'All citizens are requested to complete their Aadhaar verification by 31 March 2026.'
    },
    sample2: {
      title: 'Streetlight Repair Drive',
      desc: 'Streetlight repair requests are being prioritized this week.'
    },
    sample3: {
      title: 'Community Review Session',
      desc: 'A community issue review session will be held on 15 February 2026.'
    }
  },
  hi: {
    title: 'महत्वपूर्ण सूचनाएं',
    subtitle: 'नागरिक समस्या रिपोर्ट के अपडेट',
    important: 'महत्वपूर्ण',
    event: 'कार्यक्रम',
    info: 'सूचना',
    system: 'सूचना प्रणाली',
    howTo: 'सूचना प्राप्त करने के तरीके',
    sms: 'SMS अलर्ट के लिए रजिस्टर करें',
    email: 'ईमेल नोटिफिकेशन सब्सक्राइब करें',
    whatsapp: 'व्हाट्सएप चैनल ज्वाइन करें',
    board: 'सिविक अपडेट बोर्ड देखें',
    contact: 'संपर्क जानकारी',
    officer: 'सपोर्ट डेस्क: 9876543210',
    emailContact: 'ईमेल: info@example.com',
    hours: 'सहायता समय: सुबह 10:00 से शाम 5:00 तक',
    helpline: 'नि:शुल्क हेल्पलाइन: 1800-XXX-XXXX',
    sample1: {
      title: 'आधार सत्यापन अभियान',
      desc: 'सभी नागरिकों से अनुरोध है कि वे अपना आधार सत्यापन 31 मार्च 2026 तक पूरा कर लें।'
    },
    sample2: {
      title: 'स्ट्रीटलाइट मरम्मत अभियान',
      desc: 'इस सप्ताह स्ट्रीटलाइट मरम्मत अनुरोधों को प्राथमिकता दी जा रही है।'
    },
    sample3: {
      title: 'सामुदायिक समीक्षा सत्र',
      desc: 'सामुदायिक समस्या समीक्षा सत्र 15 फरवरी 2026 को आयोजित किया जाएगा।'
    }
  }
};

const Notices = () => {
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

  const [notices] = useState([
    { id: 1, titleKey: 'sample1.title', descKey: 'sample1.desc', date: '10 February 2026', type: 'important', icon: FaExclamationTriangle },
    { id: 2, titleKey: 'sample2.title', descKey: 'sample2.desc', date: '5 February 2026', type: 'info', icon: FaNewspaper },
    { id: 3, titleKey: 'sample3.title', descKey: 'sample3.desc', date: '1 February 2026', type: 'event', icon: FaCalendar }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-up-gov-blue to-up-gov-dark-blue rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-lg"><FaBullhorn className="text-2xl text-up-gov-blue" /></div>
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-up-gov-light-blue">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-up-gov-blue">
            <div className="flex items-start space-x-3">
              <div className={`p-3 rounded-lg ${
                notice.type === 'important' ? 'bg-red-100 text-red-600' :
                notice.type === 'event' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <notice.icon className="text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{t(notice.titleKey)}</h3>
                <p className="text-gray-600 text-sm mb-3">{t(notice.descKey)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{notice.date}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    notice.type === 'important' ? 'bg-red-100 text-red-800' :
                    notice.type === 'event' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notice.type === 'important' ? t('important') : notice.type === 'event' ? t('event') : t('info')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Information Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-up-gov-blue">{t('system')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold mb-2">{t('howTo')}</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('sms')}</li>
              <li>• {t('email')}</li>
              <li>• {t('whatsapp')}</li>
              <li>• {t('board')}</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold mb-2">{t('contact')}</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('officer')}</li>
              <li>• {t('emailContact')}</li>
              <li>• {t('hours')}</li>
              <li>• {t('helpline')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notices;
