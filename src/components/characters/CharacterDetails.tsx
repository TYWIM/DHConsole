import * as React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BasicInfoSection from './BasicInfoSection';
import LightConeSection from './LightConeSection';
import RelicsSection from './RelicsSection';
import CommandService from '../../api/CommandService';
import { Character } from '../../api/CharacterInfo';
import { useSnackbar } from '../../store/SnackbarContext';

interface CharacterDetailsProps {
    characterId: number;
}

export default function CharacterDetails({ characterId }: CharacterDetailsProps) {
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [characterInfo, setCharacterInfo] = React.useState<Character | null>(null);

    React.useEffect(() => {
        loadCharacterInfo();
    }, [characterId]);

    const loadCharacterInfo = async () => {
        try {
            const info = await CommandService.getCharacterInfo(characterId);
            setCharacterInfo(info);
        } catch (error) {
            console.error('Failed to load character info:', error);
            showSnackbar(t('character.errors.detailsFailed'), 'error');
        }
    };

    if (!characterInfo) {
        return <Typography>{t('character.pickPrompt')}</Typography>;
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="100%">
            <BasicInfoSection
                characterId={characterId}
                characterInfo={characterInfo}
                onUpdate={loadCharacterInfo}
            />
            <Divider sx={{ my: 2 }} />
            <LightConeSection
                characterId={characterId}
                characterInfo={characterInfo}
                onUpdate={loadCharacterInfo}
            />
            <Divider sx={{ my: 2 }} />
            <RelicsSection
                characterId={characterId}
                characterInfo={characterInfo}
                onUpdate={loadCharacterInfo}
            />
        </Box>
    );
} 