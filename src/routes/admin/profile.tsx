import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, updateProfile, type Profile } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/profile")({
	component: ProfileAdminPage,
});

type ProfileForm = {
	name: string;
	author_name: string;
	avatar_url: string;
	bio: string;
	description: string;
	location: string;
	url: string;
	contacts: string;
	skills: string;
	about_content: string;
	copyright: string;
	icp: string;
};

const emptyForm: ProfileForm = {
	name: "",
	author_name: "",
	avatar_url: "",
	bio: "",
	description: "",
	location: "",
	url: "",
	contacts: "",
	skills: "",
	about_content: "",
	copyright: "",
	icp: "",
};

function formFromProfile(profile: Profile): ProfileForm {
	return {
		name: profile.name ?? "",
		author_name: profile.author_name ?? "",
		avatar_url: profile.avatar_url ?? "",
		bio: profile.bio ?? "",
		description: profile.description ?? "",
		location: profile.location ?? "",
		url: profile.url ?? "",
		contacts:
			typeof profile.contacts === "object" && profile.contacts !== null
				? JSON.stringify(profile.contacts, null, 2)
				: "",
		skills:
			typeof profile.skills === "object" && profile.skills !== null
				? JSON.stringify(profile.skills, null, 2)
				: "",
		about_content: profile.about_content ?? "",
		copyright: profile.copyright ?? "",
		icp: profile.icp ?? "",
	};
}

function ProfileAdminPage() {
	const queryClient = useQueryClient();
	const [form, setForm] = useState<ProfileForm>(emptyForm);
	const [status, setStatus] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const profileQuery = useQuery({
		queryKey: ["profile-admin"],
		queryFn: getProfile,
	});

	const profile = profileQuery.data;

	useEffect(() => {
		if (profile) {
			setForm(formFromProfile(profile));
		}
	}, [profile]);

	const serializedReference = useMemo(() => {
		return JSON.stringify(profile ? formFromProfile(profile) : emptyForm);
	}, [profile]);

	const isDirty = useMemo(() => {
		return JSON.stringify(form) !== serializedReference;
	}, [form, serializedReference]);

	const mutation = useMutation({
		mutationFn: updateProfile,
		onSuccess: (data) => {
			setStatus({ type: "success", message: "Profile saved." });
			queryClient.setQueryData(["profile-admin"], data);
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
		onError: (error) => {
			setStatus({
				type: "error",
				message:
					error instanceof Error ? error.message : "Failed to save profile.",
			});
		},
	});

	const parseJsonField = (value: string, label: string) => {
		if (!value.trim()) return null;
		try {
			return JSON.parse(value);
		} catch {
			throw new Error(`${label} must be valid JSON.`);
		}
	};

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus(null);
		if (!form.name.trim()) {
			setStatus({ type: "error", message: "Name is required." });
			return;
		}
		if (!form.url.trim()) {
			setStatus({ type: "error", message: "URL is required." });
			return;
		}

		let contactsPayload: unknown = null;
		let skillsPayload: unknown = null;
		try {
			contactsPayload = parseJsonField(form.contacts, "Contacts");
			skillsPayload = parseJsonField(form.skills, "Skills");
		} catch (error) {
			setStatus({
				type: "error",
				message: error instanceof Error ? error.message : "Invalid JSON field.",
			});
			return;
		}

		const payload = {
			name: form.name.trim(),
			author_name: form.author_name.trim() || null,
			avatar_url: form.avatar_url.trim() || null,
			bio: form.bio.trim() || null,
			description: form.description.trim() || null,
			location: form.location.trim() || null,
			url: form.url.trim(),
			contacts: contactsPayload,
			skills: skillsPayload,
			about_content: form.about_content.trim() || null,
			copyright: form.copyright.trim() || null,
			icp: form.icp.trim() || null,
		};

		mutation.mutate(payload);
	};

	const resetForm = () => {
		if (profile) {
			setForm(formFromProfile(profile));
		} else {
			setForm(emptyForm);
		}
		setStatus(null);
	};

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Profile"
				description="Update the data used across the site’s public profile surfaces."
			/>

			<AdminSurface innerClassName="p-6">
				{profileQuery.isPending ? (
					<div className="text-sm text-muted-foreground">
						Loading profile...
					</div>
				) : profileQuery.error ? (
					<div className="text-sm text-destructive">
						{profileQuery.error instanceof Error
							? profileQuery.error.message
							: "Failed to load profile data."}
					</div>
				) : (
					<form className="space-y-6" onSubmit={onSubmit}>
						<section className="space-y-4">
							<div>
								<div className="text-sm font-medium">Basics</div>
								<div className="text-xs text-muted-foreground">
									Core information shown throughout the site.
								</div>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<Field label="Display name" required>
									<Input
										value={form.name}
										required
										onChange={(event) =>
											setForm((prev) => ({ ...prev, name: event.target.value }))
										}
									/>
								</Field>
								<Field label="Author name">
									<Input
										value={form.author_name}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												author_name: event.target.value,
											}))
										}
									/>
								</Field>
								<Field label="URL" required>
									<Input
										value={form.url}
										required
										onChange={(event) =>
											setForm((prev) => ({ ...prev, url: event.target.value }))
										}
									/>
								</Field>
								<Field label="Location">
									<Input
										value={form.location}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												location: event.target.value,
											}))
										}
									/>
								</Field>
								<Field label="Avatar URL">
									<Input
										value={form.avatar_url}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												avatar_url: event.target.value,
											}))
										}
										placeholder="https://..."
									/>
								</Field>
								<Field label="Short bio">
									<Textarea
										rows={3}
										value={form.bio}
										onChange={(event) =>
											setForm((prev) => ({ ...prev, bio: event.target.value }))
										}
									/>
								</Field>
								<Field label="Description">
									<Textarea
										rows={3}
										value={form.description}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												description: event.target.value,
											}))
										}
									/>
								</Field>
								<Field label="About content (Markdown)">
									<Textarea
										rows={6}
										value={form.about_content}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												about_content: event.target.value,
											}))
										}
										placeholder="Supports Markdown..."
									/>
								</Field>
							</div>
						</section>

						<section className="space-y-4">
							<div>
								<div className="text-sm font-medium">Structured data</div>
								<div className="text-xs text-muted-foreground">
									JSON blobs consumed by various widgets throughout the site.
								</div>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<Field label="Contacts JSON">
									<Textarea
										rows={6}
										className="font-mono text-xs"
										value={form.contacts}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												contacts: event.target.value,
											}))
										}
										placeholder='{"email":"hi@example.com","github":"https://github.com/user"}'
									/>
								</Field>
								<Field label="Skills JSON">
									<Textarea
										rows={6}
										className="font-mono text-xs"
										value={form.skills}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												skills: event.target.value,
											}))
										}
										placeholder='["TypeScript","React","Cloudflare"]'
									/>
								</Field>
							</div>
						</section>

						<section className="space-y-4">
							<div>
								<div className="text-sm font-medium">Legal / footer</div>
								<div className="text-xs text-muted-foreground">
									Information rendered in the footer or legal notices.
								</div>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<Field label="Copyright">
									<Input
										value={form.copyright}
										onChange={(event) =>
											setForm((prev) => ({
												...prev,
												copyright: event.target.value,
											}))
										}
									/>
								</Field>
								<Field label="ICP Number">
									<Input
										value={form.icp}
										onChange={(event) =>
											setForm((prev) => ({ ...prev, icp: event.target.value }))
										}
									/>
								</Field>
							</div>
						</section>

						<div className="flex flex-wrap items-center justify-end gap-3">
							{status ? (
								<div
									className={cn(
										"text-sm",
										status.type === "error"
											? "text-destructive"
											: "text-emerald-500",
									)}
								>
									{status.message}
								</div>
							) : null}
							<Button
								type="button"
								variant="outline"
								onClick={resetForm}
								disabled={!isDirty || profileQuery.isPending}
							>
								Reset
							</Button>
							<Button type="submit" disabled={!isDirty || mutation.isPending}>
								{mutation.isPending ? "Saving..." : "Save changes"}
							</Button>
						</div>
					</form>
				)}
			</AdminSurface>
		</div>
	);
}

function Field({
	label,
	children,
	required,
}: {
	label: string;
	children: React.ReactNode;
	required?: boolean;
}) {
	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">
				{label} {required ? <span className="text-destructive">*</span> : null}
			</Label>
			{children}
		</div>
	);
}
