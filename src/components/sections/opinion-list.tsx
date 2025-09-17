'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { OpinionPost } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Tag as TagIcon } from 'lucide-react';
import { X } from 'lucide-react';

interface OpinionListProps {
  opinions: OpinionPost[];
}

export default function OpinionList({ opinions }: OpinionListProps) {
  const [selectedOpinion, setSelectedOpinion] = useState<OpinionPost | null>(
    null
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {opinions.slice(0, 6).map((opinion) => (
          <Card
            key={opinion.id}
            className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => setSelectedOpinion(opinion)}
          >
            <div className="aspect-video overflow-hidden">
              <Image
                src={opinion.image.imageUrl}
                alt={opinion.image.description}
                width={600}
                height={400}
                data-ai-hint={opinion.image.imageHint}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg leading-tight h-14 line-clamp-2">
                {opinion.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {opinion.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{opinion.postedOn}</span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedOpinion}
        onOpenChange={(isOpen) => !isOpen && setSelectedOpinion(null)}
      >
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-bold">{selectedOpinion?.title}</DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{selectedOpinion?.postedOn}</span>
                    </div>
                     <div className="flex items-center flex-wrap gap-2">
                        <TagIcon className="w-4 h-4 mr-2" />
                        {selectedOpinion?.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 overflow-y-auto flex-grow">
                <p className="text-base leading-relaxed text-foreground/90">
                    {selectedOpinion?.content}
                </p>
            </div>
             <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
