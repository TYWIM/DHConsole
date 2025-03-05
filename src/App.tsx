import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TerminalIcon from '@mui/icons-material/Terminal';
import MapIcon from '@mui/icons-material/Map';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import type { Navigation } from '@toolpad/core';
import { lightTheme, darkTheme } from './theme';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import { LanguageProvider } from './store/languageContext';

function App() {
  const { t } = useTranslation();

  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: t('navigation.header'),
    },
    {
      segment: 'characters',
      title: t('navigation.segments.characters'),
      icon: <PeopleIcon />,
    },
    {
      segment: 'missions',
      title: t('navigation.segments.missions'),
      icon: <AssignmentIcon />,
    },
    {
      segment: 'scene',
      title: t('navigation.segments.scene'),
      icon: <MapIcon />,
    },
    {
      segment: 'inventory',
      title: t('navigation.segments.inventory'),
      icon: <InventoryIcon />,
    },
    {
      segment: 'account',
      title: t('navigation.segments.account'),
      icon: <AccountCircleIcon />,
    },
    {
      segment: 'command',
      title: t('navigation.segments.command'),
      icon: <TerminalIcon />,
    },
  ];

  const BRANDING = {
    logo: <img src="/DHConsole/logo.svg" alt="DHConsole" width="48" height="48" />,
    title: t('navigation.title'),
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} theme={{ light: lightTheme, dark: darkTheme }}>
          <Outlet />
        </ReactRouterAppProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}

export default App;
