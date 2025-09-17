// src/components/admin/profile-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BookOpen, MessageSquare, PlusCircle, Trash2, Loader2, Camera, Upload } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/actions';
import { handleImageUpload, type UploadProgress } from '@/lib/storage';
import type { Profile } from '@/lib/data';
import { Progress } from '@/components/ui/progress';

const toolSchema = z.object({
  name: z.string().min(1, 'Nama perkakas harus diisi'),
  imageUrl: z.string().min(1, 'Logo harus diunggah'),
});

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  tools: z.array(toolSchema).min(1, 'Minimal satu perkakas harus ditambahkan'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileData extends Profile {
    totalPublications: number;
    totalOpinions: number;
}

interface ProfileFormProps {
  profileData: ProfileData
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Simpan Perubahan
    </Button>
  );
}

export default function ProfileForm({ profileData }: ProfileFormProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadingToolIndex, setUploadingToolIndex] = useState<number | null>(null);
  const [state, formAction] = useActionState(updateProfile, { success: false, message: '' });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profileData.name || '',
      description: profileData.description || '',
      tools: profileData.tools || [],
      imageUrl: profileData.imageUrl || 'https://picsum.photos/seed/profile/400/400',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tools',
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
  useEffect(() => {
    form.reset({
      name: profileData.name,
      description: profileData.description,
      tools: profileData.tools,
      imageUrl: profileData.imageUrl || 'https://picsum.photos/seed/profile/400/400',
    });
  }, [profileData, form]);

  const handleFormSubmit = (data: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('imageUrl', data.imageUrl || '');
    data.tools.forEach(tool => {
        formData.append('tools', JSON.stringify(tool));
    });
    formAction(formData);
  }

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>, isTool: boolean, index?: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (isTool && typeof index !== 'number') return;

    if(isTool) {
      setUploadingToolIndex(index!);
    }
    setUploadProgress({ percentage: 0, speed: '0 KB/s' });
    
    try {
      const url = await handleImageUpload(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (isTool) {
        form.setValue(`tools.${index!}.imageUrl`, url);
      } else {
        form.setValue('imageUrl', url);
      }

      toast({
        title: 'Berhasil',
        description: `Gambar berhasil diunggah. Jangan lupa simpan perubahan.`,
      });
    } catch (error) {
        let errorMessage = 'Terjadi kesalahan saat mengunggah gambar.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
            title: 'Gagal',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setUploadProgress(null);
        if(isTool) {
          setUploadingToolIndex(null);
        }
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Image
                src={form.watch('imageUrl') || "https://picsum.photos/seed/profile/400/400"}
                alt="Profile"
                width={150}
                height={150}
                className="rounded-lg aspect-square object-cover border-4 border-background shadow-lg"
              />
              <Label 
                htmlFor="profile-image-upload" 
                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md"
              >
                {uploadProgress && !uploadingToolIndex ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
              </Label>
              <Input 
                id="profile-image-upload" 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif"
                onChange={(e) => onImageChange(e, false)}
                disabled={!!uploadProgress}
              />
            </div>
             {uploadProgress && !uploadingToolIndex ? (
              <div className="w-full text-center space-y-1">
                <Progress value={uploadProgress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress.percentage)}% | {uploadProgress.speed}</p>
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Klik pada gambar untuk mengganti foto profil Anda.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistik Konten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary mr-4" />
              <div>
                <p className="text-xl font-bold">{profileData.totalPublications}</p>
                <p className="text-sm text-muted-foreground">Publikasi</p>
              </div>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-accent mr-4" />
              <div>
                <p className="text-xl font-bold">{profileData.totalOpinions}</p>
                <p className="text-sm text-muted-foreground">Opini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Profil</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat dan menarik tentang Anda..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="mb-4 block">Kelola Perkakas</Label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4">
                     <FormField
                      control={form.control}
                      name={`tools.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Nama Perkakas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {form.watch(`tools.${index}.imageUrl`) && (
                        <Image src={form.watch(`tools.${index}.imageUrl`)} alt="Tool Logo" width={40} height={40} className="rounded-md object-contain aspect-square bg-muted p-1" />
                      )}
                      <Button asChild variant="outline" size="icon">
                        <Label htmlFor={`tool-logo-upload-${index}`}>
                          {uploadingToolIndex === index ? <Loader2 className="animate-spin" /> : <Upload />}
                        </Label>
                      </Button>
                      <Input
                        id={`tool-logo-upload-${index}`}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif, image/svg+xml"
                        onChange={(e) => onImageChange(e, true, index)}
                        disabled={uploadingToolIndex !== null}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {uploadProgress && uploadingToolIndex !== null && (
                    <div className="w-full text-center space-y-1">
                        <Progress value={uploadProgress.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{Math.round(uploadProgress.percentage)}% | {uploadProgress.speed}</p>
                    </div>
                )}
                <Button type="button" variant="outline" onClick={() => append({ name: '', imageUrl: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Perkakas
                </Button>
                 {form.formState.errors.tools && !form.formState.errors.tools.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.tools.message}
                  </p>
                )}
              </div>
            </div>

            <SubmitButton />
          </form>
        </Form>
      </div>
    </div>
  );
}
