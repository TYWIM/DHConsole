import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import zhCNTranslation from './locales/zh_CN.json';
import zhHKTranslation from './locales/zh_HK.json';
import jaTranslation from './locales/ja.json';
import koTranslation from './locales/ko.json';
import frTranslation from './locales/fr.json';
import esTranslation from './locales/es.json';
import idTranslation from './locales/id.json';
import ptTranslation from './locales/pt.json';
import ruTranslation from './locales/ru.json';
import thTranslation from './locales/th.json';
import viTranslation from './locales/vi.json';

export const LANGUAGE_STORAGE_KEY = 'app-language-preference';
const getInitialLanguage = () => {
    try {
        return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    } catch (error) {
        console.warn('Failed to read language preference from localStorage:', error);
        return 'en';
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            zh_CN: { translation: zhCNTranslation },
            zh_HK: { translation: zhHKTranslation },
            ja: { translation: jaTranslation },
            ko: { translation: koTranslation },
            fr: { translation: frTranslation },
            es: { translation: esTranslation },
            id: { translation: idTranslation },
            pt: { translation: ptTranslation },
            ru: { translation: ruTranslation },
            th: { translation: thTranslation },
            vi: { translation: viTranslation },
        },
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        defaultNS: 'translation',
    });

export default i18n; 