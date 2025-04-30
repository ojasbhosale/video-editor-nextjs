declare module "react-beautiful-dnd" {
    // DragDropContext
    export interface DragDropContextProps {
      onDragEnd: (result: DropResult) => void
      onDragStart?: (initial: DragStart) => void
      onDragUpdate?: (update: DragUpdate) => void
      children: React.ReactNode
    }
  
    export interface DragStart {
      draggableId: string
      type: string
      source: DraggableLocation
    }
  
    export interface DragUpdate extends DragStart {
      destination?: DraggableLocation
    }
  
    export interface DropResult extends DragUpdate {
      reason: "DROP" | "CANCEL"
    }
  
    export interface DraggableLocation {
      droppableId: string
      index: number
    }
  
    export const DragDropContext: React.FC<DragDropContextProps>
  
    // Droppable
    export interface DroppableProps {
      droppableId: string
      type?: string
      direction?: "horizontal" | "vertical"
      isDropDisabled?: boolean
      isCombineEnabled?: boolean
      ignoreContainerClipping?: boolean
      children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement
    }
  
    export interface DroppableProvided {
      innerRef: React.RefCallback<HTMLElement>
      droppableProps: {
        "data-rbd-droppable-id": string
        "data-rbd-droppable-context-id": string
      }
      placeholder?: React.ReactElement
    }
  
    export interface DroppableStateSnapshot {
      isDraggingOver: boolean
      draggingOverWith?: string
      draggingFromThisWith?: string
      isUsingPlaceholder: boolean
    }
  
    export const Droppable: React.FC<DroppableProps>
  
    // Draggable
    export interface DraggableProps {
      draggableId: string
      index: number
      isDragDisabled?: boolean
      disableInteractiveElementBlocking?: boolean
      shouldRespectForcePress?: boolean
      children: (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
        rubric: DraggableRubric,
      ) => React.ReactElement
    }
  
    export interface DraggableProvided {
      innerRef: React.RefCallback<HTMLElement>
      draggableProps: {
        "data-rbd-draggable-context-id": string
        "data-rbd-draggable-id": string
        style?: React.CSSProperties
        onTransitionEnd?: React.TransitionEventHandler
      }
      dragHandleProps?: {
        "data-rbd-drag-handle-draggable-id": string
        "data-rbd-drag-handle-context-id": string
        role: string
        "aria-describedby": string
        tabIndex: number
        draggable: boolean
        onDragStart: React.DragEventHandler
      }
    }
  
    export interface DraggableStateSnapshot {
      isDragging: boolean
      isDropAnimating: boolean
      isClone: boolean
      dropAnimation?: {
        duration: number
        curve: string
        moveTo: {
          x: number
          y: number
        }
        opacity: number
        scale: number
      }
      draggingOver?: string
      combineWith?: string
      combineTargetFor?: string
      mode?: "FLUID" | "SNAP"
    }
  
    export interface DraggableRubric {
      draggableId: string
      type: string
      source: {
        index: number
        droppableId: string
      }
    }
  
    export const Draggable: React.FC<DraggableProps>
  }
  