export interface Artifact {
    id: string;
    title: string;
    language: string;
    code: string;
    timestamp: Date;
}

export interface ArtifactState {
    artifacts: Artifact[];
    activeArtifactId: string | null;
    isSidebarOpen: boolean;
}
