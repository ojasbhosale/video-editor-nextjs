import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Subtitle {
  id: string
  text: string
  startTime: number
  endTime: number
  fontSize: number
  color: string
  bold: boolean
}

interface SubtitlesState {
  subtitles: Subtitle[]
}

const initialState: SubtitlesState = {
  subtitles: [],
}

export const subtitlesSlice = createSlice({
  name: "subtitles",
  initialState,
  reducers: {
    addSubtitle: (state, action: PayloadAction<Subtitle>) => {
      state.subtitles.push(action.payload)
    },
    removeSubtitle: (state, action: PayloadAction<string>) => {
      state.subtitles = state.subtitles.filter((subtitle) => subtitle.id !== action.payload)
    },
    updateSubtitle: (state, action: PayloadAction<{ id: string; changes: Partial<Subtitle> }>) => {
      const index = state.subtitles.findIndex((subtitle) => subtitle.id === action.payload.id)
      if (index !== -1) {
        state.subtitles[index] = { ...state.subtitles[index], ...action.payload.changes }
      }
    },
    reorderSubtitles: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload
      const [removed] = state.subtitles.splice(sourceIndex, 1)
      state.subtitles.splice(destinationIndex, 0, removed)
    },
  },
})

export const { addSubtitle, removeSubtitle, updateSubtitle, reorderSubtitles } = subtitlesSlice.actions

export default subtitlesSlice.reducer
