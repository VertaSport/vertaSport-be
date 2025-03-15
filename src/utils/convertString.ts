function removeAccents(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

export function convertString(str: string, gap: string = '_') {
    const noAccents = removeAccents(str).toLowerCase();

    const withUnderscores = noAccents.replace(/[^a-z0-9\s]/g, gap);

    return withUnderscores.replace(/\s+/g, gap);
}
