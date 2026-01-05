"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  className,
  side = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 8;
          left =
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          // 画面からはみ出さないように調整
          if (left < 8) left = 8;
          if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8;
          }
          // 上部にはみ出す場合は下部に表示
          if (top < 8) {
            top = triggerRect.bottom + 8;
          }
          break;
        case "bottom":
          top = triggerRect.bottom + 8;
          left =
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          if (left < 8) left = 8;
          if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8;
          }
          // 下部にはみ出す場合は上部に表示
          if (top + tooltipRect.height > viewportHeight - 8) {
            top = triggerRect.top - tooltipRect.height - 8;
          }
          break;
        case "left":
          top =
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          if (top < 8) top = 8;
          if (top + tooltipRect.height > viewportHeight - 8) {
            top = viewportHeight - tooltipRect.height - 8;
          }
          break;
        case "right":
          top =
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + 8;
          if (top < 8) top = 8;
          if (top + tooltipRect.height > viewportHeight - 8) {
            top = viewportHeight - tooltipRect.height - 8;
          }
          break;
      }

      setPosition({ top, left });
    };

    // ツールチップがDOMに追加された後に位置を計算
    const timeoutId = setTimeout(() => {
      updatePosition();
    }, 0);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible, side]);

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-zinc-100 border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-zinc-100 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-zinc-100 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-zinc-100 border-t-transparent border-b-transparent border-l-transparent",
  };

  const tooltipContent =
    isVisible && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={tooltipRef}
            className={cn(
              "fixed z-50 px-3 py-2 text-xs text-black bg-zinc-100 border border-zinc-200 rounded-md shadow-lg pointer-events-none max-w-xs",
              className
            )}
            style={{
              top: position.top > 0 ? `${position.top}px` : "0",
              left: position.left > 0 ? `${position.left}px` : "0",
              visibility:
                position.top > 0 || position.left > 0 ? "visible" : "hidden",
            }}
            role="tooltip"
          >
            {content}
            <div
              className={cn("absolute w-0 h-0 border-4", arrowClasses[side])}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  );
}
