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
    <div className="relative w-full max-w-5xl mx-auto mt-10 pb-10">
      {/* Image en arrière-plan avec hauteur ajustable */}
      <div className="relative w-full h-[815px]"> {/* Modifie h-[800px] pour ajuster la hauteur */}
        <Image
          src="/images/imgreel.jpg"
          alt="Thumbnail"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      {/* Vidéo par-dessus avec position ajustable */}
      <div className="absolute top-[34%] left-[11%]  -translate-y-1/2 z-10">
        <video
          ref={videoRef}
          src="/images/vidreel.mp4"
          autoPlay
          loop
          playsInline
          muted
          className="w-[800px] h-[850px] rounded-lg" // Ajuste la taille ici
        />
      </div>
    </div>
  );
}
