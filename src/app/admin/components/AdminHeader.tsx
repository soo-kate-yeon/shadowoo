interface AdminHeaderProps {
    youtubeUrl: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string;
    isDraftSaving: boolean;
    lastSaved: Date | null;
    loading: boolean;
    sentencesCount: number;
    onYoutubeUrlChange: (url: string) => void;
    onDifficultyChange: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
    onTagsChange: (tags: string) => void;
    onSave: () => void;
    onLoadExisting: () => void;
}

export function AdminHeader({
    youtubeUrl,
    difficulty,
    tags,
    isDraftSaving,
    lastSaved,
    loading,
    sentencesCount,
    onYoutubeUrlChange,
    onDifficultyChange,
    onTagsChange,
    onSave,
    onLoadExisting
}: AdminHeaderProps) {
    return (
        <div className="mb-4 shrink-0 flex justify-between items-center bg-surface p-4 rounded-xl shadow-sm">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-heading-3 text-secondary-900 font-bold">Sync Editor & Translator</h1>
                    <button
                        onClick={onLoadExisting}
                        className="text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-600 px-2 py-1 rounded border border-secondary-300 transition-colors"
                    >
                        📂 Load Existing
                    </button>
                </div>
                <div className="flex gap-4 text-xs text-secondary-500 items-center mt-1">
                    <span>Video: {youtubeUrl || 'None'}</span>
                    {isDraftSaving ? (
                        <span className="text-primary-600 animate-pulse">Saving draft...</span>
                    ) : lastSaved ? (
                        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    ) : null}
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <input
                    className="px-3 py-2 rounded-lg border border-secondary-300 w-64 text-sm"
                    value={youtubeUrl}
                    onChange={e => onYoutubeUrlChange(e.target.value)}
                    placeholder="YouTube URL..."
                />
                <select
                    className="px-3 py-2 rounded-lg border border-secondary-300 text-sm"
                    value={difficulty}
                    onChange={(e) => onDifficultyChange(e.target.value as any)}
                >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                <button
                    onClick={onSave}
                    disabled={loading || sentencesCount === 0}
                    className="bg-primary-500 hover:bg-primary-600 text-surface font-bold py-2 px-6 rounded-lg disabled:opacity-50 text-sm transition-colors"
                >
                    {loading ? 'Processing...' : 'Save & Publish'}
                </button>
            </div>
        </div>
    );
}
