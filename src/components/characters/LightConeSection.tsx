import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Character } from '../../api/CharacterInfo';
import CommandService from '../../api/CommandService';
import GameData from '../../store/gameData';
import { useLanguageContext } from '../../store/languageContext';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../store/SnackbarContext';

interface LightConeSectionProps {
    characterId: number;
    characterInfo: Character;
    onUpdate: () => void;
}

export default function LightConeSection({ characterId, characterInfo, onUpdate }: LightConeSectionProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [equipId, setEquipId] = React.useState(characterInfo.equipId || 0);
    const [equipLevel, setEquipLevel] = React.useState(characterInfo.equipLevel || 1);
    const [equipRank, setEquipRank] = React.useState(characterInfo.equipRank || 1);
    const { language } = useLanguageContext();
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        setEquipId(characterInfo.equipId || 0);
        setEquipLevel(characterInfo.equipLevel || 1);
        setEquipRank(characterInfo.equipRank || 1);
        setIsEditing(false);
    }, [characterInfo]);

    const handleSave = async () => {
        try {
            await CommandService.setCharacterEquip(characterId, equipId, equipLevel, equipRank);
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save light cone info:', error);
            showSnackbar(t('character.lightCone.errors.saveFailed'), 'error');
        }
    };

    const allItemsForEquip = React.useMemo(() => {
        return Object.entries(GameData.getAllItems(language)).filter(([id]) => {
            const numId = Number(id);
            // Currently all equip are between 21000 and 25000. No items are between 25000 and 30000.
            // If game data changes, this will need to be updated.
            return numId >= 21000 && numId < 30000;
        });
    }, [language]);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    {t('character.lightCone.title')}
                </Typography>
                <IconButton size="small" onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                    <EditIcon />
                </IconButton>
            </Box>

            {isEditing ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        label={t('character.lightCone.name')}
                        value={equipId}
                        onChange={(e) => setEquipId(Number(e.target.value))}
                        size="small"
                        sx={{ width: '300px' }}
                    >
                        {allItemsForEquip.map(([id, name]) => (
                            <MenuItem key={id} value={id}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={t('character.lightCone.level')}
                        type="number"
                        value={equipLevel}
                        onChange={(e) => setEquipLevel(Number(e.target.value))}
                        inputProps={{ min: 1, max: 80 }}
                        size="small"
                        sx={{ width: '100px' }}
                    />
                    <TextField
                        label={t('character.lightCone.superimposition')}
                        type="number"
                        value={equipRank}
                        onChange={(e) => setEquipRank(Number(e.target.value))}
                        inputProps={{ min: 1, max: 5 }}
                        size="small"
                        sx={{ width: '100px' }}
                    />
                    <Button variant="contained" onClick={handleSave} size="small">
                        {t('save')}
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', paddingRight: 6 }}>
                    <Typography>
                            {t('character.lightCone.name')}: {characterInfo.equipId ? GameData.get(characterInfo.equipId, language) : '--'}
                    </Typography>
                        <Typography>
                            {t('character.lightCone.level')}: {characterInfo.equipLevel || '--'}
                        </Typography>
                        <Typography>
                            {t('character.lightCone.superimposition')}: {characterInfo.equipRank || '--'}
                        </Typography>
                </Box>
            )}
        </Box>
    );
} 