import React, { createContext, useContext, useState } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn';

export interface AppContextType {
  savedStandards: string[];
  toggleSaveStandard: (id: string) => void;
  isStandardSaved: (id: string) => boolean;
  selectedLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  evidenceMode: boolean;
  setEvidenceMode: (enabled: boolean) => void;
  unreadAlertsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedStandards, setSavedStandards] = useState<string[]>([
    'IS-10322-5-8',
    'IS-2347'
  ]);
  const [selectedLanguage, setLanguage] = useState<SupportedLanguage>('en');
  const [userRole, setUserRole] = useState<string>('Manufacturer');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [evidenceMode, setEvidenceMode] = useState<boolean>(true);
  const [unreadAlertsCount] = useState<number>(2);

  const toggleSaveStandard = (id: string) => {
    setSavedStandards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isStandardSaved = (id: string) => savedStandards.includes(id);

  return (
    <AppContext.Provider
      value={{
        savedStandards,
        toggleSaveStandard,
        isStandardSaved,
        selectedLanguage,
        setLanguage,
        userRole,
        setUserRole,
        isSearchModalOpen,
        setIsSearchModalOpen,
        evidenceMode,
        setEvidenceMode,
        unreadAlertsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
