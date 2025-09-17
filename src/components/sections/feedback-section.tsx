'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, AtSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { handleFeedbackSubmit } from '@/lib/actions';

const initialState = {
  success: false,
  message: '',
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Send Feedback
    </Button>
  );
}

export default function FeedbackSection() {
  const [state, formAction] = useFormState(handleFeedbackSubmit, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <section id="feedback" className="py-16 md:py-24 bg-card/50">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Kritik & Saran
            </h2>
            <p className="text-lg text-muted-foreground">
              Have feedback or an idea? I&apos;d love to hear from you. For
              direct conversations, feel free to reach out via other platforms.
            </p>
            <div className="flex space-x-4 pt-4">
              <Button asChild variant="outline">
                <Link href="#" aria-label="Contact via Discord">
                  <svg
                    className="w-5 h-5 mr-2"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <title>Discord</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8245-.6667 1.329-2.2579-.2883-4.5777-.2883-6.8356 0-.2203-.5045-.4557-.9538-.6667-1.329a.0741.0741 0 00-.0785-.0371 19.7913 19.7913 0 00-4.8851 1.5152.069.069 0 00-.0321.0256c-1.843 3.1783-2.6593 6.48-2.6593 9.6358 0 2.2131.5579 4.3698 1.5833 6.3934.0741.1448.273.2344.4725.2217.1994-.0127.3753-.1212.4464-.2987a14.6152 14.6152 0 00-1.1218-2.3172.0644.0644 0 01.0127-.0951c.0951-.0644.2045-.0889.3139-.0644a12.0623 12.0623 0 002.1492.6534.0741.0741 0 00.089-.019c.9538-.535 1.8328-1.149 2.6466-1.8263a.0644.0644 0 00.0127-.1016c-.1929-.2601-.3789-.5266-.5453-.7994a.0644.0644 0 00-.0644-.0446c-.2883.0318-.5702.0768-.8457.1343a.0644.0644 0 00-.0514.0514c-.1802.6341-.3139 1.281-.4194 1.9403a.0644.0644 0 00.0382.0825c.2344.1147.4816.2163.7352.3051a.0644.0644 0 00.0825-.0382c.2883-.7104.5348-1.4398.7417-2.1932a.0644.0644 0 00-.0382-.0889c-.2819-.0889-.5702-.1674-.8521-.246a.0644.0644 0 00-.0644.0064c-.1147.0825-.2163.1738-.3139.2665a.0644.0644 0 00-.0064.0889c.2601.356.514.7104.7544 1.0648a.0644.0644 0 00.0889.0318c.2408-.1448.4816-.2987.716-.459a.0644.0644 0 00.0514-.0889c-.0825-.2601-.1585-.514-.2344-.7748a.0644.0644 0 00-.0644-.0578c-.2883.0127-.5638.0382-.8393.0768a.0644.0644 0 00-.0514.0514c-.1448.535-.2601 1.0827-.356 1.6368a.0644.0644 0 00.0446.0768c.2472.0889.5013.1674.7608.2344a.0644.0644 0 00.0768-.0446c.2601-.6977.488-1.4151.6849-2.1492a.0644.0644 0 00-.0382-.0889c-.2883-.0825-.5766-.1585-.8648-.2279a.0644.0644 0 00-.0644.019c-.1212.0889-.2344.1802-.3433.2819a.0644.0644 0 00-.0064.0889c.2883.4194.5766.826.8648 1.2262a.0644.0644 0 00.0889.0256c.0127-.0064.0256-.0127.0382-.019a15.4836 15.4836 0 002.3299-1.3916c.1994-.1448.3853-.2987.5638-.4654a.0644.0644 0 01.0951.0127c1.4398 2.1619 2.3458 4.4966 2.6593 6.9458 0 .2217-.0382.4433-.0889.6598.0064.0064.0127.0127.019.019.1448-.0446.2819-.0889.4194-.1448a.4018.4018 0 00.356-.356c.2163-.8892.356-1.791.356-2.7055 0-3.144-.8133-6.208-2.6593-9.354-.0127-.019-.0256-.0382-.0446-.0578z" />
                  </svg>
                  Discord
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="#" aria-label="Contact via Direct Message">
                  <AtSign className="w-5 h-5 mr-2" />
                  Direct Message
                </Link>
              </Button>
            </div>
          </div>
          <div className="bg-card p-8 rounded-lg shadow-sm">
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-1">
                <Input name="name" type="text" placeholder="Your Name" />
                {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-1">
                <Input name="email" type="email" placeholder="Your Email" />
                {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
              </div>
              <div className="space-y-1">
                <Textarea name="message" placeholder="Your message..." rows={5} />
                {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
