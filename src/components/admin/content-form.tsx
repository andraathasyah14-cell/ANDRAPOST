// This file is no longer used and can be removed.
// The functionality has been moved to a different page or is no longer needed.
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tags } from 'lucide-react';
import { Label } from '@/components/ui/label';

const initialState = {
  suggestedTags: [],
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      Categorize
    </Button>
  );
}

export default function ContentForm({
  onCategorize,
}: {
  onCategorize: (
    prevState: any,
    formData: FormData
  ) => Promise<typeof initialState>;
}) {
  const [state, formAction] = useFormState(onCategorize, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error?._form) {
      toast({
        title: 'Error',
        description: state.error._form,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Content Title</Label>
        <Input id="title" name="title" placeholder="Enter content title" />
        {state.error?.title && (
          <p className="text-sm text-destructive">{state.error.title[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Content Body</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Enter content body"
          rows={8}
        />
        {state.error?.body && (
          <p className="text-sm text-destructive">{state.error.body[0]}</p>
        )}
      </div>
      <div>
        <SubmitButton />
      </div>

      {state.suggestedTags && state.suggestedTags.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-lg font-medium flex items-center">
            <Tags className="mr-2 h-5 w-5 text-primary" />
            Suggested Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {state.suggestedTags.map((tag: string) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
