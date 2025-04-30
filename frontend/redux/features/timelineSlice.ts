import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Scene {
  id: string
  name: string
  startTime: number
  endTime: number
  thumbnail: string
}

interface TimelineState {
  scenes: Scene[]
}

const initialState: TimelineState = {
  scenes: [],
}

export const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    addScene: (state, action: PayloadAction<Scene>) => {
      state.scenes.push(action.payload)
    },
    removeScene: (state, action: PayloadAction<string>) => {
      state.scenes = state.scenes.filter((scene) => scene.id !== action.payload)
    },
    updateScene: (state, action: PayloadAction<{ id: string; changes: Partial<Scene> }>) => {
      const index = state.scenes.findIndex((scene) => scene.id === action.payload.id)
      if (index !== -1) {
        state.scenes[index] = { ...state.scenes[index], ...action.payload.changes }
      }
    },
    reorderScenes: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload
      const [removed] = state.scenes.splice(sourceIndex, 1)
      state.scenes.splice(destinationIndex, 0, removed)
    },
  },
})

export const { addScene, removeScene, updateScene, reorderScenes } = timelineSlice.actions

export default timelineSlice.reducer
