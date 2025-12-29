import { useState, useMemo, useEffect } from 'react';
import { Sentence } from '@/types';
import { LearningSession } from '@/types';
import { Check, X, GripVertical, Plus, Trash2, Clock, Edit2 } from 'lucide-react';

interface SessionCreatorProps {
    sentences: Sentence[];
    videoId: string;
    onSessionsChange: (sessions: LearningSession[]) => void;
    initialSessions?: LearningSession[];
}

export function SessionCreator({ sentences, videoId, onSessionsChange, initialSessions = [] }: SessionCreatorProps) {
    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastClickedId, setLastClickedId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

    // List State
    const [createdSessions, setCreatedSessions] = useState<LearningSession[]>(initialSessions);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

    // Effect to notify parent
    useEffect(() => {
        onSessionsChange(createdSessions);
    }, [createdSessions, onSessionsChange]);

    // Derived State
    const sortedSelectedSentences = useMemo(() => {
        if (selectedIds.size === 0) return [];
        // Filter and sort based on original order in 'sentences' array
        return sentences
            .filter(s => selectedIds.has(s.id))
            .sort((a, b) => a.startTime - b.startTime);
    }, [sentences, selectedIds]);

    const selectionDuration = useMemo(() => {
        if (sortedSelectedSentences.length === 0) return 0;
        const start = sortedSelectedSentences[0].startTime;
        const end = sortedSelectedSentences[sortedSelectedSentences.length - 1].endTime;
        return Math.max(0, end - start);
    }, [sortedSelectedSentences]);

    // Handlers
    const handleSentenceClick = (sentenceId: string, e: React.MouseEvent) => {
        if (e.shiftKey && lastClickedId) {
            // Range selection
            const currentIndex = sentences.findIndex(s => s.id === sentenceId);
            const lastIndex = sentences.findIndex(s => s.id === lastClickedId);

            if (currentIndex === -1 || lastIndex === -1) return;

            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);

            const newSelected = new Set(selectedIds);
            // If ctrl/cmd is NOT held, we might want to keep existing? 
            // Standard behavior: Shift adds to selection or defines range.
            // Let's make Shift+Click add the range.
            for (let i = start; i <= end; i++) {
                newSelected.add(sentences[i].id);
            }
            setSelectedIds(newSelected);
        } else if (e.metaKey || e.ctrlKey) {
            // Toggle individual
            const newSelected = new Set(selectedIds);
            if (newSelected.has(sentenceId)) {
                newSelected.delete(sentenceId);
            } else {
                newSelected.add(sentenceId);
            }
            setSelectedIds(newSelected);
            setLastClickedId(sentenceId);
        } else {
            // Single select (and clear others? usually yes for file explorers, 
            // but for this multi-select builder, maybe toggle or start new?)
            // Let's implement: Click = Toggle, but keep others? 
            // User requested "shift+click으로 선택하면". 
            // Usually, simple click selects just one and clears others.
            // Ctrl+click toggles.
            // Let's stick to standard: Click = Select Only This; Ctrl+Click = Toggle; Shift+Click = Range

            const newSelected = new Set<string>();
            newSelected.add(sentenceId);
            setSelectedIds(newSelected);
            setLastClickedId(sentenceId);
        }
    };

    const handleCreateSession = () => {
        if (!title.trim() || sortedSelectedSentences.length === 0) return;

        const newSession: LearningSession = {
            id: crypto.randomUUID(), // Temp ID
            source_video_id: videoId,
            title,
            description,
            start_time: sortedSelectedSentences[0].startTime,
            end_time: sortedSelectedSentences[sortedSelectedSentences.length - 1].endTime,
            duration: selectionDuration,
            sentence_ids: sortedSelectedSentences.map(s => s.id),
            difficulty,
            order_index: createdSessions.length,
            created_at: new Date().toISOString(),
            sentences: sortedSelectedSentences // Store for preview
        };

        setCreatedSessions([...createdSessions, newSession]);

        // Reset form
        setTitle('');
        setDescription('');
        setSelectedIds(new Set());
        setLastClickedId(null);
    };

    const handleDeleteSession = (sessionId: string) => {
        setCreatedSessions(prev => prev.filter(s => s.id !== sessionId));
    };

    const handleLoadSession = (session: LearningSession) => {
        // Load session back into form for editing (conceptually delete and re-create)
        setTitle(session.title);
        setDescription(session.description || '');
        setDifficulty(session.difficulty || 'intermediate');
        setSelectedIds(new Set(session.sentence_ids));
        setCreatedSessions(prev => prev.filter(s => s.id !== session.id));
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm">3</span>
                    Create Learning Sessions
                </h2>
                <div className="text-sm text-secondary-500">
                    {createdSessions.length} sessions created
                </div>
            </div>

            <div className="flex gap-6 h-[600px]">
                {/* Left: Sentence Selector */}
                <div className="w-1/2 flex flex-col gap-2 rounded-xl border border-secondary-200 bg-white overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-secondary-100 bg-secondary-50 flex justify-between items-center">
                        <span className="font-medium text-sm">Transcript ({sentences.length})</span>
                        <span className="text-xs text-secondary-400">Shift+Click to select range</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none">
                        {sentences.map((s, i) => {
                            const isSelected = selectedIds.has(s.id);
                            return (
                                <div
                                    key={s.id}
                                    onClick={(e) => handleSentenceClick(s.id, e)}
                                    className={`
                                        group flex gap-3 p-3 rounded-lg text-sm cursor-pointer transition-all border
                                        ${isSelected
                                            ? 'bg-primary-50 border-primary-200 shadow-sm z-10'
                                            : 'hover:bg-secondary-50 border-transparent hover:border-secondary-200'
                                        }
                                    `}
                                >
                                    <div className="w-12 shrink-0 text-xs font-mono text-secondary-400 pt-0.5">
                                        {Math.floor(s.startTime / 60)}:{String(Math.floor(s.startTime % 60)).padStart(2, '0')}
                                    </div>
                                    <div className={`flex-1 ${isSelected ? 'text-secondary-900 font-medium' : 'text-secondary-600'}`}>
                                        {s.text}
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-primary-500 shrink-0" />}
                                </div>
                            );
                        })}
                    </div>
                    {/* Selection Summary Footer */}
                    <div className="p-3 border-t border-secondary-100 bg-secondary-50 flex justify-between items-center text-sm">
                        <span className="text-secondary-600">
                            {selectedIds.size} sentences selected
                        </span>
                        <span className="font-mono font-medium text-primary-700">
                            Duration: {Math.floor(selectionDuration / 60)}:{String(Math.floor(selectionDuration % 60)).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Right: Creator Form & List */}
                <div className="w-1/2 flex flex-col gap-6">

                    {/* Creator Form */}
                    <div className="bg-white p-5 rounded-xl border border-secondary-200 shadow-sm flex flex-col gap-4">
                        <h3 className="font-semibold text-secondary-900">New Session Details</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-secondary-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Introduction to Shadowing"
                                    className="w-full px-3 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-secondary-500 mb-1">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What will users learn in this session?"
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-secondary-500 mb-1">Difficulty</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as any)}
                                        className="w-full px-3 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-secondary-500 mb-1">Duration</label>
                                    <div className="px-3 py-2 rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-500 text-sm font-mono flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {Math.floor(selectionDuration / 60)}:{String(Math.floor(selectionDuration % 60)).padStart(2, '0')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateSession}
                            disabled={!title || selectedIds.size === 0}
                            className={`
                                w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                                ${(!title || selectedIds.size === 0)
                                    ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-neutral-800 shadow-md hover:shadow-lg active:scale-[0.99]'
                                }
                            `}
                        >
                            <Plus className="w-4 h-4" />
                            Add Session
                        </button>
                    </div>

                    {/* Created Sessions List */}
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                        <label className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Created Sessions ({createdSessions.length})</label>
                        {createdSessions.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-secondary-400 border-2 border-dashed border-secondary-200 rounded-xl">
                                <p className="text-sm">No sessions created yet</p>
                            </div>
                        ) : (
                            createdSessions.map((session, idx) => (
                                <div key={session.id} className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm flex gap-4 group hover:border-primary-200 transition-colors">
                                    <div className="flex flex-col items-center justify-center gap-1 text-secondary-300">
                                        <span className="text-xs font-mono">#{idx + 1}</span>
                                        <GripVertical className="w-4 h-4 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-secondary-900 truncate">{session.title}</h4>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleLoadSession(session)}
                                                    className="p-1.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    className="p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-secondary-500 line-clamp-1 mb-2">
                                            {session.description || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-secondary-400">
                                            <span className="flex items-center gap-1 bg-secondary-50 px-1.5 py-0.5 rounded text-secondary-600">
                                                <Clock className="w-3 h-3" />
                                                {Math.floor(session.duration / 60)}:{String(Math.floor(session.duration % 60)).padStart(2, '0')}
                                            </span>
                                            <span>{session.sentence_ids.length} sentences</span>
                                            <span className="capitalize">{session.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
