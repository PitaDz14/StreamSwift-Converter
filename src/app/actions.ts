'use server';

import { intelligentFormatSuggestion, type IntelligentFormatSuggestionOutput } from '@/ai/flows/intelligent-format-suggestion';

// Mock function to simulate fetching YouTube video metadata
function getMockVideoMetadata(url: string) {
  // In a real app, you'd use a library like ytdl-core or a YouTube API
  // to fetch this data. For this demo, we'll return mock data.
  const isShortVideo = url.includes('shorts');
  const resolutions = ['1280x720', '1920x1080', '3840x2160'];
  const bitrates = ['1500k', '2500k', '5000k', '8000k'];
  
  const randomResolution = resolutions[Math.floor(Math.random() * resolutions.length)];
  
  return {
    title: `عنوان فيديو تجريبي من ${url.substring(0, 30)}...`,
    duration: isShortVideo ? 'PT0M45S' : `PT${Math.floor(Math.random() * 10) + 2}M${Math.floor(Math.random() * 60)}S`,
    resolution: randomResolution,
    fps: Math.random() > 0.5 ? 60 : 30,
    averageBitrate: bitrates[Math.floor(Math.random() * bitrates.length)],
    audioChannels: 2,
    originalFormat: 'mp4',
  };
}

export async function getFormatSuggestion(
  url: string
): Promise<IntelligentFormatSuggestionOutput | { error: string }> {
  try {
    if (!url || !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/.test(url)) {
      return { error: 'الرجاء إدخال رابط يوتيوب صالح.' };
    }

    const videoMetadata = getMockVideoMetadata(url);

    const suggestion = await intelligentFormatSuggestion({
      youtubeUrl: url,
      videoMetadata: videoMetadata,
    });

    return suggestion;
  } catch (e) {
    console.error('AI suggestion failed:', e);
    return { error: 'تعذر الحصول على اقتراح الذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.' };
  }
}
