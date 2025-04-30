import { configureStore } from "@reduxjs/toolkit"
import videoReducer from "./features/videoSlice"
import timelineReducer from "./features/timelineSlice"
import audioReducer from "./features/audioSlice"
import subtitlesReducer from "./features/subtitlesSlice"
import imagesReducer from "./features/imagesSlice"

export const store = configureStore({
  reducer: {
    video: videoReducer,
    timeline: timelineReducer,
    audio: audioReducer,
    subtitles: subtitlesReducer,
    images: imagesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
