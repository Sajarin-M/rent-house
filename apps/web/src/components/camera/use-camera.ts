import { useEffect, useRef } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })
      .then((stream) => {
        mediaStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function captureImage(): Promise<File> {
    if (!videoRef.current) {
      throw new Error("Couldn't get video element");
    }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', videoRef.current.videoWidth.toString());
    canvas.setAttribute('height', videoRef.current.videoHeight.toString());
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error("Couldn't get canvas context");
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Couldn't get blob"));
        resolve(blob);
      }, 'image/png');
    });

    return new File([imageBlob], 'image.png', { type: 'image/png', lastModified: Date.now() });
  }

  return { videoRef, captureImage };
}
