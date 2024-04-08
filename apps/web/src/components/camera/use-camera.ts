import { useEffect, useRef } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageCaptureRef = useRef<ImageCapture | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 },
          zoom: { exact: 0 },
        },
      })
      .then((stream) => {
        streamRef.current = stream;
        imageCaptureRef.current = new ImageCapture(streamRef.current.getVideoTracks()[0]);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function captureImage(): Promise<File> {
    if (!streamRef.current) {
      throw new Error("Couldn't get media stream");
    }

    if (!imageCaptureRef.current) {
      throw new Error("Couldn't get image capture");
    }

    const imageBlob = await imageCaptureRef.current.takePhoto();

    return new File([imageBlob], 'image.png', { type: 'image/png', lastModified: Date.now() });
  }

  return { videoRef, captureImage };
}
