
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HIGHLIGHTS, Highlight, Video, VIDEOS } from "../data/mock-data";
import imgRectangle2 from "figma:asset/0d10ac3c8c765382b7c7f94f899f714e3ba1756e.png";
import { ScrollArea } from "./ui/scroll-area";

export function HighlightsPanel() {
  // Group highlights by videoId for display
  const groupedHighlights = HIGHLIGHTS.reduce((acc, highlight) => {
    if (!acc[highlight.videoId]) {
      acc[highlight.videoId] = [];
    }
    acc[highlight.videoId].push(highlight);
    return acc;
  }, {} as Record<string, Highlight[]>);

  return (
    <div className="bg-[#f3f3f3] rounded-2xl p-4 h-full w-full flex flex-col">
      <h2 className="text-xl font-semibold text-black mb-4 shrink-0">하이라이트</h2>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full -mr-3 pr-3">
            <div className="flex flex-col gap-4 pb-4">
                {Object.entries(groupedHighlights).map(([videoId, highlights]) => {
                    const video = VIDEOS.find(v => v.id === videoId);
                    if (!video) return null;

                    return (
                        <div key={videoId} className="flex flex-col gap-3">
                            {/* Video Header */}
                            <div className="bg-[#e3e3e3] rounded-2xl p-3 flex gap-3 items-center">
                                <div className="w-[80px] h-[56px] rounded-xl overflow-hidden shrink-0">
                                    <ImageWithFallback
                                        src={imgRectangle2}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight font-['SF_Pro_Display']">
                                    {video.title}
                                </h3>
                            </div>

                            {/* Highlights List */}
                            <div className="flex flex-col gap-3">
                                {highlights.map((highlight) => (
                                    <div key={highlight.id} className="flex flex-col gap-3">
                                        {/* Highlight Text */}
                                        <div className="flex gap-3 items-start h-auto">
                                            <div className="w-1 bg-[#fcdb4b] shrink-0 rounded-full self-stretch min-h-[24px]" />
                                            <p className="text-base font-normal text-black leading-snug pt-0.5">
                                                {highlight.originalText}
                                            </p>
                                        </div>
                                        
                                        {/* User Note (if exists) */}
                                        {highlight.userNote && (
                                            <div className="h-[18px] relative w-full pl-[26px]">
                                                <div className="absolute left-[16px] top-0 w-[18px] h-[18px] flex items-center justify-center -ml-4">
                                                     <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                                                         <path d="M1 1 L1 10 L10 10" stroke="#D8D8D8" strokeWidth="2" strokeLinecap="square" />
                                                     </svg>
                                                </div>
                                                <p className="text-base font-normal text-[#767676] leading-tight font-['SF_Pro_Display']">
                                                    {highlight.userNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                 {/* Duplicate for scrolling demo */}
                 {Object.entries(groupedHighlights).map(([videoId, highlights]) => {
                    const video = VIDEOS.find(v => v.id === videoId);
                    if (!video) return null;

                    return (
                        <div key={`${videoId}-dup`} className="flex flex-col gap-3">
                            <div className="bg-[#e3e3e3] rounded-2xl p-3 flex gap-3 items-center">
                                <div className="w-[80px] h-[56px] rounded-xl overflow-hidden shrink-0">
                                    <ImageWithFallback
                                        src={imgRectangle2}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-black line-clamp-2 leading-tight font-['SF_Pro_Display']">
                                    {video.title}
                                </h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {highlights.map((highlight) => (
                                    <div key={`${highlight.id}-dup`} className="flex flex-col gap-3">
                                        <div className="flex gap-3 items-start h-auto">
                                            <div className="w-1 bg-[#fcdb4b] shrink-0 rounded-full self-stretch min-h-[24px]" />
                                            <p className="text-base font-normal text-black leading-snug pt-0.5">
                                                {highlight.originalText}
                                            </p>
                                        </div>
                                        {highlight.userNote && (
                                            <div className="h-[18px] relative w-full pl-[26px]">
                                                <div className="absolute left-[16px] top-0 w-[18px] h-[18px] flex items-center justify-center -ml-4">
                                                     <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                                                         <path d="M1 1 L1 10 L10 10" stroke="#D8D8D8" strokeWidth="2" strokeLinecap="square" />
                                                     </svg>
                                                </div>
                                                <p className="text-base font-normal text-[#767676] leading-tight font-['SF_Pro_Display']">
                                                    {highlight.userNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}
