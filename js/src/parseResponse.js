import createResponse from './createResponse';
export default function (xhr) {
    const headers = {};
    const rawHeaders = xhr.getAllResponseHeaders() || '';
    rawHeaders.replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (match, key, value) {
        headers[key.toLowerCase()] = value;
        return match;
    });
    return createResponse(xhr, headers);
}
