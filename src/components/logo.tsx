import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="inline-block" aria-label="Back to homepage">
      <div className="text-xl font-bold tracking-tight text-foreground">
        ANDRAPOST
      </div>
    </Link>
  );
}
