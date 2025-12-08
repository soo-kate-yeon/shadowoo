import { TranscriptItem, Sentence } from '@/types';

/**
 * Parse transcript items and merge them into sentences
 * Sentences are split by:
 * 1. Primary punctuation (. ! ?)
 * 2. Secondary punctuation (, ; :)
 * 3. Maximum length (150 characters)
 * 4. Time gaps (2+ seconds)
 * 5. Word count (15+ words)
 */
export function parseTranscriptToSentences(transcriptItems: TranscriptItem[]): Sentence[] {
    const sentences: Sentence[] = [];
    let currentSentence = '';
    let currentStartTime = 0;
    let currentEndTime = 0;
    let lastItemEndTime = 0;

    // Configuration
    const MAX_SENTENCE_LENGTH = 300; // characters (Increased 2x)
    const MAX_WORD_COUNT = 40; // words (Increased to match longer sentences)
    const TIME_GAP_THRESHOLD = 2.0; // seconds

    // Debug logging
    console.log('🔍 [Transcript Parser] Starting to parse', transcriptItems.length, 'items');

    let punctuationCount = 0;
    let noPunctuationCount = 0;
    const sampleItems = transcriptItems.slice(0, 5);
    console.log('📝 [Transcript Parser] Sample items:', sampleItems.map(item => ({
        text: item.text,
        hasPunctuation: /[.!?]$/.test(item.text?.trim() || ''),
        length: item.text?.length || 0
    })));

    const createSentence = (reason: string, index: number) => {
        if (currentSentence.trim()) {
            sentences.push({
                id: crypto.randomUUID(),
                text: currentSentence.trim(),
                startTime: currentStartTime,
                endTime: currentEndTime,
                highlights: [],
            });

            if (sentences.length <= 3 || index === transcriptItems.length - 1) {
                console.log(`✂️ [Transcript Parser] Sentence #${sentences.length} (${reason}):`, {
                    length: currentSentence.trim().length,
                    wordCount: currentSentence.trim().split(/\s+/).length,
                    preview: currentSentence.trim().substring(0, 50) + '...'
                });
            }

            currentSentence = '';
        }
    };

    transcriptItems.forEach((item, index) => {
        // Skip items with no text
        if (!item.text) return;

        // Initialize start time for new sentence
        if (currentSentence === '') {
            currentStartTime = item.start;
        }

        // Check for time gap (indicates natural pause/break)
        const timeGap = lastItemEndTime > 0 ? item.start - lastItemEndTime : 0;
        if (timeGap >= TIME_GAP_THRESHOLD && currentSentence !== '') {
            createSentence('time gap', index);
            currentStartTime = item.start;
        }

        // Add current item to sentence
        currentSentence += (currentSentence ? ' ' : '') + item.text;
        currentEndTime = item.start + item.duration;
        lastItemEndTime = currentEndTime;

        // Check various sentence-ending conditions
        const text = item.text.trim();
        const primaryPunctuation = /[.!?]$/.test(text);
        // Secondary punctuation check removed as requested
        const isLastItem = index === transcriptItems.length - 1;
        const currentLength = currentSentence.trim().length;
        const currentWordCount = currentSentence.trim().split(/\s+/).length;

        // Track punctuation stats
        if (primaryPunctuation) punctuationCount++;
        else noPunctuationCount++;

        // Decision tree for sentence breaks
        if (primaryPunctuation) {
            // Always break on . ! ?
            createSentence('primary punctuation', index);
        } else if (currentLength >= MAX_SENTENCE_LENGTH) {
            // Force break if too long
            createSentence('max length', index);
        } else if (currentWordCount >= MAX_WORD_COUNT) {
            // Force break if too many words
            createSentence('max words', index);
        } else if (isLastItem) {
            // Always create sentence for last item
            createSentence('last item', index);
        }
    });

    console.log('📊 [Transcript Parser] Summary:', {
        totalItems: transcriptItems.length,
        sentencesCreated: sentences.length,
        itemsWithPunctuation: punctuationCount,
        itemsWithoutPunctuation: noPunctuationCount,
        avgSentenceLength: Math.round(sentences.reduce((sum, s) => sum + s.text.length, 0) / sentences.length),
        avgWordsPerSentence: Math.round(sentences.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0) / sentences.length)
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

/**
 * Group sentences based on mode
 * - sentence: individual sentences (no grouping)
 * - paragraph: 5-10 sentences, must end with period
 * - total: all sentences combined into one
 */
export function groupSentencesByMode(
    sentences: Sentence[],
    mode: 'sentence' | 'paragraph' | 'total'
): Sentence[] {
    if (mode === 'sentence') {
        return sentences;
    }

    if (mode === 'total') {
        // Combine all sentences into one
        if (sentences.length === 0) return [];

        return [{
            id: crypto.randomUUID(),
            text: sentences.map(s => s.text).join(' '),
            startTime: sentences[0].startTime,
            endTime: sentences[sentences.length - 1].endTime,
            highlights: [],
        }];
    }

    // Paragraph mode: 5-10 sentences, must end with period
    const paragraphs: Sentence[] = [];
    let currentParagraph: Sentence[] = [];

    sentences.forEach((sentence, index) => {
        currentParagraph.push(sentence);

        const endsWithPeriod = sentence.text.trim().endsWith('.');
        const hasMinSentences = currentParagraph.length >= 5;
        const hasMaxSentences = currentParagraph.length >= 10;
        const isLastSentence = index === sentences.length - 1;

        // Create paragraph if:
        // 1. Has 5-10 sentences AND ends with period
        // 2. Has 10 sentences (force break)
        // 3. Is last sentence and has at least 1 sentence
        if ((hasMinSentences && endsWithPeriod) || hasMaxSentences || isLastSentence) {
            paragraphs.push({
                id: crypto.randomUUID(),
                text: currentParagraph.map(s => s.text).join(' '),
                startTime: currentParagraph[0].startTime,
                endTime: currentParagraph[currentParagraph.length - 1].endTime,
                highlights: [],
            });
            currentParagraph = [];
        }
    });

    console.log('📦 [Grouping] Mode:', mode, 'Original:', sentences.length, 'Grouped:', paragraphs.length);

    return paragraphs;
}
