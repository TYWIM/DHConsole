import React, { useState } from 'react';
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
    Stack,
    FormControlLabel,
    Switch
} from '@mui/material';
import { UploadFile, History, Key, Public } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ConfigSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onSelectFile: () => void;
    onUseRecent: () => void;
    onSaveManualKey: (adminKey: string, port: number) => void;
    hasRecentConfig: boolean;
    // 添加新的props
    isRemoteConnection?: boolean;
    remoteHost?: string;
    onRemoteToggle?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoteHostChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    useSSL?: boolean;
    onSSLToggle?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ConfigSelectionDialog({
    open,
    onClose,
    onSelectFile,
    onUseRecent,
    onSaveManualKey,
    hasRecentConfig,
    isRemoteConnection = false,
    remoteHost = '',
    onRemoteToggle,
    onRemoteHostChange,
    useSSL = false,
    onSSLToggle
}: ConfigSelectionDialogProps) {
    const { t } = useTranslation();
    const [adminKey, setAdminKey] = useState('');
    const [port, setPort] = useState('443');

    const handleSave = () => {
        onSaveManualKey(adminKey, parseInt(port, 10));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('server.configDialog.title')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {t('server.configDialog.description')}
                </Typography>

                <List>
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

                    {hasRecentConfig && (
                        <ListItem disablePadding>
                            <ListItemButton onClick={onUseRecent}>
                                <ListItemIcon>
                                    <History />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('server.configDialog.useRecent')}
                                    secondary={t('server.configDialog.useRecentDesc')}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', mt: 2 }}>
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1, display: 'inline-flex' }}>
                            <Key />
                        </ListItemIcon>
                        <ListItemText
                            primary={t('server.configDialog.enterKey')}
                            secondary={t('server.configDialog.enterKeyDesc')}
                        />

                        {/* 远程连接选项 */}
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isRemoteConnection}
                                        onChange={onRemoteToggle}
                                        color="primary"
                                    />
                                }
                                label={t('server.configDialog.remoteConnection')}
                            />
                            
                            {isRemoteConnection && (
                                <>
                                    <TextField
                                        label={t('server.configDialog.remoteHost')}
                                        value={remoteHost}
                                        onChange={onRemoteHostChange}
                                        fullWidth
                                        margin="normal"
                                        helperText={t('server.configDialog.remoteDesc')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={useSSL}
                                                onChange={onSSLToggle}
                                                color="primary"
                                            />
                                        }
                                        label={t('server.configDialog.useSSL')}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        {t('server.configDialog.sslDesc')}
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
                            <TextField
                                label={t('server.configDialog.adminKeyInput')}
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={t('server.configDialog.portInput')}
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                fullWidth
                                type="number"
                                inputProps={{ min: 1, max: 65535 }}
                            />
                        </Stack>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} color="primary">{t('save')}</Button>
            </DialogActions>
        </Dialog>
    );
}
