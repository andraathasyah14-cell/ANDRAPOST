
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const tags = [
  'Repost',
  'Original',
  'Technology',
  'Government',
  'International',
  'Domestic',
  'Quantitative',
  'Qualitative',
];

const initialState = {
    success: false,
    message: '',
    errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Upload Ongoing
    </Button>
  );
}

export default function OngoingForm({ onUpload }: { onUpload: (prevState: any, formData: FormData) => Promise<any> }) {
  const [state, formAction] = useFormState(onUpload, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="startedOn">Waktu (tanggal dimulai)</Label>
            <Input id="startedOn" name="startedOn" type="date" placeholder="YYYY-MM-DD" />
            {state?.errors?.startedOn && <p className="text-sm text-destructive">{state.errors.startedOn[0]}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="author">Nama Penulis</Label>
            <Input id="author" name="author" placeholder="Nama Anda" />
            {state?.errors?.author && <p className="text-sm text-destructive">{state.errors.author[0]}</p>}
        </div>
      </div>
       <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" name="title" placeholder="Judul riset" />
        {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label>Tag</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={`ongoing-tag-${tag}`} name="tags" value={tag} />
              <Label htmlFor={`ongoing-tag-${tag}`}>{tag}</Label>
            </div>
          ))}
        </div>
        {state?.errors?.tags && <p className="text-sm text-destructive">{state.errors.tags[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Singkat</Label>
        <Textarea id="description" name="description" placeholder="Deskripsi singkat mengenai riset yang sedang berjalan..." rows={4} />
        {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="image">Gambar</Label>
        <Select name="image">
            <SelectTrigger>
                <SelectValue placeholder="Pilih gambar placeholder" />
            </SelectTrigger>
            <SelectContent>
                {PlaceHolderImages.map(img => (
                    <SelectItem key={img.id} value={img.id}>
                        {img.id} - {img.description}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Pilih gambar dari daftar placeholder yang ada.</p>
        {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
