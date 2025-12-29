'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { extractVideoId, parseTranscriptToSentences } from '@/lib/transcript-parser';
import type { TranscriptItem } from '@/lib/transcript-parser';
import { Sentence } from '@/types';
import { useSentenceEditor } from './hooks/useSentenceEditor';
import { useTranscriptFetch } from './hooks/useTranscriptFetch';
import { SentenceItem } from './components/SentenceItem';
import { VideoListModal } from './components/VideoListModal';
import YouTubePlayer from '@/components/YouTubePlayer';
import { createClient } from '@/utils/supabase/client';

import { useSearchParams } from 'next/navigation';

function AdminPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Use custom hooks
    const transcriptFetch = useTranscriptFetch();

    // Form state
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [tags, setTags] = useState('');

    // Raw Script State
    const [rawScript, setRawScript] = useState('');
    const scriptRef = useRef<HTMLTextAreaElement>(null);

    // Sync Editor State (using custom hook)
    const {
        sentences,
        setSentences,
        updateSentenceTime,
        updateSentenceText,
        deleteSentence
    } = useSentenceEditor([]);
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
                    console.error('Video not found for editing');
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
        try {
            const translated = await transcriptFetch.autoTranslate(sentences);
            setSentences(translated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            if (err.message !== 'Translation cancelled') {
                // Ignore cancellation, show other errors
                console.error(err.message);
            }
        }
    };

    // --- Fetch Transcript Logic ---
    const handleFetchTranscript = async () => {
        const videoId = getVideoId();
        try {
            const rawText = await transcriptFetch.fetchTranscript(videoId || '');
            setRawScript(rawText);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    // --- Parse Script Logic ---
    const handleParseScript = async () => {
        const videoId = getVideoId();
        try {
            const parsedSentences = await transcriptFetch.parseScript(rawScript, videoId);
            setSentences(parsedSentences);
            setLastSyncTime(parsedSentences[parsedSentences.length - 1]?.endTime || 0);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            console.error(err.message);
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

    // Sentence CRUD operations moved to useSentenceEditor hook

    const handleSave = async () => {
        const videoId = getVideoId();
        if (!videoId) {
            console.error('Invalid YouTube URL');
            return;
        }

        if (sentences.length === 0) {
            console.error('No parsed sentences to save');
            return;
        }

        setLoading(true);
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
            console.error(err.message);
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

                {transcriptFetch.error && (
                    <div className="bg-error/10 border border-error rounded-lg p-3 mb-4 shrink-0">
                        <p className="text-error text-sm">{transcriptFetch.error}</p>
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
                                    onClick={handleParseScript}
                                    disabled={loading || !rawScript.trim()}
                                    className="bg-secondary-700 hover:bg-secondary-800 disabled:opacity-50 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide transition-colors"
                                    title="Parse raw script into sentences"
                                >
                                    📝 Parse Script
                                </button>
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
                                    <SentenceItem
                                        key={s.id}
                                        sentence={s}
                                        index={idx}
                                        onUpdateTime={updateSentenceTime}
                                        onUpdateText={updateSentenceText}
                                        onDelete={deleteSentence}
                                    />
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

            <VideoListModal
                show={showList}
                videos={existingVideos}
                onClose={() => setShowList(false)}
                onSelect={(videoId) => window.location.href = `/admin?id=${videoId}`}
            />
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
