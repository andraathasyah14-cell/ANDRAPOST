'use client';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-4xl font-bold tracking-widest mb-4">ANDRAPOST</div>
      <div className="w-[130px] h-[4px] rounded-full bg-muted overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full rounded-full bg-primary animate-loading-bar"></div>
      </div>
    </div>
  );
}
