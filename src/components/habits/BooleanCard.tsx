"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
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

      // Check if dropped in trash zone
      if (dropY > windowHeight - 150) {
        onDelete?.();
        animate(scale, 0, { duration: 0.3 });
        animate(opacity, 0, { duration: 0.3 });
      } else {
        // Reset
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
    // Long Press Logic
    isPointerDownRef.current = true;
    // Only set capture if we want to track it, but for swipe cards be careful
    // For now we try to detect hold without capturing aggressively unless needed
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;

    longPressTimer.current = setTimeout(() => {
      if (isPointerDownRef.current) {
        setIsDragMode(true);
        setSwiping(true); // Treat as swiping to prevent click
        animate(scale, 1.05, { duration: 0.2 });
        // animate(rotateZ, 2, { duration: 0.2 }); // small jiggle

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms hold
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragMode) return;

    // If moved significantly, cancel long press
    if (
      Math.abs(e.clientX - startXRef.current) > 10 &&
      longPressTimer.current
    ) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    // If we were just clicking and not swiping/dragging, swiping state is handled by dragStart/End
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
        dragConstraints={isDragMode ? undefined : { left: 0, right: 0 }}
        dragElastic={isDragMode ? 0.5 : 0.7}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        whileTap={isDraggable && !isDragMode ? { scale: 1.02 } : undefined}
        onClick={handleCardClick}
        className={`relative z-10 flex cursor-pointer select-none items-center gap-3 sm:gap-4 rounded-2xl border px-4 sm:px-5 py-4 shadow-sm transition-shadow active:cursor-grabbing active:shadow-md ${
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
