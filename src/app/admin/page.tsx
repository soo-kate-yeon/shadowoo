'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { extractVideoId } from '@/lib/transcript-parser';
import { Sentence } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';
import { createClient } from '@/utils/supabase/client';

import { useSearchParams } from 'next/navigation';

function AdminPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [tags, setTags] = useState('');

    // Raw Script State
    const [rawScript, setRawScript] = useState('');
    const scriptRef = useRef<HTMLTextAreaElement>(null);

    // Sync Editor State
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [player, setPlayer] = useState<YT.Player | null>(null);
    const [currentTime, setCurrentTime] = useState(0);

    const [lastSyncTime, setLastSyncTime] = useState(0);

    // Draft State
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const getVideoId = () => extractVideoId(youtubeUrl);

    const handlePlayerReady = (playerInstance: YT.Player) => {
        setPlayer(playerInstance);
    };

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
    };

    // --- Edit Mode & Draft Logic ---
    const DRAFT_KEY = 'admin_current_draft';

    // 1. Initial Load: Check for Edit ID first, then Draft
    useEffect(() => {
        const init = async () => {
            // A. Edit Mode (High Priority)
            if (editId) {
                setLoading(true);
                const { data, error } = await supabase
                    .from('curated_videos')
                    .select('*')
                    .eq('video_id', editId)
                    .single();

                if (data) {
                    setYoutubeUrl(data.youtube_url || `https://youtu.be/${data.video_id}`);
                    setDifficulty(data.difficulty || 'intermediate');
                    setTags(data.tags?.join(', ') || '');
                    setSentences(data.transcript || []);
                    // Reconstruct raw script if possible, or leave empty
                    setLastSyncTime(data.snippet_end_time || 0);
                    console.log('Loaded video for editing:', data.title);
                } else {
                    setError('Video not found for editing');
                }
                setLoading(false);
                return;
            }

            // B. Draft Recovery (Only if not editing)
            const { data, error } = await supabase
                .from('admin_drafts')
                .select('data')
                .eq('key', DRAFT_KEY)
                .maybeSingle();

            if (data?.data && confirm('Recover previous draft session?')) {
                const d = data.data as any;
                setYoutubeUrl(d.youtubeUrl || '');
                setDifficulty(d.difficulty || 'intermediate');
                setTags(d.tags || '');
                setRawScript(d.rawScript || '');
                setSentences(d.sentences || []);
                setLastSyncTime(d.lastSyncTime || 0);
            }
        };

        init();
    }, [editId]); // Run only on mount or if editId changes

    // Save Draft (Debounced) - Skip if editing existing video (optional, but enables safe editing)
    useEffect(() => {
        // ... (Keep existing logic, works for edit mode too as a safety net)
        const saveDraft = async () => {
            if (!youtubeUrl && !rawScript && sentences.length === 0) return;

            setIsDraftSaving(true);
            try {
                const draftData = {
                    youtubeUrl,
                    difficulty,
                    tags,
                    rawScript,
                    sentences,
                    lastSyncTime,
                };

                const { error } = await supabase
                    .from('admin_drafts')
                    .upsert({
                        key: DRAFT_KEY,
                        data: draftData,
                        last_updated: new Date().toISOString()
                    }, { onConflict: 'key' });

                if (error) throw error;
                setLastSaved(new Date());
            } catch (err) {
                console.error('Failed to save draft:', err);
            } finally {
                setIsDraftSaving(false);
            }
        };

        const timer = setTimeout(saveDraft, 5000);
        return () => clearTimeout(timer);
    }, [youtubeUrl, difficulty, tags, rawScript, sentences, lastSyncTime]);


    // --- CMS List Logic ---
    const [showList, setShowList] = useState(false);
    const [existingVideos, setExistingVideos] = useState<any[]>([]);

    const fetchExistingVideos = async () => {
        const { data, error } = await supabase
            .from('curated_videos')
            .select('video_id, title, created_at')
            .order('created_at', { ascending: false });

        if (data) {
            setExistingVideos(data);
            setShowList(true);
        }
    };

    // --- Translation Logic ---
    const handleAutoTranslate = async () => {
        if (sentences.length === 0) return;
        if (!confirm('Auto translate all sentences? This will overwrite existing translations.')) return;

        setLoading(true);
        try {
            const texts = sentences.map(s => s.text);
            const res = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentences: texts })
            });

            if (!res.ok) throw new Error('Translation failed');

            const { translations } = await res.json();

            setSentences(prev => prev.map((s, idx) => ({
                ...s,
                translation: translations[idx] || ''
            })));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // --- Fetch Transcript Logic ---
    const handleFetchTranscript = async () => {
        const videoId = getVideoId();
        if (!videoId) {
            setError('Please enter a valid YouTube URL first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/transcript?videoId=${videoId}`);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch transcript');
            }

            const { transcript } = await res.json();

            // Convert transcript to Sentence format
            const newSentences: Sentence[] = transcript.map((item: any) => ({
                id: crypto.randomUUID(),
                text: item.text,
                startTime: item.offset / 1000, // Convert ms to seconds
                endTime: (item.offset + item.duration) / 1000,
                highlights: []
            }));

            setSentences(newSentences);
            setLastSyncTime(newSentences[newSentences.length - 1]?.endTime || 0);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    // --- Sync Logic ---
    const handleSyncTrigger = () => {
        if (!player || !scriptRef.current) return;

        const textarea = scriptRef.current;
        const cursorPosition = textarea.selectionStart;

        if (cursorPosition === 0) return; // Nothing selected

        const fullText = rawScript;
        const splitText = fullText.substring(0, cursorPosition).trim();
        const remainingText = fullText.substring(cursorPosition).trimStart();

        if (!splitText) return;

        const currentAbsTime = parseFloat(player.getCurrentTime().toFixed(2));

        const newSentence: Sentence = {
            id: crypto.randomUUID(),
            text: splitText,
            startTime: lastSyncTime,
            endTime: currentAbsTime,
            highlights: []
        };

        setSentences(prev => [...prev, newSentence]);
        setLastSyncTime(currentAbsTime);
        setRawScript(remainingText);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            // 1. Sync Trigger (Only in Raw Script Textarea or at Body level)
            // We allow this specific shortcut in the script textarea for workflow speed
            const isScriptTextarea = target === scriptRef.current;
            const isBody = target === document.body;

            if ((isScriptTextarea || isBody) && (e.key === ']' || e.code === 'BracketRight')) {
                e.preventDefault();
                handleSyncTrigger();
                return;
            }

            // 2. Video Navigation (Arrow Keys) - Only when NOT editing text
            if (!isInput && player) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault(); // Prevent scroll
                    const currentTime = player.getCurrentTime();
                    player.seekTo(Math.max(0, currentTime - 5), true);
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault(); // Prevent scroll
                    const currentTime = player.getCurrentTime();
                    player.seekTo(Math.min(player.getDuration(), currentTime + 5), true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [player, rawScript, lastSyncTime]);

    const updateSentenceTime = (id: string, field: 'startTime' | 'endTime', value: number) => {
        setSentences(prev => prev.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const updateSentenceText = (id: string, field: 'text' | 'translation', value: string) => {
        setSentences(prev => prev.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const deleteSentence = (index: number) => {
        setSentences(prev => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    const handleSave = async () => {
        const videoId = getVideoId();
        if (!videoId) {
            setError('Invalid YouTube URL');
            return;
        }

        if (sentences.length === 0) {
            setError('No parsed sentences to save');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const duration = player ? player.getDuration() : sentences[sentences.length - 1].endTime;

            const { data: { user } } = await supabase.auth.getUser();

            // USING DIRECT SUPABASE UPSERT (Bypassing API for full Admin power)
            const payload = {
                video_id: videoId,
                source_url: youtubeUrl,
                title: `Video ${videoId}`, // Ideally fetch title from YouTube API, but placeholder is fine for now
                snippet_start_time: 0,
                snippet_end_time: duration,
                difficulty,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                transcript: sentences,
                attribution: 'YouTube',
                created_at: new Date().toISOString(),
                created_by: user?.id,
            };

            // Use upsert matching video_id
            const { error: dbError } = await supabase
                .from('curated_videos')
                .upsert(payload, { onConflict: 'video_id' });

            if (dbError) throw dbError;

            setSuccess(true);

            // Clear draft
            await supabase.from('admin_drafts').delete().eq('key', DRAFT_KEY);

            // If editing, maybe stay on page? If new, maybe clear?
            setTimeout(() => {
                setSuccess(false);
                if (!editId) {
                    setRawScript('');
                    setYoutubeUrl('');
                    setSentences([]);
                    setLastSyncTime(0);
                }
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-200 p-8">
            <div className="max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
                <div className="mb-4 shrink-0 flex justify-between items-center bg-surface p-4 rounded-xl shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-heading-3 text-secondary-900 font-bold">Sync Editor & Translator</h1>
                            <button
                                onClick={fetchExistingVideos}
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
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="YouTube URL..."
                        />
                        <select
                            className="px-3 py-2 rounded-lg border border-secondary-300 text-sm"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <button
                            onClick={handleSave}
                            disabled={loading || sentences.length === 0}
                            className="bg-primary-500 hover:bg-primary-600 text-surface font-bold py-2 px-6 rounded-lg disabled:opacity-50 text-sm transition-colors"
                        >
                            {loading ? 'Processing...' : 'Save & Publish'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-error/10 border border-error rounded-lg p-3 mb-4 shrink-0">
                        <p className="text-error text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-success/10 border border-success rounded-lg p-3 mb-4 shrink-0">
                        <p className="text-success text-sm">✅ Saved successfully!</p>
                    </div>
                )}

                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Left: Player */}
                    <div className="w-[45%] flex flex-col gap-4">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg shrink-0 border border-secondary-900/10">
                            {getVideoId() ? (
                                <YouTubePlayer
                                    videoId={getVideoId() || ''}
                                    className="w-full h-full"
                                    onReady={handlePlayerReady}
                                    onTimeUpdate={handleTimeUpdate}
                                    showNativeControls={true}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-secondary-500">
                                    Enter URL to load video
                                </div>
                            )}
                        </div>

                        <div className="bg-surface p-6 rounded-2xl flex-1 overflow-y-auto shadow-sm">
                            <h3 className="font-bold mb-3 text-secondary-900">How to Sync</h3>
                            <ul className="space-y-2 text-sm text-secondary-600 mb-6 list-disc pl-4">
                                <li><strong>Paste script</strong> into the top-right editor.</li>
                                <li>Play video. Click in the text where the sentence ends.</li>
                                <li>Press <kbd className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-bold">]</kbd> key.</li>
                                <li>Use <strong>Auto Translate</strong> to fill Korean meanings.</li>
                            </ul>

                            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-secondary-500">Current Time</span>
                                    <span className="font-mono font-bold text-primary-600 text-lg">{currentTime.toFixed(2)}s</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary-500">Last Sync Time</span>
                                    <span className="font-mono text-secondary-700">{lastSyncTime.toFixed(2)}s</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Script Editor */}
                    <div className="w-[55%] flex flex-col gap-4 min-h-0">
                        {/* Top: Raw Script Input */}
                        <div className="h-1/3 flex flex-col bg-surface rounded-2xl border-2 border-primary-100 shadow-sm overflow-hidden focus-within:border-primary-400 transition-colors relative">
                            <div className="absolute top-0 left-0 bg-primary-100 text-primary-800 text-xs px-3 py-1 font-bold rounded-br-lg z-10 flex items-center gap-2">
                                Step 1: Raw Script
                                <button
                                    onClick={handleFetchTranscript}
                                    disabled={loading || !youtubeUrl}
                                    className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide transition-colors"
                                    title="Fetch transcript from YouTube"
                                >
                                    🎬 Fetch Transcript
                                </button>
                                <button
                                    onClick={() => setRawScript(prev => prev.replace(/\n/g, ' ').replace(/\s+/g, ' '))}
                                    className="bg-white hover:bg-white/80 text-primary-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border border-primary-200 transition-colors"
                                    title="Remove line breaks"
                                >
                                    Normalize Spacing
                                </button>
                            </div>
                            <textarea
                                ref={scriptRef}
                                value={rawScript}
                                onChange={(e) => setRawScript(e.target.value)}
                                className="w-full h-full p-6 pt-8 resize-none focus:outline-none text-lg leading-relaxed text-secondary-800 placeholder:text-secondary-300"
                                placeholder="Paste your full transcript here... Click where sentence ends and press ] to sync."
                            />
                        </div>

                        {/* Bottom: Parsed List */}
                        <div className="flex-1 bg-surface rounded-2xl border border-secondary-200 shadow-sm overflow-hidden flex flex-col relative">
                            <div className="absolute top-0 left-0 bg-secondary-200 text-secondary-800 text-xs px-3 py-1 font-bold rounded-br-lg z-10 flex gap-2 items-center">
                                Step 2: Parsed Sentences ({sentences.length})
                                <button
                                    onClick={handleAutoTranslate}
                                    disabled={loading || sentences.length === 0}
                                    className="bg-primary-500 hover:bg-primary-600 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide transition-colors"
                                >
                                    Auto Translate
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 pt-10 space-y-3">
                                {sentences.map((s, idx) => (
                                    <div
                                        key={s.id}
                                        className="bg-secondary-50 rounded-xl p-4 border border-secondary-100 hover:border-secondary-300 transition-all group"
                                    >
                                        <div className="flex gap-4 items-start">
                                            <span className="text-xs font-mono text-secondary-400 mt-1.5 w-6">#{idx + 1}</span>
                                            <div className="flex-1 space-y-3">
                                                {/* Textarea for Wrapping */}
                                                <textarea
                                                    value={s.text}
                                                    onChange={e => updateSentenceText(s.id, 'text', e.target.value)}
                                                    rows={1}
                                                    onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                    }}
                                                    className="w-full bg-transparent font-medium text-lg text-secondary-900 focus:outline-none border-b border-transparent focus:border-secondary-300 pb-1 resize-none overflow-hidden"
                                                    placeholder="Original Sentence"
                                                />
                                                <input
                                                    value={s.translation || ''}
                                                    onChange={e => updateSentenceText(s.id, 'translation', e.target.value)}
                                                    className="w-full bg-transparent text-sm text-secondary-600 focus:outline-none border-b border-secondary-200 focus:border-primary-300 pb-1 placeholder:text-secondary-300"
                                                    placeholder="Korean Translation (Click 'Auto Translate' above)"
                                                />

                                                <div className="flex gap-4 text-xs font-mono text-secondary-500 items-center">
                                                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-secondary-200">
                                                        <span>Start</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={s.startTime}
                                                            onChange={e => updateSentenceTime(s.id, 'startTime', parseFloat(e.target.value))}
                                                            className="w-14 text-right focus:outline-none focus:text-primary-600 font-bold"
                                                        />
                                                    </div>
                                                    <div className="text-secondary-300">→</div>
                                                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-secondary-200">
                                                        <span>End</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={s.endTime}
                                                            onChange={e => updateSentenceTime(s.id, 'endTime', parseFloat(e.target.value))}
                                                            className="w-14 text-right focus:outline-none focus:text-primary-600 font-bold"
                                                        />
                                                    </div>
                                                    <div className="text-secondary-300 ml-2">
                                                        Dur: {(s.endTime - s.startTime).toFixed(2)}s
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteSentence(idx)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-secondary-400 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                                title="Delete sentence"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {sentences.length === 0 && (
                                    <div className="text-center text-secondary-400 py-10 italic">
                                        Parsed sentences will appear here...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing Videos Modal */}
            {
                showList && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8" onClick={() => setShowList(false)}>
                        <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-secondary-200 flex justify-between items-center bg-secondary-50">
                                <h2 className="font-bold text-lg text-secondary-900">Existing Videos ({existingVideos.length})</h2>
                                <button onClick={() => setShowList(false)} className="text-secondary-500 hover:text-secondary-900">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {existingVideos.length === 0 ? (
                                    <div className="p-8 text-center text-secondary-500">No videos found.</div>
                                ) : (
                                    <div className="space-y-1">
                                        {existingVideos.map((v) => (
                                            <button
                                                key={v.video_id}
                                                onClick={() => {
                                                    // Hard reload to reset states cleanly or push router
                                                    if (confirm('Load this video? Unsaved changes will be lost.')) {
                                                        window.location.href = `/admin?id=${v.video_id}`;
                                                    }
                                                }}
                                                className="w-full text-left p-3 hover:bg-secondary-100 rounded-lg flex justify-between items-center group transition-colors"
                                            >
                                                <div>
                                                    <div className="font-medium text-secondary-900">{v.title || v.video_id}</div>
                                                    <div className="text-xs text-secondary-500">{new Date(v.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPageContent />
        </Suspense>
    );
}
