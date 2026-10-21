'use client';

import { useState } from 'react';
import { Share2, Download, Copy, Check, MessageCircle } from 'lucide-react';
import { shareStrip, downloadStrip, copyStripToClipboard, shareToStory, getSocialShareLinks } from '@/lib/share';
import confetti from 'canvas-confetti';

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareButtonsProps {
  stripBlob: Blob | null;
  templateName?: string;
}

export function ShareButtons({ stripBlob, templateName = 'wstrip' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const flash = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#007aff', '#5856d6', '#ff2d55', '#ffcc00', '#34c759'],
      });
    } catch {
      // Ignore if confetti is unsupported
    }
  };

  const filename = () =>
    `wstrip-${templateName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;

  const handleShare = async () => {
    if (!stripBlob) return;
    setIsSharing(true);
    const name = filename();
    const result = await shareStrip(stripBlob, name);
    setIsSharing(false);

    if (result.success) {
      triggerConfetti();
      flash(
        result.method === 'web-share'
          ? 'Shared successfully'
          : result.method === 'clipboard'
            ? 'Copied strip to clipboard'
            : 'Strip downloaded'
      );
    } else if (!result.cancelled && result.error) {
      downloadStrip(stripBlob, name);
      flash('Sharing unavailable. Downloaded instead.');
    }
  };

  const handleDownload = () => {
    if (!stripBlob) return;
    downloadStrip(stripBlob, filename());
    triggerConfetti();
    flash('Strip downloaded');
  };

  const handleCopy = async () => {
    if (!stripBlob) return;
    const ok = await copyStripToClipboard(stripBlob);
    if (ok) {
      setCopied(true);
      triggerConfetti();
      flash('Copied image to clipboard');
      setTimeout(() => setCopied(false), 3000);
    } else {
      flash('Copying images is not supported in this browser');
    }
  };

  const handleShareStory = async (platform: 'instagram' | 'facebook') => {
    if (!stripBlob) return;
    setIsSharing(true);
    const platformLabel = platform === 'instagram' ? 'Instagram' : 'Facebook';
    const result = await shareToStory(stripBlob, platform, filename());
    setIsSharing(false);

    if (result.success) {
      triggerConfetti();
      if (result.method === 'web-share') {
        flash(`Select ${platformLabel} > Stories to post!`);
      } else if (result.method === 'clipboard') {
        flash(`Strip copied! Paste into ${platformLabel} Story`);
      } else {
        flash(`Strip downloaded! Pick from gallery in ${platformLabel} Story`);
      }
    } else if (!result.cancelled) {
      downloadStrip(stripBlob, filename());
      flash(`Strip downloaded! Upload to your ${platformLabel} Story`);
    }
  };

  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://wstrip.vercel.app';
  const links = getSocialShareLinks(
    siteUrl,
    'Look at my photobooth strip from wStrip! Make yours free:'
  );

  const roundLink =
    'mac-btn flex h-8 w-8 items-center justify-center rounded-full text-black/70';

  return (
    <div className="flex w-full flex-col gap-3">
      <div aria-live="polite" className="min-h-0">
        {statusMessage && (
          <p className="animate-fadeIn rounded-lg bg-[#007aff]/10 px-3 py-2 text-center text-xs font-medium text-[#0058d0]">
            {statusMessage}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleShare}
        disabled={!stripBlob || isSharing}
        className="mac-btn-primary flex h-10 w-full items-center justify-center gap-2 text-sm"
      >
        <Share2 className="h-4 w-4" />
        {isSharing ? 'Sharing...' : 'Share'}
      </button>

      {/* Story Quick-Share Actions */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-black/55">Post to Stories</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleShareStory('instagram')}
            disabled={!stripBlob || isSharing}
            className="mac-btn flex h-9 items-center justify-center gap-1.5 text-xs font-medium text-black/80 hover:text-[#d62976]"
          >
            <InstagramIcon className="text-[#d62976]" />
            Instagram Story
          </button>
          <button
            type="button"
            onClick={() => handleShareStory('facebook')}
            disabled={!stripBlob || isSharing}
            className="mac-btn flex h-9 items-center justify-center gap-1.5 text-xs font-medium text-black/80 hover:text-[#1877f2]"
          >
            <FacebookIcon className="text-[#1877f2]" />
            Facebook Story
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!stripBlob}
          className="mac-btn flex h-9 items-center justify-center gap-2 text-[13px]"
        >
          <Download className="h-4 w-4" />
          Save PNG
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!stripBlob}
          className="mac-btn flex h-9 items-center justify-center gap-2 text-[13px]"
        >
          {copied ? <Check className="h-4 w-4 text-[#34c759]" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 pt-3">
        <span className="text-[11px] text-black/50">Send the site to friends</span>
        <div className="flex items-center gap-2">
          <a href={links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={roundLink}>
            <FacebookIcon />
          </a>
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={roundLink}>
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
          <a href={links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={roundLink}>
            <XIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
