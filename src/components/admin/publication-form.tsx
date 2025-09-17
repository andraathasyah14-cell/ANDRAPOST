
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
      Upload Publikasi
    </Button>
  );
}

export default function PublicationForm({ onUpload }: { onUpload: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string; errors: any; }> }) {
  const [state, formAction] = useActionState(onUpload, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

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
      const url = await handleImageUpload(file, (progress) => {
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
          <Label htmlFor="publishedOn">Waktu (tanggal dibuat)</Label>
          <Input id="publishedOn" name="publishedOn" placeholder="e.g., Q2 2024 atau YYYY-MM-DD" />
          {state?.errors?.publishedOn && <p className="text-sm text-destructive">{state.errors.publishedOn[0]}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" name="title" placeholder="Judul publikasi" />
        {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label>Tag</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={`pub-tag-${tag}`} name="tags" value={tag} />
              <Label htmlFor={`pub-tag-${tag}`}>{tag}</Label>
            </div>
          ))}
        </div>
        {state?.errors?.tags && <p className="text-sm text-destructive">{state.errors.tags[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" name="description" placeholder="Deskripsi singkat mengenai publikasi..." rows={4} />
        {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="fileUrl">URL File Publikasi</Label>
        <Input id="fileUrl" name="fileUrl" type="url" placeholder="https://example.com/file.pdf" />
         <p className="text-xs text-muted-foreground">Harap masukkan URL yang valid (diawali dengan http/https).</p>
        {state?.errors?.fileUrl && <p className="text-sm text-destructive">{state.errors.fileUrl[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup name="status" defaultValue="public" className="flex gap-4">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="status-public" />
                <Label htmlFor="status-public" className="flex items-center gap-2"> <span className="h-3 w-3 rounded-full bg-green-500"></span> Umum</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="status-private" />
                <Label htmlFor="status-private" className="flex items-center gap-2"> <span className="h-3 w-3 rounded-full bg-red-500"></span> Izin Khusus</Label>
            </div>
        </RadioGroup>
        {state?.errors?.status && <p className="text-sm text-destructive">{state.errors.status[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image-upload-pub">Gambar</Label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-20 bg-muted rounded-md flex items-center justify-center">
            {uploadProgress ? <Loader2 className="animate-spin" /> : imageUrl ? (
              <Image src={imageUrl} alt="Preview" width={128} height={80} className="object-cover rounded-md w-full h-full" />
            ) : (
              <ImageIcon className="text-muted-foreground" />
            )}
          </div>
          <Button type="button" asChild variant="outline">
            <Label htmlFor="image-upload-pub" className="cursor-pointer">
              <UploadCloud className="mr-2" />
              Unggah Gambar
            </Label>
          </Button>
        </div>
        <Input id="image-upload-pub" type="file" className="hidden" accept="image/*" onChange={onImageChange} disabled={!!uploadProgress} />
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
