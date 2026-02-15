"use client";

import { Habit, LogCompletion } from "@/types/habits";
import { useMotionValue, useTransform, motion, animate } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";

/* ─── Leaf type ─── */
interface Leaf {
  id: number;
  x: number; // position along card (%)
  side: "top" | "bottom";
  size: number; // scale factor
  hue: number; // green hue variation
  delay: number;
}

/* ─── Petal type (for flower bloom at max) ─── */
interface Petal {
  id: number;
  angle: number;
  distance: number;
  size: number;
  hue: number;
  delay: number;
}

let leafId = 0;
let petalId = 0;

/* ─── Leaf SVG ─── */
function LeafSVG({ hue, side }: { hue: number; side: "top" | "bottom" }) {
  const flip = side === "bottom" ? "scaleY(-1)" : "";
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      style={{ transform: flip }}
    >
      <path
        d="M1 13C1 13 4 1 17 1C17 1 14 6 9 9C4 12 1 13 1 13Z"
        fill={`hsl(${hue}, 70%, 45%)`}
        stroke={`hsl(${hue}, 60%, 35%)`}
        strokeWidth="0.5"
      />
      <path
        d="M1 13C5 8 10 4 17 1"
        stroke={`hsl(${hue}, 50%, 55%)`}
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
}

/* ─── Flower SVG ─── */
function FlowerSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {/* Petals */}
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
      {/* Center */}
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

export function MeasurableCard({
  habit,
  log,
  onSetValue,
  onDelete,
  onDragToggle,
}: MeasurableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [liveValue, setLiveValue] = useState(Number(log?.actualValue ?? 0));
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [showFlower, setShowFlower] = useState(false);
  const startXRef = useRef(0);
  const startValueRef = useRef(0);
  const hasDraggedRef = useRef(false);
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

  const fillPct = useMotionValue(0);
  const fillWidthStr = useTransform(fillPct, (v) => `${v}%`);

  useEffect(() => {
    onDragToggle?.(isDragMode);
  }, [isDragMode, onDragToggle]);

  /* ─── Vine/fill color: earthy brown → green ─── */
  const vineBg = useTransform(fillPct, (v) => {
    if (v <= 0) return "rgba(0,0,0,0)";
    const t = v / 100;
    // Brown-green gradient
    const r = Math.round(120 - 86 * t);
    const g = Math.round(100 + 80 * t);
    const b = Math.round(60 - 10 * t);
    return `rgba(${r},${g},${b},0.2)`;
  });

  /* ─── Vine stem color ─── */
  const stemColor = useTransform(fillPct, (v) => {
    const t = v / 100;
    const r = Math.round(80 - 46 * t);
    const g = Math.round(90 + 70 * t);
    const b = Math.round(40 + 14 * t);
    return `rgb(${r},${g},${b})`;
  });

  const maxValue = Number(habit.targetValue ?? 100);
  const step = 1;
  const currentValue = Number(log?.actualValue ?? 0);

  useEffect(() => {
    setLiveValue(currentValue);
    prevSnapRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    if (!dragging) {
      animate(fillPct, (currentValue / maxValue) * 100, {
        type: "spring",
        stiffness: 120,
        damping: 20,
      });
    }
  }, [currentValue, maxValue, dragging, fillPct]);

  // Show flower when at max
  useEffect(() => {
    setShowFlower(currentValue >= maxValue && currentValue > 0);
  }, [currentValue, maxValue]);

  const snapToStep = useCallback(
    (raw: number) => {
      const snapped = Math.round(raw / step) * step;
      return Math.max(0, Math.min(maxValue, snapped));
    },
    [maxValue, step],
  );

  /* ─── Spawn leaf ─── */
  const spawnLeaf = useCallback((pct: number) => {
    const id = ++leafId;
    const leaf: Leaf = {
      id,
      x: pct,
      side: Math.random() > 0.5 ? "top" : "bottom",
      size: 0.7 + Math.random() * 0.5,
      hue: 110 + Math.random() * 40, // green variations
      delay: Math.random() * 0.1,
    };
    setLeaves((prev) => [...prev.slice(-20), leaf]);
    // Fade leaf after a while
    setTimeout(() => {
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    }, 2500);
  }, []);

  /* ─── Spawn petals (max celebration) ─── */
  const spawnPetals = useCallback(() => {
    const newPetals: Petal[] = [];
    for (let i = 0; i < 12; i++) {
      newPetals.push({
        id: ++petalId,
        angle: (i / 12) * 360 + Math.random() * 20,
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
      // Long Press Logic
      isPointerDownRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);

      longPressTimer.current = setTimeout(() => {
        if (isPointerDownRef.current) {
          setIsDragMode(true);
          setDragging(false); // Cancel value dragging if it started
          animate(scale, 1.05, { duration: 0.2 });
          animate(rotate, 2, { duration: 0.2 });

          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }, 1000);

      // Value Drag Logic
      if (expanded) return;

      startXRef.current = e.clientX;
      startValueRef.current = currentValue;
      hasDraggedRef.current = false;
      prevSnapRef.current = currentValue;
      setDragging(true);
    },
    [expanded, currentValue, scale, rotate],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // If we are in Drag Mode (Deleting), ignore value changes
      if (isDragMode) return;

      if (!dragging) return;
      const deltaX = e.clientX - startXRef.current;

      // If moved significantly, cancel long press
      if (Math.abs(deltaX) > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!hasDraggedRef.current && Math.abs(deltaX) < 5) return;
      hasDraggedRef.current = true;

      if (!cardRef.current) return;
      const cardWidth = cardRef.current.getBoundingClientRect().width;

      const deltaValue = (deltaX / cardWidth) * maxValue;
      const raw = startValueRef.current + deltaValue;
      const val = snapToStep(raw);

      // Detect step change — spawn leaf
      if (val !== prevSnapRef.current) {
        const pct = (val / maxValue) * 100;
        if (val > prevSnapRef.current) {
          // Growing — spawn leaf at new position
          spawnLeaf(pct);
        }
        // If shrinking, leaves naturally thin out via timeout
        prevSnapRef.current = val;
      }

      setLiveValue(val);
      fillPct.set((val / maxValue) * 100);
    },
    [dragging, maxValue, snapToStep, fillPct, spawnLeaf, isDragMode],
  );

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isDragMode) {
      // Logic handled by onDragEnd of motion.div
      return;
    }

    if (!dragging) return;
    if (hasDraggedRef.current) {
      onSetValue({ actualValue: liveValue });
      if (liveValue >= maxValue) {
        spawnPetals();
      }
    }
    setDragging(false);
    hasDraggedRef.current = false;
  }, [dragging, liveValue, maxValue, onSetValue, spawnPetals, isDragMode]);

  const handleDragEnd = (
    _: unknown,
    info: { point: { x: number; y: number } },
  ) => {
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
        animate(rotate, 0, { duration: 0.2 });
      }
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
    const newVal = Math.max(0, Math.min(maxValue, currentValue + delta));
    onSetValue({ actualValue: newVal });
    setLiveValue(newVal);
    if (delta > 0) {
      spawnLeaf((newVal / maxValue) * 100);
    }
    if (newVal >= maxValue) {
      spawnPetals();
    }
  }

  const displayValue = dragging ? liveValue : currentValue;
  const isDone = currentValue > 0;
  const isMax = displayValue >= maxValue;

  // Compute how many persistent vine segments to show based on fill
  const segmentCount = Math.floor((displayValue / maxValue) * 8);

  return (
    <div className="relative">
      <motion.div
        ref={cardRef}
        style={{ x, y, scale, rotate, opacity, zIndex: isDragMode ? 50 : 1 }}
        drag={true}
        dragListener={true}
        dragConstraints={
          isDragMode ? undefined : { left: 0, right: 0, top: 0, bottom: 0 }
        }
        dragElastic={isDragMode ? 0.5 : 0}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        onClick={handleTap}
        className={`relative overflow-hidden rounded-2xl border shadow-sm select-none transition-colors duration-500 touch-none ${
          isMax
            ? "border-green-400 bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:border-green-700 dark:from-green-950/30 dark:to-emerald-950/30"
            : isDone
              ? "border-green-200/60 bg-green-50/20 dark:border-green-900/60 dark:bg-green-950/10"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        } ${isDragMode ? "shadow-xl ring-2 ring-red-500/50 cursor-grabbing" : "cursor-grab"}`}
      >
        {/* Soil/earth gradient at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            background: isDone
              ? "linear-gradient(to right, rgba(120,80,40,0.3), rgba(80,60,30,0.15))"
              : "transparent",
          }}
        />

        {/* Vine fill area (green growth background) */}
        <motion.div
          className="absolute bottom-0 left-0 top-0 pointer-events-none"
          style={{
            width: fillWidthStr,
            background: vineBg,
          }}
        />

        {/* Content Row */}
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
          <span className="text-2xl sm:text-3xl shrink-0">{habit.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mr-1">
              <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {habit.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-bold font-mono transition-colors duration-300 ${
                    isDone
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {displayValue}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  / {maxValue} {habit.targetUnit || ""}
                </span>
              </div>
            </div>

            {/* Progress bar line */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
              {/* Background ticks */}
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-[1px] bg-zinc-300/30 dark:bg-zinc-700/30"
                  style={{ left: `${(i + 1) * 10}%` }}
                />
              ))}

              {/* Stem (vine main line) */}
              <motion.div
                className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full origin-left"
                style={{ width: fillWidthStr, backgroundColor: stemColor }}
              />

              {/* Leaves spawning on the vine */}
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {/* Persistent leaves based on segment */}
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
                  >
                    <LeafSVG hue={120} side={i % 2 === 0 ? "top" : "bottom"} />
                  </motion.div>
                ))}

                {/* Ephemeral floating leaves */}
                {leaves.map((leaf) => (
                  <motion.div
                    key={leaf.id}
                    className="absolute top-1/2 left-0 -translate-y-1/2"
                    initial={{ opacity: 0, scale: 0, x: `${leaf.x}%`, y: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: leaf.size,
                      y: leaf.side === "top" ? -10 : 10,
                      rotate: leaf.side === "top" ? -20 : 20,
                    }}
                    transition={{
                      duration: 0.6 + leaf.delay,
                      ease: "easeOut",
                    }}
                  >
                    <LeafSVG hue={leaf.hue} side={leaf.side} />
                  </motion.div>
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

        {/* Flower Bloom Overlay (when maxed) */}
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
            {/* Petals Explosion */}
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
}
