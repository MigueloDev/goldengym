import { usePage } from '@inertiajs/react';

interface PageProps {
  translations: Record<string, string>;
}

export function useTranslations() {
  const { translations } = usePage<PageProps>().props;

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`:${param}`, String(value));
      });
    }

    return translation;
  };

  return { t, translations };
}
