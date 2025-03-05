import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Stack,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Male, Female } from '@mui/icons-material';
import CommandService from '../api/CommandService';
import { usePlayerContext } from '../store/playerContext';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../store/SnackbarContext';

export default function Account() {
  const { t } = useTranslation();
  const [playerInfo, setPlayerInfo] = useState<{ level: number; gender: number }>({ level: 1, gender: 1 });
  const [editLevel, setEditLevel] = useState<string>('');
  const { playerUid, isConnected } = usePlayerContext();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (!isConnected) {
      return;
    }
    loadPlayerInfo();
  }, [playerUid, isConnected]);

  const loadPlayerInfo = async () => {
    try {
      const info = await CommandService.getPlayerInfo();
      setPlayerInfo(info);
      setEditLevel(info.level.toString());
    } catch (error) {
      showSnackbar(t('account.messages.loadError'), 'error');
    }
  };

  const handleLevelChange = async () => {
    try {
      const newLevel = parseInt(editLevel, 10);
      if (newLevel < 1 || newLevel > 80) {
        throw new Error(t('account.messages.levelRangeError'));
      }
      await CommandService.setPlayerLevel(newLevel);
      setPlayerInfo(prev => ({ ...prev, level: newLevel }));
      showSnackbar(t('account.messages.levelSuccess'), 'success');
    } catch (error) {
      showSnackbar(t('account.messages.levelError'), 'error');
    }
  };

  const handleGenderChange = async (_: React.MouseEvent<HTMLElement>, newGender: number) => {
    if (newGender === null) return;
    try {
      await CommandService.setPlayerGender(newGender);
      setPlayerInfo(prev => ({ ...prev, gender: newGender }));
      showSnackbar(t('account.messages.genderSuccess'), 'success');
    } catch (error) {
      showSnackbar(t('account.messages.genderError'), 'error');
    }
  };

  const handleUnlockAction = async (action: () => Promise<void>, successKey: string) => {
    try {
      await action();
      showSnackbar(t(`account.messages.unlockSuccess.${successKey}`), 'success');
    } catch (error) {
      showSnackbar(t('account.messages.actionError'), 'error');
    }
  };

  return (
    <Box sx={{ width: 600, margin: '0 auto', p: 3 }}>
      {/* Player Info Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('account.playerInfo.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box display="flex" justifyContent="space-around" alignItems="center">
            <Box>
              <Stack spacing={2}>
                <Typography variant="subtitle1">{t('account.playerInfo.level')}</Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    sx={{ width: 80 }}
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    type="number"
                    inputProps={{ min: 1, max: 80 }}
                  />
                  <Button variant="contained" onClick={handleLevelChange}>
                    {t('account.playerInfo.update')}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box>
              <Stack spacing={2}>
                <Typography variant="subtitle1">{t('account.playerInfo.gender')}</Typography>
                <ToggleButtonGroup
                  size="small"
                  value={playerInfo.gender}
                  exclusive
                  onChange={handleGenderChange}
                  aria-label="gender"
                >
                  <ToggleButton value={1} aria-label="male">
                    <Male sx={{ mr: 1 }} /> {t('account.playerInfo.male')}
                  </ToggleButton>
                  <ToggleButton value={2} aria-label="female">
                    <Female sx={{ mr: 1 }} /> {t('account.playerInfo.female')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Account Controls Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('account.controls.title')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('account.controls.unlockAll')}</Typography>
            <Grid container spacing={2}>
              {['characters', 'collectibles', 'furniture', 'pets'].map((item) => (
                <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleUnlockAction(() => CommandService.giveAll(item), item)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t(`account.controls.buttons.${item}`)}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>{t('account.controls.maxAll')}</Typography>
            <Grid container spacing={2}>
              {['characterLevel', 'characterRank', 'characterTalent'].map((item) => (
                <Grid key={item} size={{ xs: 12, sm: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleUnlockAction(() => CommandService.maxAll(item), item)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t(`account.controls.buttons.${item}`)}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>{t('account.controls.getAll')}</Typography>
            <Grid container spacing={2}>
              {['mission', 'tutorial', 'rogue'].map((item) => (
                <Grid key={item} size={{ xs: 12, sm: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleUnlockAction(() => CommandService.unlockAll(item), item)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t(`account.controls.buttons.${item}`)}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}