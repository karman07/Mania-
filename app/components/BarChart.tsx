"use client";

import { useEffect, useRef } from "react";
import type { ChapterAnalytics } from "@/app/lib/types";

interface BarChartProps {
  data: ChapterAnalytics[];
  height?: number;
  color?: string;
}

export default function BarChart({ data, height = 180, color = "#E8521A" }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.parentElement?.clientWidth ?? 600;
    const H = height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const maxVal = Math.max(...data.map((d) => d.views), 1);
    const pad = { top: 16, right: 8, bottom: 32, left: 44 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const barGap = 4;
    const barW = Math.max(8, (chartW / data.length) - barGap);

    let progress = 0;
    cancelAnimationFrame(animRef.current);

    function draw(pct: number) {
      ctx!.clearRect(0, 0, W, H);

      data.forEach((d, i) => {
        const x = pad.left + i * ((chartW) / data.length) + barGap / 2;
        const fullH = (d.views / maxVal) * chartH;
        const h = fullH * pct;
        const y = pad.top + chartH - h;

        // Bar gradient
        const grad = ctx!.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, `${color}66`);
        ctx!.fillStyle = grad;

        const r = Math.min(4, barW / 2);
        ctx!.beginPath();
        ctx!.moveTo(x + r, y);
        ctx!.lineTo(x + barW - r, y);
        ctx!.arcTo(x + barW, y, x + barW, y + r, r);
        ctx!.lineTo(x + barW, y + h);
        ctx!.lineTo(x, y + h);
        ctx!.arcTo(x, y, x + r, y, r);
        ctx!.closePath();
        ctx!.fill();
      });

      // Y-axis labels
      ctx!.fillStyle = "rgba(100,80,60,0.5)";
      ctx!.font = "10px system-ui";
      ctx!.textAlign = "right";
      [0, 0.5, 1].forEach((t) => {
        const yp = pad.top + chartH * (1 - t);
        ctx!.fillText(Math.round(maxVal * t).toLocaleString(), pad.left - 4, yp + 3);
        ctx!.fillStyle = "rgba(100,80,60,0.08)";
        ctx!.fillRect(pad.left, yp, chartW, 1);
        ctx!.fillStyle = "rgba(100,80,60,0.5)";
      });

      // X-axis chapter labels
      ctx!.textAlign = "center";
      data.forEach((d, i) => {
        const x = pad.left + i * (chartW / data.length) + barW / 2 + barGap / 2;
        if (i % Math.ceil(data.length / 8) === 0) {
          ctx!.fillText(`Ch.${d.chapterNumber}`, x, H - 6);
        }
      });
    }

    function animate() {
      progress = Math.min(1, progress + 0.05);
      draw(progress);
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [data, height, color]);

  return (
    <div className="w-full relative">
      <canvas ref={canvasRef} className="w-full" style={{ height }} />
    </div>
  );
}
