import { useEffect, useRef, useState } from 'react';
import { Button } from '@mantine/core';

export default function Test() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  return (
    <div>
      <Button
        m='xl'
        onClick={async () => {
          if (videoRef.current) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
              return;
            }
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              setObjectUrl(url);
            }, 'image/png');
          }
        }}
      >
        Webcam
      </Button>

      <video ref={videoRef} autoPlay playsInline muted />
      {objectUrl && <img src={objectUrl} />}
    </div>
  );
}
