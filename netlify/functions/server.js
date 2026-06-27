import server from '../../dist/server/server.js';

function getUrl(event) {
  const host = event.headers?.host ?? 'localhost';
  const protocol = event.headers?.x-forwarded-proto ?? 'https';
  const url = new URL(`${protocol}://${host}${event.path}`);
  const query = event.queryStringParameters ?? {};
  for (const [key, value] of Object.entries(query)) {
    if (value != null) {
      url.searchParams.set(key, value);
    }
  }
  return url;
}

function getRequestBody(event) {
  if (event.body == null) return null;
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body;
}

function normalizeHeaders(headers = {}) {
  const normalized = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) normalized.append(name, item.toString());
      }
    } else if (value != null) {
      normalized.append(name, value.toString());
    }
  }
  return normalized;
}

function toNetlifyResponse(response) {
  const headers = {};
  for (const [name, value] of response.headers) {
    headers[name] = value;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('javascript') || contentType.includes('xml')) {
    return response.text().then((body) => ({
      statusCode: response.status,
      headers,
      body,
      isBase64Encoded: false,
    }));
  }

  return response.arrayBuffer().then((buffer) => ({
    statusCode: response.status,
    headers,
    body: Buffer.from(buffer).toString('base64'),
    isBase64Encoded: true,
  }));
}

export async function handler(event) {
  const request = new Request(getUrl(event), {
    method: event.httpMethod,
    headers: normalizeHeaders(event.headers),
    body: getRequestBody(event),
  });

  const response = await server.fetch(request, {}, {});
  return toNetlifyResponse(response);
}
