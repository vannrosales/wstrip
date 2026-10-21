'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from '@/lib/useCamera';
import { CameraView } from '@/components/CameraView';
import { Countdown } from '@/components/Countdown';
import { FilterSelector } from '@/components/FilterSelector';
import { TEMPLATES, getTemplateById, FILTERS } from '@/lib/templates';
import { StripTemplate } from '@/lib/types';
import { getBoothSession, saveBoothSession } from '@/lib/boothState';
import { playCountdownBeep, playShutterSound } from '@/lib/sound';
import { Camera, RotateCcw, ArrowRight, Upload, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { MacWindow } from '@/components/MacWindow';

export default function BoothPage() {
  const router = useRouter();
  const camera = useCamera();

  const [template] = useState<StripTemplate>(() => {
    const session = getBoothSession();
    return session?.templateId ? getTemplateById(session.templateId) : TEMPLATES[0];
  });
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>(() => {
    const session = getBoothSession();
    return session?.photos && session.photos.length > 0 ? session.photos : [];
  });
  const [mirrored, setMirrored] = useState(() => {
    const session = getBoothSession();
    return session?.mirrored !== undefined ? session.mirrored : true;
  });
  const [activeFilterId, setActiveFilterId] = useState(() => {
    const session = getBoothSession();
    return session?.filterId || 'original';
  });
  const [countdownDuration, setCountdownDuration] = useState<3 | 5>(3);
  const [currentCount, setCurrentCount] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturingSequence, setIsCapturingSequence] = useState(false);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sequenceActiveRef = useRef(false);

  // Start camera on mount
  useEffect(() => {
    camera.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMuted = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('wstrip_sound_muted') === 'true';
  };

  // Helper to grab a single frame from video element
  const captureFrameFromVideo = useCallback((): string | null => {
    const video = document.querySelector('video');
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [mirrored]);

  // Flash & shutter sound execution
  const triggerShutterFlash = useCallback(() => {
    setIsFlashing(true);
    playShutterSound(isMuted());
    setTimeout(() => {
      setIsFlashing(false);
    }, 150);
  }, []);

  // Run countdown for a single photo
  const runCountdownForShot = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      let count = countdownDuration;
      setCurrentCount(count);
      playCountdownBeep(count, isMuted());

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCurrentCount(count);
          playCountdownBeep(count, isMuted());
        } else {
          clearInterval(interval);
          setCurrentCount(null);
          triggerShutterFlash();
          const photoDataUrl = captureFrameFromVideo();
          resolve(photoDataUrl);
        }
      }, 1000);
    });
  }, [countdownDuration, triggerShutterFlash, captureFrameFromVideo]);

  // Handle single retake
  const handleRetakeSingle = async (index: number) => {
    setRetakeIndex(index);
    const photo = await runCountdownForShot();
    if (photo) {
      setCapturedPhotos((prev) => {
        const next = [...prev];
        next[index] = photo;
        saveBoothSession({
          templateId: template.id,
          photos: next,
          filterId: activeFilterId,
          mirrored,
        });
        return next;
      });
    }
    setRetakeIndex(null);
  };

  // Start automatic full sequence
  const startCaptureSequence = async () => {
    if (isCapturingSequence) return;
    setIsCapturingSequence(true);
    sequenceActiveRef.current = true;

    const newPhotos: string[] = [];
    const targetShots = template.shots;

    for (let i = 0; i < targetShots; i++) {
      if (!sequenceActiveRef.current) break;
      const photo = await runCountdownForShot();
      if (photo) {
        newPhotos.push(photo);
        setCapturedPhotos([...newPhotos]);
      }
      // Small 1.2s break between shots to let users strike the next pose!
      if (i < targetShots - 1 && sequenceActiveRef.current) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    setIsCapturingSequence(false);
    sequenceActiveRef.current = false;

    if (newPhotos.length > 0) {
      saveBoothSession({
        templateId: template.id,
        photos: newPhotos,
        filterId: activeFilterId,
        mirrored,
      });
    }
  };

  const handleReset = () => {
    sequenceActiveRef.current = false;
    setIsCapturingSequence(false);
    setCurrentCount(null);
    setCapturedPhotos([]);
    saveBoothSession({
      templateId: template.id,
      photos: [],
      filterId: activeFilterId,
      mirrored,
    });
  };

  // Upload file fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, template.shots - capturedPhotos.length);
    const readers = fileList.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((dataUrls) => {
      setCapturedPhotos((prev) => {
        const next = [...prev, ...dataUrls].slice(0, template.shots);
        saveBoothSession({
          templateId: template.id,
          photos: next,
          filterId: activeFilterId,
          mirrored,
        });
        return next;
      });
    });
  };

  const handleProceedToResult = () => {
    saveBoothSession({
      templateId: template.id,
      photos: capturedPhotos,
      filterId: activeFilterId,
      mirrored,
    });
    router.push('/result');
  };

  const activeFilterCss =
    FILTERS.find((f) => f.id === activeFilterId)?.cssFilter || 'none';

  const isComplete = capturedPhotos.length >= template.shots;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Photo booth</h1>
      <MacWindow
        title="Photo Booth"
        toolbar={
          <div className="mac-segmented" role="group" aria-label="Countdown length">
            {([3, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={countdownDuration === s}
                onClick={() => setCountdownDuration(s)}
                disabled={isCapturingSequence}
              >
                {s}s
              </button>
            ))}
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/templates"
              className="hidden items-center gap-1 text-[13px] font-medium text-[#007aff] hover:underline sm:inline-flex"
            >
              <ChevronLeft className="h-4 w-4" />
              {template.name}
            </Link>

            {!isComplete ? (
              <button
                type="button"
                onClick={startCaptureSequence}
                disabled={isCapturingSequence || !camera.stream}
                className="mac-btn-primary inline-flex h-10 w-full items-center justify-center gap-2 px-6 text-sm sm:w-auto"
              >
                <Camera className="h-4 w-4" />
                {isCapturingSequence
                  ? `Photo ${Math.min(capturedPhotos.length + 1, template.shots)} of ${template.shots}`
                  : `Take ${template.shots} photos`}
              </button>
            ) : (
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="mac-btn inline-flex h-10 items-center gap-1.5 px-4 text-[13px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retake all
                </button>
                <button
                  type="button"
                  onClick={handleProceedToResult}
                  className="mac-btn-primary inline-flex h-10 flex-1 items-center justify-center gap-2 px-5 text-sm"
                >
                  Compose strip
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        }
        bodyClassName="grid gap-5 p-4 sm:p-5 md:grid-cols-[1fr_16rem]"
      >
        {/* Viewfinder */}
        <div className="flex min-w-0 flex-col gap-3">
          <CameraView
            camera={camera}
            isFlashing={isFlashing}
            mirrored={mirrored}
            onToggleMirror={() => setMirrored((m) => !m)}
            onRetry={camera.start}
            activeFilterCss={activeFilterCss}
          >
            <Countdown currentCount={currentCount} />
          </CameraView>
          <FilterSelector activeFilterId={activeFilterId} onSelectFilter={setActiveFilterId} />
        </div>

        {/* Roll */}
        <aside className="mac-card flex flex-col p-3" aria-label="Captured photos">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-black/70">
              Photos {capturedPhotos.length}/{template.shots}
            </span>
            {capturedPhotos.length > 0 && !isCapturingSequence && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007aff] hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: template.shots }).map((_, idx) => {
              const photo = capturedPhotos[idx];
              const isRetakingThis = retakeIndex === idx;
              return (
                <div
                  key={idx}
                  className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-black/[0.06] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
                >
                  {photo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        style={{ filter: activeFilterCss }}
                        className="h-full w-full object-cover"
                      />
                      {!isCapturingSequence && (
                        <button
                          type="button"
                          onClick={() => handleRetakeSingle(idx)}
                          aria-label={`Retake photo ${idx + 1}`}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-[11px] font-medium text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Retake
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-black/35">
                      <Camera className="h-5 w-5" strokeWidth={1.5} />
                      <span className="text-[10px] font-medium">
                        {isRetakingThis ? 'Shooting' : idx + 1}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mac-btn mt-3 inline-flex h-8 items-center justify-center gap-1.5 text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            Import from library
          </button>
        </aside>
      </MacWindow>
    </div>
  );
}
