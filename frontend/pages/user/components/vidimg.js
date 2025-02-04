import { useRef, useEffect } from "react";
import Image from "next/image";

export default function Vidimg() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const video = videoRef.current;

      if (video) {
        video.oncanplay = () => {
          video.play().catch((err) => console.error("Erreur de lecture vidéo :", err));
        };

        video.addEventListener("ended", () => {
          video.currentTime = 0;
          video.play();
        });
      }
    }
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-10 pb-10">
      <div className="relative w-full h-[600px]"> 
        <Image
          src="/images/imgreel.jpg"
          alt="Thumbnail"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      <div className="absolute top-[33.1%] left-[11%] -translate-y-1/2 z-10">
        <video
          ref={videoRef}
          src="/images/vidreel.mp4"
          autoPlay
          loop
          playsInline
          muted
          className="w-[600px] h-[650px] rounded-lg" 
        />
      </div>
    </div>
  );
}
