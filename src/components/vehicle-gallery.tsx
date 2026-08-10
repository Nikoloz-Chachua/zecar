"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import { Chevron, Close } from "./icons";

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef(0);
  const total = vehicle.galleryImages.length;
  const move = useCallback((amount: number) => setActive((current) => (current + amount + total) % total), [total]);
  useEffect(() => {
    if (!lightbox) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(false); if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); };
    window.addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [lightbox, move]);
  const alt = `${vehicle.exteriorColor} ${vehicle.year} ${vehicle.make} ${vehicle.model}, view ${active + 1}`;
  const main = (fullscreen = false) => <div className={fullscreen ? "lightbox-image" : "gallery-main"} onTouchStart={(e) => touchStart.current = e.touches[0].clientX} onTouchEnd={(e) => { const delta = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); }}>
    <Image src={vehicle.galleryImages[active]} alt={alt} fill sizes={fullscreen ? "100vw" : "(max-width: 900px) 100vw, 65vw"} priority={!fullscreen} />
    {!fullscreen && <button type="button" className="expand-gallery" onClick={() => setLightbox(true)}>View full screen</button>}
  </div>;
  return <><div className="gallery">{main()}<button type="button" className="gallery-prev" aria-label="Previous image" onClick={() => move(-1)}><Chevron className="icon reverse" /></button><button type="button" className="gallery-next" aria-label="Next image" onClick={() => move(1)}><Chevron className="icon" /></button><p className="image-count">{active + 1} / {total}</p><div className="thumbnails">{vehicle.galleryImages.map((image, index) => <button type="button" key={image} onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`} aria-current={active === index}><Image src={image} alt="" fill sizes="100px" /></button>)}</div></div>
    {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${vehicle.make} ${vehicle.model} image gallery`}><button type="button" className="lightbox-close" onClick={() => setLightbox(false)} aria-label="Close gallery"><Close className="icon" /></button>{main(true)}<button type="button" className="lightbox-prev" aria-label="Previous image" onClick={() => move(-1)}><Chevron className="icon reverse" /></button><button type="button" className="lightbox-next" aria-label="Next image" onClick={() => move(1)}><Chevron className="icon" /></button><p>{active + 1} / {total}</p></div>}
  </>;
}
