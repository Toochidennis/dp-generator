// Builds absolute public URLs for sharing.

const origin = typeof window !== "undefined" ? window.location.origin : "";

export const publicProgramUrl = (slug: string) => `${origin}/programs/${slug}/attending`;
export const publicShareUrl = (generationId: string) => `${origin}/share/${generationId}`;
