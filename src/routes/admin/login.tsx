import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminSurface } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMe, login } from "@/lib/api";

export const Route = createFileRoute("/admin/login")({
	component: AdminLoginPage,
});

function AdminLoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { isSuccess } = useQuery({
		queryKey: ["admin-me"],
		queryFn: getMe,
		retry: false,
	});

	useEffect(() => {
		if (isSuccess) navigate({ to: "/admin" });
	}, [isSuccess, navigate]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			await login(email, password);
			navigate({ to: "/admin" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<AdminSurface className="w-full max-w-md" innerClassName="p-8">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/20">
						<Lock className="h-5 w-5" />
					</div>
					<div>
						<div className="text-lg font-semibold tracking-tight">Sign in</div>
						<div className="text-sm text-muted-foreground">
							Ankh Admin Console
						</div>
					</div>
				</div>

				<form onSubmit={onSubmit} className="mt-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					{error ? (
						<div className="text-sm text-destructive">{error}</div>
					) : null}

					<Button className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</AdminSurface>
		</div>
	);
}
