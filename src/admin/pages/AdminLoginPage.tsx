import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Lock } from "lucide-react";
import { authService } from "@/shared/services/authService";
import { BrandMark } from "@/shared/components/BrandMark";
import { Seo } from "@/shared/components/Seo";
import { Button, Field } from "@/shared/components/ui/primitives";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await authService.login(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f7fc] p-6">
      <Seo title="Admin sign in | Digital Dreams Events" description="Private administration area." path="/admin/login" robots="noindex, nofollow" />
      <form onSubmit={(e) => void submit(e)} className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <h1 className="mt-5 text-center font-[Manrope] text-xl font-extrabold text-slate-900">Admin sign in</h1>
        <p className="mt-1 text-center text-xs text-slate-500">Manage programs, templates and generations.</p>

        <div className="mt-6 space-y-4">
          <Field label="Username">
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="text-input" />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="text-input" />
          </Field>

          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Lock size={14} />}
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
}
