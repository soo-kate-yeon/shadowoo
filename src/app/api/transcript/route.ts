import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        // Initialize Innertube
        const youtube = await Innertube.create();

        // Get video info and transcript
        const info = await youtube.getInfo(videoId);

        try {
            const transcriptData = await info.getTranscript();

            if (!transcriptData?.transcript?.content?.body?.initial_segments) {
                throw new Error('No transcript data found');
            }

            // Map to expected format
            const transcript = transcriptData.transcript.content.body.initial_segments.map((segment: any) => ({
                text: segment.snippet.text,
                start: Number(segment.start_ms) / 1000,
                duration: Number(segment.end_ms - segment.start_ms) / 1000,
                offset: Number(segment.start_ms) / 1000,
                lang: 'en' // Default or extracted if available
            }));

            return NextResponse.json({
                success: true,
                transcript,
            });
        } catch (transcriptError) {
            console.error('Transcript not available:', transcriptError);
            return NextResponse.json({
                success: true,
                transcript: [], // Return empty if no transcript found
                message: 'No transcript available for this video'
            });
        }

    } catch (error) {
        console.error('Transcript fetch error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch transcript',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
