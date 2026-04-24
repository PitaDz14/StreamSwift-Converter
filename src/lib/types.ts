export type VideoJobStatus = 'pending' | 'downloading' | 'converting' | 'ready' | 'failed';

export type VideoJob = {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  thumbnailHint: string;
  status: VideoJobStatus;
  format?: string;
  codec?: string;
  bitrate?: string;
  resolution?: string;
  statusMessage: string;
};
