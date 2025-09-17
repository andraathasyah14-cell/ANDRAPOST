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
import { BookOpen, MessageSquare, PlusCircle, Trash2, Loader2, Camera } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/actions';
import { ToolLogos } from '@/components/icons/tool-logos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleImageUpload } from '@/lib/storage';
import type { Profile } from '@/lib/data';

const toolSchema = z.object({
  name: z.string().min(1, 'Nama perkakas harus diisi'),
  icon: z.string().min(1, 'Ikon harus dipilih'),
});

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  tools: z.array(toolSchema).min(1, 'Minimal satu perkakas harus ditambahkan'),
  imageUrl: z.string().url().optional(),
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
  const [isUploading, setIsUploading] = useState(false);
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

  const availableIcons = Object.keys(ToolLogos);
  
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

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await handleImageUpload(file, 'profile-images');
      form.setValue('imageUrl', url);
      toast({
        title: 'Berhasil',
        description: 'Gambar profil berhasil diunggah. Jangan lupa simpan perubahan.',
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
        setIsUploading(false);
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
                {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
              </Label>
              <Input 
                id="profile-image-upload" 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif"
                onChange={onFileChange}
                disabled={isUploading}
              />
            </div>
             <p className="text-sm text-center text-muted-foreground">
              Klik pada gambar untuk mengganti foto profil Anda.
            </p>
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
                    <Controller
                        control={form.control}
                        name={`tools.${index}.icon`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Ikon" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableIcons.map(iconName => (
                                            <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ name: '', icon: '' })}>
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
