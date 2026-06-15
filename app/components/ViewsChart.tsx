"use client";

import { useEffect, useRef } from "react";
import type { ViewDataPoint } from "@/app/lib/types";

interface ViewsChartProps {
  data: ViewDataPoint[];
  height?: number;
  color?: string;
}

export default function ViewsChart({ data, height = 160, color = "#E8521A" }: ViewsChartProps) {
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
    const pad = { top: 16, right: 16, bottom: 28, left: 40 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    const xs = data.map((_, i) => pad.left + (i / (data.length - 1)) * chartW);
    const ys = data.map((d) => pad.top + chartH - (d.views / maxVal) * chartH);

    let progress = 0;
    cancelAnimationFrame(animRef.current);

    function draw(pct: number) {
      ctx!.clearRect(0, 0, W, H);

      const count = Math.max(2, Math.floor(pct * data.length));
      const slice = { xs: xs.slice(0, count), ys: ys.slice(0, count) };

      // Gradient fill
      const grad = ctx!.createLinearGradient(0, pad.top, 0, H - pad.bottom);
      grad.addColorStop(0, `${color}33`);
      grad.addColorStop(1, `${color}00`);
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.moveTo(slice.xs[0], H - pad.bottom);
      slice.xs.forEach((x, i) => ctx!.lineTo(x, slice.ys[i]));
      ctx!.lineTo(slice.xs[slice.xs.length - 1], H - pad.bottom);
      ctx!.closePath();
      ctx!.fill();

      // Line
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 2.5;
      ctx!.lineJoin = "round";
      ctx!.beginPath();
      slice.xs.forEach((x, i) => (i === 0 ? ctx!.moveTo(x, slice.ys[i]) : ctx!.lineTo(x, slice.ys[i])));
      ctx!.stroke();

      // Dots on last
      if (count >= 2) {
        ctx!.fillStyle = color;
        ctx!.beginPath();
        ctx!.arc(slice.xs[count - 1], slice.ys[count - 1], 4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Y-axis labels
      ctx!.fillStyle = "rgba(100,80,60,0.5)";
      ctx!.font = "10px system-ui";
      ctx!.textAlign = "right";
      [0, 0.5, 1].forEach((t) => {
        const yp = pad.top + chartH * (1 - t);
        ctx!.fillText(Math.round(maxVal * t).toLocaleString(), pad.left - 4, yp + 3);
      });

      // X-axis labels (first, mid, last)
      ctx!.textAlign = "center";
      const labelIdxs = [0, Math.floor((data.length - 1) / 2), data.length - 1];
      labelIdxs.forEach((idx) => {
        if (idx < count) {
          const label = data[idx].date.slice(5); // MM-DD
          ctx!.fillText(label, xs[idx], H - 4);
        }
      });
    }

    function animate() {
      progress = Math.min(1, progress + 0.04);
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
