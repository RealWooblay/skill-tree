// Sound effect URLs
const SOUND_EFFECTS = {
    nodeComplete: '/sounds/node-complete.mp3',
    questComplete: '/sounds/quest-complete.mp3',
}

// Sound settings
let volume = 0.5
let isMuted = false

// Cache for audio elements
const audioCache: { [key: string]: HTMLAudioElement } = {}

// Initialize audio elements
const initAudio = (url: string): HTMLAudioElement => {
    if (!audioCache[url]) {
        const audio = new Audio(url)
        audio.volume = volume
        audioCache[url] = audio
    }
    return audioCache[url]
}

// Play a sound effect
export const playSound = (type: keyof typeof SOUND_EFFECTS) => {
    try {
        const url = SOUND_EFFECTS[type]
        if (!url) return

        const audio = initAudio(url)
        if (!audio) return

        // Reset the audio to the beginning if it's already playing
        audio.currentTime = 0
        audio.play().catch((error) => {
            console.warn(`Failed to play sound ${type}:`, error)
        })
    } catch (error) {
        console.warn(`Error playing sound ${type}:`, error)
    }
}

// Set volume (0-1)
export const setVolume = (newVolume: number) => {
    volume = Math.max(0, Math.min(1, newVolume))
    Object.values(audioCache).forEach((audio) => {
        audio.volume = volume
    })
}

// Toggle mute
export const toggleMute = () => {
    isMuted = !isMuted
    Object.values(audioCache).forEach((audio) => {
        audio.muted = isMuted
    })
}

// Get current volume
export const getVolume = () => volume

// Get mute state
export const isMutedState = () => isMuted 