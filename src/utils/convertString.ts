function removeAccents(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

export function convertString(str: string) {
    const noAccents = removeAccents(str).toLowerCase();

    const withUnderscores = noAccents.replace(/[^a-z0-9\s]/g, '_');

    return withUnderscores.replace(/\s+/g, '_');
}
