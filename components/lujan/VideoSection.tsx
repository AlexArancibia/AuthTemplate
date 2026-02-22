"use client";

/**
 * Sección de video (Spot) – migrada desde vitivinicolalujan-offline.
 * Thumbnail de fondo + botón play que abre modal con video.
 * Fuente: index.html ~1713–1732 (elementskit-video, popup con SPOT-PUBLICITARIO).
 */

import { useCallback, useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/lujan/video/spot.mp4";
const THUMB_SRC = "/lujan/video/thumb.jpg";

export function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChangedColor, setHasChangedColor] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const open = useCallback(() => {
    setHasChangedColor(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleEnter = useCallback(() => setHasChangedColor(true), []);

  useEffect(() => {
    if (!isOpen) return;
    videoRef.current?.play().catch(() => {});
    return () => {
      videoRef.current?.pause();
    };
  }, [isOpen]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) {
      document.addEventListener("keydown", onEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <>
      <section
        className="lujan-video-section"
        aria-label="Ver nuestro spot"
      >
        <div
          className="lujan-video-section__bg"
          style={{ backgroundImage: `url(${THUMB_SRC})` }}
          aria-hidden
        />
        <div className="lujan-video-section__overlay" aria-hidden />
        <div className="lujan-video-section__content">
          <button
            type="button"
            className={`lujan-video-section__play${hasChangedColor ? " lujan-video-section__play--active" : ""}`}
            onClick={open}
            onMouseEnter={handleEnter}
            onFocus={handleEnter}
            aria-label="Reproducir video"
          >
            <i aria-hidden="true" className="icon icon-play" />
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="lujan-video-section__modal"
          role="dialog"
          aria-modal="true"
          aria-label="Reproduciendo video"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="lujan-video-section__modal-inner">
            <button
              type="button"
              className="lujan-video-section__modal-close"
              onClick={close}
              aria-label="Cerrar video"
            >
              <CloseIcon />
            </button>
            <video
              ref={videoRef}
              className="lujan-video-section__video"
              src={VIDEO_SRC}
              controls
              playsInline
              muted
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
