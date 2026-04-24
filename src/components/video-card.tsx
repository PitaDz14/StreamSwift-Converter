'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { CheckCircle2, Download, Loader, Trash2, XCircle, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  onRetry: (id: string) => void;
}

const statusTranslations: Record<VideoJob['status'], string> = {
  pending: 'قيد الانتظار',
  downloading: 'جار التحميل',
  converting: 'جار التحويل',
  ready: 'جاهز',
  failed: 'فشل',
};

const StatusIndicator: FC<{ status: VideoJob['status'] }> = ({ status }) => {
  const commonClasses = "h-5 w-5";
  switch (status) {
    case 'pending':
      return <Loader className={cn(commonClasses, "animate-spin text-muted-foreground")} />;
    case 'downloading':
    case 'converting':
      return <Loader className={cn(commonClasses, "animate-spin text-primary")} />;
    case 'ready':
      return <CheckCircle2 className={cn(commonClasses, "text-green-500")} />;
    case 'failed':
      return <XCircle className={cn(commonClasses, "text-destructive")} />;
    default:
      return null;
  }
};

export const VideoCard: FC<VideoCardProps> = ({ job, onDelete, onRetry }) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "بدء التحميل",
      description: `جاري التحضير لتحميل ${job.title}.`,
    });
    // In a real app, this would trigger a file download.
  };

  const isProcessing = job.status === 'downloading' || job.status === 'converting';

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 bg-gradient-to-br from-card to-card/90 hover:shadow-xl hover:shadow-primary/10 border-border/60">
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
        <div className="absolute left-2 top-2">
          <Badge
            variant={job.status === 'failed' ? 'destructive' : 'secondary'}
            className={cn('capitalize text-xs', {
              'bg-green-600/30 text-green-200 border-green-500/30': job.status === 'ready',
              'bg-primary/20 text-primary-foreground/80 border-primary/30': isProcessing,
            })}
          >
            {statusTranslations[job.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 line-clamp-2 h-[3rem] font-headline text-lg">
          {job.title}
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <StatusIndicator status={job.status} />
            <p className="truncate">{job.statusMessage}</p>
          </div>
          {(isProcessing || job.status === 'ready') && (
            <div>
              <Progress value={job.progress} className="h-2 w-full" />
              {isProcessing && (
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {job.speed !== undefined ? `${job.speed.toFixed(1)} ميجابايت/ثانية` : '...'}
                  </span>
                  <span>
                    {job.eta !== undefined ? `${job.eta} ثانية متبقية` : '...'}
                  </span>
                </div>
              )}
            </div>
          )}
          {job.status === 'failed' && job.errorMessage && (
             <p className="text-xs text-destructive">{job.errorMessage}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <TooltipProvider>
          <div className="flex w-full justify-start space-x-2 space-x-reverse">
             {job.status === 'failed' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onRetry(job.id)}
                    aria-label="إعادة المحاولة"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>إعادة محاولة المهمة</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={job.status !== 'ready'}
                  onClick={handleDownload}
                  aria-label="تنزيل"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>تنزيل</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(job.id)}
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>حذف المهمة</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};
