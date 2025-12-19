import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { videoId: string } }
) {
    try {
        const supabase = await createClient();
        const videoId = params.videoId;

        const { data, error } = await supabase
            .from('curated_videos')
            .select('*')
            .eq('video_id', videoId)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            video: data
        });

    } catch (error) {
        console.error('Curated video fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
