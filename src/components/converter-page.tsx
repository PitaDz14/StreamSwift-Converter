'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VideoJob, VideoJobStatus } from '@/lib/types';
import { UrlInputForm } from '@/components/url-input-form';
import { VideoDashboard } from '@/components/video-dashboard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogoIcon } from './icons';
import { useToast } from '@/hooks/use-toast';

const STATUS_PIPELINE: { status: VideoJobStatus; message: string; duration: number }[] = [
  { status: 'downloading', message: 'Downloading video from source...', duration: 5000 },
  { status: 'converting', message: 'Converting to suggested format...', duration: 8000 },
  { status: 'ready', message: 'Conversion complete and ready for download.', duration: 0 },
];

export function ConverterPage() {
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const { toast } = useToast();

  const handleAddVideoJob = useCallback((jobData: { url: string, title: string, format?: string, codec?: string, bitrate?: string, resolution?: string }) => {
    const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    const newJob: VideoJob = {
      id: crypto.randomUUID(),
      url: jobData.url,
      title: jobData.title || 'Untitled Conversion',
      thumbnail: randomImage.imageUrl,
      thumbnailHint: randomImage.imageHint,
      status: 'pending',
      statusMessage: 'In queue for processing...',
      format: jobData.format,
      codec: jobData.codec,
      bitrate: jobData.bitrate,
      resolution: jobData.resolution,
    };
    setVideoJobs((prevJobs) => [newJob, ...prevJobs]);
    toast({
        title: "Conversion Started",
        description: "Your video has been added to the queue.",
    });
  }, [toast]);

  const handleDeleteVideoJob = useCallback((id: string) => {
    setVideoJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
  }, []);

  useEffect(() => {
    const processQueue = () => {
      setVideoJobs((prevJobs) => {
        const newJobs = [...prevJobs];
        let changed = false;

        newJobs.forEach((job, index) => {
          if (job.status !== 'ready' && job.status !== 'failed') {
            const currentPipelineIndex = STATUS_PIPELINE.findIndex(p => p.status === job.status) + 1;
            
            if (job.status === 'pending' && currentPipelineIndex === 0) {
               // Initial transition from pending
               setTimeout(() => {
                   setVideoJobs(current => {
                       const jobs = [...current];
                       const jobIndex = jobs.findIndex(j => j.id === job.id);
                       if (jobIndex > -1) {
                           jobs[jobIndex] = { ...jobs[jobIndex], status: STATUS_PIPELINE[0].status, statusMessage: STATUS_PIPELINE[0].message };
                           return jobs;
                       }
                       return current;
                   });
               }, 2000); // Wait 2s before starting
            }
             else if (currentPipelineIndex > 0 && currentPipelineIndex < STATUS_PIPELINE.length) {
              const nextStage = STATUS_PIPELINE[currentPipelineIndex];
              setTimeout(() => {
                setVideoJobs(current => {
                  const jobs = [...current];
                  const jobIndex = jobs.findIndex(j => j.id === job.id);
                  if (jobIndex > -1 && jobs[jobIndex].status !== 'ready') {
                    jobs[jobIndex] = { ...jobs[jobIndex], status: nextStage.status, statusMessage: nextStage.message };
                    return jobs;
                  }
                  return current;
                })
              }, STATUS_PIPELINE[currentPipelineIndex - 1].duration);
            }
          }
        });
        
        return prevJobs; 
      });
    };
    
    const jobToProcess = videoJobs.find(job => job.status === 'pending');
    if (jobToProcess) {
      processQueue();
    }
  }, [videoJobs]);
  
  const isProcessing = videoJobs.some(job => job.status !== 'ready' && job.status !== 'failed');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center space-x-3">
          <LogoIcon className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-3xl font-bold">StreamSwift Converter</h1>
            <p className="text-muted-foreground">Intelligent Video Format Conversion</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto max-w-4xl flex-grow px-4">
        <div className="mb-8">
          <UrlInputForm onAddJob={handleAddVideoJob} isProcessing={isProcessing}/>
        </div>
        
        <div className="mb-8">
          <VideoDashboard jobs={videoJobs} onDelete={handleDeleteVideoJob} />
        </div>
      </main>
      
      <footer className="w-full py-4">
        <p className="text-center text-sm text-muted-foreground">
          Developed by Khaled_Deragha
        </p>
      </footer>
    </div>
  );
}
