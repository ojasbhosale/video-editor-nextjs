import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface AudioTrack {
  id: string
  name: string
  type: "music" | "voice"
  volume: number
  muted: boolean
  startTime: number
  endTime: number
  waveform: string
}

interface AudioState {
  audioTracks: AudioTrack[]
}

const initialState: AudioState = {
  audioTracks: [],
}

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    addAudioTrack: (state, action: PayloadAction<AudioTrack>) => {
      state.audioTracks.push(action.payload)
    },
    removeAudioTrack: (state, action: PayloadAction<string>) => {
      state.audioTracks = state.audioTracks.filter((track) => track.id !== action.payload)
    },
    updateAudioTrack: (state, action: PayloadAction<{ id: string; changes: Partial<AudioTrack> }>) => {
      const index = state.audioTracks.findIndex((track) => track.id === action.payload.id)
      if (index !== -1) {
        state.audioTracks[index] = { ...state.audioTracks[index], ...action.payload.changes }
      }
    },
    reorderAudioTracks: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload
      const [removed] = state.audioTracks.splice(sourceIndex, 1)
      state.audioTracks.splice(destinationIndex, 0, removed)
    },
  },
})

export const { addAudioTrack, removeAudioTrack, updateAudioTrack, reorderAudioTracks } = audioSlice.actions

export default audioSlice.reducer
