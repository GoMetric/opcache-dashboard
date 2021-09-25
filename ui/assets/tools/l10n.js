// localisation
export function loadLocaleData(locale: string) {
    return import('/lang/' + locale + '.json');
}

export function detectLocale() {
    return 'uk';
}
