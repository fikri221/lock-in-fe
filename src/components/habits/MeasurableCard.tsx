"use client";

import { Habit, LogCompletion } from "@/types/habits";
import {
  useMotionValue,
  useTransform,
  motion,
  animate,
  useDragControls,
} from "framer-motion";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";

/* ─── Petal type (for flower bloom at max) ─── */
interface Petal {
  id: number;
  angle: number;
  distance: number;
  size: number;
  hue: number;
  delay: number;
}

let petalId = 0;

/* ─── Flower SVG ─── */
function FlowerSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx="14"
          cy="14"
          rx="4"
          ry="8"
          fill={`hsl(${340 + i * 8}, 75%, ${65 + i * 3}%)`}
          transform={`rotate(${angle} 14 14) translate(0 -5)`}
          opacity="0.85"
        />
      ))}
      <circle cx="14" cy="14" r="4" fill="#facc15" />
      <circle cx="14" cy="14" r="2.5" fill="#f59e0b" />
    </svg>
  );
}

/* ─── Main Card ─── */
interface MeasurableCardProps {
  habit: Habit;
  log?: LogCompletion;
  onSetValue: (data: { actualValue: number }) => void;
  onDelete?: () => void;
  onDragToggle?: (isDragging: boolean) => void;
}

export const MeasurableCard = memo(function MeasurableCard({
  habit,
  log,
  onSetValue,
  onDelete,
  onDragToggle,
}: MeasurableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragDisplayVal, setDragDisplayVal] = useState(
    Number(log?.actualValue ?? 0),
  );
  const liveValueMV = useMotionValue(Number(log?.actualValue ?? 0));
  const roundedValue = useTransform(liveValueMV, Math.round);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [showFlower, setShowFlower] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const draggingRef = useRef(false);
  const prevSnapRef = useRef(Number(log?.actualValue ?? 0));

  // Drag to delete state
  const [isDragMode, setIsDragMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isPointerDownRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const opacity = useMotionValue(1);

  const dragControls = useDragControls();
  const pointerEventRef = useRef<React.PointerEvent | null>(null);

  const fillPct = useMotionValue(0);
  const fillWidthStr = useTransform(fillPct, (v) => `${v}%`);

  const router = useRouter();
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/habits/${habit.id}`);
  };

  useEffect(() => {
    onDragToggle?.(isDragMode);
  }, [isDragMode, onDragToggle]);

  // [Efek Samping]: Penggunaan e.preventDefault() pada touchmove non-passive akan
  // mematikan scroll bawaan browser (native scroll) sementara.
  // Ini dilakukan agar browser tidak mencuri gesture sentuhan saat kita sedang
  // menunggu timer Long Press (500ms) atau saat sedang melakukan dragging.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchMove = (e: TouchEvent) => {
      // 1. Jika sudah dalam mode Drag to Delete atau sedang menggeser slider (Measurable),
      // kita harus mengunci gesture agar tidak berubah jadi scroll halaman.
      if (isDragMode || draggingRef.current) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      // 2. Jika jari masih menempel (timer aktif) dan pergerakan masih sangat kecil (wiggle room),
      // kita cegah browser untuk memulai scroll agar Long Press bisa terdeteksi dengan stabil.
      if (longPressTimer.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - startXRef.current);
        const dy = Math.abs(touch.clientY - startYRef.current);

        // Jika jari hanya bergoyang < 10px, blokir scroll browser.
        if (dx < 10 && dy < 10) {
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    // Kita harus menggunakan { passive: false } agar preventDefault() diizinkan oleh browser.
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => card.removeEventListener("touchmove", handleTouchMove);
  }, [isDragMode]);

  const vineBg = useTransform(fillPct, (v) => {
    if (v <= 0) return "rgba(0,0,0,0)";
    const t = v / 100;
    const r = Math.round(120 - 86 * t);
    const g = Math.round(100 + 80 * t);
    const b = Math.round(60 - 10 * t);
    return `rgba(${r},${g},${b},0.2)`;
  });

  const stemColor = useTransform(fillPct, (v) => {
    const t = v / 100;
    const r = Math.round(80 - 46 * t);
    const g = Math.round(90 + 70 * t);
    const b = Math.round(40 + 14 * t);
    return `rgb(${r},${g},${b})`;
  });

  const maxValue = Number(habit.targetValue ?? 100) || 100;
  const step = 1;
  const currentValue = Number(log?.actualValue ?? 0) || 0;

  useEffect(() => {
    if (!dragging) {
      setDragDisplayVal(currentValue);
      prevSnapRef.current = currentValue;
      animate(liveValueMV, currentValue, {
        type: "spring",
        stiffness: 120,
        damping: 20,
      });
      animate(fillPct, Math.min(100, (currentValue / (maxValue || 1)) * 100), {
        type: "spring",
        stiffness: 120,
        damping: 20,
      });
    }
  }, [currentValue, maxValue, dragging, fillPct, liveValueMV]);

  useEffect(() => {
    setShowFlower(currentValue >= maxValue && currentValue > 0);
  }, [currentValue, maxValue]);

  const snapToStep = useCallback(
    (raw: number) => {
      const snapped = Math.round(raw / step) * step;
      return Math.max(0, snapped);
    },
    [step],
  );

  const spawnPetals = useCallback(() => {
    const newPetals: Petal[] = [];
    for (let i = 0; i < 6; i++) {
      newPetals.push({
        id: ++petalId,
        angle: (i / 6) * 360 + Math.random() * 20,
        distance: 30 + Math.random() * 50,
        size: 4 + Math.random() * 4,
        hue: 330 + Math.random() * 40,
        delay: i * 0.03,
      });
    }
    setPetals(newPetals);
    setTimeout(() => setPetals([]), 1500);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isPointerDownRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      pointerEventRef.current = e;

      longPressTimer.current = setTimeout(() => {
        if (isPointerDownRef.current) {
          if (pointerEventRef.current) {
            setIsDragMode(true);
            setDragging(false);
            if (cardRef.current) {
              widthRef.current = cardRef.current.getBoundingClientRect().width;
            }
            animate(scale, 1.05, { duration: 0.2 });
            animate(rotate, 2, { duration: 0.2 });

            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(50);
            }

            // [Optimasi]: Mengatur touchAction secara imperatif ke 'none' agar perubahan
            // lebih cepat dari render React, mencegah scroll saat mulai ditarik.
            if (cardRef.current) {
              cardRef.current.style.touchAction = "none";
            }

            dragControls.start(pointerEventRef.current);
          }
        }
      }, 500);

      if (expanded) return;

      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startValueRef.current = currentValue;
      hasDraggedRef.current = false;
      prevSnapRef.current = currentValue;
      setDragDisplayVal(currentValue);
      if (cardRef.current) {
        widthRef.current = cardRef.current.getBoundingClientRect().width;
      }
      setDragging(true);
      draggingRef.current = true;
    },
    [expanded, currentValue, scale, rotate, dragControls],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragMode) return;

      if (!dragging) return;
      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      // If moved significantly horizontally, cancel long press
      // Vertical movement is allowed a bit more to prevent accidental cancellation on touch screens
      if (Math.abs(deltaX) > 15 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!hasDraggedRef.current) {
        // If movement is more vertical than horizontal, don't start dragging
        if (Math.abs(deltaY) > Math.abs(deltaX) + 5) {
          setDragging(false);
          draggingRef.current = false;
          return;
        }
        if (Math.abs(deltaX) < 10) return;
      }

      hasDraggedRef.current = true;

      if (!cardRef.current) return;
      const cardWidth =
        widthRef.current || cardRef.current.getBoundingClientRect().width;
      if (cardWidth <= 0) return;

      const deltaValue = (deltaX / cardWidth) * maxValue;
      const raw = startValueRef.current + deltaValue;
      const clampedRaw = Math.max(0, raw);
      const val = snapToStep(clampedRaw);

      // Detect step change — spawn leaf
      if (val !== prevSnapRef.current) {
        prevSnapRef.current = val;
        setDragDisplayVal(val);
      }

      liveValueMV.set(clampedRaw);
      fillPct.set(Math.min(100, (clampedRaw / (maxValue || 1)) * 100));
    },
    [dragging, maxValue, snapToStep, fillPct, isDragMode, liveValueMV],
  );

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    if (cardRef.current) {
      cardRef.current.style.touchAction = "pan-y";
    }
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isDragMode) {
      pointerEventRef.current = null;
      return;
    }

    if (!dragging) {
      pointerEventRef.current = null;
      return;
    }
    if (hasDraggedRef.current) {
      const finalRaw = liveValueMV.get();
      const finalValue = snapToStep(finalRaw);

      animate(liveValueMV, finalValue, {
        type: "spring",
        stiffness: 600,
        damping: 30,
      });
      animate(fillPct, Math.min(100, (finalValue / (maxValue || 1)) * 100), {
        type: "spring",
        stiffness: 600,
        damping: 30,
      });
      setDragDisplayVal(finalValue);

      if (finalValue !== startValueRef.current) {
        onSetValue({ actualValue: finalValue });
      }
      if (finalValue >= maxValue && startValueRef.current < maxValue) {
        spawnPetals();
      }
    }
    setDragging(false);
    draggingRef.current = false;
    hasDraggedRef.current = false;
    pointerEventRef.current = null;
  }, [
    dragging,
    liveValueMV,
    maxValue,
    onSetValue,
    spawnPetals,
    isDragMode,
    fillPct,
    snapToStep,
  ]);

  const handleDragEnd = (
    _: unknown,
    info: {
      point: { x: number; y: number };
      offset: { x: number; y: number };
    },
  ) => {
    if (isDragMode) {
      const windowHeight =
        typeof window !== "undefined" ? window.innerHeight : 800;
      const dropY = info.point.y;

      console.log("Drag ended. dropY:", dropY, "windowHeight:", windowHeight);

      const isMovingUp = info.offset.y < -30;
      if (dropY > windowHeight - 100 && !isMovingUp) {
        console.log("Delete triggered!");
        onDelete?.();
      } else {
        console.log("Drag cancelled - moved up or not in trash zone.");
      }

      setIsDragMode(false);
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
      animate(scale, 1, { duration: 0.2 });
      animate(rotate, 0, { duration: 0.2 });
    }
  };

  function handleTap() {
    if (isDragMode) return;
    if (!hasDraggedRef.current) {
      setExpanded(!expanded);
    }
  }

  function adjustValue(delta: number) {
    if (isDragMode) return;
    const newVal = Math.max(0, currentValue + delta);
    onSetValue({ actualValue: newVal });
    setDragDisplayVal(newVal);
    animate(liveValueMV, newVal, {
      type: "spring",
      stiffness: 300,
      damping: 25,
    });
    animate(fillPct, Math.min(100, (newVal / (maxValue || 1)) * 100), {
      type: "spring",
      stiffness: 300,
      damping: 25,
    });

    if (newVal >= maxValue && currentValue < maxValue) {
      spawnPetals();
    }
  }

  const isDone = dragDisplayVal > 0;
  const isMax = dragDisplayVal >= maxValue;
  const segmentCount = Math.max(
    0,
    Math.min(10, Math.floor((dragDisplayVal / (maxValue || 1)) * 8) || 0),
  );

  return (
    <div className="relative">
      <motion.div
        ref={cardRef}
        style={{ x, y, scale, rotate, opacity, zIndex: isDragMode ? 50 : 1 }}
        drag={isDragMode ? true : false}
        dragControls={dragControls}
        dragListener={!isDragMode}
        dragDirectionLock={!isDragMode}
        dragConstraints={
          isDragMode ? undefined : { left: 0, right: 0, top: 0, bottom: 0 }
        }
        dragElastic={isDragMode ? 0.5 : 0}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onClick={handleTap}
        className={`relative overflow-hidden rounded-2xl border shadow-sm select-none transition-colors duration-500 ${
          isDragMode ? "touch-none" : "touch-pan-y"
        } ${
          isMax
            ? "border-green-400 bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:border-green-700 dark:from-green-950/30 dark:to-emerald-950/30"
            : isDone
              ? "border-green-200/60 bg-green-50/20 dark:border-green-900/60 dark:bg-green-950/10"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        } ${
          isDragMode
            ? "shadow-xl ring-2 ring-red-500/50 cursor-grabbing"
            : "cursor-grab"
        }`}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            background: isDone
              ? "linear-gradient(to right, rgba(120,80,40,0.3), rgba(80,60,30,0.15))"
              : "transparent",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 top-0 pointer-events-none"
          style={{
            width: fillWidthStr,
            background: vineBg,
          }}
        />
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
          <span className="text-2xl sm:text-3xl shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all">
            {habit.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mr-1">
              <p
                onClick={handleHeaderClick}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:underline"
              >
                {habit.name}
              </p>
              <div className="flex items-baseline gap-1">
                <motion.span
                  className={`text-lg font-bold font-mono transition-colors duration-300 ${
                    isDone
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {roundedValue}
                </motion.span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  / {maxValue} {habit.targetUnit || ""}
                </span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-[1px] bg-zinc-300/30 dark:bg-zinc-700/30"
                  style={{ left: `${(i + 1) * 10}%` }}
                />
              ))}
              <motion.div
                className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full origin-left"
                style={{ width: fillWidthStr, backgroundColor: stemColor }}
              />
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {[...Array(segmentCount)].map((_, i) => (
                  <motion.div
                    key={`static-${i}`}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{
                      left: `${(i + 1) * 12.5}%`,
                      transform: `translateY(${i % 2 === 0 ? "-3px" : "3px"}) rotate(${
                        i % 2 === 0 ? "-20deg" : "20deg"
                      }) scale(0.6)`,
                    }}
                  ></motion.div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 flex justify-between">
              <span>
                {isDragMode
                  ? "Drag to trash to delete"
                  : "Drag card to set value"}
              </span>
              {showFlower && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-amber-500 font-medium"
                >
                  Max reached! 🌻
                </motion.span>
              )}
            </p>
          </div>
        </div>
        {showFlower && !dragging && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.1,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FlowerSVG />
            </motion.div>
            {petals.map((p) => (
              <motion.div
                key={p.id}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: `hsl(${p.hue}, 80%, 60%)` }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: p.distance * Math.cos((p.angle * Math.PI) / 180),
                  y: p.distance * Math.sin((p.angle * Math.PI) / 180),
                  scale: p.size / 2,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}

        {/* Adjust Buttons (Only visible when expanded) */}
        {expanded && !isDragMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-2"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  adjustValue(-1);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-transform"
              >
                -
              </button>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Adjust
              </span>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  adjustValue(1);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});
