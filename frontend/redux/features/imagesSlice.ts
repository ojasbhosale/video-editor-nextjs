import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ImageOverlay {
  id: string
  url: string
  name: string
  position: {
    x: number
    y: number
  }
  size: number
  opacity: number
  border: boolean
  borderColor: string
}

interface ImagesState {
  images: ImageOverlay[]
}

const initialState: ImagesState = {
  images: [],
}

export const imagesSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    addImage: (state, action: PayloadAction<ImageOverlay>) => {
      state.images.push(action.payload)
    },
    removeImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((image) => image.id !== action.payload)
    },
    updateImage: (state, action: PayloadAction<{ id: string; changes: Partial<ImageOverlay> }>) => {
      const index = state.images.findIndex((image) => image.id === action.payload.id)
      if (index !== -1) {
        state.images[index] = { ...state.images[index], ...action.payload.changes }
      }
    },
    reorderImages: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload
      const [removed] = state.images.splice(sourceIndex, 1)
      state.images.splice(destinationIndex, 0, removed)
    },
  },
})

export const { addImage, removeImage, updateImage, reorderImages } = imagesSlice.actions

export default imagesSlice.reducer
