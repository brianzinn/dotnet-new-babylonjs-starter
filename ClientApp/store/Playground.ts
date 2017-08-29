import { Action, Reducer } from 'redux';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface PlaygroundState {
    lastClickedMeshName: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.
export type MESH_CLICKED = 'demo/MESH_CLICKED'
export const MESH_CLICKED: MESH_CLICKED = 'demo/MESH_CLICKED';

export type MESH_CLEARED = 'demo/MESH_CLEARED'
export const MESH_CLEARED: MESH_CLEARED = 'demo/MESH_CLEARED';

export type MeshClickedAction = {
    type: MESH_CLICKED,
    name: string
}

export type MeshClearedAction = {
    type: MESH_CLEARED
}



// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = MeshClickedAction | MeshClearedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    clickedOnMesh: (name: string) => <MeshClickedAction>{ type: MESH_CLICKED, name },
    clearSelection: () => <MeshClearedAction>{ type: MESH_CLEARED }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<PlaygroundState> = (state: PlaygroundState, action: KnownAction) => {
    switch (action.type) {
        case MESH_CLICKED:
            return { lastClickedMeshName: action.name };
        case MESH_CLEARED:
            return { lastClickedMeshName: '' }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || { lastClickedMeshName: '' };
};