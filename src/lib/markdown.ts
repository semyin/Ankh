import hljs from "highlight.js";
import { marked } from "marked";
import { slugify } from "@/lib/format";

function normalizeLang(lang: string) {
	const cleaned = String(lang || "")
		.trim()
		.toLowerCase()
		.replace(/^language-/, "");
	return cleaned.split(/\s+/)[0] ?? "";
}

export function renderMarkdown(markdown: string) {
	const slugCounts = new Map<string, number>();
	const renderer = new marked.Renderer();

	renderer.heading = function heading(textOrToken: any, levelMaybe?: number) {
		const isToken = !!textOrToken && typeof textOrToken === "object";
		const text = isToken
			? String(textOrToken.text ?? "")
			: String(textOrToken ?? "");
		const level = isToken
			? Number(textOrToken.depth ?? levelMaybe)
			: Number(levelMaybe);

		const baseId = slugify(text);
		const count = slugCounts.get(baseId) ?? 0;
		slugCounts.set(baseId, count + 1);
		const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

		return `<h${level} id="${id}" class="scroll-mt-24">${text}</h${level}>`;
	};

	renderer.code = function code(codeOrToken: any, langOrToken?: any) {
		const isToken = !!codeOrToken && typeof codeOrToken === "object";
		const codeText = isToken
			? String(codeOrToken.text ?? "")
			: String(codeOrToken);
		const rawLang = isToken
			? String(codeOrToken.lang ?? "")
			: String(langOrToken ?? "");
		const lang = normalizeLang(rawLang);

		const highlighted =
			lang && hljs.getLanguage(lang)
				? hljs.highlight(codeText, { language: lang }).value
				: hljs.highlightAuto(codeText).value;

		const className = lang ? `hljs language-${lang}` : "hljs";
		return `<pre><code class="${className}">${highlighted}</code></pre>`;
	};

	const html = marked.parse(markdown, { renderer });
	return typeof html === "string" ? html : "";
}
