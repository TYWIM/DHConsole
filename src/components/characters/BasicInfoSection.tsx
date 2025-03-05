import * as React from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Character } from '../../api/CharacterInfo';
import CommandService from '../../api/CommandService';
import GameData from '../../store/gameData';
import { useLanguageContext } from '../../store/languageContext';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../store/SnackbarContext';

interface BasicInfoSectionProps {
    characterId: number;
    characterInfo: Character;
    onUpdate: () => void;
}

export default function BasicInfoSection({ characterId, characterInfo, onUpdate }: BasicInfoSectionProps) {
    const { language } = useLanguageContext();
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [isEditing, setIsEditing] = React.useState(false);
    const [level, setLevel] = React.useState(characterInfo.level || 1);
    const [rank, setRank] = React.useState(characterInfo.rank || 0);
    const [talent, setTalent] = React.useState(Math.max(...Object.values(characterInfo.talent || { 1: 10 })));

    React.useEffect(() => {
        setLevel(characterInfo.level || 1);
        setRank(characterInfo.rank || 0);
        setTalent(Math.max(...Object.values(characterInfo.talent || { 1: 10 })));
        setIsEditing(false);
    }, [characterInfo]);

    const handleSave = async () => {
        try {
            await CommandService.setCharacterBasicInfo(characterId, level, rank, talent);
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save basic info:', error);
            showSnackbar(t('character.basicInfo.errors.saveFailed'), 'error');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 4, mb: 2 }}>
                <Typography variant="h4">{GameData.get(characterId, language)}</Typography>
                <Typography variant="body2" color="text.secondary">ID: {characterId}</Typography>
                {characterInfo.pathId !== 0 && (
                    <Typography variant="body2" color="text.secondary">
                        ({t('character.basicInfo.path')}: {characterInfo.pathId})
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{t('character.basicInfo.title')}</Typography>
                <IconButton size="small" onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                    <EditIcon />
                </IconButton>
            </Box>

            {isEditing ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label={t('character.basicInfo.level')}
                        type="number"
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        inputProps={{ min: 1, max: 80 }}
                        size="small"
                        sx={{ width: '100px' }}
                    />
                    <TextField
                        label={t('character.basicInfo.eidolon')}
                        type="number"
                        value={rank}
                        onChange={(e) => setRank(Number(e.target.value))}
                        inputProps={{ min: 0, max: 6 }}
                        size="small"
                        sx={{ width: '100px' }}
                    />
                    <TextField
                        label={t('character.basicInfo.talentLevel')}
                        type="number"
                        value={talent}
                        onChange={(e) => setTalent(Number(e.target.value))}
                        inputProps={{ min: 1, max: 10 }}
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
                        {t('character.basicInfo.level')}: {characterInfo.level}
                    </Typography>
                    <Typography>
                        {t('character.basicInfo.eidolon')}: {characterInfo.rank}
                    </Typography>
                    <Typography>
                        {t('character.basicInfo.talentLevel')}: {Object.entries(characterInfo.talent || {})
                            .slice(0, 4)
                            .map(([key, value]) => `${value}`)
                            .join(', ')}
                    </Typography>
                </Box>
            )}
        </Box>
    );
} 