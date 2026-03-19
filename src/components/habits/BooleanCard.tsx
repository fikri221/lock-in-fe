"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useDragControls,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Habit, LogCompletion, LogCompletionType } from "@/types/habits";
import { useRouter } from "next/navigation";

type CardPhase = "idle" | "flying-out" | "dropping-in";

interface BooleanCardProps {
  habit: Habit;
  log?: LogCompletion;
  onComplete: () => void;
  onSkip: () => void;
}

export function BooleanCard({
  habit,
  log,
  onComplete,
  onSkip,
  onDelete,
  onDragToggle,
}: BooleanCardProps & {
  onDelete?: () => void;
  onDragToggle?: (isDragging: boolean) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateZ = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<CardPhase>("idle");
  const [swiping, setSwiping] = useState(false);

  // Drag to delete state
  const [isDragMode, setIsDragMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dragControls = useDragControls();
  const pointerEventRef = useRef<React.PointerEvent | null>(null);

  const bgRight = useTransform(
    x,
    [0, 150],
    ["rgba(34,197,94,0)", "rgba(34,197,94,0.15)"],
  );
  const bgLeft = useTransform(
    x,
    [-150, 0],
    ["rgba(239,68,68,0.15)", "rgba(239,68,68,0)"],
  );
  const bg = useTransform(x, (v) => (v >= 0 ? bgRight.get() : bgLeft.get()));
  const idleRotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);

  const finalRotate = useTransform(() => {
    return phase === "idle"
      ? isDragMode
        ? rotateZ.get()
        : idleRotate.get()
      : rotateZ.get();
  });

  const rightOpacity = useTransform(x, [0, 80], [0, 1]);
  const leftOpacity = useTransform(x, [-80, 0], [1, 0]);

  const callbackFiredRef = useRef(false);

  const router = useRouter();

  useEffect(() => {
    onDragToggle?.(isDragMode);
  }, [isDragMode, onDragToggle]);

  // [Efek Samping]: Penggunaan e.preventDefault() pada touchmove non-passive akan
  // mematikan scroll bawaan browser (native scroll) sementara.
  // Ini dilakukan agar browser tidak mencuri gesture sentuhan saat kita sedang
  // menunggu timer Long Press (500ms).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchMove = (e: TouchEvent) => {
      // 1. Jika sudah dalam mode drag (misal: mode hapus), kunci sentuhan.
      if (isDragMode) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      // 2. Cegah scroll browser saat jari masih tertahan (nunggu 500ms).
      // Memungkinkan long press dideteksi tanpa diganggu scroll sistem.
      if (longPressTimer.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - startXRef.current);
        const dy = Math.abs(
          touch.clientY - (startYRef?.current ?? touch.clientY),
        );

        if (dx < 10 && dy < 10) {
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    // Passive false diperlukan agar bisa memanggil preventDefault() pada gesture.
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => card.removeEventListener("touchmove", handleTouchMove);
  }, [isDragMode]);

  function triggerFlyAndDrop(
    direction: "right" | "left",
    callback: () => void,
  ) {
    if (!callbackFiredRef.current) {
      callbackFiredRef.current = true;
      callback();
    }

    setPhase("flying-out");

    const flyX = direction === "right" ? 600 : -600;
    const flyRotate = direction === "right" ? 25 : -25;

    Promise.all([
      animate(x, flyX, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8,
      }),
      animate(rotateZ, flyRotate, {
        type: "spring",
        stiffness: 200,
        damping: 20,
      }),
      animate(opacity, 0, { duration: 0.25, delay: 0.1 }),
    ]).then(() => {
      callbackFiredRef.current = false;

      x.set(0);
      rotateZ.set(-6 + Math.random() * 12);
      y.set(-400);
      scale.set(0.92);
      opacity.set(1);

      setPhase("dropping-in");

      animate(y, 0, {
        type: "spring",
        stiffness: 180,
        damping: 14,
        mass: 1.2,
      });

      animate(rotateZ, 0, {
        type: "spring",
        stiffness: 120,
        damping: 8,
        mass: 0.8,
        delay: 0.08,
      });

      animate(scale, 1, {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.05,
      });

      setTimeout(() => {
        setPhase("idle");
        setSwiping(false);
      }, 800);
    });
  }

  function handleDragEnd(
    _: unknown,
    info: {
      point: { x: number; y: number };
      offset: { x: number };
      velocity: { x: number };
    },
  ) {
    if (isDragMode) {
      const windowHeight =
        typeof window !== "undefined" ? window.innerHeight : 800;
      const dropY = info.point.y;

      console.log(
        "BooleanCard: Drag ended. dropY:",
        dropY,
        "windowHeight:",
        windowHeight,
      );

      if (dropY > windowHeight - 150) {
        console.log("BooleanCard: Delete triggered!");
        onDelete?.();
        animate(scale, 0, { duration: 0.3 });
        animate(opacity, 0, { duration: 0.3 });
      } else {
        console.log("BooleanCard: Drag cancelled - not in trash zone.");
        setIsDragMode(false);
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
        animate(scale, 1, { duration: 0.2 });
        animate(rotateZ, 0, { duration: 0.2 });
      }
      return;
    }

    const threshold = 100;
    const velocityThreshold = 500;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      triggerFlyAndDrop("right", onComplete);
    } else if (
      info.offset.x < -threshold ||
      info.velocity.x < -velocityThreshold
    ) {
      triggerFlyAndDrop("left", onSkip);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      setTimeout(() => setSwiping(false), 300);
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    pointerEventRef.current = e;

    longPressTimer.current = setTimeout(() => {
      if (isPointerDownRef.current) {
        setIsDragMode(true);
        setSwiping(true);
        console.log("Long press triggered in BooleanCard!");
        animate(scale, 1.05, { duration: 0.2 });

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }

        // [Optimasi]: Mengatur touchAction ke 'none' secara manual ke elemen DOM.
        // Lebih cepat daripada menunggu state update agar browser tidak sempat scroll.
        if (cardRef.current) {
          cardRef.current.style.touchAction = "none";
        }

        if (pointerEventRef.current) {
          dragControls.start(pointerEventRef.current);
        }
      }
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragMode) return;

    const deltaX = e.clientX - startXRef.current;
    // Note: We don't check deltaY here manually in the timer cancel block
    // to allow some vertical wiggle during long press on mobile.
    // However, the browser might still trigger a pointercancel if it detects a scroll.
    const threshold = 15;
    if (Math.abs(deltaX) > threshold && longPressTimer.current) {
      console.log(
        `Long press in BooleanCard cancelled by horizontal movement: deltaX=${deltaX}`,
      );
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDownRef.current = false;
    if (cardRef.current) {
      cardRef.current.style.touchAction = "pan-y";
    }
    if (longPressTimer.current) {
      console.log(
        `Pointer up/cancel/leave in BooleanCard. Event type: ${e.type}`,
      );
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerEventRef.current = null;
  };

  const isDone = log?.status === LogCompletionType.COMPLETED;
  const isDraggable = phase === "idle";

  const handleCardClick = () => {
    if (!swiping && !isDragMode) {
      router.push(`/habits/${habit.id}`);
    }
  };

  return (
    <div className="relative">
      {phase === "idle" && !isDragMode && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6 text-sm font-semibold">
          <motion.span
            style={{ opacity: leftOpacity }}
            className="text-red-500"
          >
            Skip
          </motion.span>
          <motion.span
            style={{ opacity: rightOpacity }}
            className="text-emerald-600"
          >
            Done!
          </motion.span>
        </div>
      )}

      <motion.div
        ref={cardRef}
        style={{
          x,
          y,
          rotate: finalRotate,
          scale,
          opacity,
          backgroundColor: phase === "idle" ? bg : undefined,
          zIndex: isDragMode ? 50 : 1,
        }}
        drag={isDragMode ? true : isDraggable ? "x" : false}
        dragControls={dragControls}
        dragListener={!isDragMode}
        dragElastic={isDragMode ? 0.5 : 0.7}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        whileTap={isDraggable && !isDragMode ? { scale: 1.02 } : undefined}
        onClick={handleCardClick}
        className={`relative z-10 flex cursor-pointer select-none items-center gap-3 sm:gap-4 rounded-2xl border px-4 sm:px-5 py-4 shadow-sm transition-shadow active:cursor-grabbing active:shadow-md ${isDragMode ? "touch-none" : "touch-pan-y"} ${
          isDone
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        } ${isDragMode ? "shadow-xl ring-2 ring-red-500/50 cursor-grabbing" : "cursor-grab"}`}
      >
        <span className="text-2xl sm:text-3xl shrink-0">{habit.icon}</span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm sm:text-base font-semibold truncate ${
              isDone
                ? "text-emerald-700 dark:text-emerald-400 line-through"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {habit.name}
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            {isDone
              ? "Completed"
              : isDragMode
                ? "Drag to trash"
                : "Swipe right to complete"}
          </p>
        </div>
        {isDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm"
          >
            ✓
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
