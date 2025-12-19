
import { ScrollArea } from "./ui/scroll-area";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CATEGORIES, VIDEOS } from "../data/mock-data";
import imgImage2 from "figma:asset/1a339745da21aab9cb2adfc43e0150c462b45e45.png";
import svgPaths from "../imports/svg-khwtkieu1k";

function Check() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" viewBox="0 0 16 16">
        <path d={svgPaths.p39be50} stroke="#F5F5F5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

export function VideoListSidebar() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 shrink-0">
        <h2 className="text-2xl font-semibold text-black">학습할 영상</h2>
        
        {/* Filter Chips */}
        <ScrollArea className="w-full whitespace-nowrap pb-2 -mx-1 px-1">
          <div className="flex gap-3">
            {CATEGORIES.map((cat, index) => {
              const isActive = index === 0;
              return (
                <button
                  key={cat}
                  className={`
                    flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-base font-medium transition-colors
                    ${isActive 
                      ? "bg-[#2c2c2c] text-[#f5f5f5]" 
                      : "bg-[#f5f5f5] text-[#757575] hover:bg-[#e5e5e5]"}
                  `}
                >
                  {isActive && <Check />}
                  <span className="leading-[20px]">{cat}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Video List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full -mr-3 pr-3">
          <div className="flex flex-col gap-4 pb-4">
            {VIDEOS.map((video, i) => (
              <div key={video.id} className="flex flex-col gap-4 group cursor-pointer">
                {/* Thumbnail Container */}
                <div className="relative w-full h-[169px] rounded-2xl overflow-hidden bg-input-background">
                  <ImageWithFallback
                    src={imgImage2} // Using the Figma asset as requested
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/35 backdrop-blur-sm px-2 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium">{video.duration}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-end justify-between gap-2">
                    <h3 className="text-lg font-semibold text-black tracking-[0.5px] line-clamp-1 flex-1">
                        {video.title}
                    </h3>
                    <span className="text-lg font-medium text-black shrink-0">
                        {video.sentenceCount}문장 · {video.duration.split(':')[0]}분
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#767676] leading-tight line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Extra Mock Data to Demonstrate Scrolling */}
            {VIDEOS.map((video) => (
              <div key={`${video.id}-duplicate`} className="flex flex-col gap-4 group cursor-pointer">
                <div className="relative w-full h-[169px] rounded-2xl overflow-hidden bg-input-background">
                  <ImageWithFallback
                    src={imgImage2}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/35 backdrop-blur-sm px-2 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium">{video.duration}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-end justify-between gap-2">
                    <h3 className="text-lg font-semibold text-black tracking-[0.5px] line-clamp-1 flex-1">
                        {video.title}
                    </h3>
                    <span className="text-lg font-medium text-black shrink-0">
                        {video.sentenceCount}문장 · {video.duration.split(':')[0]}분
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#767676] leading-tight line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
