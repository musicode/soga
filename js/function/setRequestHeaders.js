export default function (xhr, headers) {
    for (let key in headers) {
        xhr.setRequestHeader(key, headers[key]);
    }
}
