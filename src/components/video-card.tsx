'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { CheckCircle2, Download, Loader, Trash2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VideoJob } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VideoCardProps {
  job: VideoJob;
  onDelete: (id: string) => void;
}

const StatusIndicator: FC<{ status: VideoJob['status'] }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Loader className="h-5 w-5 animate-spin text-muted-foreground" />;
    case 'downloading':
      return <Loader className="h-5 w-5 animate-spin text-primary" />;
    case 'converting':
      return <Loader className="h-5 w-5 animate-spin text-secondary" />;
    case 'ready':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return null;
  }
};

export const VideoCard: FC<VideoCardProps> = ({ job, onDelete }) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Initiated",
      description: `Preparing to download ${job.title}.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="relative p-0">
        <div className="aspect-video w-full overflow-hidden">
          <Image
            src={job.thumbnail}
            alt={`Thumbnail for ${job.title}`}
            width={600}
            height={400}
            data-ai-hint={job.thumbnailHint}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute right-2 top-2">
          <Badge
            variant={job.status === 'failed' ? 'destructive' : 'secondary'}
            className={cn('capitalize text-xs', {
              'bg-green-500/20 text-green-300 border-green-500/30': job.status === 'ready',
              'bg-primary/20 text-primary-foreground/80 border-primary/30': job.status === 'downloading'
            })}
          >
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 line-clamp-2 h-[3.5rem] font-headline text-lg">
          {job.title}
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <StatusIndicator status={job.status} />
          <p className="truncate">{job.statusMessage}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <TooltipProvider>
          <div className="flex w-full justify-end space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={job.status !== 'ready'}
                  onClick={handleDownload}
                  aria-label="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(job.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Job</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};
