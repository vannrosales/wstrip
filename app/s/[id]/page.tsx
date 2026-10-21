import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Camera, ArrowRight, Aperture } from 'lucide-react';
import { MacWindow } from '@/components/MacWindow';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ogImageUrl = `/api/og?title=${encodeURIComponent('Photostrip by Friends')}&subtitle=${encodeURIComponent('View this photostrip on wStrip')}`;

  return {
    title: `Photostrip #${id} - wStrip`,
    description: 'Check out this free online photobooth strip created on wStrip!',
    openGraph: {
      title: `wStrip Photobooth #${id}`,
      description: 'Check out this free online photobooth strip created on wStrip!',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'wStrip Photobooth Strip' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `wStrip Photobooth #${id}`,
      description: 'Check out this free online photobooth strip created on wStrip!',
      images: [ogImageUrl],
    },
    robots: { index: false, follow: false },
  };
}

async function StripContent({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <MacWindow title="Shared Strip">
        <div className="flex flex-col items-center p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#3d9eff] to-[#007aff] text-white shadow-md">
            <Aperture className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-black/85">Shared photostrip #{id}</h1>
          <p className="mt-2 text-sm leading-relaxed text-black/55">
            This strip was made with wStrip. Want to take your own with friends? It&apos;s free.
          </p>
          <Link
            href="/templates"
            className="mac-btn-primary mt-6 inline-flex h-10 items-center gap-2 px-5 text-sm"
          >
            <Camera className="h-4 w-4" />
            Make your own strip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </MacWindow>
    </div>
  );
}

export default function SharedStripPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-black/15 border-t-[#007aff]" />
        </div>
      }
    >
      <StripContent params={params} />
    </Suspense>
  );
}
