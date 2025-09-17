
'use client';

import type { OpinionContent, PublicationContent, OngoingContent } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleDeleteContent } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';


type ContentItem = OpinionContent | PublicationContent | OngoingContent;

interface ContentListProps {
  opinions: OpinionContent[];
  publications: PublicationContent[];
  ongoingResearches: OngoingContent[];
}

function ContentItemRow({ item, typeName }: { item: ContentItem; typeName: string }) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    toast({
      title: 'Fitur Dalam Pengembangan',
      description: 'Kemampuan untuk mengedit konten akan segera hadir!',
    });
  };

  const performDelete = async () => {
    setIsDeleting(true);
    const result = await handleDeleteContent(item.id);
    if (result.success) {
      toast({
        title: 'Berhasil',
        description: result.message,
      });
    } else {
      toast({
        title: 'Gagal',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Image 
            src={item.image.imageUrl} 
            alt={item.title} 
            width={80} 
            height={45} 
            className="rounded-md object-cover aspect-video" 
        />
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-muted-foreground">{typeName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Hapus</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat diurungkan. Ini akan menghapus konten secara permanen dari server (secara demo).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={performDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function ContentList({ opinions, publications, ongoingResearches }: ContentListProps) {
  return (
    <Accordion type="multiple" defaultValue={['opinions', 'publications', 'ongoing']} className="w-full">
      <AccordionItem value="opinions">
        <AccordionTrigger>Opini ({opinions.length})</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col">
            {opinions.length > 0 ? opinions.map(item => <ContentItemRow key={item.id} item={item} typeName="Opini" />) : <p className="p-4 text-muted-foreground">Belum ada opini yang diunggah.</p>}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="publications">
        <AccordionTrigger>Publikasi ({publications.length})</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col">
             {publications.length > 0 ? publications.map(item => <ContentItemRow key={item.id} item={item} typeName="Publikasi" />) : <p className="p-4 text-muted-foreground">Belum ada publikasi yang diunggah.</p>}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="ongoing">
        <AccordionTrigger>Riset Ongoing ({ongoingResearches.length})</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col">
            {ongoingResearches.length > 0 ? ongoingResearches.map(item => <ContentItemRow key={item.id} item={item} typeName="Riset Ongoing" />) : <p className="p-4 text-muted-foreground">Belum ada riset yang diunggah.</p>}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
