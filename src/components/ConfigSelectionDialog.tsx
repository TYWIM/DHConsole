import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    TextField,
    Box,
    Stack
} from '@mui/material';
import { UploadFile, History, Key } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';

interface ConfigSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onSelectFile: () => void;
    onUseRecent: () => void;
    onSaveManualKey: (key: string, port: number) => void;
    hasRecentConfig: boolean;
}

const ConfigSelectionDialog = ({
    open,
    onClose,
    onSelectFile,
    onUseRecent,
    onSaveManualKey,
    hasRecentConfig
}: ConfigSelectionDialogProps) => {
    const { t } = useTranslation();
    const [showManualInput, setShowManualInput] = React.useState(false);
    const [manualKey, setManualKey] = React.useState('');
    const [port, setPort] = React.useState('443');

    const handleSaveManualKey = () => {
        const portNumber = parseInt(port, 10);
        onSaveManualKey(manualKey, portNumber);
    };

    const handleClose = () => {
        setShowManualInput(false);
        setManualKey('');
        setPort('443');
        onClose();
    };

    const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers and empty string
        if (value === '' || /^\d+$/.test(value)) {
            const num = parseInt(value, 10);
            if (!value || (num >= 1 && num <= 65535)) {
                setPort(value);
            }
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('server.configDialog.title')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('server.configDialog.description')}
                </Typography>
                <List>
                    {hasRecentConfig && (
                        <ListItem
                            disablePadding
                            sx={{
                                mb: 2,
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                borderRadius: 1,
                                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            <ListItemButton
                                onClick={onUseRecent}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <History />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('server.configDialog.useRecent')}
                                    secondary={t('server.configDialog.useRecentDesc')}
                                    primaryTypographyProps={{
                                        fontWeight: 'bold'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}
                    <ListItem disablePadding>
                        <ListItemButton onClick={onSelectFile}>
                            <ListItemIcon>
                                <UploadFile />
                            </ListItemIcon>
                            <ListItemText
                                primary={t('server.configDialog.selectFile')}
                                secondary={t('server.configDialog.selectFileDesc')}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setShowManualInput(true)}>
                            <ListItemIcon>
                                <Key />
                            </ListItemIcon>
                            <ListItemText
                                primary={t('server.configDialog.enterKey')}
                                secondary={t('server.configDialog.enterKeyDesc')}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
                {showManualInput && (
                    <Box sx={{ mt: 2 }}>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label={t('server.configDialog.adminKeyInput')}
                                value={manualKey}
                                onChange={(e) => setManualKey(e.target.value)}
                                autoFocus
                            />
                            <TextField
                                label={t('server.configDialog.portInput')}
                                value={port}
                                onChange={handlePortChange}
                                type="text"
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                }}
                            />
                        </Stack>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('cancel')}</Button>
                {showManualInput && (
                    <Button
                        onClick={handleSaveManualKey}
                        disabled={!manualKey.trim()}
                    >
                        {t('save')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ConfigSelectionDialog; 