'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getFormatSuggestion } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Loader, Wand2, Youtube, X } from 'lucide-react';
import type { IntelligentFormatSuggestionOutput } from '@/ai/flows/intelligent-format-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
});

interface UrlInputFormProps {
  onAddJob: (jobData: {
    url: string,
    title: string,
    format?: string,
    codec?: string,
    bitrate?: string,
    resolution?: string,
  }) => void;
  isProcessing: boolean;
}

export function UrlInputForm({ onAddJob, isProcessing }: UrlInputFormProps) {
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<IntelligentFormatSuggestionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('url', e.target.value);
    const url = e.target.value;
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/.test(url)) {
      setSuggestion(null);
      startAiTransition(async () => {
        const result = await getFormatSuggestion(url);
        if ('error' in result) {
          console.warn(result.error);
        } else {
          setSuggestion(result);
        }
      });
    } else {
      setSuggestion(null);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddJob({
      url: values.url,
      title: suggestion?.description || `Conversion for ${values.url}`,
      ...suggestion,
    });
    form.reset();
    setSuggestion(null);
  };
  
  const handleUseSuggestion = () => {
    if (form.getValues('url')) {
      onSubmit({ url: form.getValues('url') });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'URL field is empty.',
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">YouTube URL</FormLabel>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Input
                      {...field}
                      onChange={handleUrlChange}
                      placeholder="Paste a YouTube URL here..."
                      className="pl-10 h-12 text-base"
                      disabled={isProcessing}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12" disabled={isProcessing || form.formState.isSubmitting || !form.formState.isValid}>
            {isProcessing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing Queue...
              </>
            ) : (
              'Convert Now'
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-4 min-h-[120px]">
        {isAiPending && (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
             <Loader className="mr-2 h-4 w-4 animate-spin" />
             <span>Analyzing video for optimal settings...</span>
          </div>
        )}
        {suggestion && !isAiPending && (
          <Card className="bg-card/50 border-primary/20 animate-in fade-in-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                 <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">
                    <Wand2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-headline font-semibold">AI Suggestion</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">Format: {suggestion.format}</Badge>
                        <Badge variant="outline">Codec: {suggestion.codec}</Badge>
                        <Badge variant="outline">Bitrate: {suggestion.bitrate}</Badge>
                        <Badge variant="outline">Resolution: {suggestion.resolution}</Badge>
                    </div>
                  </div>
                 </div>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSuggestion(null)}>
                  <X className="h-4 w-4" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
