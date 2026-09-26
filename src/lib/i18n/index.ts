import { en, type Messages } from './en';
import { es } from './es';
import { ja } from './ja';
import { zh } from './zh';

export type { Messages };

export const LANGUAGES = [
	{ id: 'en', label: 'English', locale: 'en-US' },
	{ id: 'ja', label: '日本語', locale: 'ja-JP' },
	{ id: 'es', label: 'Español', locale: 'es-ES' },
	{ id: 'zh', label: '中文', locale: 'zh-CN' }
] as const;

export type Language = (typeof LANGUAGES)[number]['id'];

export const MESSAGES: Record<Language, Messages> = { en, ja, es, zh };

export const isLanguage = (value: unknown): value is Language =>
	LANGUAGES.some((language) => language.id === value);

export const localeOf = (language: Language) =>
	LANGUAGES.find((entry) => entry.id === language)?.locale ?? 'en-US';

/** Picks the closest supported language from the browser's preferences. */
export const detectLanguage = (preferred: readonly string[]): Language => {
	for (const tag of preferred) {
		const base = tag.toLowerCase().split('-')[0];
		if (isLanguage(base)) return base;
	}
	return 'en';
};

/** Fills `{name}` placeholders. */
export const format = (template: string, values: Record<string, string | number>) =>
	template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match
	);

export type Plural = { one?: string; other: string };

const pluralRules = new Map<Language, Intl.PluralRules>();

/** Picks the plural form for `count` and fills in its placeholders. */
export const plural = (
	language: Language,
	forms: Plural,
	count: number,
	values: Record<string, string | number> = {}
) => {
	let rules = pluralRules.get(language);
	if (!rules) {
		rules = new Intl.PluralRules(localeOf(language));
		pluralRules.set(language, rules);
	}
	const form = rules.select(count) === 'one' && forms.one ? forms.one : forms.other;
	return format(form, { count, ...values });
};
