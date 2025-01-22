import * as React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import CharacterList from '../components/characters/CharacterList';
import CharacterDetails from '../components/characters/CharacterDetails';

export default function Characters() {
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<number | null>(null);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper sx={{ height: 'calc(100vh - 80px)', overflow: 'auto' }}>
            <CharacterList
              selectedCharacterId={selectedCharacterId}
              onCharacterSelect={setSelectedCharacterId}
            />
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper sx={{ p: 2 }}>
            {selectedCharacterId ? (
              <CharacterDetails characterId={selectedCharacterId} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                Select a character to view details
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}