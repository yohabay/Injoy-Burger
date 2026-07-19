import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useMenuItems,
  useSiteVideos,
  useSiteImages,
  useUpsertMenuItem,
  useDeleteMenuItem,
  useUpsertVideo,
  useDeleteVideo,
  useUpsertImage,
  useDeleteImage,
  useUploadFile,
  useWheelSegments,
  useUpsertWheelSegment,
  useDeleteWheelSegment,
  useLoyaltyTiers,
  useUpsertTier,
  useDeleteTier,
  useLoyaltyRewards,
  useUpsertReward,
  useDeleteReward,
} from "@/lib/content.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [tab, setTab] = useState<"menu" | "videos" | "images" | "wheel" | "loyalty">("menu");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <Toaster position="top-right" richColors />
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-zinc-950/70 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-orange-500/20">
            IJ
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">
              Injoy <span className="text-orange-400">Admin</span>
            </h1>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Content Manager</p>
          </div>
        </div>
        <a
          href="/"
          className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/20 transition-all font-mono"
        >
          ← Live Site
        </a>
      </header>

      <nav className="sticky top-[65px] z-20 backdrop-blur-xl bg-zinc-950/50 border-b border-white/5 px-6 flex gap-0">
        {([
          ["menu", "Menu Items"],
          ["videos", "Site Videos"],
          ["images", "Through Their Lens"],
          ["wheel", "Spin Wheel"],
          ["loyalty", "Loyalty Club"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative px-4 py-3 text-sm font-medium transition-all ${
              tab === key
                ? "text-orange-400"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {label}
            {tab === key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500"
              />
            )}
          </button>
        ))}
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {tab === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <MenuTab />
            </motion.div>
          )}
          {tab === "videos" && (
            <motion.div key="videos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <VideosTab />
            </motion.div>
          )}
          {tab === "images" && (
            <motion.div key="images" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <ImagesTab />
            </motion.div>
          )}
          {tab === "wheel" && (
            <motion.div key="wheel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <WheelTab />
            </motion.div>
          )}
          {tab === "loyalty" && (
            <motion.div key="loyalty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <LoyaltyTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── Drop Zone — drag & drop OR click to upload ── */
function DropZone({ accept, onUploaded, label, preview }: { accept: string; onUploaded: (url: string) => void; label: string; preview?: string | null }) {
  const upload = useUploadFile();
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    try {
      const url = await upload.mutateAsync(file);
      onUploaded(url);
      toast.success("Uploaded!");
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Upload failed");
    }
  }, [upload, onUploaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => ref.current?.click()}
      className={`relative cursor-pointer border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-3 p-4 min-h-[90px] ${
        drag ? "border-orange-500 bg-orange-500/10" : preview ? "border-white/10 bg-white/[0.03]" : "border-white/10 bg-white/[0.02] hover:border-orange-500/30 hover:bg-orange-500/5"
      }`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (ref.current) ref.current.value = ""; }} />
      {upload.isPending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-white/40">Uploading...</span>
        </div>
      ) : preview ? (
        <div className="flex items-center gap-3 w-full">
          {accept.includes("video") ? (
            <video src={preview} className="h-16 rounded object-cover border border-white/10" />
          ) : (
            <img src={preview} alt="" className="h-16 w-16 rounded object-cover border border-white/10" />
          )}
          <span className="text-xs text-orange-400">Drop to replace</span>
        </div>
      ) : (
        <>
          <svg className="h-5 w-5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-xs text-white/30 font-medium">{label}</span>
        </>
      )}
    </div>
  );
}

/* ── Shared input row ── */
function InputRow({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono mb-1 block">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/5 border-white/10 text-white text-sm h-9 rounded-md focus:border-orange-500/50 focus:ring-orange-500/20" />
    </div>
  );
}

function SelectRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-sm text-white h-9 focus:border-orange-500/50 focus:outline-none" style={{ colorScheme: "dark" }}>
        {options.map(([val, lbl]) => <option key={val} value={val} className="bg-zinc-800 text-white">{lbl}</option>)}
      </select>
    </div>
  );
}

/* ── MENU TAB ── */
function MenuTab() {
  const { data: items, isLoading, error } = useMenuItems();
  const upsert = useUpsertMenuItem();
  const remove = useDeleteMenuItem();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  if (isLoading) return <LoadingState label="menu items" />;
  if (error) return <ErrorState message={(error as Error).message} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Menu Items</h2>
          <p className="text-xs text-white/30 mt-0.5">{items?.length ?? 0} items total</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowNew(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-9 px-4 rounded-md shadow-lg shadow-orange-500/20">
          + New Item
        </Button>
      </div>

      <AnimatePresence>
        {(showNew || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <MenuItemForm
              item={editingId ? items?.find((m: { id: string }) => m.id === editingId) : null}
              onSave={async (data) => {
                try { await upsert.mutateAsync(data); toast.success("Saved!"); setEditingId(null); setShowNew(false); }
                catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); }
              }}
              onCancel={() => { setEditingId(null); setShowNew(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items?.map((item: { id: string; number: string; name: string; tag: string; description: string; price: number; img: string; video: string | null; category: string; active: boolean }) => (
          <div key={item.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all">
            <div className="relative aspect-square bg-zinc-800 overflow-hidden">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-2 left-2 font-mono text-orange-400 text-[10px] bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">{item.number}</span>
              <span className="absolute top-2 right-2 text-[8px] font-mono bg-black/60 backdrop-blur-sm text-white/50 px-1.5 py-0.5 rounded">{item.category}</span>
              {!item.active && <span className="absolute bottom-2 left-2 text-[8px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">HIDDEN</span>}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold truncate">{item.name}</p>
              <p className="text-[10px] text-white/20 truncate">{item.tag}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-orange-300/80 font-mono">ETB {item.price}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)} className="text-[10px] h-6 flex-1">Edit</Button>
                  <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete "${item.name}"?`)) { try { await remove.mutateAsync({ id: item.id }); toast.success("Deleted"); } catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); } } }} className="text-[10px] h-6 flex-1">Del</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuItemForm({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    number: item?.number ?? String((item?.sort_order ?? 0) + 1).padStart(2, "0"),
    name: item?.name ?? "",
    tag: item?.tag ?? "",
    description: item?.description ?? "",
    price: item?.price ?? 0,
    img: item?.img ?? "",
    video: item?.video ?? "",
    category: item?.category ?? "Main Dish",
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  });

  return (
    <div className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{item ? "Edit" : "New"} Menu Item</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white text-xs">&times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputRow label="Number" value={f.number} onChange={(v) => setF({ ...f, number: v })} />
        <InputRow label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <InputRow label="Tagline" value={f.tag} onChange={(v) => setF({ ...f, tag: v })} />
        <InputRow label="Price (ETB)" value={String(f.price)} onChange={(v) => setF({ ...f, price: Number(v) })} type="number" />
        <InputRow label="Description" value={f.description} onChange={(v) => setF({ ...f, description: v })} />
        <SelectRow label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={[["Most Ordered", "Most Ordered"], ["Main Dish", "Main Dish"]]} />
        <InputRow label="Sort Order" value={String(f.sort_order)} onChange={(v) => setF({ ...f, sort_order: Number(v) })} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Image</label>
          <DropZone accept="image/*" label="Drop image here or click" preview={f.img || null} onUploaded={(url) => setF({ ...f, img: url })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Video (optional)</label>
          <DropZone accept="video/*" label="Drop video here or click" preview={f.video || null} onUploaded={(url) => setF({ ...f, video: url })} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(item?.id ? { ...f, id: item.id } : f)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-8 px-5 rounded-md">Save</Button>
        <Button variant="outline" onClick={onCancel} className="text-xs h-8 border-white/10">Cancel</Button>
      </div>
    </div>
  );
}

/* ── VIDEOS TAB ── */
function VideosTab() {
  const { data: videos, isLoading, error } = useSiteVideos();
  const upsert = useUpsertVideo();
  const remove = useDeleteVideo();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="videos" />;
  if (error) return <ErrorState message={(error as Error).message} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Videos</h2>
          <p className="text-xs text-white/30 mt-0.5">{videos?.length ?? 0} videos total</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowNew(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-9 px-4 rounded-md shadow-lg shadow-orange-500/20">
          + New Video
        </Button>
      </div>

      <AnimatePresence>
        {(showNew || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <VideoForm
              item={editingId ? videos?.find((v: { id: string }) => v.id === editingId) : null}
              onSave={async (data) => {
                try { await upsert.mutateAsync(data); toast.success("Saved!"); setEditingId(null); setShowNew(false); }
                catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); }
              }}
              onCancel={() => { setEditingId(null); setShowNew(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {videos?.map((vid: { id: string; label: string; section: string; src: string; poster: string | null; active: boolean }) => (
          <div key={vid.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all">
            <div className="relative aspect-video bg-zinc-800 overflow-hidden cursor-pointer">
              {playingId === vid.id ? (
                <video key={vid.id} src={vid.src} poster={vid.poster ?? undefined} controls autoPlay onEnded={() => setPlayingId(null)} className="w-full h-full object-cover" />
              ) : (
                <>
                  {vid.poster ? <img src={vid.poster} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
                    <div className="w-full h-full flex items-center justify-center"><svg className="h-10 w-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPlayingId(vid.id)}>
                    <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                      <svg className="h-4 w-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 text-[8px] font-mono bg-black/60 backdrop-blur-sm text-white/50 px-1.5 py-0.5 rounded">{vid.section}</span>
                </>
              )}
            </div>
            <div className="p-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold truncate">{vid.label}</p>
                {playingId === vid.id && <span className="text-[8px] text-green-400 font-mono animate-pulse">PLAYING</span>}
              </div>
              <div className="flex gap-1 mt-2">
                {playingId === vid.id && <Button size="sm" variant="outline" onClick={() => setPlayingId(null)} className="text-[10px] h-6 flex-1">Stop</Button>}
                <Button size="sm" variant="outline" onClick={() => setEditingId(vid.id)} className="text-[10px] h-6 flex-1">Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete "${vid.label}"?`)) { try { await remove.mutateAsync({ id: vid.id }); toast.success("Deleted"); } catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); } } }} className="text-[10px] h-6 flex-1">Del</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoForm({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    label: item?.label ?? "",
    section: item?.section ?? "hero",
    src: item?.src ?? "",
    poster: item?.poster ?? "",
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  });

  return (
    <div className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{item ? "Edit" : "New"} Video</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white text-xs">&times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputRow label="Label" value={f.label} onChange={(v) => setF({ ...f, label: v })} />
        <SelectRow label="Section" value={f.section} onChange={(v) => setF({ ...f, section: v })} options={[["hero", "Hero"], ["movie-story", "Movie Story"], ["rider", "Rider"], ["eating-burger", "Eating Burger"]]} />
        <InputRow label="Sort Order" value={String(f.sort_order)} onChange={(v) => setF({ ...f, sort_order: Number(v) })} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Video File</label>
          <DropZone accept="video/*" label="Drop video here or click" preview={f.src || null} onUploaded={(url) => setF({ ...f, src: url })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Poster Image</label>
          <DropZone accept="image/*" label="Drop poster here or click" preview={f.poster || null} onUploaded={(url) => setF({ ...f, poster: url })} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(item?.id ? { ...f, id: item.id } : f)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-8 px-5 rounded-md">Save</Button>
        <Button variant="outline" onClick={onCancel} className="text-xs h-8 border-white/10">Cancel</Button>
      </div>
    </div>
  );
}

/* ── IMAGES TAB — Through Their Lens gallery ── */
function ImagesTab() {
  const { data: allImages, isLoading, error } = useSiteImages();
  const upsert = useUpsertImage();
  const remove = useDeleteImage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const images = (allImages ?? []).filter((img: any) => img.section === "lens");

  if (isLoading) return <LoadingState label="images" />;
  if (error) return <ErrorState message={(error as Error).message} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Through Their Lens</h2>
          <p className="text-xs text-white/30 mt-0.5">{images.length} photos in gallery</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowNew(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-9 px-4 rounded-md shadow-lg shadow-orange-500/20">
          + Add Photo
        </Button>
      </div>

      <AnimatePresence>
        {(showNew || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <ImageForm
              item={editingId ? images.find((i: { id: string }) => i.id === editingId) : null}
              onSave={async (data) => {
                try { await upsert.mutateAsync(data); toast.success("Saved!"); setEditingId(null); setShowNew(false); }
                catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); }
              }}
              onCancel={() => { setEditingId(null); setShowNew(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img: { id: string; label: string; src: string; alt: string; sort_order: number; active: boolean }) => (
          <div key={img.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all">
            <div className="relative aspect-square bg-zinc-800 overflow-hidden cursor-pointer" onClick={() => setPreviewSrc(img.src)}>
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold truncate">{img.label}</p>
              <p className="text-[10px] text-white/20 truncate">{img.alt}</p>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(img.id)} className="text-[10px] h-6 flex-1">Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete "${img.label}"?`)) { try { await remove.mutateAsync({ id: img.id }); toast.success("Deleted"); } catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); } } }} className="text-[10px] h-6 flex-1">Del</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full preview modal */}
      <AnimatePresence>
        {previewSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8" onClick={() => setPreviewSrc(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={previewSrc} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            <button className="absolute top-6 right-6 text-white/50 hover:text-white text-sm font-mono">&times; Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageForm({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    label: item?.label ?? "",
    section: "lens",
    src: item?.src ?? "",
    alt: item?.alt ?? "",
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  });

  return (
    <div className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{item ? "Edit" : "New"} Photo</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white text-xs">&times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputRow label="Label" value={f.label} onChange={(v) => setF({ ...f, label: v })} />
        <InputRow label="Alt Text (author)" value={f.alt} onChange={(v) => setF({ ...f, alt: v })} />
        <InputRow label="Sort Order" value={String(f.sort_order)} onChange={(v) => setF({ ...f, sort_order: Number(v) })} type="number" />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Photo</label>
        <DropZone accept="image/*" label="Drop photo here or click" preview={f.src || null} onUploaded={(url) => setF({ ...f, src: url })} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(item?.id ? { ...f, id: item.id } : f)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-8 px-5 rounded-md">Save</Button>
        <Button variant="outline" onClick={onCancel} className="text-xs h-8 border-white/10">Cancel</Button>
      </div>
    </div>
  );
}

/* ── SPIN WHEEL TAB ── */
function WheelTab() {
  const { data: segments, isLoading, error } = useWheelSegments();
  const upsert = useUpsertWheelSegment();
  const remove = useDeleteWheelSegment();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  if (isLoading) return <LoadingState label="spin wheel segments" />;
  if (error) return <ErrorState message={(error as Error).message} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Spin Wheel</h2>
          <p className="text-xs text-white/30 mt-0.5">{segments?.length ?? 0} segments total</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowNew(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-9 px-4 rounded-md shadow-lg shadow-orange-500/20">
          + New Segment
        </Button>
      </div>

      <AnimatePresence>
        {(showNew || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <WheelSegmentForm
              item={editingId ? segments?.find((s: { id: string }) => s.id === editingId) : null}
              onSave={async (data) => {
                try { await upsert.mutateAsync(data); toast.success("Saved!"); setEditingId(null); setShowNew(false); }
                catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); }
              }}
              onCancel={() => { setEditingId(null); setShowNew(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {segments?.map((seg: { id: string; label: string; code: string; color: string; sort_order: number; active: boolean }) => (
          <div key={seg.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all">
            <div className="relative aspect-square overflow-hidden flex items-center justify-center" style={{ backgroundColor: seg.color }}>
              <span className="text-white font-black text-sm text-center px-2">{seg.label}</span>
              {!seg.active && <span className="absolute top-2 left-2 text-[8px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">HIDDEN</span>}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold truncate">{seg.label}</p>
              <p className="text-[10px] text-white/20 font-mono truncate">{seg.code || 'No code'}</p>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(seg.id)} className="text-[10px] h-6 flex-1">Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete "${seg.label}"?`)) { try { await remove.mutateAsync({ id: seg.id }); toast.success("Deleted"); } catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); } } }} className="text-[10px] h-6 flex-1">Del</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WheelSegmentForm({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    label: item?.label ?? "",
    code: item?.code ?? "",
    color: item?.color ?? "#f97316",
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  });

  return (
    <div className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{item ? "Edit" : "New"} Segment</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white text-xs">&times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputRow label="Label" value={f.label} onChange={(v) => setF({ ...f, label: v })} />
        <InputRow label="Promo Code (empty = try again)" value={f.code} onChange={(v) => setF({ ...f, code: v })} />
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono mb-1 block">Color</label>
          <input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} className="w-full h-9 rounded-md border border-white/10 bg-zinc-800 cursor-pointer" />
        </div>
        <InputRow label="Sort Order" value={String(f.sort_order)} onChange={(v) => setF({ ...f, sort_order: Number(v) })} type="number" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Active</label>
        <button onClick={() => setF({ ...f, active: !f.active })} className={`w-10 h-5 rounded-full transition-all ${f.active ? "bg-orange-500" : "bg-zinc-700"}`}>
          <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${f.active ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(item?.id ? { ...f, id: item.id } : f)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-8 px-5 rounded-md">Save</Button>
        <Button variant="outline" onClick={onCancel} className="text-xs h-8 border-white/10">Cancel</Button>
      </div>
    </div>
  );
}

/* ── LOYALTY TAB ── */
function LoyaltyTab() {
  const { data: tiers, isLoading: tiersLoading, error: tiersError } = useLoyaltyTiers();
  const { data: rewards, isLoading: rewardsLoading, error: rewardsError } = useLoyaltyRewards();
  const upsertTier = useUpsertTier();
  const removeTier = useDeleteTier();
  const upsertReward = useUpsertReward();
  const removeReward = useDeleteReward();
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [showNewTier, setShowNewTier] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [showNewReward, setShowNewReward] = useState(false);

  if (tiersLoading || rewardsLoading) return <LoadingState label="loyalty data" />;
  if (tiersError) return <ErrorState message={(tiersError as Error).message} />;
  if (rewardsError) return <ErrorState message={(rewardsError as Error).message} />;

  return (
    <div className="space-y-8">
      {/* Tiers Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Tiers</h2>
            <p className="text-xs text-white/30 mt-0.5">{tiers?.length ?? 0} tiers — members progress through these based on points</p>
          </div>
          <Button onClick={() => { setEditingTierId(null); setShowNewTier(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-9 px-4 rounded-md shadow-lg shadow-orange-500/20">
            + New Tier
          </Button>
        </div>

        <AnimatePresence>
          {(showNewTier || editingTierId) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <TierForm
                item={editingTierId ? tiers?.find((t: { id: string }) => t.id === editingTierId) : null}
                onSave={async (data) => {
                  try { await upsertTier.mutateAsync(data); toast.success("Saved!"); setEditingTierId(null); setShowNewTier(false); }
                  catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); }
                }}
                onCancel={() => { setEditingTierId(null); setShowNewTier(false); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tiers?.map((tier: { id: string; name: string; min_points: number; color: string; active: boolean }) => (
            <div key={tier.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all">
              <div className={`h-16 bg-gradient-to-r ${tier.color}`} />
              <div className="p-3">
                <p className="text-sm font-bold">{tier.name}</p>
                <p className="text-[10px] text-white/30 font-mono">{tier.min_points}+ pts</p>
                {!tier.active && <span className="text-[8px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded mt-1 inline-block">HIDDEN</span>}
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingTierId(tier.id)} className="text-[10px] h-6 flex-1">Edit</Button>
                  <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete "${tier.name}"?`)) { try { await removeTier.mutateAsync({ id: tier.id }); toast.success("Deleted"); } catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); } } }} className="text-[10px] h-6 flex-1">Del</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Rewards</h2>
            <p className="text-xs text-white/30 mt-0.5">{rewards?.length ?? 0} rewards — unlocked at point milestones</p>
          </div>
          <Button onClick={() => { setEditingRewardId(null); setShowNewReward(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-9 px-4 rounded-md shadow-lg shadow-orange-500/20">
            + New Reward
          </Button>
        </div>

        <AnimatePresence>
          {(showNewReward || editingRewardId) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <RewardForm
                item={editingRewardId ? rewards?.find((r: { id: string }) => r.id === editingRewardId) : null}
                onSave={async (data) => {
                  try { await upsertReward.mutateAsync(data); toast.success("Saved!"); setEditingRewardId(null); setShowNewReward(false); }
                  catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); }
                }}
                onCancel={() => { setEditingRewardId(null); setShowNewReward(false); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3">
          {rewards?.map((reward: { id: string; label: string; points: number; icon: string; active: boolean }) => (
            <div key={reward.id} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all p-3 text-center">
              <div className="text-2xl mb-1">{reward.icon}</div>
              <p className="text-sm font-bold">{reward.points} pts</p>
              <p className="text-[10px] text-white/30">{reward.label}</p>
              {!reward.active && <span className="text-[8px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded mt-1 inline-block">HIDDEN</span>}
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" onClick={() => setEditingRewardId(reward.id)} className="text-[10px] h-6 flex-1">Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (confirm(`Delete "${reward.label}"?`)) { try { await removeReward.mutateAsync({ id: reward.id }); toast.success("Deleted"); } catch (e: unknown) { toast.error((e as Error)?.message || "Failed"); } } }} className="text-[10px] h-6 flex-1">Del</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TierForm({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    name: item?.name ?? "",
    min_points: item?.min_points ?? 0,
    color: item?.color ?? "from-orange-500 to-red-600",
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  });

  const colorOptions: [string, string][] = [
    ["from-orange-500 to-red-600", "Orange-Red"],
    ["from-zinc-200 to-zinc-400", "Silver"],
    ["from-amber-300 to-orange-500", "Gold"],
    ["from-zinc-300 to-zinc-500", "Platinum"],
  ];

  return (
    <div className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{item ? "Edit" : "New"} Tier</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white text-xs">&times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputRow label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <InputRow label="Min Points" value={String(f.min_points)} onChange={(v) => setF({ ...f, min_points: Number(v) })} type="number" />
        <SelectRow label="Color Gradient" value={f.color} onChange={(v) => setF({ ...f, color: v })} options={colorOptions} />
        <InputRow label="Sort Order" value={String(f.sort_order)} onChange={(v) => setF({ ...f, sort_order: Number(v) })} type="number" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Active</label>
        <button onClick={() => setF({ ...f, active: !f.active })} className={`w-10 h-5 rounded-full transition-all ${f.active ? "bg-orange-500" : "bg-zinc-700"}`}>
          <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${f.active ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(item?.id ? { ...f, id: item.id } : f)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-8 px-5 rounded-md">Save</Button>
        <Button variant="outline" onClick={onCancel} className="text-xs h-8 border-white/10">Cancel</Button>
      </div>
    </div>
  );
}

function RewardForm({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    label: item?.label ?? "",
    points: item?.points ?? 0,
    icon: item?.icon ?? "🔥",
    sort_order: item?.sort_order ?? 0,
    active: item?.active ?? true,
  });

  return (
    <div className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{item ? "Edit" : "New"} Reward</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white text-xs">&times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputRow label="Label" value={f.label} onChange={(v) => setF({ ...f, label: v })} />
        <InputRow label="Points Required" value={String(f.points)} onChange={(v) => setF({ ...f, points: Number(v) })} type="number" />
        <InputRow label="Icon (emoji)" value={f.icon} onChange={(v) => setF({ ...f, icon: v })} />
        <InputRow label="Sort Order" value={String(f.sort_order)} onChange={(v) => setF({ ...f, sort_order: Number(v) })} type="number" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono">Active</label>
        <button onClick={() => setF({ ...f, active: !f.active })} className={`w-10 h-5 rounded-full transition-all ${f.active ? "bg-orange-500" : "bg-zinc-700"}`}>
          <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${f.active ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(item?.id ? { ...f, id: item.id } : f)} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs h-8 px-5 rounded-md">Save</Button>
        <Button variant="outline" onClick={onCancel} className="text-xs h-8 border-white/10">Cancel</Button>
      </div>
    </div>
  );
}

/* ── Loading / Error states ── */
function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-sm text-white/30 font-mono">Loading {label}...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white/60">Connection Error</p>
        <p className="text-xs text-red-400/80 mt-1 font-mono max-w-md">{message}</p>
      </div>
    </div>
  );
}
