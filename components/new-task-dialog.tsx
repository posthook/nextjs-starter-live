"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, LoaderCircleIcon } from "lucide-react";

export function NewTaskDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !contentType.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), contentType: contentType.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Something went wrong" }));
        setError(body.error || `Error ${res.status}`);
        return;
      }
      setPrompt("");
      setContentType("");
      setError(null);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError("Network error — please try again");
      console.error("[new-task] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="comic-btn pastel-yellow px-4 py-2 text-xs inline-flex items-center gap-1.5">
            <PlusIcon className="size-3.5" />
            New Review
          </button>
        }
      />
      <DialogContent className="sm:max-w-md !rounded-2xl !border-[2.5px] !border-foreground !shadow-[4px_4px_0_#1a1a2e] !ring-0 pastel-lavender">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-black text-lg">New content review</DialogTitle>
            <DialogDescription className="text-sm">
              Describe what you need. AI will generate a draft for your review.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="contentType" className="font-bold text-sm">Content type</Label>
              <input
                id="contentType"
                type="text"
                placeholder="e.g., blog post, email, social post"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-lg border-2 border-foreground bg-white px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:opacity-50"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="prompt" className="font-bold text-sm">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the content you want AI to draft..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                rows={3}
                className="!border-2 !border-foreground !bg-white !rounded-lg focus-visible:!ring-2 focus-visible:!ring-foreground/20"
              />
            </div>
            {error && (
              <div className="pastel-rose border-2 border-foreground rounded-lg px-3 py-2 text-sm font-bold">
                {error}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !prompt.trim() || !contentType.trim()}
              className="comic-btn bg-foreground text-background px-6 py-2.5 text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircleIcon className="size-3.5 animate-spin" />
                  Generating draft...
                </>
              ) : (
                "Generate & queue for review"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
