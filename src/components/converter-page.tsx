'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { VideoJob } from '@/lib/types';
import { UrlInputForm } from '@/components/url-input-form';
import { VideoDashboard } from '@/components/video-dashboard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogoIcon } from './icons';
import { useToast } from '@/hooks/use-toast';

// Constants for simulation
const DOWNLOAD_SPEED = 2 * 1024 * 1024; // 2 MB/s
const VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const CONVERT_TIME = 8; // seconds
const TICK_INTERVAL = 500; // ms

export function ConverterPage() {
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const { toast } = useToast();
  const activeTimers = useRef<NodeJS.Timeout[]>([]);

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

  const handleRetryJob = useCallback((id: string) => {
    setVideoJobs(prevJobs => prevJobs.map(job => 
      job.id === id 
        ? { ...job, status: 'pending', statusMessage: 'Retrying...', progress: 0, errorMessage: undefined } 
        : job
    ));
  }, []);
  
  useEffect(() => {
    const processQueue = () => {
      videoJobs.forEach(job => {
        if (job.status === 'pending') {
          // Start processing this job
          setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'downloading', statusMessage: 'Starting download...' } : j));
        }
      });
    };
    
    const interval = setInterval(processQueue, 1000);
    return () => clearInterval(interval);
  }, [videoJobs]);

  useEffect(() => {
    const tick = () => {
       setVideoJobs(currentJobs => {
        return currentJobs.map(job => {
          if (job.status === 'downloading') {
            const downloadedBytes = (job.progress / 100) * VIDEO_SIZE;
            const newDownloadedBytes = downloadedBytes + (DOWNLOAD_SPEED * (TICK_INTERVAL / 1000));
            let newProgress = (newDownloadedBytes / VIDEO_SIZE) * 100;
            
            if (newProgress >= 100) {
              newProgress = 100;
              // Randomly fail some jobs for demonstration
              if (Math.random() < 0.2) {
                 return { ...job, status: 'failed', statusMessage: 'Download failed unexpectedly.', progress: 100, errorMessage: 'Network error during download.' };
              }
              return { ...job, status: 'converting', statusMessage: 'Downloaded. Starting conversion...', progress: 0 };
            }
            
            return { ...job, progress: newProgress, statusMessage: `Downloading... (${(DOWNLOAD_SPEED / 1024 / 1024).toFixed(1)} MB/s)` };
          } 
          
          if (job.status === 'converting') {
            const newProgress = job.progress + (100 / (CONVERT_TIME * (1000 / TICK_INTERVAL)));

            if (newProgress >= 100) {
              return { ...job, status: 'ready', statusMessage: 'Conversion complete!', progress: 100 };
            }
            return { ...job, progress: newProgress, statusMessage: 'Converting video...' };
          }
          
          return job;
        });
      });
    };

    const timer = setInterval(tick, TICK_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const isProcessing = videoJobs.some(job => job.status === 'downloading' || job.status === 'converting');

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
