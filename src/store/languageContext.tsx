import React, { createContext, useContext, useState, ReactNode } from 'react';
import i18n, { LANGUAGE_STORAGE_KEY } from '../i18n';

// Define the shape of the context state
interface LanguageContextState {
    language: string;
    setLanguage: (language: string) => void;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextState | undefined>(undefined);

// Create a provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => {
        // Try to get the language from localStorage, fallback to 'zh_CN'
        try {
            const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            return storedLanguage || 'zh_CN'; // 修改默认语言为中文
        } catch (error) {
            // In case of any localStorage errors, fallback to 'zh_CN'
            console.warn('Failed to read language preference from localStorage:', error);
            return 'zh_CN'; // 修改默认语言为中文
        }
    });

    const setLanguage = (newLanguage: string) => {
        setLanguageState(newLanguage);
        i18n.changeLanguage(newLanguage);
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
        } catch (error) {
            console.warn('Failed to save language preference to localStorage:', error);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to use the LanguageContext
export const useLanguageContext = (): LanguageContextState => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguageContext must be used within a LanguageProvider');
    }
    return context;
};
