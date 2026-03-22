import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// XHR-based fetch to bypass preview tool's fetch interceptor.
// Uses a Proxy so the response body can be read multiple times
// (prevents "Script error." from Supabase internal re-reads).
const xhrFetch = (input, init = {}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = typeof input === 'string' ? input : input.url;
    xhr.open(init.method || 'GET', url, true);
    xhr.responseType = 'text';

    const headers = init.headers || {};
    const entries =
      headers instanceof Headers
        ? [...headers.entries()]
        : Object.entries(headers);
    entries.forEach(([k, v]) => xhr.setRequestHeader(k, v));

    xhr.onload = () => {
      const bodyText = xhr.responseText;
      const respHeaders = new Headers();
      xhr
        .getAllResponseHeaders()
        .trim()
        .split(/[\r\n]+/)
        .forEach((line) => {
          const idx = line.indexOf(': ');
          if (idx > -1)
            respHeaders.append(line.slice(0, idx), line.slice(idx + 2));
        });

      const init = { status: xhr.status, statusText: xhr.statusText, headers: respHeaders };

      const makeProxy = () => {
        const resp = new Response(bodyText, init);
        return new Proxy(resp, {
          get(target, prop) {
            if (prop === 'json') return () => {
              try { return Promise.resolve(JSON.parse(bodyText)); }
              catch (e) { return Promise.reject(e); }
            };
            if (prop === 'text') return () => Promise.resolve(bodyText);
            if (prop === 'clone') return makeProxy;
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
          },
        });
      };

      resolve(makeProxy());
    };

    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'));

    xhr.send(init.body !== undefined ? init.body : null);
  });
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Read user from localStorage. Returns null (and clears storage) if the
 * stored id is not a valid UUID — which would cause Postgres to reject it.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.id || !UUID_RE.test(user.id)) {
      localStorage.removeItem('user');
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: xhrFetch,
  },
});
