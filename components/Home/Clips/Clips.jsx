'use client';
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./Clips.scss";

const JSON_URL = "/api/video";

const SkeletonSlide = () => (
  <div className="clip-skeleton">
    <div className="skeleton-video" />
  </div>
);

export default function Clips() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(JSON_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const data = await res.json();
        setClips(data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  };

  return (
    <div className="clips">
      <Swiper
        slidesPerView="auto"
        spaceBetween={0}
        onSlideChange={handleSlideChange}
        onAfterInit={handleSlideChange}
        centeredSlides='true'
        className="clips-swiper"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <SwiperSlide key={idx}>
                <SkeletonSlide />
              </SwiperSlide>
            ))
          : clips.map((clip, idx) => (
              <SwiperSlide key={clip.id}>
                  <video
                    ref={(el) => (videoRefs.current[idx] = el)}
                    src={clip.source_url}
                    muted
                    playsInline
                    autoPlay={idx === 0}
                    loop
                    preload="metadata"
                    className="clip-video"
                  />
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
}
