import * as React from 'react'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'

import GameWindow from '@/components/game/gamewindow'

export default function SplitScreen() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Box
                component="main"
                style={{
                    minHeight: '100vh',
                    maxHeight: '100vh',
                    overflow: 'auto',
                    minWidth: '50%',
                    background: '#F3F3F3',
                }}
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
                <GameWindow isActive={true}></GameWindow>
            </Box>
            <Box
                component="main"
                style={{
                    minHeight: '100vh',
                    maxHeight: '100vh',
                    overflow: 'auto',
                    minWidth: '50%',
                }}
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
                <GameWindow isActive={false}></GameWindow>
            </Box>
        </Box>
    )
}
