import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClipboardList, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUser,
  FaBuilding,
  FaUserTie,
  FaChartLine,
  FaThumbsUp
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/axios';
import StatCard from '../components/StatCard';
import ComplaintList from '../components/ComplaintList';

const translations = {
  en: {
    role: {
      citizen: 'Citizen',
      department: 'Department',
      admin: 'Admin'
    },
    citizen: {
      title: 'Citizen Dashboard',
      desc: 'Register complaints and track their status',
      quickNew: 'New Complaint',
      quickNewDesc: 'Register a new complaint',
      quickMy: 'My Complaints',
      quickMyDesc: 'View all your complaints',
      quickCommunity: 'Community',
      quickCommunityDesc: 'View and engage with community complaints',
      quickStatus: 'Check Status',
      quickStatusDesc: 'Ongoing complaints',
      feature1: 'Register complaint',
      feature2: 'Real-time status',
      feature3: 'Update notifications',
      feature4: 'Rate after resolution'
    },
    department: {
      title: 'Department Dashboard',
      desc: 'Manage citizen complaints',
      quickAssigned: 'Assigned Complaints',
      quickAssignedDesc: 'View assigned complaints',
      quickPending: 'Pending Review',
      quickPendingDesc: 'New complaints',
      quickResolved: 'Resolved',
      quickResolvedDesc: 'Completed complaints',
      feature1: 'Department-specific complaints',
      feature2: 'Update complaint status',
      feature3: 'Official comments',
      feature4: 'Resolution evidence'
    },
    admin: {
      title: 'Admin Dashboard',
      desc: 'Monitor system performance',
      quickNew: 'System Analytics',
      quickNewDesc: 'Detailed reports',
      quickMy: 'Department Management',
      quickMyDesc: 'Add/edit departments',
      quickStatus: 'User Management',
      quickStatusDesc: 'Manage user accounts',
      feature1: 'All system complaints',
      feature2: 'Department performance',
      feature3: 'User account management',
      feature4: 'System reports'
    },
    welcome: 'Welcome, {name}!',
    email: 'Email: {email}',
    accountType: 'Account Type',
    status: 'Status: Active',
    stats: {
      totalUsers: 'Total Users',
      departments: 'Departments',
      totalComplaints: 'Total Complaints',
      avgResolution: 'Avg. Resolution',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      trendUsers: '+5% this month',
      trendDepts: 'All active',
      trendComplaints: '+12% total',
      trendAvg: '0.5d faster'
    },
    quickActions: 'Quick Actions',
    recentActivity: 'Recent System Activity',
    recentComplaints: 'Recent Complaints',
    features: 'Dashboard Features',
    tips: 'Quick Tips',
    tip1: 'Take clear photos in daylight.',
    tip2: 'Tag the correct department for faster routing.',
    tip3: 'Keep your contact details updated for notifications.',
    viewAll: 'View All'
  },
  hi: {
    role: {
      citizen: 'नागरिक',
      department: 'विभाग',
      admin: 'प्रशासन'
    },
    citizen: {
      title: 'नागरिक डैशबोर्ड',
      desc: 'शिकायत दर्ज करें और उनकी स्थिति देखें',
      quickNew: 'नई शिकायत',
      quickNewDesc: 'नई शिकायत दर्ज करें',
      quickMy: 'मेरी शिकायतें',
      quickMyDesc: 'अपनी सभी शिकायतें देखें',
      quickCommunity: 'समुदाय',
      quickCommunityDesc: 'समुदाय की शिकायतों को देखें और जुड़ें',
      quickStatus: 'स्थिति देखें',
      quickStatusDesc: 'चल रही शिकायतें',
      feature1: 'शिकायत दर्ज करें',
      feature2: 'वास्तविक समय स्थिति',
      feature3: 'अपडेट सूचनाएं',
      feature4: 'हल होने पर रेट करें'
    },
    department: {
      title: 'विभाग डैशबोर्ड',
      desc: 'नागरिक शिकायतें प्रबंधित करें',
      quickAssigned: 'असाइंड शिकायतें',
      quickAssignedDesc: 'असाइंड शिकायतें देखें',
      quickPending: 'लंबित समीक्षा',
      quickPendingDesc: 'नई शिकायतें',
      quickResolved: 'हल की गई',
      quickResolvedDesc: 'पूरी हुई शिकायतें',
      feature1: 'विभाग विशेष शिकायतें',
      feature2: 'शिकायत स्थिति अपडेट',
      feature3: 'आधिकारिक टिप्पणियाँ',
      feature4: 'समाधान प्रमाण'
    },
    admin: {
      title: 'प्रशासन डैशबोर्ड',
      desc: 'सिस्टम प्रदर्शन मॉनिटर करें',
      quickNew: 'सिस्टम एनालिटिक्स',
      quickNewDesc: 'विस्तृत रिपोर्ट्स',
      quickMy: 'विभाग प्रबंधन',
      quickMyDesc: 'विभाग जोड़ें/संपादित करें',
      quickStatus: 'यूजर प्रबंधन',
      quickStatusDesc: 'यूजर खाते प्रबंधित करें',
      feature1: 'सभी सिस्टम शिकायतें',
      feature2: 'विभाग प्रदर्शन',
      feature3: 'यूजर खाते प्रबंधन',
      feature4: 'सिस्टम रिपोर्ट्स'
    },
    welcome: 'स्वागत है, {name}!',
    email: 'ईमेल: {email}',
    accountType: 'खाता प्रकार',
    status: 'स्थिति: सक्रिय',
    stats: {
      totalUsers: 'कुल यूजर्स',
      departments: 'विभाग',
      totalComplaints: 'कुल शिकायतें',
      avgResolution: 'औसत समाधान',
      pending: 'लंबित',
      inProgress: 'प्रगति में',
      resolved: 'हल की गई',
      trendUsers: '+5% इस महीने',
      trendDepts: 'सभी सक्रिय',
      trendComplaints: '+12% कुल',
      trendAvg: '0.5d तेज'
    },
    quickActions: 'त्वरित कार्य',
    recentActivity: 'हाल की सिस्टम गतिविधि',
    recentComplaints: 'हाल की शिकायतें',
    features: 'डैशबोर्ड सुविधाएं',
    tips: 'त्वरित सुझाव',
    tip1: 'फोटो स्पष्ट और दिन के उजाले में लें।',
    tip2: 'तेज़ रूटिंग के लिए सही विभाग टैग करें।',
    tip3: 'सूचनाओं के लिए अपना संपर्क विवरण अपडेट रखें।',
    viewAll: 'सभी देखें'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
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

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/complaints');
      const complaints = response.data;
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        recent: complaints.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = (role) => {
    if (role === 'citizen') return [
      {
        to: '/new-complaint',
        labelKey: 'citizen.quickNew',
        descKey: 'citizen.quickNewDesc',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600'
      },
      {
        to: '/complaints',
        labelKey: 'citizen.quickMy',
        descKey: 'citizen.quickMyDesc',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-600'
      },
      {
        to: '/community',
        labelKey: 'citizen.quickCommunity',
        descKey: 'citizen.quickCommunityDesc',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-600'
      },
      {
        to: '/complaints?status=In Progress',
        labelKey: 'citizen.quickStatus',
        descKey: 'citizen.quickStatusDesc',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600'
      },
    ];

    if (role === 'department') return [
      {
        to: '/complaints?status=In Progress',
        labelKey: 'department.quickAssigned',
        descKey: 'department.quickAssignedDesc',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-600'
      },
      {
        to: '/complaints?status=Pending',
        labelKey: 'department.quickPending',
        descKey: 'department.quickPendingDesc',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-600'
      },
      {
        to: '/complaints?status=Resolved',
        labelKey: 'department.quickResolved',
        descKey: 'department.quickResolvedDesc',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600'
      },
    ];

    // admin
    return [
      {
        to: '/admin/analytics',
        labelKey: 'admin.quickNew',
        descKey: 'admin.quickNewDesc',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-600'
      },
      {
        to: '/admin/departments',
        labelKey: 'admin.quickMy',
        descKey: 'admin.quickMyDesc',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600'
      },
      {
        to: '/admin/users',
        labelKey: 'admin.quickStatus',
        descKey: 'admin.quickStatusDesc',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600'
      },
    ];
  };

  const getRoleContent = () => {
    const role = user?.role || 'citizen';
    return {
      titleKey: `${role}.title`,
      descKey: `${role}.desc`,
      icon: role === 'citizen'
        ? <FaUser className="w-6 h-6 text-white" />
        : role === 'department'
          ? <FaBuilding className="w-6 h-6 text-white" />
          : <FaUserTie className="w-6 h-6 text-white" />,
      gradientBg: role === 'citizen'
        ? 'from-blue-600 to-blue-800'
        : role === 'department'
          ? 'from-indigo-600 to-indigo-800'
          : 'from-green-600 to-green-800',
      featureDot: role === 'citizen'
        ? 'bg-blue-500'
        : role === 'department'
          ? 'bg-indigo-500'
          : 'bg-green-500',
      quickActions: getQuickActions(role),
      features: [
        `${role}.feature1`,
        `${role}.feature2`,
        `${role}.feature3`,
        `${role}.feature4`
      ]
    };
  };

  const content = getRoleContent();
  const roleLabel = t(`role.${user?.role || 'citizen'}`).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">

      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${content.gradientBg} rounded-xl p-8 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                {content.icon}
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                  {roleLabel}
                </span>
                <h1 className="text-3xl font-bold mt-2">{t(content.titleKey)}</h1>
              </div>
            </div>
            <p className="text-white text-opacity-90 max-w-xl">{t(content.descKey)}</p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-white text-opacity-70" />
                <span className="font-medium text-lg text-white">
                  {t('welcome', { name: user?.name })}
                </span>
              </div>
              <span className="text-sm bg-black bg-opacity-10 px-3 py-1 rounded-md text-white">
                {t('email', { email: user?.email })}
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg border border-white border-opacity-20">
              <p className="text-sm opacity-80">{t('accountType')}</p>
              <p className="text-2xl font-bold">{roleLabel}</p>
              <p className="text-sm mt-2 opacity-80 font-mono">{t('status')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' ? (
          <>
            <StatCard title={t('stats.totalUsers')} value="1,250" icon={<FaUser />} color="purple" trend={t('stats.trendUsers')} />
            <StatCard title={t('stats.departments')} value="8" icon={<FaBuilding />} color="blue" trend={t('stats.trendDepts')} />
            <StatCard title={t('stats.totalComplaints')} value={stats.total} icon={<FaClipboardList />} color="green" trend={t('stats.trendComplaints')} />
            <StatCard title={t('stats.avgResolution')} value="3.2" icon={<FaChartLine />} color="orange" trend={t('stats.trendAvg')} />
          </>
        ) : (
          <>
            <StatCard title={t('stats.totalComplaints')} value={stats.total} icon={<FaClipboardList />} color="blue" />
            <StatCard title={t('stats.pending')} value={stats.pending} icon={<FaClock />} color="yellow" />
            <StatCard title={t('stats.inProgress')} value={stats.inProgress} icon={<FaExclamationTriangle />} color="orange" />
            <StatCard title={t('stats.resolved')} value={stats.resolved} icon={<FaCheckCircle />} color="green" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className={`p-6 rounded-lg border-2 ${action.bgColor} ${action.borderColor} hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-lg ${action.textColor}`}>{t(action.labelKey)}</h3>
                  <p className="text-gray-600 text-sm mt-1">{t(action.descKey)}</p>
                </div>
                <FaArrowRight className={`${action.textColor} group-hover:translate-x-2 transition-transform`} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Lists and Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {user?.role === 'admin' ? t('recentActivity') : t('recentComplaints')}
              </h2>
              <Link
                to="/complaints"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>{t('viewAll')}</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ComplaintList complaints={stats.recent} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
              <span className={`p-2 rounded-lg ${content.featureDot} text-white`}>
                <FaChartLine className="w-4 h-4" />
              </span>
              <span>{t('features')}</span>
            </h3>
            <ul className="space-y-3">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${content.featureDot}`}></div>
                  <span className="text-sm text-gray-700">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
              <FaThumbsUp className="text-green-600" />
              <span>{t('tips')}</span>
            </h3>
            <div className="space-y-3 text-gray-600">
              <p className="text-sm leading-relaxed">• {t('tip1')}</p>
              <p className="text-sm leading-relaxed">• {t('tip2')}</p>
              <p className="text-sm leading-relaxed">• {t('tip3')}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;