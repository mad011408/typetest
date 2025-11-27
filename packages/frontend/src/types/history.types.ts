export interface ChatHistory {
    id: string;
    title: string;
    messages: any[];
    model: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface HistoryState {
    histories: ChatHistory[];
    currentHistoryId: string | null;
    isLoading: boolean;
}
