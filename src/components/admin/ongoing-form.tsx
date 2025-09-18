
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { handleImageUpload, type UploadProgress } from '@/lib/storage';
import { Progress } from '@/components/ui/progress';

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
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Upload Ongoing
    </Button>
  );
}

export default function OngoingForm({ onUpload }: { onUpload: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string; errors: any; }> }) {
  const [state, formAction] = useActionState(onUpload, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  useEffect(() => {
    // Set a client-side default value for the date input to avoid hydration mismatches
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDefaultDate(now.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
        setImageUrl(null);
      }
    }
  }, [state, toast]);

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress({ percentage: 0, speed: '0 KB/s' });
    try {
      const url = await handleImageUpload(file, 'ongoing', (progress) => {
        setUploadProgress(progress);
      });
      setImageUrl(url);
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil diunggah.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunggah gambar.';
      toast({
        title: 'Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl || ''} />
      <div className="space-y-2">
          <Label htmlFor="startedOn">Waktu (tanggal dimulai)</Label>
          <Input id="startedOn" name="startedOn" type="datetime-local" defaultValue={defaultDate} />
          {state?.errors?.startedOn && <p className="text-sm text-destructive">{state.errors.startedOn[0]}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" name="title" placeholder="Judul riset" />
        {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label>Tag</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
        <Label htmlFor="image-upload-ongoing">Gambar</Label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-20 bg-muted rounded-md flex items-center justify-center">
            {uploadProgress ? <Loader2 className="animate-spin" /> : imageUrl ? (
              <Image src={imageUrl} alt="Preview" width={128} height={80} className="object-cover rounded-md w-full h-full" />
            ) : (
              <ImageIcon className="text-muted-foreground" />
            )}
          </div>
          <Button type="button" asChild variant="outline">
            <Label htmlFor="image-upload-ongoing" className="cursor-pointer">
              <UploadCloud className="mr-2" />
              Unggah Gambar
            </Label>
          </Button>
        </div>
        <Input id="image-upload-ongoing" type="file" className="hidden" accept="image/*" onChange={onImageChange} disabled={!!uploadProgress} />
        {uploadProgress && (
          <div className="space-y-1">
            <Progress value={uploadProgress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(uploadProgress.percentage)}% | {uploadProgress.speed}</p>
          </div>
        )}
        {state?.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
