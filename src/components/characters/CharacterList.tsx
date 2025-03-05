import React, { useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CommandService from '../../api/CommandService';
import { useLanguageContext } from '../../store/languageContext';
import { usePlayerContext } from '../../store/playerContext';
import { useSnackbar } from '../../store/SnackbarContext';
import GameData from '../../store/gameData';

interface CharacterListProps {
    selectedCharacterId: number | null;
    onCharacterSelect: (characterId: number) => void;
}

export default function CharacterList({ selectedCharacterId, onCharacterSelect }: CharacterListProps) {
    const { t } = useTranslation();
    const { showSnackbar } = useSnackbar();
    const [ownedCharacters, setOwnedCharacters] = React.useState<number[]>([]);
    const [newCharacterId, setNewCharacterId] = React.useState<number | ''>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const { language } = useLanguageContext();
    const { playerUid, isConnected } = usePlayerContext();

    useEffect(() => {
        GameData.loadRelicTypes();
    }, []);

    useEffect(() => {
        const fetchCharacters = async () => {
            setLoading(true);
            await Promise.all([GameData.loadCharacter(language), GameData.loadItem(language)]);
            setLoading(false);
        };
        if (!isConnected) {
            return;
        }
        fetchCharacters();
    }, [language, isConnected]);

    const loadOwnedCharacters = async () => {
        try {
            const characters = await CommandService.getOwnedCharacters();
            setOwnedCharacters(characters);
        } catch (error) {
            console.error('Failed to load characters:', error);
            showSnackbar(t('character.errors.loadFailed'), 'error');
        }
    };

    useEffect(() => {
        loadOwnedCharacters();
    }, [playerUid, isConnected]);

    const handleAddCharacter = async () => {
        if (!newCharacterId) return;
        try {
            await CommandService.giveItem(Number(newCharacterId));
            await loadOwnedCharacters();
            setNewCharacterId('');
        } catch (error) {
            console.error('Failed to add character:', error);
            showSnackbar(t('character.errors.addFailed'), 'error');
        }
    };

    const availableCharacters = Object.entries(GameData.getAllAvatars(language))
        .filter(([id]) => !ownedCharacters.includes(Number(id)) && Number(id) < 3000);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                    select
                    fullWidth
                    size="small"
                    value={newCharacterId}
                    onChange={(e) => setNewCharacterId(Number(e.target.value))}
                    label={t('character.list.addCharacter')}
                    sx={{ mb: 1 }}
                    disabled={!isConnected || loading}
                >
                    {availableCharacters.map(([id, name]) => (
                        <MenuItem key={id} value={id}>
                            {name}
                        </MenuItem>
                    ))}
                </TextField>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddCharacter}
                    disabled={!newCharacterId || !isConnected || loading}
                >
                    {t('character.list.addCharacter')}
                </Button>
            </Box>
            <List>
                {ownedCharacters.map((characterId) => (
                    <ListItem key={characterId} disablePadding>
                        <ListItemButton
                            selected={characterId === selectedCharacterId}
                            onClick={() => onCharacterSelect(characterId)}
                        >
                            <ListItemText primary={GameData.get(characterId, language)} slotProps={{ primary: { variant: 'body1' } }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
} 