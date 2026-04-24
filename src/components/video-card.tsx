'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { CheckCircle2, Copy, Loader, Share2, Trash2, XCircle, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleCopyLink = () => {
    if (!job.outputUrl) return;
    navigator.clipboard.writeText(job.outputUrl)
    .then(() => {
        toast({
            title: "تم نسخ الرابط",
            description: "تم نسخ رابط m3u8 إلى الحافظة.",
        });
    })
    .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            variant: "destructive",
            title: "فشل النسخ",
            description: "لم نتمكن من نسخ الرابط.",
        });
    });
  };

  const handleShare = async () => {
      if (!job.outputUrl) return;

      if (navigator.share) {
          try {
              await navigator.share({
                  title: job.title,
                  text: `رابط الفيديو المحول: ${job.title}`,
                  url: job.outputUrl,
              });
          } catch (error) {
              console.log('Web Share API canceled or failed.', error);
          }
      } else {
          toast({
              variant: "destructive",
              title: "المشاركة غير مدعومة",
              description: "متصفحك لا يدعم المشاركة المباشرة.",
          });
      }
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
        <div className="absolute right-2 top-2">
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
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
            <StatusIndicator status={job.status} />
            <p className="truncate">{job.statusMessage}</p>
          </div>
          {isProcessing && (
            <div>
              <Progress value={job.progress} className="h-2 w-full" />
              <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>
                  {job.speed !== undefined ? `${job.speed.toFixed(1)} ميجابايت/ثانية` : '...'}
                </span>
                <span>
                  {job.eta !== undefined ? `${job.eta} ثانية متبقية` : '...'}
                </span>
              </div>
            </div>
          )}
          {job.status === 'ready' && job.outputUrl && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <Label htmlFor={`output-url-${job.id}`} className="text-xs font-medium">رابط m3u8</Label>
              <Input id={`output-url-${job.id}`} readOnly dir="ltr" value={job.outputUrl} className="h-9 bg-muted/50 text-xs" />
            </div>
          )}
          {job.status === 'failed' && job.errorMessage && (
             <p className="text-xs text-destructive">{job.errorMessage}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <TooltipProvider>
          <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                 {job.status === 'ready' && job.outputUrl && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4" /></Button></TooltipTrigger>
                            <TooltipContent><p>نسخ الرابط</p></TooltipContent>
                        </Tooltip>
                        {typeof navigator !== 'undefined' && navigator.share && (
                           <Tooltip>
                                <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button></TooltipTrigger>
                                <TooltipContent><p>مشاركة</p></TooltipContent>
                            </Tooltip>
                        )}
                   </>
                )}
                {job.status === 'failed' && (
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => onRetry(job.id)}><RotateCw className="h-4 w-4" /></Button></TooltipTrigger>
                        <TooltipContent><p>إعادة المحاولة</p></TooltipContent>
                    </Tooltip>
                )}
              </div>

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
