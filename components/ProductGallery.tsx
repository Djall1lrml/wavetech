"use client";

import { useRef, useState } from "react";

type ProductImage = {
  id: number;
  url: string;
};

export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToImage(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const nextIndex = Math.max(0, Math.min(index, images.length - 1));
    track.scrollTo({ left: nextIndex * track.clientWidth, behavior: "smooth" });
    setActiveIndex(nextIndex);
  }

  function updateActiveImage() {
    const track = trackRef.current;
    if (!track) return;
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  if (images.length === 0) {
    return <div className="grid aspect-square place-items-center rounded-lg bg-slate-100 text-slate-500">No product images</div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg bg-slate-100">
        <div
          ref={trackRef}
          onScroll={updateActiveImage}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${name} image gallery`}
        >
          {images.map(image => (
            <img
              key={image.id}
              src={image.url}
              alt={name}
              className="h-full w-full flex-none snap-center object-contain"
            />
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => scrollToImage(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-slate-950/70 text-xl text-white disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => scrollToImage(activeIndex + 1)}
              disabled={activeIndex === images.length - 1}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-slate-950/70 text-xl text-white disabled:opacity-30"
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2" aria-label="Choose product image">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={activeIndex === index}
              onClick={() => scrollToImage(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${activeIndex === index ? "bg-neon-c" : "bg-slate-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
