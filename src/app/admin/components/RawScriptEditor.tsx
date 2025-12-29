interface RawScriptEditorProps {
    rawScript: string;
    loading: boolean;
    youtubeUrl: string;
    onChange: (value: string) => void;
    onFetchTranscript: () => void;
    onNormalizeSpacing: () => void;
    scriptRef: React.RefObject<HTMLTextAreaElement>;
}

export function RawScriptEditor({
    rawScript,
    loading,
    youtubeUrl,
    onChange,
    onFetchTranscript,
    onNormalizeSpacing,
    scriptRef
}: RawScriptEditorProps) {
    return (
        <div className="h-1/3 flex flex-col bg-surface rounded-2xl border-2 border-primary-100 shadow-sm overflow-hidden focus-within:border-primary-400 transition-colors relative">
            <div className="absolute top-0 left-0 bg-primary-100 text-primary-800 text-xs px-3 py-1 font-bold rounded-br-lg z-10 flex items-center gap-2">
                Step 1: Raw Script
                <button
                    onClick={onFetchTranscript}
                    disabled={loading || !youtubeUrl}
                    className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide transition-colors"
                    title="Fetch transcript from YouTube"
                >
                    🎬 Fetch Transcript
                </button>
                <button
                    onClick={onNormalizeSpacing}
                    className="bg-white hover:bg-white/80 text-primary-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border border-primary-200 transition-colors"
                    title="Remove line breaks"
                >
                    Normalize Spacing
                </button>
            </div>
            <textarea
                ref={scriptRef}
                value={rawScript}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full p-6 pt-8 resize-none focus:outline-none text-lg leading-relaxed text-secondary-800 placeholder:text-secondary-300"
                placeholder="Paste your full transcript here... Click where sentence ends and press ] to sync."
            />
        </div>
    );
}
