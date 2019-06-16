import createResponse from './createResponse';
export default function (xhr) {
    const keys = [];
    const values = [];
    const entries = [];
    xhr
        .getAllResponseHeaders()
        .replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (match, key, value) {
        keys.push(key = key.toLowerCase());
        values.push(value);
        entries.push([key, value]);
        return match;
    });
    return createResponse(xhr, keys, values, entries);
}
