"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback } from "react";
// Import types removed for build compatibility

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full text-ink/40 dark:text-cream/40 text-sm">
      Loading canvas…
    </div>
  )}
);

export interface CanvasPage {
  id: string;
  blob: Blob;
  url: string;
  label: string;
}

interface ExcalidrawEditorProps {
  pages: CanvasPage[];
  onPagesChange: (pages: CanvasPage[]) => void;
}

export default function ExcalidrawEditor({ pages, onPagesChange }: ExcalidrawEditorProps) {
  const [exApi, setExApi] = useState<{
    getSceneElements: () => readonly any[];
    getAppState: () => any;
    getFiles: () => any;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activePage, setActivePage] = useState<number | null>(null);

  const handleExcalidrawMount = useCallback((api: typeof exApi) => {
    setExApi(api);
  }, []);

  async function exportCurrentPage() {
    if (!exApi || exporting) return;
    setExporting(true);
    try {
      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const blob = await exportToBlob({
        elements: exApi.getSceneElements(),
        appState: { ...exApi.getAppState(), exportBackground: true, exportWithDarkMode: false },
        files: exApi.getFiles(),
        quality: 0.95,
        mimeType: "image/png",
      });
      const url = URL.createObjectURL(blob);
      const newPage: CanvasPage = {
        id: crypto.randomUUID(),
        blob,
        url,
        label: `Page ${pages.length + 1}`,
      };
      onPagesChange([...pages, newPage]);
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setExporting(false);
    }
  }

  function removePage(id: string) {
    onPagesChange(pages.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button
          id="export-page-btn"
          onClick={exportCurrentPage}
          disabled={exporting || !exApi}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron text-white text-sm font-bold disabled:opacity-40 hover:bg-saffron/90 active:scale-95 transition-all"
        >
          {exporting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>✦</span>
          )}
          {exporting ? "Saving page…" : "Save Page"}
        </button>
        <p className="text-xs text-ink/40 dark:text-cream/40">
          Draw your manga page then click "Save Page" to add it to your chapter
        </p>
      </div>

      {/* Canvas */}
      <div className="flex-1 rounded-2xl overflow-hidden border-2 border-ink/10 dark:border-cream/10 min-h-[480px] bg-white dark:bg-[#1a1a2e]">
        <Excalidraw
          excalidrawAPI={(api) => handleExcalidrawMount(api as typeof exApi)}
          theme="light"
          initialData={{
            appState: {
              viewBackgroundColor: "#ffffff",
              currentItemFontFamily: 1,
            },
          }}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              saveAsImage: false,
            },
          }}
        />
      </div>

      {/* Saved pages strip */}
      {pages.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink dark:text-cream">
              Saved Pages <span className="text-saffron">({pages.length})</span>
            </h3>
            <p className="text-xs text-ink/40 dark:text-cream/40">These will be uploaded as chapter pages</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className={`relative flex-shrink-0 w-20 cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                  activePage === idx
                    ? "border-saffron shadow-lg shadow-saffron/20"
                    : "border-ink/10 dark:border-cream/10 hover:border-saffron/40"
                }`}
                onClick={() => setActivePage(activePage === idx ? null : idx)}
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                  {p.label}
                </div>
                <button
                  id={`remove-page-${idx}`}
                  onClick={(e) => { e.stopPropagation(); removePage(p.id); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label={`Remove ${p.label}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
