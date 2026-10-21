'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraFacingMode } from './types';

export type CameraErrorType =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'SecurityError'
  | 'UnknownError'
  | null;

export type CameraState = {
  stream: MediaStream | null;
  error: string | null;
  errorType: CameraErrorType;
  isLoading: boolean;
  facingMode: CameraFacingMode;
  start: () => Promise<void>;
  stop: () => void;
  switchCamera: () => Promise<void>;
};

export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<CameraErrorType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('user');

  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<CameraFacingMode>('user');

  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const start = useCallback(async () => {
    // If not supported
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported on this device/browser.');
      setErrorType('NotFoundError');
      return;
    }

    // Stop existing tracks before requesting a new stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }

    setIsLoading(true);
    setError(null);
    setErrorType(null);

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingModeRef.current,
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
      audio: false,
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      let friendlyMessage = 'Unable to access the camera.';
      let type: CameraErrorType = 'UnknownError';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          type = 'NotAllowedError';
          friendlyMessage =
            'Camera permission was denied. Please allow camera access in your browser settings to take photostrips.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          type = 'NotFoundError';
          friendlyMessage = 'No camera device was found on your system.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          type = 'NotReadableError';
          friendlyMessage =
            'Camera is currently in use by another application or tab. Please close other apps and try again.';
        } else if (err.name === 'SecurityError') {
          type = 'SecurityError';
          friendlyMessage = 'Camera requires a secure HTTPS connection.';
        } else {
          friendlyMessage = err.message || friendlyMessage;
        }
      }

      setError(friendlyMessage);
      setErrorType(type);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const nextMode: CameraFacingMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    facingModeRef.current = nextMode;
    await start();
  }, [start]);

  // Clean up all tracks on unmount to turn off the hardware camera light
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    stream,
    error,
    errorType,
    isLoading,
    facingMode,
    start,
    stop,
    switchCamera,
  };
}
