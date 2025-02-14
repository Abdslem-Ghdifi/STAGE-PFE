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
    <div className="relative w-full max-w-4xl mx-auto mt-10 pb-10">
      <div className="relative w-full h-[1000px]">
        <Image
          src="/images/imgreel.jpg"
          alt="Thumbnail"
          width={1200}   
          height={800}   
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      <div className="absolute top-[41.9%] left-[4%] -translate-y-1/2 z-10">
        <video
          ref={videoRef}
          src="/images/vidreel.mp4"
          autoPlay
          loop
          playsInline
          muted
          className="w-[830px] h-[830px] rounded-lg"
        />
      </div>
    </div>
  );
}
