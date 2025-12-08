import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';
import * as SupabaseStore from './supabase-store';

export interface Video {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string;
    description: string;
    sentenceCount?: number;
}

export interface Session {
    id: string;
    videoId: string;
    progress: number; // 0-100 (deprecated, kept for backward compatibility)
    lastAccessedAt: number;
    totalSentences: number;
    timeLeft: string;
    currentStep: 1 | 2; // 1 = listen without script, 2 = script view
    currentSentence?: number; // last viewed sentence index
}

export interface Highlight {
    id: string;
    videoId: string;
    originalText: string;
    userNote?: string;
    createdAt: number;
}

export interface SavedSentence {
    id: string;
    videoId: string;
    sentenceId: string; // Reference to the sentence ID
    sentenceText: string;
    startTime: number;
    endTime: number;
    createdAt: number;
}

export interface AINote {
    id: string;
    videoId: string;
    sentenceId: string;
    sentenceText: string;
    userFeedback: string[]; // e.g. ['too_fast', 'unknown_words']
    aiResponse: {
        analysis: string;
        tips: string;
        focusPoint: string;
    };
    createdAt: number;
}

interface AppState {
    videos: Video[];
    sessions: Record<string, Session>; // Keyed by videoId
    highlights: Highlight[];
    savedSentences: SavedSentence[];
    aiNotes: AINote[];

    // Actions
    addSession: (session: Session) => void;
    updateSessionProgress: (videoId: string, progress: number) => void;
    updateSessionPosition: (videoId: string, step: 1 | 2, sentenceIndex?: number) => void;
    addHighlight: (highlight: Highlight) => void;
    removeHighlight: (id: string) => void;
    addSavedSentence: (sentence: SavedSentence) => void;
    removeSavedSentence: (id: string) => void;
    addAINote: (note: AINote) => void;
    removeAINote: (id: string) => void;
    getVideo: (videoId: string) => Video | undefined;

    // Supabase sync
    loadUserData: () => Promise<void>;
}

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

// Initial Mock Data
const INITIAL_VIDEOS: Video[] = [
    {
        id: 'qp0HIF3SfI4',
        title: 'How great leaders inspire action | Simon Sinek',
        thumbnailUrl: 'https://img.youtube.com/vi/qp0HIF3SfI4/maxresdefault.jpg',
        duration: '18:04',
        description: 'Simon Sinek has a simple but powerful model for inspirational leadership - starting with a golden circle and the question: "Why?"',
        sentenceCount: 58
    }
];

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            videos: INITIAL_VIDEOS,
            sessions: {},
            highlights: [],
            savedSentences: [],
            aiNotes: [],

            addSession: async (session) => {
                set((state) => ({
                    sessions: { ...state.sessions, [session.videoId]: session }
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.saveSession(userId, session);
                }
            },

            updateSessionProgress: async (videoId, progress) => {
                const session = get().sessions[videoId];
                if (!session) return;

                const updatedSession = { ...session, progress, lastAccessedAt: Date.now() };
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [videoId]: updatedSession
                    }
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.saveSession(userId, updatedSession);
                }
            },

            updateSessionPosition: async (videoId, step, sentenceIndex) => {
                const session = get().sessions[videoId];
                if (!session) return;

                console.log(`Session updated - Video: ${videoId}, Step: ${step}, Sentence: ${sentenceIndex ?? 'N/A'}`);

                const updatedSession = {
                    ...session,
                    currentStep: step,
                    currentSentence: sentenceIndex,
                    lastAccessedAt: Date.now()
                };

                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [videoId]: updatedSession
                    }
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.saveSession(userId, updatedSession);
                }
            },

            addHighlight: async (highlight) => {
                set((state) => ({
                    highlights: [...state.highlights, highlight]
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.saveHighlight(userId, highlight);
                }
            },

            removeHighlight: async (id: string) => {
                set((state) => ({
                    highlights: state.highlights.filter((h) => h.id !== id)
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.deleteHighlight(userId, id);
                }
            },

            addSavedSentence: async (sentence) => {
                set((state) => ({
                    savedSentences: [...state.savedSentences, sentence]
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.saveSavedSentence(userId, sentence);
                }
            },

            removeSavedSentence: async (id: string) => {
                set((state) => ({
                    savedSentences: state.savedSentences.filter((s) => s.id !== id)
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.deleteSavedSentence(userId, id);
                }
            },

            addAINote: async (note) => {
                set((state) => ({
                    aiNotes: [...state.aiNotes, note]
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.saveAINote(userId, note);
                }
            },

            removeAINote: async (id) => {
                set((state) => ({
                    aiNotes: state.aiNotes.filter((n) => n.id !== id)
                }));

                const userId = await getCurrentUserId();
                if (userId) {
                    await SupabaseStore.deleteAINote(userId, id);
                }
            },

            getVideo: (videoId) => get().videos.find((v) => v.id === videoId),

            loadUserData: async () => {
                const userId = await getCurrentUserId();
                if (!userId) return;

                const data = await SupabaseStore.loadAllUserData(userId);
                set({
                    sessions: data.sessions,
                    highlights: data.highlights,
                    savedSentences: data.savedSentences,
                    aiNotes: data.aiNotes,
                });
            },
        }),
        {
            name: 'shadowing-ninja-storage',
        }
    )
);
