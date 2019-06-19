import * as type from '../type';
export default function (xhr: XMLHttpRequest, headers: Record<string, string>): () => type.Response;
