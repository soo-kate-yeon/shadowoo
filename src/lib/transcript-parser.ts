import { TranscriptItem, Sentence } from '@/types';

/**
 * Parse transcript items and merge them into sentences
 * Sentences are split by punctuation marks (. ! ?)
 */
export function parseTranscriptToSentences(transcriptItems: TranscriptItem[]): Sentence[] {
    const sentences: Sentence[] = [];
    let currentSentence = '';
    let currentStartTime = 0;
    let currentEndTime = 0;

    transcriptItems.forEach((item, index) => {
        if (currentSentence === '') {
            currentStartTime = item.start;
        }

        currentSentence += (currentSentence ? ' ' : '') + item.text;
        currentEndTime = item.start + item.duration;

        // Check if sentence ends with punctuation
        const endsWithPunctuation = /[.!?]$/.test(item.text.trim());
        const isLastItem = index === transcriptItems.length - 1;

        if (endsWithPunctuation || isLastItem) {
            sentences.push({
                id: crypto.randomUUID(),
                text: currentSentence.trim(),
                startTime: currentStartTime,
                endTime: currentEndTime,
                highlights: [],
            });

            currentSentence = '';
        }
    });

    return sentences;
}

/**
 * Extract YouTube video ID from URL
 */
export function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}
