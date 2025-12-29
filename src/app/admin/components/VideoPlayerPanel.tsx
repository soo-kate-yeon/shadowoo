import YouTubePlayer from '@/components/YouTubePlayer';

interface VideoPlayerPanelProps {
    videoId: string | null;
    currentTime: number;
    lastSyncTime: number;
    onReady: (player: YT.Player) => void;
    onTimeUpdate: (time: number) => void;
}

export function VideoPlayerPanel({
    videoId,
    currentTime,
    lastSyncTime,
    onReady,
    onTimeUpdate
}: VideoPlayerPanelProps) {
    return (
        <div className="w-[45%] flex flex-col gap-4">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg shrink-0 border border-secondary-900/10">
                {videoId ? (
                    <YouTubePlayer
                        videoId={videoId}
                        className="w-full h-full"
                        onReady={onReady}
                        onTimeUpdate={onTimeUpdate}
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
    );
}
