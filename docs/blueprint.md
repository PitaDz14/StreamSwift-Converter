# **App Name**: StreamSwift Converter

## Core Features:

- Video URL Input: Provides a clean interface for users to paste and submit YouTube video URLs for conversion.
- Conversion Job Initiation: Submits the provided YouTube URL to a backend API to trigger asynchronous video download and format conversion (m3u8/TS).
- Intelligent Format Suggestion: An AI tool analyzes the YouTube video's metadata (e.g., resolution, audio channels) and inferred user intent to recommend and apply optimal HLS/TS encoding parameters (codec, bitrate, resolution) for superior streaming quality or smaller file size.
- Processed Video Dashboard: Displays a dashboard with a paginated list of all videos submitted for conversion, showing their titles, processing status (e.g., 'pending', 'downloading', 'converting', 'ready', 'failed'), and a small thumbnail preview.
- Download Converted Stream: Enables users to download the finalized m3u8 playlist or TS segment files directly for use with compatible streaming players or other applications.
- Delete Processed Video: Offers an option to remove specific video entries from the dashboard and trigger the deletion of associated converted files from the server's storage.
- Developer Acknowledgment: Prominently displays 'Developed by Khaled_Deragha' in the application's footer.

## Style Guidelines:

- Color Anchor: The user-specified 'Deep Indigo' and 'Coral Red' conveying a modern, professional, and dynamic application focused on video processing. Scheme: Dark Theme, as explicitly requested.
- Background Color: A rich, deep indigo hue (HSL(240, 50%, 15%)) which converts to RGB hex '#12122B', providing a sophisticated and immersive dark environment.
- Primary Accent Color: A vibrant coral red (HSL(10, 95%, 65%)) which converts to RGB hex '#FF6659', used for primary calls to action, interactive elements, and key information.
- Secondary Accent Color: An analogous magenta-pink (HSL(340, 80%, 70%)) which converts to RGB hex '#EC77BD', providing secondary highlights and visual interest, complementing the primary accent.
- Headlines Font: 'Space Grotesk' (sans-serif), for its modern, tech-inspired aesthetic, ideal for titles and prominent textual elements.
- Body Text Font: 'Inter' (sans-serif), for excellent readability and a neutral, professional appearance across various content types and sizes.
- Style: Utilize a set of clean, minimalist, and outline-based vector icons. These should maintain consistency with the modern dark theme and clearly communicate actions related to video, download, and playback functions.
- Structure: A responsive, dashboard-style layout optimized for seamless user experience across both desktop and mobile browsers. Key interactive elements (URL input, video list, controls) will be logically grouped and easily accessible.
- Subtle Transitions: Implement smooth and tasteful animations, such as gentle fades, subtle slides, and fluid loading indicators, to enhance perceived responsiveness and provide engaging feedback on user interactions and job status updates.