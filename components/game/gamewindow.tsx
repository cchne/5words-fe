'use client'
import { useState, useEffect } from 'react'
import { Button, Grid, styled, Paper, Divider } from '@mui/material'
import { Input, Alert, AlertTitle, Typography } from '@mui/material'
import useWebSocket from 'react-use-websocket'
import WordPanel from './wordpanel'

interface GameWindowProps {
    isActive?: boolean
}
type ExpectedJsonMessage = {
    msg: any
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}))

const ACTIONS = {
    join: 'join',
    setup: 'setup',
    guess: 'guess',
}

const GAME_STATES = {
    joining: 'joining',
    setup: 'setup',
    ongoing: 'ongoing',
    gameover: 'gameover',
}

export default function GameWindow(props: GameWindowProps) {
    const socketUrl = 'ws://localhost:8000'
    const [data, setData] = useState('')
    // Keep track of the current game state
    const [gameState, setGameState] = useState(GAME_STATES.joining)
    const [playerName, setPlayerName] = useState('')
    const [playerWords, setPlayerWords] = useState([] as Array<string>)
    const [knownWords, setKnownWords] = useState(['', '', '', '', ''])
    const [guesses, setGuesses] = useState([] as Array<string>)
    const [matches, setMatches] = useState([] as Array<Array<string>>)
    const [showRestart, setShowRestart] = useState(false)

    const [instructTitle, setInstructTitle] = useState('Your turn.')
    const [instructMessage, setInstructMessage] = useState(
        'Enter your name. The game will start when both players have joined'
    )

    const { sendJsonMessage, lastMessage, lastJsonMessage } = useWebSocket<ExpectedJsonMessage>(
        socketUrl,
        {
            heartbeat: {
                message: 'ping',
                returnMessage: 'pong',
                timeout: 60000,
                interval: 10000,
            },
            onOpen: () => console.log('opened'),
            onClose: () => console.log('closed'),
            //Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: (closeEvent) => true,
            share: true,
        }
    )

    // Handle new messages
    useEffect(() => {
        // console.log(lastMessage)
    }, [lastMessage])

    // Handle json messages
    useEffect(() => {
        console.log(lastJsonMessage)
        let nextGameState = lastJsonMessage?.msg?.game_state
        if (nextGameState) {
            setGameState(nextGameState)
            if (nextGameState === GAME_STATES.setup) {
                // 2. Player is 2nd player to join
                setInstructTitle('Your turn')
                setInstructMessage('Both players have joined. Enter 5 words, separated by comma')
            } else if (nextGameState === GAME_STATES.ongoing) {
                if (props.isActive) {
                    if (lastJsonMessage?.msg?.next_turn === playerName) {
                        setInstructTitle('Your turn')
                        setInstructMessage('Make your guess')
                    } else {
                        setInstructTitle('')
                        setInstructMessage('Waiting for opponent to make a move')
                    }
                }
            }
        } else {
            nextGameState = gameState
        }
        const action = lastJsonMessage?.msg?.action
        if (action === 'joined') {
            // This player has successfully joined the game
            // if (nextGameState === GAME_STATES.joining) {
            // 1. First player to join, wait for 2nd player
            setInstructTitle('')
            setInstructMessage('Waiting for 2nd player to join...')
            // }
        } else if (action === 'oppo_joined' && !props.isActive) {
            setPlayerName(lastJsonMessage?.msg?.player_id)
        } else if (action === 'player_ready') {
            if (lastJsonMessage?.msg?.client_id) {
                if (lastJsonMessage?.msg?.client_id !== playerName && props.isActive) {
                    setInstructMessage(
                        'Both players have joined. Enter 5 words, separated by comma. Your opponent is waiting on you.'
                    )
                } else {
                    setInstructTitle('')
                    setInstructMessage('Waiting for your opponent to finish setting up.')
                }
            } else if (lastJsonMessage?.msg?.words && !props.isActive) {
                setPlayerWords(lastJsonMessage?.msg?.words)
            }
        } else if (action === 'guess') {
            // Find the current active player (whether player or opponent) in the received data and render the board
            const myIndex = lastJsonMessage.msg?.ids?.indexOf(playerName)
            if (myIndex === -1) {
                console.log('Player ID not found')
                return
            } else {
                setGuesses(lastJsonMessage.msg.data[myIndex]?.guesses)
                setMatches(lastJsonMessage.msg.data[myIndex]?.matches)
            }
            // Update the player turn indicator
            if (lastJsonMessage.msg?.next_player === playerName && props.isActive) {
                setInstructTitle('Your turn.')
                setInstructMessage('Make your guess')
            } else {
                setInstructTitle("Opponent's turn.")
                setInstructMessage('Waiting for your opponent to make a guess.')
            }
            if (lastJsonMessage.msg?.game_state === 'gameover' && props.isActive) {
                setKnownWords(lastJsonMessage.msg.words[1 - myIndex])
                setShowRestart(true)
                // Find the winner
                if (lastJsonMessage.msg?.next_player === playerName) {
                    setInstructTitle('You Win! 🏆')
                    setInstructMessage('')
                } else {
                    setInstructTitle('You got 2nd place.')
                    setInstructMessage('')
                }
            }
        } else if (action === 'restart') {
            setShowRestart(false)
            setInstructTitle('A new round has started')
            setInstructMessage('Enter 5 words, separated by comma')
            setGameState(GAME_STATES.setup)
            setKnownWords([])
            setPlayerWords([])
            setGuesses([])
            setMatches([])
        }
    }, [lastJsonMessage, gameState, props.isActive])

    const instructionPanel = () => {
        return (
            props.isActive && (
                <Alert variant="outlined" severity="success" icon={false}>
                    <AlertTitle>{instructTitle}</AlertTitle>
                    {instructMessage}
                </Alert>
            )
        )
    }
    const playerInfo = () => {
        return (
            <Typography gutterBottom>
                {props.isActive
                    ? `Your name: ${playerName}`
                    : playerName
                      ? `Opponent name: ${playerName}`
                      : 'Waiting for opponent to join.'}
            </Typography>
        )
    }

    return (
        <div>
            <Button
                variant="contained"
                onClick={() => {
                    sendJsonMessage({ msg: { client_id: 'zzz', action: 'RESET' } })
                }}
            >
                RESET
            </Button>
            <Divider></Divider>
            {/* Debug stuff above */}
            {playerInfo()}
            {instructionPanel()}
            {showRestart && props.isActive && (
                <>
                    <p></p>
                    <Button
                        variant="contained"
                        onClick={() => {
                            sendJsonMessage({ msg: { client_id: playerName, action: 'restart' } })
                        }}
                    >
                        Rematch
                    </Button>
                </>
            )}
            <div>
                {gameState === GAME_STATES.setup && !props.isActive && playerWords.length
                    ? 'Your opponent will need to guess: ' + playerWords.join(', ')
                    : ''}
            </div>
            <div>
                {!props.isActive && gameState === GAME_STATES.ongoing && guesses.length
                    ? `Your opponent's last guess: ${guesses[guesses.length - 1]}`
                    : ''}
            </div>

            {props.isActive && gameState === GAME_STATES.joining && (
                <>
                    <Input onChange={(e) => setData(e.target.value)}></Input>
                    <p></p>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setPlayerName(data)
                            sendJsonMessage({ msg: { client_id: data, id: data, action: 'join' } })
                        }}
                    >
                        Join Game
                    </Button>
                </>
            )}
            {props.isActive && gameState === GAME_STATES.setup && (
                <>
                    <Input onChange={(e) => setData(e.target.value)}></Input>

                    <p></p>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const wordList = data.split(',')
                            const words = []
                            for (let word of wordList) {
                                if (words.length === 5) {
                                    break
                                }
                                if (word.trim().length !== 5) {
                                    // Warning message
                                    console.log('Word invalid length: ', word)
                                    return
                                } else {
                                    words.push(word.trim().toUpperCase())
                                }
                            }
                            sendJsonMessage({
                                msg: { id: playerName, action: 'setup', words },
                            })
                        }}
                    >
                        Confirm words
                    </Button>
                </>
            )}
            {props.isActive && gameState === GAME_STATES.ongoing && (
                <>
                    <Input onChange={(e) => setData(e.target.value)}></Input>
                    <p></p>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (data.trim().length !== 5) {
                                console.log('Word invalid length: ', data)
                                return
                            }
                            sendJsonMessage({
                                msg: {
                                    id: playerName,
                                    action: 'guess',
                                    word: data.toUpperCase(),
                                },
                            })
                        }}
                    >
                        Make guess
                    </Button>
                </>
            )}
            <p></p>

            <Grid container spacing={1}>
                {(gameState === GAME_STATES.ongoing || gameState === GAME_STATES.gameover) &&
                    [0, 1, 2, 3, 4].map((index) => {
                        let actualWord = '?????'
                        if (!props.isActive) {
                            actualWord = playerWords[index]
                        } else if (knownWords[index]) {
                            actualWord = knownWords[index]
                        }
                        return (
                            <Grid item key={index} xs={4}>
                                <WordPanel
                                    actualWord={actualWord}
                                    guesses={guesses}
                                    // Get the corresponding column of the 2d array
                                    matches={matches?.map((value) => {
                                        return value[index]
                                    })}
                                ></WordPanel>
                            </Grid>
                        )
                    })}
            </Grid>
        </div>
    )
}
