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
import { AdminHeader } from './components/AdminHeader';
import { VideoPlayerPanel } from './components/VideoPlayerPanel';
import { RawScriptEditor } from './components/RawScriptEditor';
import { SentenceListEditor } from './components/SentenceListEditor';
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
                <AdminHeader
                    youtubeUrl={youtubeUrl}
                    difficulty={difficulty}
                    tags={tags}
                    isDraftSaving={isDraftSaving}
                    lastSaved={lastSaved}
                    loading={loading}
                    sentencesCount={sentences.length}
                    onYoutubeUrlChange={setYoutubeUrl}
                    onDifficultyChange={setDifficulty}
                    onTagsChange={setTags}
                    onSave={handleSave}
                    onLoadExisting={fetchExistingVideos}
                />

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
                    <VideoPlayerPanel
                        videoId={getVideoId()}
                        currentTime={currentTime}
                        lastSyncTime={lastSyncTime}
                        onReady={handlePlayerReady}
                        onTimeUpdate={handleTimeUpdate}
                    />

                    <div className="w-[55%] flex flex-col gap-4 min-h-0">
                        <RawScriptEditor
                            rawScript={rawScript}
                            loading={loading}
                            youtubeUrl={youtubeUrl}
                            onChange={setRawScript}
                            onFetchTranscript={handleFetchTranscript}
                            onNormalizeSpacing={() => setRawScript(prev => prev.replace(/\n/g, ' ').replace(/\s+/g, ' '))}
                            scriptRef={scriptRef}
                        />

                        <SentenceListEditor
                            sentences={sentences}
                            loading={loading}
                            rawScript={rawScript}
                            onParseScript={handleParseScript}
                            onAutoTranslate={handleAutoTranslate}
                            onUpdateTime={updateSentenceTime}
                            onUpdateText={updateSentenceText}
                            onDelete={deleteSentence}
                        />
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
