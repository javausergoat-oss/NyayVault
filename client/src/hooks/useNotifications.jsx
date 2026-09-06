import React, { createContext, useContext, useState, useEffect } from 'react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    titleEn: 'Evidence Verified',
    titleHi: 'साक्ष्य सत्यापित',
    messageEn: 'FIR_0045.pdf cryptographic SHA-256 integrity match confirmed.',
    messageHi: 'FIR_0045.pdf की क्रिप्टोग्राफिक SHA-256 अखंडता सत्यापित हुई।',
    timeEn: '5m ago',
    timeHi: '5 मिनट पहले',
    type: 'success',
    read: false,
    caseId: 'CR-2026-0045'
  },
  {
    id: 'notif-2',
    titleEn: 'New Exhibit Uploaded',
    titleHi: 'नया साक्ष्य अपलोड',
    messageEn: 'CCTV_12.mp4 added to case CR-2026-0045 by Investigator POL-1.',
    messageHi: 'जांच अधिकारी POL-1 द्वारा केस CR-2026-0045 में CCTV_12.mp4 जोड़ा गया।',
    timeEn: '1h ago',
    timeHi: '1 घंटा पहले',
    type: 'info',
    read: false,
    caseId: 'CR-2026-0045'
  },
  {
    id: 'notif-3',
    titleEn: 'Contradiction Detected',
    titleHi: 'विसंगति चिह्नित',
    messageEn: 'AI Cross-Radar flagged timestamp mismatch between FIR and Witness #2.',
    messageHi: 'एआई क्रॉस-रडार ने प्राथमिकी और गवाह #2 के समय में विरोधाभास पाया।',
    timeEn: '2h ago',
    timeHi: '2 घंटे पहले',
    type: 'warning',
    read: false,
    caseId: 'CR-2026-0001'
  },
  {
    id: 'notif-4',
    titleEn: 'Custody Chain Updated',
    titleHi: 'कस्टडी श्रृंखला अपडेट',
    messageEn: 'Officer POL-104 accessed Forensic_Report.pdf on secure ledger.',
    messageHi: 'अधिकारी POL-104 ने सुरक्षित लेज़र पर Forensic_Report.pdf देखी।',
    timeEn: 'Yesterday',
    timeHi: 'कल',
    type: 'neutral',
    read: true,
    caseId: 'CR-2026-0045'
  }
];

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('sih_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sih_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = ({ titleEn, titleHi, messageEn, messageHi, type = 'info', caseId = null }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      titleEn,
      titleHi: titleHi || titleEn,
      messageEn,
      messageHi: messageHi || messageEn,
      timeEn: 'Just now',
      timeHi: 'अभी',
      type,
      read: false,
      caseId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
      addNotification: () => {}
    };
  }
  return context;
};
