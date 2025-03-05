import React, { useState } from 'react';
import { useLanguageContext } from '../store/languageContext';
import { Button, Menu, MenuItem, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'zh_CN', name: '简体中文', flag: 'cn' },
    { code: 'zh_HK', name: '繁體中文', flag: 'cn' },
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'ja', name: '日本語', flag: 'jp' },
    { code: 'ko', name: '한국어', flag: 'kr' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'id', name: 'Indonesia', flag: 'id' },
    { code: 'pt', name: 'Português', flag: 'pt' },
    { code: 'ru', name: 'Русский', flag: 'ru' },
    { code: 'th', name: 'ไทย', flag: 'th' },
    { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
];

const LanguageSidebarFooter: React.FC<SidebarFooterProps> = ({ mini }: SidebarFooterProps) => {
    const { language, setLanguage } = useLanguageContext();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { i18n } = useTranslation();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (langCode: string) => {
        setLanguage(langCode);
        console.log('Setting language to', langCode);
        handleClose();
    };

    const flagUrl = (countryCode: string) => `https://flagcdn.com/24x18/${countryCode}.png`;
    const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button onClick={handleClick} sx={{ padding: 1, borderRadius: '6px' }} >
                <img src={flagUrl(currentLanguage.flag || 'us')} alt={currentLanguage.name} width="24" height="18" />
                {mini ? null : (
                    <Typography variant="body2" sx={{ marginLeft: 1, fontFamily: 'Noto Sans, sans-serif', color: "text.primary" }}>
                        {currentLanguage.name}
                    </Typography>
                )}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                    '& .MuiPaper-root': {
                        width: '300px',
                        padding: 1,
                        borderRadius: '6px',
                        mt: -4,
                    },
                }}
            >
                <Grid container spacing={1}>
                    {languages.map((lang) => (
                        <Grid key={lang.code} size={6}>
                            <MenuItem onClick={() => handleMenuItemClick(lang.code)} sx={{ borderRadius: '6px' }} >
                                <img src={flagUrl(lang.flag)} alt={lang.name} width="24" height="18" />
                                <Typography variant="body2" sx={{ marginLeft: 1, fontFamily: 'Noto Sans, sans-serif' }}>
                                    {lang.name}
                                </Typography>
                            </MenuItem>
                        </Grid>
                    ))}
                </Grid>
            </Menu>
        </Box>
    );
};

export default LanguageSidebarFooter;
