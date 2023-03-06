export async function loadLocaleData(locale: string) {
    return import('/dist/lang/' + locale + '.json');
}

export function detectLocale() {
    const supportedLanguages = ['en', 'uk'];
    const currentLanguageTag = navigator.language;
    const language = currentLanguageTag.split('-')[0];

    if (supportedLanguages.indexOf(currentLanguageTag) !== -1) {
        return currentLanguageTag;
    }

    if (language && supportedLanguages.indexOf(language) !== -1) {
        return language;
    }

    return supportedLanguages[0];
}
