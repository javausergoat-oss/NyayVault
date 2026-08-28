import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    'SIH Vault': 'SIH Vault',
    'Evidence System': 'Evidence System',
    'Cross-Case Radar': 'Cross-Case Radar',
    'Dashboard': 'Dashboard',
    'Cases': 'Cases',
    'Total Cases': 'Total Cases',
    'Total Evidence Logged': 'Total Evidence Logged',
    'Integrity Scans': 'Integrity Scans',
    'Recent Activity': 'Recent Activity',
    'Evidence Vault': 'Evidence Vault',
    'Smart Search': 'Smart Search',
    'AI Assistant': 'AI Assistant',
    'Timeline': 'Timeline',
    'Summary': 'Summary',
    'Chain of Custody': 'Chain of Custody',
    'Complaints': 'Complaints',
    'Verify Integrity': 'Verify Integrity',
    'View & Intel': 'View & Intel'
  },
  hi: {
    'SIH Vault': 'SIH वॉल्ट',
    'Evidence System': 'साक्ष्य प्रणाली',
    'Cross-Case Radar': 'क्रॉस-केस रडार',
    'Dashboard': 'डैशबोर्ड',
    'Cases': 'मामले',
    'Total Cases': 'कुल मामले',
    'Total Evidence Logged': 'कुल दर्ज साक्ष्य',
    'Integrity Scans': 'अखंडता स्कैन',
    'Recent Activity': 'हाल की गतिविधि',
    'Evidence Vault': 'साक्ष्य वॉल्ट',
    'Smart Search': 'स्मार्ट खोज',
    'AI Assistant': 'एआई सहायक',
    'Timeline': 'समय-रेखा',
    'Summary': 'सारांश',
    'Chain of Custody': 'कस्टडी की श्रृंखला',
    'Complaints': 'शिकायतें',
    'Verify Integrity': 'सत्यापित करें',
    'View & Intel': 'देखें और विश्लेषण'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sih_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sih_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a dummy translation function if used outside provider
    return { language: 'en', toggleLanguage: () => {}, t: (k) => k };
  }
  return context;
};
