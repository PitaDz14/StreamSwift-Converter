'use client';

import type { FC } from 'react';
import { VideoCard } from '@/components/video-card';
import type { VideoJob } from '@/lib/types';
import { FileQuestion } from 'lucide-react';

interface VideoDashboardProps {
  jobs: VideoJob[];
  onDelete: (id: string) => void;
}

export const VideoDashboard: FC<VideoDashboardProps> = ({ jobs, onDelete }) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <FileQuestion className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="font-headline text-xl font-bold">No conversions yet</h3>
        <p className="text-muted-foreground">
          Enter a YouTube URL above to start your first conversion.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {jobs.map((job) => (
        <VideoCard key={job.id} job={job} onDelete={onDelete} />
      ))}
    </div>
  );
};
