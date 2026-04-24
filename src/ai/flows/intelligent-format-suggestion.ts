'use server';
/**
 * @fileOverview This flow provides intelligent suggestions for optimal HLS/TS encoding parameters
 * based on YouTube video metadata, balancing streaming quality and file size.
 *
 * - intelligentFormatSuggestion - A function that suggests encoding parameters.
 * - IntelligentFormatSuggestionInput - The input type for the intelligentFormatSuggestion function.
 * - IntelligentFormatSuggestionOutput - The return type for the intelligentFormatSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentFormatSuggestionInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The YouTube video URL.'),
  videoMetadata: z.object({
    title: z.string().describe('The title of the video.').optional(),
    duration: z.string().describe('The duration of the video (e.g., "PT5M30S").').optional(),
    resolution: z.string().describe('The highest available resolution (e.g., "1920x1080").').optional(),
    fps: z.number().describe('Frames per second of the video.').optional(),
    averageBitrate: z.string().describe('The average bitrate of the original video (e.g., "5000k").').optional(),
    audioChannels: z.number().describe('Number of audio channels.').optional(),
    originalFormat: z.string().describe('The original container format (e.g., "mp4").').optional(),
  }).describe('Extracted metadata about the YouTube video.'),
});
export type IntelligentFormatSuggestionInput = z.infer<typeof IntelligentFormatSuggestionInputSchema>;

const IntelligentFormatSuggestionOutputSchema = z.object({
  format: z.enum(['m3u8', 'ts']).describe('The suggested output format (HLS: m3u8 or ts).'),
  codec: z.string().describe('The suggested video codec (e.g., h264, hevc).'),
  bitrate: z.string().describe('The suggested video bitrate for conversion (e.g., "2000k", "auto" for original).'),
  resolution: z.string().describe('The suggested output resolution (e.g., "1920x1080", "original").'),
  description: z.string().describe('شرح موجز للمعلمات المقترحة باللغة العربية.'),
});
export type IntelligentFormatSuggestionOutput = z.infer<typeof IntelligentFormatSuggestionOutputSchema>;

export async function intelligentFormatSuggestion(input: IntelligentFormatSuggestionInput): Promise<IntelligentFormatSuggestionOutput> {
  return intelligentFormatSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentFormatSuggestionPrompt',
  input: { schema: IntelligentFormatSuggestionInputSchema },
  output: { schema: IntelligentFormatSuggestionOutputSchema },
  prompt: `You are an expert in video encoding and streaming optimization. Your task is to recommend optimal HLS/TS encoding parameters for a YouTube video, balancing streaming quality and file size.

Analyze the provided video metadata and suggest the best encoding parameters for conversion to HLS (either m3u8 playlist or raw TS segments).

Consider the following:
- For general use, prioritize a good balance of quality and file size.
- If the original video quality is high, suggest maintaining good quality.
- If the original video has a lower bitrate or resolution, adjust the suggestions accordingly to avoid unnecessary upscaling or over-encoding.
- For 'bitrate', you can suggest specific values like '2000k', '5000k', or 'auto' to match the original if appropriate.
- For 'resolution', you can suggest specific values like '1920x1080', '1280x720', or 'original' to keep the source resolution.
- Always suggest either 'm3u8' or 'ts' for the format.
- The user's language is Arabic. The final 'description' field MUST be in Arabic.

YouTube Video URL: {{{youtubeUrl}}}

Video Metadata:
{{#if videoMetadata.title}}- Title: {{{videoMetadata.title}}}{{/if}}
{{#if videoMetadata.duration}}- Duration: {{{videoMetadata.duration}}}{{/if}}
{{#if videoMetadata.resolution}}- Resolution: {{{videoMetadata.resolution}}}{{/if}}
{{#if videoMetadata.fps}}- FPS: {{{videoMetadata.fps}}}{{/if}}
{{#if videoMetadata.averageBitrate}}- Average Bitrate: {{{videoMetadata.averageBitrate}}}{{/if}}
{{#if videoMetadata.audioChannels}}- Audio Channels: {{{videoMetadata.audioChannels}}}{{/if}}
{{#if videoMetadata.originalFormat}}- Original Format: {{{videoMetadata.originalFormat}}}{{/if}}

Based on this, what are the optimal encoding parameters and why? Provide the description in Arabic.`,
});

const intelligentFormatSuggestionFlow = ai.defineFlow(
  {
    name: 'intelligentFormatSuggestionFlow',
    inputSchema: IntelligentFormatSuggestionInputSchema,
    outputSchema: IntelligentFormatSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
