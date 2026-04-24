'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VideoJob } from '@/lib/types';
import { UrlInputForm } from '@/components/url-input-form';
import { VideoDashboard } from '@/components/video-dashboard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogoIcon } from './icons';
import { useToast } from '@/hooks/use-toast';

// Constants for simulation
const DOWNLOAD_SPEED = 5 * 1024 * 1024; // 5 MB/s
const CONVERT_TIME = 8; // seconds
const TICK_INTERVAL = 500; // ms

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
      progress: 0,
      size: (Math.random() * 150 + 20) * 1024 * 1024, // Random size 20-170MB
    };
    setVideoJobs((prevJobs) => [newJob, ...prevJobs]);
    toast({
        title: "Conversion Added",
        description: "Your video has been added to the queue.",
    });
  }, [toast]);

  const handleDeleteVideoJob = useCallback((id: string) => {
    setVideoJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
  }, []);

  const handleRetryJob = useCallback((id: string) => {
    setVideoJobs(prevJobs => prevJobs.map(job => 
      job.id === id 
        ? { ...job, status: 'pending', statusMessage: 'Retrying...', progress: 0, errorMessage: undefined, speed: undefined, eta: undefined } 
        : job
    ));
  }, []);
  
  useEffect(() => {
    const tick = () => {
       setVideoJobs(currentJobs => {
        const activeJob = currentJobs.find(job => job.status === 'downloading' || job.status === 'converting');

        if (activeJob) {
          // An existing job is processing, update it
          return currentJobs.map(job => {
            if (job.id !== activeJob.id) return job;

            if (job.status === 'downloading') {
              const speedMBps = DOWNLOAD_SPEED / 1024 / 1024;
              const downloadedBytes = (job.progress / 100) * job.size;
              const newDownloadedBytes = downloadedBytes + (DOWNLOAD_SPEED * (TICK_INTERVAL / 1000));
              let newProgress = (newDownloadedBytes / job.size) * 100;
              const remainingBytes = job.size - newDownloadedBytes;
              const eta = remainingBytes > 0 ? Math.round(remainingBytes / DOWNLOAD_SPEED) : 0;
              
              if (newProgress >= 100) {
                 if (Math.random() < 0.1) { // 10% failure rate
                   return { ...job, status: 'failed', statusMessage: 'Download failed unexpectedly.', progress: 100, errorMessage: 'Network error during download.', speed: undefined, eta: undefined };
                 }
                return { ...job, status: 'converting', statusMessage: 'Downloaded. Converting...', progress: 0, speed: undefined, eta: undefined };
              }
              return { ...job, progress: newProgress, statusMessage: `Downloading...`, speed: speedMBps, eta };
            }

            if (job.status === 'converting') {
              const newProgress = job.progress + (100 / (CONVERT_TIME * (1000 / TICK_INTERVAL)));
              if (newProgress >= 100) {
                return { ...job, status: 'ready', statusMessage: 'Conversion complete!', progress: 100, speed: undefined, eta: undefined };
              }
              return { ...job, progress: newProgress, statusMessage: 'Converting...' };
            }
            return job;
          });
        } else {
          // No active job, find a pending one to start
          const pendingJobIndex = currentJobs.findIndex(job => job.status === 'pending');
          if (pendingJobIndex !== -1) {
            return currentJobs.map((job, index) => 
              index === pendingJobIndex 
                ? { ...job, status: 'downloading', statusMessage: 'Starting download...' }
                : job
            );
          }
        }
        
        return currentJobs; // No changes
      });
    };

    const timer = setInterval(tick, TICK_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const isQueueActive = videoJobs.some(job => job.status === 'downloading' || job.status === 'converting' || job.status === 'pending');

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
          <UrlInputForm onAddJob={handleAddVideoJob} isProcessing={isQueueActive}/>
        </div>
        
        <div className="mb-8">
          <VideoDashboard jobs={videoJobs} onDelete={handleDeleteVideoJob} onRetry={handleRetryJob} />
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
