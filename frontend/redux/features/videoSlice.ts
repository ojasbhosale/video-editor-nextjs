import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface VideoState {
  videoUrl: string | null
  videoName: string | null
  videoDuration: number
  videoSize: number
}

const initialState: VideoState = {
  videoUrl: null,
  videoName: null,
  videoDuration: 0,
  videoSize: 0,
}

interface SetVideoPayload {
  url: string
  name: string
  duration: number
  size: number
}

export const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setVideo: (state, action: PayloadAction<SetVideoPayload>) => {
      state.videoUrl = action.payload.url
      state.videoName = action.payload.name
      state.videoDuration = action.payload.duration
      state.videoSize = action.payload.size
    },
    clearVideo: (state) => {
      state.videoUrl = null
      state.videoName = null
      state.videoDuration = 0
      state.videoSize = 0
    },
    updateVideoDuration: (state, action: PayloadAction<number>) => {
      state.videoDuration = action.payload
    },
  },
})

export const { setVideo, clearVideo, updateVideoDuration } = videoSlice.actions

export default videoSlice.reducer
