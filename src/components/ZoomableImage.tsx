import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ZoomableImage({
  closeImgModal,
  currentImage,
}: {
  closeImgModal: () => void;
  currentImage: string | null;
}) {
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDistanceExceeded, setIsDistanceExceeded] = useState(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const MAX_DISTANCE = 600;

  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3));
  const zoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 1));
    setPosition({ x: 0, y: 0 });
    setIsDistanceExceeded(true);
  };
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1) return;

    e.preventDefault();
    const touch = e.touches[0];
    startPosition.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    setDragging(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;

    startPosition.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setDragging(true);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;

    let clientX, clientY;

    if ("touches" in e) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setPosition({
      x: clientX - startPosition.current.x,
      y: clientY - startPosition.current.y,
    });
    setIsDistanceExceeded(false);
  };

  const handleEnd = () => {
    setDragging(false);
    const distance = Math.sqrt(position.x ** 2 + position.y ** 2);

    if (distance > MAX_DISTANCE) {
      setPosition({ x: 0, y: 0 });
      setIsDistanceExceeded(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e);
    const handleTouchMove = (e: TouchEvent) => handleMove(e);
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, isDistanceExceeded, position]);

  useEffect(() => {
    if (!currentImage) return;
    const handleEscapeToClose = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImgModal();
      }
    };

    document.addEventListener("keydown", handleEscapeToClose);

    return () => {
      document.removeEventListener("keydown", handleEscapeToClose);
    };
  }, [currentImage]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center w-full bg-black/75"
      onClick={closeImgModal}
    >
      <div className={zoom > 1 ? "w-full" : ""}>
        <div
          className="relative rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="overflow-hidden"
            style={{
              cursor: dragging ? "grabbing" : zoom > 1 ? "grab" : "default",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <Image
              width={400}
              height={400}
              src={currentImage || ""}
              alt="Viewed"
              className={`object-contain w-full max-h-screen transform select-none ${
                isDistanceExceeded && "transition-all duration-500 ease-in-out"
              }`}
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                touchAction: "none",
                userSelect: "none",
              }}
              draggable={false}
            />
          </div>

          <div className="fixed flex w-10 h-10 gap-8 text-4xl text-white rounded-full right-48 top-4">
            <button
              onClick={resetZoom}
              className="w-10 h-10 !text-lg text-white cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={zoomOut}
              className="w-10 h-10 !text-4xl text-white cursor-pointer"
            >
              -
            </button>
            <button
              onClick={zoomIn}
              className="w-10 h-10 !text-4xl text-white cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            onClick={closeImgModal}
            className="fixed w-10 h-10 !text-4xl text-white right-4 top-4 cursor-pointer"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
