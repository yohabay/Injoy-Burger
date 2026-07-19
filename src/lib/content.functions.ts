import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const MenuItemInput = z.object({
  id: z.string().uuid().optional(),
  number: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  tag: z.string().max(100).default(""),
  description: z.string().max(500).default(""),
  price: z.number().min(0).max(100000),
  img: z.string().max(500).default(""),
  video: z.string().max(500).optional().nullable(),
  category: z.string().max(50).default("Main Dish"),
  sort_order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

const VideoInput = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(100),
  section: z.string().min(1).max(50),
  src: z.string().min(1).max(500),
  poster: z.string().max(500).optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

const ImageInput = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(100),
  section: z.string().min(1).max(50),
  src: z.string().min(1).max(500),
  alt: z.string().max(200).default(""),
  sort_order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const getMenuItems = createServerFn({ method: "GET" })
  .validator(() => ({}))
  .handler(async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`menu_items: ${error.message} (${error.code})`);
    return data ?? [];
  });

export const getVideos = createServerFn({ method: "GET" })
  .validator(() => ({}))
  .handler(async () => {
    const { data, error } = await supabase
      .from("site_videos")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`site_videos: ${error.message} (${error.code})`);
    return data ?? [];
  });

export const getImages = createServerFn({ method: "GET" })
  .validator(() => ({}))
  .handler(async () => {
    const { data, error } = await supabase
      .from("site_images")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`site_images: ${error.message} (${error.code})`);
    return data ?? [];
  });

export const uploadFile = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ path: z.string(), base64: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.base64, "base64");
    const { error } = await supabase.storage
      .from("content")
      .upload(data.path, buffer, {
        contentType: data.path.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
        upsert: true,
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("content").getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  });

export const upsertMenuItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => MenuItemInput.parse(data))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabase.from("menu_items").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { id, ...rest } = data;
      const { error } = await supabase.from("menu_items").insert(rest);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteMenuItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const upsertVideo = createServerFn({ method: "POST" })
  .validator((data: unknown) => VideoInput.parse(data))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabase.from("site_videos").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { id, ...rest } = data;
      const { error } = await supabase.from("site_videos").insert(rest);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("site_videos").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const upsertImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => ImageInput.parse(data))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabase.from("site_images").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { id, ...rest } = data;
      const { error } = await supabase.from("site_images").insert(rest);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("site_images").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
