import { Button, Grid, styled, Paper, Divider, Typography } from '@mui/material'
import { useState } from 'react'
import { Box } from '@mui/material'
interface WordPanelProps {
    isActive?: boolean
    actualWord?: string
    guesses: Array<string>
    matches: Array<string>
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}))

enum BgColors {
    match = '#99FF99',
    miss = '#FEFE88',
    wrong = '#A9A9A9',
    title = '#91FFE1',
    win = '#59FF59',
}

function bgColorFromMatch(matchChar: string) {
    if (matchChar === 'o') {
        return BgColors.match
    } else if (matchChar === 'y') {
        return BgColors.miss
    }
    return BgColors.wrong
}

export default function WordPanel(props: WordPanelProps) {
    const [revealWord, setRevealWord] = useState('')

    const titleWord = (word: string | undefined) => {
        if (!word) {
            return
        }
        let background = BgColors.title
        if (revealWord) {
            word = revealWord
            background = BgColors.win
        }
        return word.split('').map((e, i) => (
            <Grid item key={i} xs={12 / 5} style={{ background: background }}>
                <Typography sx={{ fontWeight: 'bold' }}>{e}</Typography>
            </Grid>
        ))
    }
    return (
        <Box>
            <Item>
                {/* The Actual Word */}
                <Grid container spacing={0}>
                    {titleWord(props.actualWord)}
                </Grid>
            </Item>
            <Item>
                {/* Guesses and matches */}
                {props.guesses?.map((word, roundNumber) => {
                    const match = (props.matches as Array<string>)[roundNumber]
                    if (match === 'ooooo' && !revealWord) {
                        // Player won this round
                        setRevealWord(props.guesses[props.matches?.indexOf('ooooo')])
                        return
                    } else if (match === 'MATCH') {
                        // Player already won in previous round
                        return
                    }
                    return (
                        <Grid key={roundNumber} container spacing={0}>
                            {word.split('').map((e, i) => {
                                const bgColor = match ? bgColorFromMatch(match[i]) : BgColors.wrong
                                return (
                                    <Grid item key={i} xs={12 / 5} style={{ background: bgColor }}>
                                        <Typography>{e}</Typography>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    )
                })}
            </Item>
        </Box>
    )
}
