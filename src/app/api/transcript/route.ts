import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

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

        // Fetch transcript from YouTube
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        return NextResponse.json({
            success: true,
            transcript,
        });
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
