'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BookOpen, MessageSquare, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/actions';
import { ToolLogos } from '@/components/icons/tool-logos';

const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  icon: z.string().min(1, 'Icon name is required'),
});

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  tools: z.array(toolSchema),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profileData: {
    name: string;
    description: string;
    totalPublications: number;
    totalOpinions: number;
    tools: { name: string; icon: string }[];
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  );
}

export default function ProfileForm({ profileData }: ProfileFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction] = useActionState(updateProfile, { success: false, message: '' });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData.name,
      description: profileData.description,
      tools: profileData.tools,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tools',
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
    // When the profileData prop changes (due to revalidation), reset the form
  useEffect(() => {
    form.reset({
      name: profileData.name,
      description: profileData.description,
      tools: profileData.tools,
    });
  }, [profileData, form]);

  const availableIcons = Object.keys(ToolLogos);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Image
              src="https://picsum.photos/seed/profile/400/400"
              alt="Profile"
              width={150}
              height={150}
              className="rounded-full aspect-square object-cover border-4 border-background shadow-lg"
            />
             <p className="text-sm text-center text-muted-foreground">
              Profile photo upload is for demonstration and is not connected to the server.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
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
            ref={formRef}
            action={formAction}
            onSubmit={form.handleSubmit(() => {
                const formData = new FormData(formRef.current!);
                const tools = form.getValues('tools');
                
                // Clear previous tools before adding new ones
                formData.delete('tools');
                
                tools.forEach(tool => {
                    formData.append('tools', JSON.stringify(tool));
                });
                
                formAction(formData);
            })}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
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
                  <FormLabel>Deskripsi Singkat</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief, compelling description..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="mb-4 block">Input Foto/Logo Tools</Label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`tools.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Tool Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`tools.${index}.icon`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                           <FormControl>
                             <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                               <option value="">Select Icon</option>
                               {availableIcons.map(iconName => (
                                 <option key={iconName} value={iconName}>{iconName}</option>
                               ))}
                             </select>
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ name: '', icon: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Tool
                </Button>
              </div>
            </div>

            <SubmitButton />
          </form>
        </Form>
      </div>
    </div>
  );
}
