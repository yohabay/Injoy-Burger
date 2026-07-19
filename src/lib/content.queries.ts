import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type MenuItemData = {
  id?: string;
  number: string;
  name: string;
  tag?: string;
  description?: string;
  price: number;
  img?: string;
  video?: string | null;
  category?: string;
  sort_order?: number;
  active?: boolean;
};

type VideoData = {
  id?: string;
  label: string;
  section: string;
  src: string;
  poster?: string | null;
  sort_order?: number;
  active?: boolean;
};

type ImageData = {
  id?: string;
  label: string;
  section: string;
  src: string;
  alt?: string;
  sort_order?: number;
  active?: boolean;
};

const isBrowser = typeof window !== "undefined";

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: isBrowser,
    retry: 1,
  });
}

export function useSiteVideos() {
  return useQuery({
    queryKey: ["site-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_videos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: isBrowser,
    retry: 1,
  });
}

export function useSiteImages() {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: isBrowser,
    retry: 1,
  });
}

export function useUpsertMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: MenuItemData) => {
      if (data.id) {
        const { error } = await supabase.from("menu_items").update(data).eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { id, ...rest } = data;
        const { error } = await supabase.from("menu_items").insert(rest);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useUpsertVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: VideoData) => {
      if (data.id) {
        const { error } = await supabase.from("site_videos").update(data).eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { id, ...rest } = data;
        const { error } = await supabase.from("site_videos").insert(rest);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      const { error } = await supabase.from("site_videos").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useUpsertImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ImageData) => {
      if (data.id) {
        const { error } = await supabase.from("site_images").update(data).eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { id, ...rest } = data;
        const { error } = await supabase.from("site_images").insert(rest);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-images"] }),
  });
}

export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      const { error } = await supabase.from("site_images").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-images"] }),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("content")
        .upload(path, file, {
          contentType: file.type || (ext === "mp4" ? "video/mp4" : "image/jpeg"),
          upsert: true,
        });
      if (error) throw new Error(error.message);
      const { data: urlData } = supabase.storage.from("content").getPublicUrl(path);
      return urlData.publicUrl;
    },
  });
}

/* ── Spin Wheel ── */
type WheelSegmentData = {
  id?: string;
  label: string;
  code?: string;
  color: string;
  sort_order?: number;
  active?: boolean;
};

export function useWheelSegments() {
  return useQuery({
    queryKey: ["spin-wheel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_wheel")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: isBrowser,
    retry: 1,
  });
}

export function useUpsertWheelSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: WheelSegmentData) => {
      if (data.id) {
        const { error } = await supabase.from("spin_wheel").update(data).eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { id, ...rest } = data;
        const { error } = await supabase.from("spin_wheel").insert(rest);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spin-wheel"] }),
  });
}

export function useDeleteWheelSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      const { error } = await supabase.from("spin_wheel").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spin-wheel"] }),
  });
}

/* ── Loyalty Tiers ── */
type TierData = {
  id?: string;
  name: string;
  min_points: number;
  color: string;
  sort_order?: number;
  active?: boolean;
};

export function useLoyaltyTiers() {
  return useQuery({
    queryKey: ["loyalty-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_tiers")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: isBrowser,
    retry: 1,
  });
}

export function useUpsertTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TierData) => {
      if (data.id) {
        const { error } = await supabase.from("loyalty_tiers").update(data).eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { id, ...rest } = data;
        const { error } = await supabase.from("loyalty_tiers").insert(rest);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-tiers"] }),
  });
}

export function useDeleteTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      const { error } = await supabase.from("loyalty_tiers").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-tiers"] }),
  });
}

/* ── Loyalty Rewards ── */
type RewardData = {
  id?: string;
  label: string;
  points: number;
  icon?: string;
  sort_order?: number;
  active?: boolean;
};

export function useLoyaltyRewards() {
  return useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: isBrowser,
    retry: 1,
  });
}

export function useUpsertReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: RewardData) => {
      if (data.id) {
        const { error } = await supabase.from("loyalty_rewards").update(data).eq("id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { id, ...rest } = data;
        const { error } = await supabase.from("loyalty_rewards").insert(rest);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-rewards"] }),
  });
}

export function useDeleteReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      const { error } = await supabase.from("loyalty_rewards").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-rewards"] }),
  });
}
