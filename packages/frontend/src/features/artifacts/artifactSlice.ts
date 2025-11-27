import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Artifact, ArtifactState } from '@/types/artifact.types';

const initialState: ArtifactState = {
    artifacts: [],
    activeArtifactId: null,
    isSidebarOpen: false
};

const artifactSlice = createSlice({
    name: 'artifacts',
    initialState,
    reducers: {
        addArtifact: (state, action: PayloadAction<Artifact>) => {
            state.artifacts.push(action.payload);
            state.activeArtifactId = action.payload.id;
            state.isSidebarOpen = true;
        },
        updateArtifact: (state, action: PayloadAction<{ id: string; code: string }>) => {
            const artifact = state.artifacts.find(a => a.id === action.payload.id);
            if (artifact) {
                artifact.code = action.payload.code;
            }
        },
        setActiveArtifact: (state, action: PayloadAction<string>) => {
            state.activeArtifactId = action.payload;
        },
        removeArtifact: (state, action: PayloadAction<string>) => {
            state.artifacts = state.artifacts.filter(a => a.id !== action.payload);
            if (state.activeArtifactId === action.payload) {
                state.activeArtifactId = state.artifacts[0]?.id || null;
            }
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        closeSidebar: (state) => {
            state.isSidebarOpen = false;
        }
    }
});

export const {
    addArtifact,
    updateArtifact,
    setActiveArtifact,
    removeArtifact,
    toggleSidebar,
    closeSidebar
} = artifactSlice.actions;

export default artifactSlice.reducer;
