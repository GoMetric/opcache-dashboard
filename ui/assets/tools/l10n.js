export async function loadLocaleData(locale: string) {
    return import('/dist/lang/' + locale + '.json');
}

export function detectLocale() {
    return 'uk';
}
