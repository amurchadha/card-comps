
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.9.8";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var a = {}, b = {};
      function c(d) {
        var e = b[d];
        if (void 0 !== e) return e.exports;
        var f = b[d] = { exports: {} }, g = true;
        try {
          a[d](f, f.exports, c), g = false;
        } finally {
          g && delete b[d];
        }
        return f.exports;
      }
      c.m = a, c.amdO = {}, (() => {
        var a2 = [];
        c.O = (b2, d, e, f) => {
          if (d) {
            f = f || 0;
            for (var g = a2.length; g > 0 && a2[g - 1][2] > f; g--) a2[g] = a2[g - 1];
            a2[g] = [d, e, f];
            return;
          }
          for (var h = 1 / 0, g = 0; g < a2.length; g++) {
            for (var [d, e, f] = a2[g], i = true, j = 0; j < d.length; j++) (false & f || h >= f) && Object.keys(c.O).every((a3) => c.O[a3](d[j])) ? d.splice(j--, 1) : (i = false, f < h && (h = f));
            if (i) {
              a2.splice(g--, 1);
              var k = e();
              void 0 !== k && (b2 = k);
            }
          }
          return b2;
        };
      })(), c.n = (a2) => {
        var b2 = a2 && a2.__esModule ? () => a2.default : () => a2;
        return c.d(b2, { a: b2 }), b2;
      }, c.d = (a2, b2) => {
        for (var d in b2) c.o(b2, d) && !c.o(a2, d) && Object.defineProperty(a2, d, { enumerable: true, get: b2[d] });
      }, c.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (a2) {
          if ("object" == typeof window) return window;
        }
      }(), c.o = (a2, b2) => Object.prototype.hasOwnProperty.call(a2, b2), c.r = (a2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(a2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a2, "__esModule", { value: true });
      }, (() => {
        var a2 = { 149: 0 };
        c.O.j = (b3) => 0 === a2[b3];
        var b2 = (b3, d2) => {
          var e, f, [g, h, i] = d2, j = 0;
          if (g.some((b4) => 0 !== a2[b4])) {
            for (e in h) c.o(h, e) && (c.m[e] = h[e]);
            if (i) var k = i(c);
          }
          for (b3 && b3(d2); j < g.length; j++) f = g[j], c.o(a2, f) && a2[f] && a2[f][0](), a2[f] = 0;
          return c.O(k);
        }, d = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        d.forEach(b2.bind(null, 0)), d.push = b2.bind(null, d.push.bind(d));
      })();
    })();
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// .next/server/middleware.js
var require_middleware = __commonJS({
  ".next/server/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[751], { 16: (a, b, c) => {
      "use strict";
      c.d(b, { F: () => e, h: () => f });
      let d = "DYNAMIC_SERVER_USAGE";
      class e extends Error {
        constructor(a2) {
          super("Dynamic server usage: " + a2), this.description = a2, this.digest = d;
        }
      }
      function f(a2) {
        return "object" == typeof a2 && null !== a2 && "digest" in a2 && "string" == typeof a2.digest && a2.digest === d;
      }
    }, 35: (a, b) => {
      "use strict";
      var c = { H: null, A: null };
      function d(a2) {
        var b2 = "https://react.dev/errors/" + a2;
        if (1 < arguments.length) {
          b2 += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var c2 = 2; c2 < arguments.length; c2++) b2 += "&args[]=" + encodeURIComponent(arguments[c2]);
        }
        return "Minified React error #" + a2 + "; visit " + b2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var e = Array.isArray;
      function f() {
      }
      var g = Symbol.for("react.transitional.element"), h = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), j = Symbol.for("react.strict_mode"), k = Symbol.for("react.profiler"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), n = Symbol.for("react.memo"), o = Symbol.for("react.lazy"), p = Symbol.iterator, q = Object.prototype.hasOwnProperty, r = Object.assign;
      function s(a2, b2, c2, d2, e2, f2) {
        return { $$typeof: g, type: a2, key: b2, ref: void 0 !== (c2 = f2.ref) ? c2 : null, props: f2 };
      }
      function t(a2) {
        return "object" == typeof a2 && null !== a2 && a2.$$typeof === g;
      }
      var u = /\/+/g;
      function v(a2, b2) {
        var c2, d2;
        return "object" == typeof a2 && null !== a2 && null != a2.key ? (c2 = "" + a2.key, d2 = { "=": "=0", ":": "=2" }, "$" + c2.replace(/[=:]/g, function(a3) {
          return d2[a3];
        })) : b2.toString(36);
      }
      function w(a2, b2, c2) {
        if (null == a2) return a2;
        var i2 = [], j2 = 0;
        return !function a3(b3, c3, i3, j3, k2) {
          var l2, m2, n2, q2 = typeof b3;
          ("undefined" === q2 || "boolean" === q2) && (b3 = null);
          var r2 = false;
          if (null === b3) r2 = true;
          else switch (q2) {
            case "bigint":
            case "string":
            case "number":
              r2 = true;
              break;
            case "object":
              switch (b3.$$typeof) {
                case g:
                case h:
                  r2 = true;
                  break;
                case o:
                  return a3((r2 = b3._init)(b3._payload), c3, i3, j3, k2);
              }
          }
          if (r2) return k2 = k2(b3), r2 = "" === j3 ? "." + v(b3, 0) : j3, e(k2) ? (i3 = "", null != r2 && (i3 = r2.replace(u, "$&/") + "/"), a3(k2, c3, i3, "", function(a4) {
            return a4;
          })) : null != k2 && (t(k2) && (l2 = k2, m2 = i3 + (null == k2.key || b3 && b3.key === k2.key ? "" : ("" + k2.key).replace(u, "$&/") + "/") + r2, k2 = s(l2.type, m2, void 0, void 0, void 0, l2.props)), c3.push(k2)), 1;
          r2 = 0;
          var w2 = "" === j3 ? "." : j3 + ":";
          if (e(b3)) for (var x2 = 0; x2 < b3.length; x2++) q2 = w2 + v(j3 = b3[x2], x2), r2 += a3(j3, c3, i3, q2, k2);
          else if ("function" == typeof (x2 = null === (n2 = b3) || "object" != typeof n2 ? null : "function" == typeof (n2 = p && n2[p] || n2["@@iterator"]) ? n2 : null)) for (b3 = x2.call(b3), x2 = 0; !(j3 = b3.next()).done; ) q2 = w2 + v(j3 = j3.value, x2++), r2 += a3(j3, c3, i3, q2, k2);
          else if ("object" === q2) {
            if ("function" == typeof b3.then) return a3(function(a4) {
              switch (a4.status) {
                case "fulfilled":
                  return a4.value;
                case "rejected":
                  throw a4.reason;
                default:
                  switch ("string" == typeof a4.status ? a4.then(f, f) : (a4.status = "pending", a4.then(function(b4) {
                    "pending" === a4.status && (a4.status = "fulfilled", a4.value = b4);
                  }, function(b4) {
                    "pending" === a4.status && (a4.status = "rejected", a4.reason = b4);
                  })), a4.status) {
                    case "fulfilled":
                      return a4.value;
                    case "rejected":
                      throw a4.reason;
                  }
              }
              throw a4;
            }(b3), c3, i3, j3, k2);
            throw Error(d(31, "[object Object]" === (c3 = String(b3)) ? "object with keys {" + Object.keys(b3).join(", ") + "}" : c3));
          }
          return r2;
        }(a2, i2, "", "", function(a3) {
          return b2.call(c2, a3, j2++);
        }), i2;
      }
      function x(a2) {
        if (-1 === a2._status) {
          var b2 = a2._result;
          (b2 = b2()).then(function(b3) {
            (0 === a2._status || -1 === a2._status) && (a2._status = 1, a2._result = b3);
          }, function(b3) {
            (0 === a2._status || -1 === a2._status) && (a2._status = 2, a2._result = b3);
          }), -1 === a2._status && (a2._status = 0, a2._result = b2);
        }
        if (1 === a2._status) return a2._result.default;
        throw a2._result;
      }
      function y() {
        return /* @__PURE__ */ new WeakMap();
      }
      function z() {
        return { s: 0, v: void 0, o: null, p: null };
      }
      b.Children = { map: w, forEach: function(a2, b2, c2) {
        w(a2, function() {
          b2.apply(this, arguments);
        }, c2);
      }, count: function(a2) {
        var b2 = 0;
        return w(a2, function() {
          b2++;
        }), b2;
      }, toArray: function(a2) {
        return w(a2, function(a3) {
          return a3;
        }) || [];
      }, only: function(a2) {
        if (!t(a2)) throw Error(d(143));
        return a2;
      } }, b.Fragment = i, b.Profiler = k, b.StrictMode = j, b.Suspense = m, b.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = c, b.cache = function(a2) {
        return function() {
          var b2 = c.A;
          if (!b2) return a2.apply(null, arguments);
          var d2 = b2.getCacheForType(y);
          void 0 === (b2 = d2.get(a2)) && (b2 = z(), d2.set(a2, b2)), d2 = 0;
          for (var e2 = arguments.length; d2 < e2; d2++) {
            var f2 = arguments[d2];
            if ("function" == typeof f2 || "object" == typeof f2 && null !== f2) {
              var g2 = b2.o;
              null === g2 && (b2.o = g2 = /* @__PURE__ */ new WeakMap()), void 0 === (b2 = g2.get(f2)) && (b2 = z(), g2.set(f2, b2));
            } else null === (g2 = b2.p) && (b2.p = g2 = /* @__PURE__ */ new Map()), void 0 === (b2 = g2.get(f2)) && (b2 = z(), g2.set(f2, b2));
          }
          if (1 === b2.s) return b2.v;
          if (2 === b2.s) throw b2.v;
          try {
            var h2 = a2.apply(null, arguments);
            return (d2 = b2).s = 1, d2.v = h2;
          } catch (a3) {
            throw (h2 = b2).s = 2, h2.v = a3, a3;
          }
        };
      }, b.cacheSignal = function() {
        var a2 = c.A;
        return a2 ? a2.cacheSignal() : null;
      }, b.captureOwnerStack = function() {
        return null;
      }, b.cloneElement = function(a2, b2, c2) {
        if (null == a2) throw Error(d(267, a2));
        var e2 = r({}, a2.props), f2 = a2.key, g2 = void 0;
        if (null != b2) for (h2 in void 0 !== b2.ref && (g2 = void 0), void 0 !== b2.key && (f2 = "" + b2.key), b2) q.call(b2, h2) && "key" !== h2 && "__self" !== h2 && "__source" !== h2 && ("ref" !== h2 || void 0 !== b2.ref) && (e2[h2] = b2[h2]);
        var h2 = arguments.length - 2;
        if (1 === h2) e2.children = c2;
        else if (1 < h2) {
          for (var i2 = Array(h2), j2 = 0; j2 < h2; j2++) i2[j2] = arguments[j2 + 2];
          e2.children = i2;
        }
        return s(a2.type, f2, void 0, void 0, g2, e2);
      }, b.createElement = function(a2, b2, c2) {
        var d2, e2 = {}, f2 = null;
        if (null != b2) for (d2 in void 0 !== b2.key && (f2 = "" + b2.key), b2) q.call(b2, d2) && "key" !== d2 && "__self" !== d2 && "__source" !== d2 && (e2[d2] = b2[d2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        if (a2 && a2.defaultProps) for (d2 in g2 = a2.defaultProps) void 0 === e2[d2] && (e2[d2] = g2[d2]);
        return s(a2, f2, void 0, void 0, null, e2);
      }, b.createRef = function() {
        return { current: null };
      }, b.forwardRef = function(a2) {
        return { $$typeof: l, render: a2 };
      }, b.isValidElement = t, b.lazy = function(a2) {
        return { $$typeof: o, _payload: { _status: -1, _result: a2 }, _init: x };
      }, b.memo = function(a2, b2) {
        return { $$typeof: n, type: a2, compare: void 0 === b2 ? null : b2 };
      }, b.use = function(a2) {
        return c.H.use(a2);
      }, b.useCallback = function(a2, b2) {
        return c.H.useCallback(a2, b2);
      }, b.useDebugValue = function() {
      }, b.useId = function() {
        return c.H.useId();
      }, b.useMemo = function(a2, b2) {
        return c.H.useMemo(a2, b2);
      }, b.version = "19.2.0-canary-97cdd5d3-20250710";
    }, 58: (a, b, c) => {
      "use strict";
      c.d(b, { xl: () => g });
      let d = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class e {
        disable() {
          throw d;
        }
        getStore() {
        }
        run() {
          throw d;
        }
        exit() {
          throw d;
        }
        enterWith() {
          throw d;
        }
        static bind(a2) {
          return a2;
        }
      }
      let f = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function g() {
        return f ? new f() : new e();
      }
    }, 115: (a, b, c) => {
      "use strict";
      c.d(b, { XN: () => e, FP: () => d });
      let d = (0, c(58).xl)();
      function e(a2) {
        let b2 = d.getStore();
        switch (!b2 && function(a3) {
          throw Object.defineProperty(Error(`\`${a3}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", { value: "E251", enumerable: false, configurable: true });
        }(a2), b2.type) {
          case "request":
          default:
            return b2;
          case "prerender":
          case "prerender-client":
          case "prerender-ppr":
          case "prerender-legacy":
            throw Object.defineProperty(Error(`\`${a2}\` cannot be called inside a prerender. This is a bug in Next.js.`), "__NEXT_ERROR_CODE", { value: "E401", enumerable: false, configurable: true });
          case "cache":
            throw Object.defineProperty(Error(`\`${a2}\` cannot be called inside "use cache". Call it outside and pass an argument instead. Read more: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E37", enumerable: false, configurable: true });
          case "unstable-cache":
            throw Object.defineProperty(Error(`\`${a2}\` cannot be called inside unstable_cache. Call it outside and pass an argument instead. Read more: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E69", enumerable: false, configurable: true });
        }
      }
    }, 159: (a, b, c) => {
      "use strict";
      c.d(b, { RM: () => f, s8: () => e });
      let d = new Set(Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 })), e = "NEXT_HTTP_ERROR_FALLBACK";
      function f(a2) {
        if ("object" != typeof a2 || null === a2 || !("digest" in a2) || "string" != typeof a2.digest) return false;
        let [b2, c2] = a2.digest.split(";");
        return b2 === e && d.has(Number(c2));
      }
    }, 167: (a, b, c) => {
      "use strict";
      c.d(b, { nJ: () => e });
      var d = c(821);
      function e(a2) {
        if ("object" != typeof a2 || null === a2 || !("digest" in a2) || "string" != typeof a2.digest) return false;
        let b2 = a2.digest.split(";"), [c2, e2] = b2, f = b2.slice(2, -2).join(";"), g = Number(b2.at(-2));
        return "NEXT_REDIRECT" === c2 && ("replace" === e2 || "push" === e2) && "string" == typeof f && !isNaN(g) && g in d.Q;
      }
    }, 199: (a, b, c) => {
      "use strict";
      c.d(b, { p: () => f });
      var d = c(159), e = c(167);
      function f(a2) {
        return (0, e.nJ)(a2) || (0, d.RM)(a2);
      }
    }, 201: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { getTestReqInfo: function() {
        return g;
      }, withRequest: function() {
        return f;
      } });
      let d = new (c(521)).AsyncLocalStorage();
      function e(a2, b2) {
        let c2 = b2.header(a2, "next-test-proxy-port");
        if (!c2) return;
        let d2 = b2.url(a2);
        return { url: d2, proxyPort: Number(c2), testData: b2.header(a2, "next-test-data") || "" };
      }
      function f(a2, b2, c2) {
        let f2 = e(a2, b2);
        return f2 ? d.run(f2, c2) : c2();
      }
      function g(a2, b2) {
        let c2 = d.getStore();
        return c2 || (a2 && b2 ? e(a2, b2) : void 0);
      }
    }, 221: (a, b, c) => {
      "use strict";
      c.d(b, { headers: () => q }), c(818), c(725);
      var d = c(535), e = c(115), f = c(557), g = c(602), h = c(801), i = c(815);
      let j = { current: null }, k = "function" == typeof i.cache ? i.cache : (a2) => a2, l = console.warn;
      function m(a2) {
        return function(...b2) {
          l(a2(...b2));
        };
      }
      k((a2) => {
        try {
          l(j.current);
        } finally {
          j.current = null;
        }
      });
      var n = c(335), o = c(730);
      /* @__PURE__ */ new WeakMap(), m(function(a2, b2) {
        let c2 = a2 ? `Route "${a2}" ` : "This route ";
        return Object.defineProperty(Error(`${c2}used ${b2}. \`cookies()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E223", enumerable: false, configurable: true });
      });
      var p = c(381);
      function q() {
        let a2 = d.J.getStore(), b2 = e.FP.getStore();
        if (a2) {
          if (b2 && "after" === b2.phase && !(0, n.iC)()) throw Object.defineProperty(Error(`Route ${a2.route} used "headers" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "headers" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E367", enumerable: false, configurable: true });
          if (a2.forceStatic) return s(p.o.seal(new Headers({})));
          if (b2) {
            if ("cache" === b2.type) throw Object.defineProperty(Error(`Route ${a2.route} used "headers" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E304", enumerable: false, configurable: true });
            else if ("unstable-cache" === b2.type) throw Object.defineProperty(Error(`Route ${a2.route} used "headers" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E127", enumerable: false, configurable: true });
          }
          if (a2.dynamicShouldError) throw Object.defineProperty(new g.f(`Route ${a2.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`headers\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E525", enumerable: false, configurable: true });
          if (b2) switch (b2.type) {
            case "prerender":
              var c2 = b2;
              let d2 = r.get(c2);
              if (d2) return d2;
              let e2 = (0, h.W)(c2.renderSignal, "`headers()`");
              return r.set(c2, e2), e2;
            case "prerender-client":
              let i2 = "`headers`";
              throw Object.defineProperty(new o.z(`${i2} must not be used within a client component. Next.js should be preventing ${i2} from being included in client components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E693", enumerable: false, configurable: true });
            case "prerender-ppr":
              (0, f.Ui)(a2.route, "headers", b2.dynamicTracking);
              break;
            case "prerender-legacy":
              (0, f.xI)("headers", a2, b2);
          }
          (0, f.Pk)(a2, b2);
        }
        return s((0, e.XN)("headers").headers);
      }
      let r = /* @__PURE__ */ new WeakMap();
      function s(a2) {
        let b2 = r.get(a2);
        if (b2) return b2;
        let c2 = Promise.resolve(a2);
        return r.set(a2, c2), Object.defineProperties(c2, { append: { value: a2.append.bind(a2) }, delete: { value: a2.delete.bind(a2) }, get: { value: a2.get.bind(a2) }, has: { value: a2.has.bind(a2) }, set: { value: a2.set.bind(a2) }, getSetCookie: { value: a2.getSetCookie.bind(a2) }, forEach: { value: a2.forEach.bind(a2) }, keys: { value: a2.keys.bind(a2) }, values: { value: a2.values.bind(a2) }, entries: { value: a2.entries.bind(a2) }, [Symbol.iterator]: { value: a2[Symbol.iterator].bind(a2) } }), c2;
      }
      m(function(a2, b2) {
        let c2 = a2 ? `Route "${a2}" ` : "This route ";
        return Object.defineProperty(Error(`${c2}used ${b2}. \`headers()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E277", enumerable: false, configurable: true });
      }), c(16), /* @__PURE__ */ new WeakMap(), m(function(a2, b2) {
        let c2 = a2 ? `Route "${a2}" ` : "This route ";
        return Object.defineProperty(Error(`${c2}used ${b2}. \`draftMode()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E377", enumerable: false, configurable: true });
      });
    }, 280: (a, b, c) => {
      var d;
      (() => {
        var e = { 226: function(e2, f2) {
          !function(g2, h) {
            "use strict";
            var i = "function", j = "undefined", k = "object", l = "string", m = "major", n = "model", o = "name", p = "type", q = "vendor", r = "version", s = "architecture", t = "console", u = "mobile", v = "tablet", w = "smarttv", x = "wearable", y = "embedded", z = "Amazon", A = "Apple", B = "ASUS", C = "BlackBerry", D = "Browser", E = "Chrome", F = "Firefox", G = "Google", H = "Huawei", I = "Microsoft", J = "Motorola", K = "Opera", L = "Samsung", M = "Sharp", N = "Sony", O = "Xiaomi", P = "Zebra", Q = "Facebook", R = "Chromium OS", S = "Mac OS", T = function(a2, b2) {
              var c2 = {};
              for (var d2 in a2) b2[d2] && b2[d2].length % 2 == 0 ? c2[d2] = b2[d2].concat(a2[d2]) : c2[d2] = a2[d2];
              return c2;
            }, U = function(a2) {
              for (var b2 = {}, c2 = 0; c2 < a2.length; c2++) b2[a2[c2].toUpperCase()] = a2[c2];
              return b2;
            }, V = function(a2, b2) {
              return typeof a2 === l && -1 !== W(b2).indexOf(W(a2));
            }, W = function(a2) {
              return a2.toLowerCase();
            }, X = function(a2, b2) {
              if (typeof a2 === l) return a2 = a2.replace(/^\s\s*/, ""), typeof b2 === j ? a2 : a2.substring(0, 350);
            }, Y = function(a2, b2) {
              for (var c2, d2, e3, f3, g3, j2, l2 = 0; l2 < b2.length && !g3; ) {
                var m2 = b2[l2], n2 = b2[l2 + 1];
                for (c2 = d2 = 0; c2 < m2.length && !g3 && m2[c2]; ) if (g3 = m2[c2++].exec(a2)) for (e3 = 0; e3 < n2.length; e3++) j2 = g3[++d2], typeof (f3 = n2[e3]) === k && f3.length > 0 ? 2 === f3.length ? typeof f3[1] == i ? this[f3[0]] = f3[1].call(this, j2) : this[f3[0]] = f3[1] : 3 === f3.length ? typeof f3[1] !== i || f3[1].exec && f3[1].test ? this[f3[0]] = j2 ? j2.replace(f3[1], f3[2]) : void 0 : this[f3[0]] = j2 ? f3[1].call(this, j2, f3[2]) : void 0 : 4 === f3.length && (this[f3[0]] = j2 ? f3[3].call(this, j2.replace(f3[1], f3[2])) : h) : this[f3] = j2 || h;
                l2 += 2;
              }
            }, Z = function(a2, b2) {
              for (var c2 in b2) if (typeof b2[c2] === k && b2[c2].length > 0) {
                for (var d2 = 0; d2 < b2[c2].length; d2++) if (V(b2[c2][d2], a2)) return "?" === c2 ? h : c2;
              } else if (V(b2[c2], a2)) return "?" === c2 ? h : c2;
              return a2;
            }, $ = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, _ = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [r, [o, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [r, [o, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [o, r], [/opios[\/ ]+([\w\.]+)/i], [r, [o, K + " Mini"]], [/\bopr\/([\w\.]+)/i], [r, [o, K]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [o, r], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [r, [o, "UC" + D]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [r, [o, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [r, [o, "WeChat"]], [/konqueror\/([\w\.]+)/i], [r, [o, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [r, [o, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [r, [o, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[o, /(.+)/, "$1 Secure " + D], r], [/\bfocus\/([\w\.]+)/i], [r, [o, F + " Focus"]], [/\bopt\/([\w\.]+)/i], [r, [o, K + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [r, [o, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [r, [o, "Dolphin"]], [/coast\/([\w\.]+)/i], [r, [o, K + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [r, [o, "MIUI " + D]], [/fxios\/([-\w\.]+)/i], [r, [o, F]], [/\bqihu|(qi?ho?o?|360)browser/i], [[o, "360 " + D]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[o, /(.+)/, "$1 " + D], r], [/(comodo_dragon)\/([\w\.]+)/i], [[o, /_/g, " "], r], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [o, r], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [o], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[o, Q], r], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [o, r], [/\bgsa\/([\w\.]+) .*safari\//i], [r, [o, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [r, [o, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [r, [o, E + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[o, E + " WebView"], r], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [r, [o, "Android " + D]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [o, r], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [r, [o, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [r, o], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [o, [r, Z, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [o, r], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[o, "Netscape"], r], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [r, [o, F + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [o, r], [/(cobalt)\/([\w\.]+)/i], [o, [r, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[s, "amd64"]], [/(ia32(?=;))/i], [[s, W]], [/((?:i[346]|x)86)[;\)]/i], [[s, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[s, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[s, "armhf"]], [/windows (ce|mobile); ppc;/i], [[s, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[s, /ower/, "", W]], [/(sun4\w)[;\)]/i], [[s, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[s, W]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [n, [q, L], [p, v]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [n, [q, L], [p, u]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [n, [q, A], [p, u]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [n, [q, A], [p, v]], [/(macintosh);/i], [n, [q, A]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [n, [q, M], [p, u]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [n, [q, H], [p, v]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [n, [q, H], [p, u]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[n, /_/g, " "], [q, O], [p, u]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[n, /_/g, " "], [q, O], [p, v]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [n, [q, "OPPO"], [p, u]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [n, [q, "Vivo"], [p, u]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [n, [q, "Realme"], [p, u]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [n, [q, J], [p, u]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [n, [q, J], [p, v]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [n, [q, "LG"], [p, v]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [n, [q, "LG"], [p, u]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [n, [q, "Lenovo"], [p, v]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[n, /_/g, " "], [q, "Nokia"], [p, u]], [/(pixel c)\b/i], [n, [q, G], [p, v]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [n, [q, G], [p, u]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [n, [q, N], [p, u]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[n, "Xperia Tablet"], [q, N], [p, v]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [n, [q, "OnePlus"], [p, u]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [n, [q, z], [p, v]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[n, /(.+)/g, "Fire Phone $1"], [q, z], [p, u]], [/(playbook);[-\w\),; ]+(rim)/i], [n, q, [p, v]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [n, [q, C], [p, u]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [n, [q, B], [p, v]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [n, [q, B], [p, u]], [/(nexus 9)/i], [n, [q, "HTC"], [p, v]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [q, [n, /_/g, " "], [p, u]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [n, [q, "Acer"], [p, v]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [n, [q, "Meizu"], [p, u]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [q, n, [p, u]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [q, n, [p, v]], [/(surface duo)/i], [n, [q, I], [p, v]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [n, [q, "Fairphone"], [p, u]], [/(u304aa)/i], [n, [q, "AT&T"], [p, u]], [/\bsie-(\w*)/i], [n, [q, "Siemens"], [p, u]], [/\b(rct\w+) b/i], [n, [q, "RCA"], [p, v]], [/\b(venue[\d ]{2,7}) b/i], [n, [q, "Dell"], [p, v]], [/\b(q(?:mv|ta)\w+) b/i], [n, [q, "Verizon"], [p, v]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [n, [q, "Barnes & Noble"], [p, v]], [/\b(tm\d{3}\w+) b/i], [n, [q, "NuVision"], [p, v]], [/\b(k88) b/i], [n, [q, "ZTE"], [p, v]], [/\b(nx\d{3}j) b/i], [n, [q, "ZTE"], [p, u]], [/\b(gen\d{3}) b.+49h/i], [n, [q, "Swiss"], [p, u]], [/\b(zur\d{3}) b/i], [n, [q, "Swiss"], [p, v]], [/\b((zeki)?tb.*\b) b/i], [n, [q, "Zeki"], [p, v]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[q, "Dragon Touch"], n, [p, v]], [/\b(ns-?\w{0,9}) b/i], [n, [q, "Insignia"], [p, v]], [/\b((nxa|next)-?\w{0,9}) b/i], [n, [q, "NextBook"], [p, v]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[q, "Voice"], n, [p, u]], [/\b(lvtel\-)?(v1[12]) b/i], [[q, "LvTel"], n, [p, u]], [/\b(ph-1) /i], [n, [q, "Essential"], [p, u]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [n, [q, "Envizen"], [p, v]], [/\b(trio[-\w\. ]+) b/i], [n, [q, "MachSpeed"], [p, v]], [/\btu_(1491) b/i], [n, [q, "Rotor"], [p, v]], [/(shield[\w ]+) b/i], [n, [q, "Nvidia"], [p, v]], [/(sprint) (\w+)/i], [q, n, [p, u]], [/(kin\.[onetw]{3})/i], [[n, /\./g, " "], [q, I], [p, u]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [n, [q, P], [p, v]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [n, [q, P], [p, u]], [/smart-tv.+(samsung)/i], [q, [p, w]], [/hbbtv.+maple;(\d+)/i], [[n, /^/, "SmartTV"], [q, L], [p, w]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[q, "LG"], [p, w]], [/(apple) ?tv/i], [q, [n, A + " TV"], [p, w]], [/crkey/i], [[n, E + "cast"], [q, G], [p, w]], [/droid.+aft(\w)( bui|\))/i], [n, [q, z], [p, w]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [n, [q, M], [p, w]], [/(bravia[\w ]+)( bui|\))/i], [n, [q, N], [p, w]], [/(mitv-\w{5}) bui/i], [n, [q, O], [p, w]], [/Hbbtv.*(technisat) (.*);/i], [q, n, [p, w]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[q, X], [n, X], [p, w]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[p, w]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [q, n, [p, t]], [/droid.+; (shield) bui/i], [n, [q, "Nvidia"], [p, t]], [/(playstation [345portablevi]+)/i], [n, [q, N], [p, t]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [n, [q, I], [p, t]], [/((pebble))app/i], [q, n, [p, x]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [n, [q, A], [p, x]], [/droid.+; (glass) \d/i], [n, [q, G], [p, x]], [/droid.+; (wt63?0{2,3})\)/i], [n, [q, P], [p, x]], [/(quest( 2| pro)?)/i], [n, [q, Q], [p, x]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [q, [p, y]], [/(aeobc)\b/i], [n, [q, z], [p, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [n, [p, u]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [n, [p, v]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[p, v]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[p, u]], [/(android[-\w\. ]{0,9});.+buil/i], [n, [q, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [r, [o, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [r, [o, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [o, r], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [r, o]], os: [[/microsoft (windows) (vista|xp)/i], [o, r], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [o, [r, Z, $]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[o, "Windows"], [r, Z, $]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[r, /_/g, "."], [o, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[o, S], [r, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [r, o], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [o, r], [/\(bb(10);/i], [r, [o, C]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [r, [o, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [r, [o, F + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [r, [o, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [r, [o, "watchOS"]], [/crkey\/([\d\.]+)/i], [r, [o, E + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[o, R], r], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [o, r], [/(sunos) ?([\w\.\d]*)/i], [[o, "Solaris"], r], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [o, r]] }, aa = function(a2, b2) {
              if (typeof a2 === k && (b2 = a2, a2 = h), !(this instanceof aa)) return new aa(a2, b2).getResult();
              var c2 = typeof g2 !== j && g2.navigator ? g2.navigator : h, d2 = a2 || (c2 && c2.userAgent ? c2.userAgent : ""), e3 = c2 && c2.userAgentData ? c2.userAgentData : h, f3 = b2 ? T(_, b2) : _, t2 = c2 && c2.userAgent == d2;
              return this.getBrowser = function() {
                var a3, b3 = {};
                return b3[o] = h, b3[r] = h, Y.call(b3, d2, f3.browser), b3[m] = typeof (a3 = b3[r]) === l ? a3.replace(/[^\d\.]/g, "").split(".")[0] : h, t2 && c2 && c2.brave && typeof c2.brave.isBrave == i && (b3[o] = "Brave"), b3;
              }, this.getCPU = function() {
                var a3 = {};
                return a3[s] = h, Y.call(a3, d2, f3.cpu), a3;
              }, this.getDevice = function() {
                var a3 = {};
                return a3[q] = h, a3[n] = h, a3[p] = h, Y.call(a3, d2, f3.device), t2 && !a3[p] && e3 && e3.mobile && (a3[p] = u), t2 && "Macintosh" == a3[n] && c2 && typeof c2.standalone !== j && c2.maxTouchPoints && c2.maxTouchPoints > 2 && (a3[n] = "iPad", a3[p] = v), a3;
              }, this.getEngine = function() {
                var a3 = {};
                return a3[o] = h, a3[r] = h, Y.call(a3, d2, f3.engine), a3;
              }, this.getOS = function() {
                var a3 = {};
                return a3[o] = h, a3[r] = h, Y.call(a3, d2, f3.os), t2 && !a3[o] && e3 && "Unknown" != e3.platform && (a3[o] = e3.platform.replace(/chrome os/i, R).replace(/macos/i, S)), a3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return d2;
              }, this.setUA = function(a3) {
                return d2 = typeof a3 === l && a3.length > 350 ? X(a3, 350) : a3, this;
              }, this.setUA(d2), this;
            };
            aa.VERSION = "1.0.35", aa.BROWSER = U([o, r, m]), aa.CPU = U([s]), aa.DEVICE = U([n, q, p, t, u, w, v, x, y]), aa.ENGINE = aa.OS = U([o, r]), typeof f2 !== j ? (e2.exports && (f2 = e2.exports = aa), f2.UAParser = aa) : c.amdO ? void 0 === (d = function() {
              return aa;
            }.call(b, c, b, a)) || (a.exports = d) : typeof g2 !== j && (g2.UAParser = aa);
            var ab = typeof g2 !== j && (g2.jQuery || g2.Zepto);
            if (ab && !ab.ua) {
              var ac = new aa();
              ab.ua = ac.getResult(), ab.ua.get = function() {
                return ac.getUA();
              }, ab.ua.set = function(a2) {
                ac.setUA(a2);
                var b2 = ac.getResult();
                for (var c2 in b2) ab.ua[c2] = b2[c2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, f = {};
        function g(a2) {
          var b2 = f[a2];
          if (void 0 !== b2) return b2.exports;
          var c2 = f[a2] = { exports: {} }, d2 = true;
          try {
            e[a2].call(c2.exports, c2, c2.exports, g), d2 = false;
          } finally {
            d2 && delete f[a2];
          }
          return c2.exports;
        }
        g.ab = "//", a.exports = g(226);
      })();
    }, 335: (a, b, c) => {
      "use strict";
      c.d(b, { iC: () => e }), c(602);
      var d = c(427);
      function e() {
        let a2 = d.Z.getStore();
        return (null == a2 ? void 0 : a2.rootTaskSpawnPhase) === "action";
      }
    }, 356: (a) => {
      "use strict";
      a.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 381: (a, b, c) => {
      "use strict";
      c.d(b, { o: () => f });
      var d = c(716);
      class e extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new e();
        }
      }
      class f extends Headers {
        constructor(a2) {
          super(), this.headers = new Proxy(a2, { get(b2, c2, e2) {
            if ("symbol" == typeof c2) return d.l.get(b2, c2, e2);
            let f2 = c2.toLowerCase(), g = Object.keys(a2).find((a3) => a3.toLowerCase() === f2);
            if (void 0 !== g) return d.l.get(b2, g, e2);
          }, set(b2, c2, e2, f2) {
            if ("symbol" == typeof c2) return d.l.set(b2, c2, e2, f2);
            let g = c2.toLowerCase(), h = Object.keys(a2).find((a3) => a3.toLowerCase() === g);
            return d.l.set(b2, h ?? c2, e2, f2);
          }, has(b2, c2) {
            if ("symbol" == typeof c2) return d.l.has(b2, c2);
            let e2 = c2.toLowerCase(), f2 = Object.keys(a2).find((a3) => a3.toLowerCase() === e2);
            return void 0 !== f2 && d.l.has(b2, f2);
          }, deleteProperty(b2, c2) {
            if ("symbol" == typeof c2) return d.l.deleteProperty(b2, c2);
            let e2 = c2.toLowerCase(), f2 = Object.keys(a2).find((a3) => a3.toLowerCase() === e2);
            return void 0 === f2 || d.l.deleteProperty(b2, f2);
          } });
        }
        static seal(a2) {
          return new Proxy(a2, { get(a3, b2, c2) {
            switch (b2) {
              case "append":
              case "delete":
              case "set":
                return e.callable;
              default:
                return d.l.get(a3, b2, c2);
            }
          } });
        }
        merge(a2) {
          return Array.isArray(a2) ? a2.join(", ") : a2;
        }
        static from(a2) {
          return a2 instanceof Headers ? a2 : new f(a2);
        }
        append(a2, b2) {
          let c2 = this.headers[a2];
          "string" == typeof c2 ? this.headers[a2] = [c2, b2] : Array.isArray(c2) ? c2.push(b2) : this.headers[a2] = b2;
        }
        delete(a2) {
          delete this.headers[a2];
        }
        get(a2) {
          let b2 = this.headers[a2];
          return void 0 !== b2 ? this.merge(b2) : null;
        }
        has(a2) {
          return void 0 !== this.headers[a2];
        }
        set(a2, b2) {
          this.headers[a2] = b2;
        }
        forEach(a2, b2) {
          for (let [c2, d2] of this.entries()) a2.call(b2, d2, c2, this);
        }
        *entries() {
          for (let a2 of Object.keys(this.headers)) {
            let b2 = a2.toLowerCase(), c2 = this.get(b2);
            yield [b2, c2];
          }
        }
        *keys() {
          for (let a2 of Object.keys(this.headers)) {
            let b2 = a2.toLowerCase();
            yield b2;
          }
        }
        *values() {
          for (let a2 of Object.keys(this.headers)) {
            let b2 = this.get(a2);
            yield b2;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
    }, 427: (a, b, c) => {
      "use strict";
      c.d(b, { Z: () => d });
      let d = (0, c(620).xl)();
    }, 521: (a) => {
      "use strict";
      a.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 535: (a, b, c) => {
      "use strict";
      c.d(b, { J: () => d });
      let d = (0, c(58).xl)();
    }, 552: (a, b, c) => {
      "use strict";
      var d = c(356).Buffer;
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { handleFetch: function() {
        return h;
      }, interceptFetch: function() {
        return i;
      }, reader: function() {
        return f;
      } });
      let e = c(201), f = { url: (a2) => a2.url, header: (a2, b2) => a2.headers.get(b2) };
      async function g(a2, b2) {
        let { url: c2, method: e2, headers: f2, body: g2, cache: h2, credentials: i2, integrity: j, mode: k, redirect: l, referrer: m, referrerPolicy: n } = b2;
        return { testData: a2, api: "fetch", request: { url: c2, method: e2, headers: [...Array.from(f2), ["next-test-stack", function() {
          let a3 = (Error().stack ?? "").split("\n");
          for (let b3 = 1; b3 < a3.length; b3++) if (a3[b3].length > 0) {
            a3 = a3.slice(b3);
            break;
          }
          return (a3 = (a3 = (a3 = a3.filter((a4) => !a4.includes("/next/dist/"))).slice(0, 5)).map((a4) => a4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: g2 ? d.from(await b2.arrayBuffer()).toString("base64") : null, cache: h2, credentials: i2, integrity: j, mode: k, redirect: l, referrer: m, referrerPolicy: n } };
      }
      async function h(a2, b2) {
        let c2 = (0, e.getTestReqInfo)(b2, f);
        if (!c2) return a2(b2);
        let { testData: h2, proxyPort: i2 } = c2, j = await g(h2, b2), k = await a2(`http://localhost:${i2}`, { method: "POST", body: JSON.stringify(j), next: { internal: true } });
        if (!k.ok) throw Object.defineProperty(Error(`Proxy request failed: ${k.status}`), "__NEXT_ERROR_CODE", { value: "E146", enumerable: false, configurable: true });
        let l = await k.json(), { api: m } = l;
        switch (m) {
          case "continue":
            return a2(b2);
          case "abort":
          case "unhandled":
            throw Object.defineProperty(Error(`Proxy request aborted [${b2.method} ${b2.url}]`), "__NEXT_ERROR_CODE", { value: "E145", enumerable: false, configurable: true });
        }
        let { status: n, headers: o, body: p } = l.response;
        return new Response(p ? d.from(p, "base64") : null, { status: n, headers: new Headers(o) });
      }
      function i(a2) {
        return c.g.fetch = function(b2, c2) {
          var d2;
          return (null == c2 || null == (d2 = c2.next) ? void 0 : d2.internal) ? a2(b2, c2) : h(a2, new Request(b2, c2));
        }, () => {
          c.g.fetch = a2;
        };
      }
    }, 557: (a, b, c) => {
      "use strict";
      c.d(b, { I3: () => k, Ui: () => i, xI: () => g, Pk: () => h });
      var d = c(815), e = c(16);
      c(602), c(115), c(535), c(801);
      let f = "function" == typeof d.unstable_postpone;
      function g(a2, b2, c2) {
        let d2 = Object.defineProperty(new e.F(`Route ${b2.route} couldn't be rendered statically because it used \`${a2}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
        throw c2.revalidate = 0, b2.dynamicUsageDescription = a2, b2.dynamicUsageStack = d2.stack, d2;
      }
      function h(a2, b2) {
        b2 && "cache" !== b2.type && "unstable-cache" !== b2.type && ("prerender" === b2.type || "prerender-client" === b2.type || "prerender-legacy" === b2.type) && (b2.revalidate = 0);
      }
      function i(a2, b2, c2) {
        (function() {
          if (!f) throw Object.defineProperty(Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E224", enumerable: false, configurable: true });
        })(), c2 && c2.dynamicAccesses.push({ stack: c2.isDebugDynamicAccesses ? Error().stack : void 0, expression: b2 }), d.unstable_postpone(j(a2, b2));
      }
      function j(a2, b2) {
        return `Route ${a2} needs to bail out of prerendering at this point because it used ${b2}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
      }
      function k(a2) {
        return "object" == typeof a2 && null !== a2 && "string" == typeof a2.message && l(a2.message);
      }
      function l(a2) {
        return a2.includes("needs to bail out of prerendering at this point because it used") && a2.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }
      if (false === l(j("%%%", "^^^"))) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`);
    }, 602: (a, b, c) => {
      "use strict";
      c.d(b, { f: () => d });
      class d extends Error {
        constructor(...a2) {
          super(...a2), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
    }, 620: (a, b, c) => {
      "use strict";
      c.d(b, { $p: () => i, cg: () => h, xl: () => g });
      let d = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class e {
        disable() {
          throw d;
        }
        getStore() {
        }
        run() {
          throw d;
        }
        exit() {
          throw d;
        }
        enterWith() {
          throw d;
        }
        static bind(a2) {
          return a2;
        }
      }
      let f = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function g() {
        return f ? new f() : new e();
      }
      function h(a2) {
        return f ? f.bind(a2) : e.bind(a2);
      }
      function i() {
        return f ? f.snapshot() : function(a2, ...b2) {
          return a2(...b2);
        };
      }
    }, 716: (a, b, c) => {
      "use strict";
      c.d(b, { l: () => d });
      class d {
        static get(a2, b2, c2) {
          let d2 = Reflect.get(a2, b2, c2);
          return "function" == typeof d2 ? d2.bind(a2) : d2;
        }
        static set(a2, b2, c2, d2) {
          return Reflect.set(a2, b2, c2, d2);
        }
        static has(a2, b2) {
          return Reflect.has(a2, b2);
        }
        static deleteProperty(a2, b2) {
          return Reflect.deleteProperty(a2, b2);
        }
      }
    }, 724: (a) => {
      "use strict";
      var b = Object.defineProperty, c = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyNames, e = Object.prototype.hasOwnProperty, f = {};
      function g(a2) {
        var b2;
        let c2 = ["path" in a2 && a2.path && `Path=${a2.path}`, "expires" in a2 && (a2.expires || 0 === a2.expires) && `Expires=${("number" == typeof a2.expires ? new Date(a2.expires) : a2.expires).toUTCString()}`, "maxAge" in a2 && "number" == typeof a2.maxAge && `Max-Age=${a2.maxAge}`, "domain" in a2 && a2.domain && `Domain=${a2.domain}`, "secure" in a2 && a2.secure && "Secure", "httpOnly" in a2 && a2.httpOnly && "HttpOnly", "sameSite" in a2 && a2.sameSite && `SameSite=${a2.sameSite}`, "partitioned" in a2 && a2.partitioned && "Partitioned", "priority" in a2 && a2.priority && `Priority=${a2.priority}`].filter(Boolean), d2 = `${a2.name}=${encodeURIComponent(null != (b2 = a2.value) ? b2 : "")}`;
        return 0 === c2.length ? d2 : `${d2}; ${c2.join("; ")}`;
      }
      function h(a2) {
        let b2 = /* @__PURE__ */ new Map();
        for (let c2 of a2.split(/; */)) {
          if (!c2) continue;
          let a3 = c2.indexOf("=");
          if (-1 === a3) {
            b2.set(c2, "true");
            continue;
          }
          let [d2, e2] = [c2.slice(0, a3), c2.slice(a3 + 1)];
          try {
            b2.set(d2, decodeURIComponent(null != e2 ? e2 : "true"));
          } catch {
          }
        }
        return b2;
      }
      function i(a2) {
        if (!a2) return;
        let [[b2, c2], ...d2] = h(a2), { domain: e2, expires: f2, httponly: g2, maxage: i2, path: l2, samesite: m2, secure: n, partitioned: o, priority: p } = Object.fromEntries(d2.map(([a3, b3]) => [a3.toLowerCase().replace(/-/g, ""), b3]));
        {
          var q, r, s = { name: b2, value: decodeURIComponent(c2), domain: e2, ...f2 && { expires: new Date(f2) }, ...g2 && { httpOnly: true }, ..."string" == typeof i2 && { maxAge: Number(i2) }, path: l2, ...m2 && { sameSite: j.includes(q = (q = m2).toLowerCase()) ? q : void 0 }, ...n && { secure: true }, ...p && { priority: k.includes(r = (r = p).toLowerCase()) ? r : void 0 }, ...o && { partitioned: true } };
          let a3 = {};
          for (let b3 in s) s[b3] && (a3[b3] = s[b3]);
          return a3;
        }
      }
      ((a2, c2) => {
        for (var d2 in c2) b(a2, d2, { get: c2[d2], enumerable: true });
      })(f, { RequestCookies: () => l, ResponseCookies: () => m, parseCookie: () => h, parseSetCookie: () => i, stringifyCookie: () => g }), a.exports = ((a2, f2, g2, h2) => {
        if (f2 && "object" == typeof f2 || "function" == typeof f2) for (let i2 of d(f2)) e.call(a2, i2) || i2 === g2 || b(a2, i2, { get: () => f2[i2], enumerable: !(h2 = c(f2, i2)) || h2.enumerable });
        return a2;
      })(b({}, "__esModule", { value: true }), f);
      var j = ["strict", "lax", "none"], k = ["low", "medium", "high"], l = class {
        constructor(a2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          let b2 = a2.get("cookie");
          if (b2) for (let [a3, c2] of h(b2)) this._parsed.set(a3, { name: a3, value: c2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed);
          if (!a2.length) return c2.map(([a3, b3]) => b3);
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter(([a3]) => a3 === d2).map(([a3, b3]) => b3);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2] = 1 === a2.length ? [a2[0].name, a2[0].value] : a2, d2 = this._parsed;
          return d2.set(b2, { name: b2, value: c2 }), this._headers.set("cookie", Array.from(d2).map(([a3, b3]) => g(b3)).join("; ")), this;
        }
        delete(a2) {
          let b2 = this._parsed, c2 = Array.isArray(a2) ? a2.map((a3) => b2.delete(a3)) : b2.delete(a2);
          return this._headers.set("cookie", Array.from(b2).map(([a3, b3]) => g(b3)).join("; ")), c2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((a2) => `${a2.name}=${encodeURIComponent(a2.value)}`).join("; ");
        }
      }, m = class {
        constructor(a2) {
          var b2, c2, d2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          let e2 = null != (d2 = null != (c2 = null == (b2 = a2.getSetCookie) ? void 0 : b2.call(a2)) ? c2 : a2.get("set-cookie")) ? d2 : [];
          for (let a3 of Array.isArray(e2) ? e2 : function(a4) {
            if (!a4) return [];
            var b3, c3, d3, e3, f2, g2 = [], h2 = 0;
            function i2() {
              for (; h2 < a4.length && /\s/.test(a4.charAt(h2)); ) h2 += 1;
              return h2 < a4.length;
            }
            for (; h2 < a4.length; ) {
              for (b3 = h2, f2 = false; i2(); ) if ("," === (c3 = a4.charAt(h2))) {
                for (d3 = h2, h2 += 1, i2(), e3 = h2; h2 < a4.length && "=" !== (c3 = a4.charAt(h2)) && ";" !== c3 && "," !== c3; ) h2 += 1;
                h2 < a4.length && "=" === a4.charAt(h2) ? (f2 = true, h2 = e3, g2.push(a4.substring(b3, d3)), b3 = h2) : h2 = d3 + 1;
              } else h2 += 1;
              (!f2 || h2 >= a4.length) && g2.push(a4.substring(b3, a4.length));
            }
            return g2;
          }(e2)) {
            let b3 = i(a3);
            b3 && this._parsed.set(b3.name, b3);
          }
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed.values());
          if (!a2.length) return c2;
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter((a3) => a3.name === d2);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2, d2] = 1 === a2.length ? [a2[0].name, a2[0].value, a2[0]] : a2, e2 = this._parsed;
          return e2.set(b2, function(a3 = { name: "", value: "" }) {
            return "number" == typeof a3.expires && (a3.expires = new Date(a3.expires)), a3.maxAge && (a3.expires = new Date(Date.now() + 1e3 * a3.maxAge)), (null === a3.path || void 0 === a3.path) && (a3.path = "/"), a3;
          }({ name: b2, value: c2, ...d2 })), function(a3, b3) {
            for (let [, c3] of (b3.delete("set-cookie"), a3)) {
              let a4 = g(c3);
              b3.append("set-cookie", a4);
            }
          }(e2, this._headers), this;
        }
        delete(...a2) {
          let [b2, c2] = "string" == typeof a2[0] ? [a2[0]] : [a2[0].name, a2[0]];
          return this.set({ ...c2, name: b2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(g).join("; ");
        }
      };
    }, 725: (a, b, c) => {
      "use strict";
      c.d(b, { Ud: () => d.stringifyCookie, VO: () => d.ResponseCookies, tm: () => d.RequestCookies });
      var d = c(724);
    }, 730: (a, b, c) => {
      "use strict";
      c.d(b, { z: () => d });
      class d extends Error {
        constructor(a2, b2) {
          super("Invariant: " + (a2.endsWith(".") ? a2 : a2 + ".") + " This is a bug in Next.js.", b2), this.name = "InvariantError";
        }
      }
    }, 792: (a, b, c) => {
      "use strict";
      c.d(b, { X: () => function a2(b2) {
        if ((0, f.p)(b2) || "object" == typeof b2 && null !== b2 && "digest" in b2 && "BAILOUT_TO_CLIENT_SIDE_RENDERING" === b2.digest || (0, h.h)(b2) || (0, g.I3)(b2) || "object" == typeof b2 && null !== b2 && b2.$$typeof === e || (0, d.T)(b2)) throw b2;
        b2 instanceof Error && "cause" in b2 && a2(b2.cause);
      } });
      var d = c(801);
      let e = Symbol.for("react.postpone");
      var f = c(199), g = c(557), h = c(16);
    }, 801: (a, b, c) => {
      "use strict";
      function d(a2) {
        return "object" == typeof a2 && null !== a2 && "digest" in a2 && a2.digest === e;
      }
      c.d(b, { T: () => d, W: () => h });
      let e = "HANGING_PROMISE_REJECTION";
      class f extends Error {
        constructor(a2) {
          super(`During prerendering, ${a2} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${a2} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context.`), this.expression = a2, this.digest = e;
        }
      }
      let g = /* @__PURE__ */ new WeakMap();
      function h(a2, b2) {
        if (a2.aborted) return Promise.reject(new f(b2));
        {
          let c2 = new Promise((c3, d2) => {
            let e2 = d2.bind(null, new f(b2)), h2 = g.get(a2);
            if (h2) h2.push(e2);
            else {
              let b3 = [e2];
              g.set(a2, b3), a2.addEventListener("abort", () => {
                for (let a3 = 0; a3 < b3.length; a3++) b3[a3]();
              }, { once: true });
            }
          });
          return c2.catch(i), c2;
        }
      }
      function i() {
      }
    }, 802: (a) => {
      (() => {
        "use strict";
        var b = { 993: (a2) => {
          var b2 = Object.prototype.hasOwnProperty, c2 = "~";
          function d2() {
          }
          function e2(a3, b3, c3) {
            this.fn = a3, this.context = b3, this.once = c3 || false;
          }
          function f(a3, b3, d3, f2, g2) {
            if ("function" != typeof d3) throw TypeError("The listener must be a function");
            var h2 = new e2(d3, f2 || a3, g2), i = c2 ? c2 + b3 : b3;
            return a3._events[i] ? a3._events[i].fn ? a3._events[i] = [a3._events[i], h2] : a3._events[i].push(h2) : (a3._events[i] = h2, a3._eventsCount++), a3;
          }
          function g(a3, b3) {
            0 == --a3._eventsCount ? a3._events = new d2() : delete a3._events[b3];
          }
          function h() {
            this._events = new d2(), this._eventsCount = 0;
          }
          Object.create && (d2.prototype = /* @__PURE__ */ Object.create(null), new d2().__proto__ || (c2 = false)), h.prototype.eventNames = function() {
            var a3, d3, e3 = [];
            if (0 === this._eventsCount) return e3;
            for (d3 in a3 = this._events) b2.call(a3, d3) && e3.push(c2 ? d3.slice(1) : d3);
            return Object.getOwnPropertySymbols ? e3.concat(Object.getOwnPropertySymbols(a3)) : e3;
          }, h.prototype.listeners = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            if (!d3) return [];
            if (d3.fn) return [d3.fn];
            for (var e3 = 0, f2 = d3.length, g2 = Array(f2); e3 < f2; e3++) g2[e3] = d3[e3].fn;
            return g2;
          }, h.prototype.listenerCount = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            return d3 ? d3.fn ? 1 : d3.length : 0;
          }, h.prototype.emit = function(a3, b3, d3, e3, f2, g2) {
            var h2 = c2 ? c2 + a3 : a3;
            if (!this._events[h2]) return false;
            var i, j, k = this._events[h2], l = arguments.length;
            if (k.fn) {
              switch (k.once && this.removeListener(a3, k.fn, void 0, true), l) {
                case 1:
                  return k.fn.call(k.context), true;
                case 2:
                  return k.fn.call(k.context, b3), true;
                case 3:
                  return k.fn.call(k.context, b3, d3), true;
                case 4:
                  return k.fn.call(k.context, b3, d3, e3), true;
                case 5:
                  return k.fn.call(k.context, b3, d3, e3, f2), true;
                case 6:
                  return k.fn.call(k.context, b3, d3, e3, f2, g2), true;
              }
              for (j = 1, i = Array(l - 1); j < l; j++) i[j - 1] = arguments[j];
              k.fn.apply(k.context, i);
            } else {
              var m, n = k.length;
              for (j = 0; j < n; j++) switch (k[j].once && this.removeListener(a3, k[j].fn, void 0, true), l) {
                case 1:
                  k[j].fn.call(k[j].context);
                  break;
                case 2:
                  k[j].fn.call(k[j].context, b3);
                  break;
                case 3:
                  k[j].fn.call(k[j].context, b3, d3);
                  break;
                case 4:
                  k[j].fn.call(k[j].context, b3, d3, e3);
                  break;
                default:
                  if (!i) for (m = 1, i = Array(l - 1); m < l; m++) i[m - 1] = arguments[m];
                  k[j].fn.apply(k[j].context, i);
              }
            }
            return true;
          }, h.prototype.on = function(a3, b3, c3) {
            return f(this, a3, b3, c3, false);
          }, h.prototype.once = function(a3, b3, c3) {
            return f(this, a3, b3, c3, true);
          }, h.prototype.removeListener = function(a3, b3, d3, e3) {
            var f2 = c2 ? c2 + a3 : a3;
            if (!this._events[f2]) return this;
            if (!b3) return g(this, f2), this;
            var h2 = this._events[f2];
            if (h2.fn) h2.fn !== b3 || e3 && !h2.once || d3 && h2.context !== d3 || g(this, f2);
            else {
              for (var i = 0, j = [], k = h2.length; i < k; i++) (h2[i].fn !== b3 || e3 && !h2[i].once || d3 && h2[i].context !== d3) && j.push(h2[i]);
              j.length ? this._events[f2] = 1 === j.length ? j[0] : j : g(this, f2);
            }
            return this;
          }, h.prototype.removeAllListeners = function(a3) {
            var b3;
            return a3 ? (b3 = c2 ? c2 + a3 : a3, this._events[b3] && g(this, b3)) : (this._events = new d2(), this._eventsCount = 0), this;
          }, h.prototype.off = h.prototype.removeListener, h.prototype.addListener = h.prototype.on, h.prefixed = c2, h.EventEmitter = h, a2.exports = h;
        }, 213: (a2) => {
          a2.exports = (a3, b2) => (b2 = b2 || (() => {
          }), a3.then((a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => a4), (a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => {
            throw a4;
          })));
        }, 574: (a2, b2) => {
          Object.defineProperty(b2, "__esModule", { value: true }), b2.default = function(a3, b3, c2) {
            let d2 = 0, e2 = a3.length;
            for (; e2 > 0; ) {
              let f = e2 / 2 | 0, g = d2 + f;
              0 >= c2(a3[g], b3) ? (d2 = ++g, e2 -= f + 1) : e2 = f;
            }
            return d2;
          };
        }, 821: (a2, b2, c2) => {
          Object.defineProperty(b2, "__esModule", { value: true });
          let d2 = c2(574);
          class e2 {
            constructor() {
              this._queue = [];
            }
            enqueue(a3, b3) {
              let c3 = { priority: (b3 = Object.assign({ priority: 0 }, b3)).priority, run: a3 };
              if (this.size && this._queue[this.size - 1].priority >= b3.priority) return void this._queue.push(c3);
              let e3 = d2.default(this._queue, c3, (a4, b4) => b4.priority - a4.priority);
              this._queue.splice(e3, 0, c3);
            }
            dequeue() {
              let a3 = this._queue.shift();
              return null == a3 ? void 0 : a3.run;
            }
            filter(a3) {
              return this._queue.filter((b3) => b3.priority === a3.priority).map((a4) => a4.run);
            }
            get size() {
              return this._queue.length;
            }
          }
          b2.default = e2;
        }, 816: (a2, b2, c2) => {
          let d2 = c2(213);
          class e2 extends Error {
            constructor(a3) {
              super(a3), this.name = "TimeoutError";
            }
          }
          let f = (a3, b3, c3) => new Promise((f2, g) => {
            if ("number" != typeof b3 || b3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (b3 === 1 / 0) return void f2(a3);
            let h = setTimeout(() => {
              if ("function" == typeof c3) {
                try {
                  f2(c3());
                } catch (a4) {
                  g(a4);
                }
                return;
              }
              let d3 = "string" == typeof c3 ? c3 : `Promise timed out after ${b3} milliseconds`, h2 = c3 instanceof Error ? c3 : new e2(d3);
              "function" == typeof a3.cancel && a3.cancel(), g(h2);
            }, b3);
            d2(a3.then(f2, g), () => {
              clearTimeout(h);
            });
          });
          a2.exports = f, a2.exports.default = f, a2.exports.TimeoutError = e2;
        } }, c = {};
        function d(a2) {
          var e2 = c[a2];
          if (void 0 !== e2) return e2.exports;
          var f = c[a2] = { exports: {} }, g = true;
          try {
            b[a2](f, f.exports, d), g = false;
          } finally {
            g && delete c[a2];
          }
          return f.exports;
        }
        d.ab = "//";
        var e = {};
        (() => {
          Object.defineProperty(e, "__esModule", { value: true });
          let a2 = d(993), b2 = d(816), c2 = d(821), f = () => {
          }, g = new b2.TimeoutError();
          class h extends a2 {
            constructor(a3) {
              var b3, d2, e2, g2;
              if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = f, this._resolveIdle = f, !("number" == typeof (a3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: c2.default }, a3)).intervalCap && a3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (d2 = null == (b3 = a3.intervalCap) ? void 0 : b3.toString()) ? d2 : ""}\` (${typeof a3.intervalCap})`);
              if (void 0 === a3.interval || !(Number.isFinite(a3.interval) && a3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (g2 = null == (e2 = a3.interval) ? void 0 : e2.toString()) ? g2 : ""}\` (${typeof a3.interval})`);
              this._carryoverConcurrencyCount = a3.carryoverConcurrencyCount, this._isIntervalIgnored = a3.intervalCap === 1 / 0 || 0 === a3.interval, this._intervalCap = a3.intervalCap, this._interval = a3.interval, this._queue = new a3.queueClass(), this._queueClass = a3.queueClass, this.concurrency = a3.concurrency, this._timeout = a3.timeout, this._throwOnTimeout = true === a3.throwOnTimeout, this._isPaused = false === a3.autoStart;
            }
            get _doesIntervalAllowAnother() {
              return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
            }
            get _doesConcurrentAllowAnother() {
              return this._pendingCount < this._concurrency;
            }
            _next() {
              this._pendingCount--, this._tryToStartAnother(), this.emit("next");
            }
            _resolvePromises() {
              this._resolveEmpty(), this._resolveEmpty = f, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = f, this.emit("idle"));
            }
            _onResumeInterval() {
              this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
            }
            _isIntervalPaused() {
              let a3 = Date.now();
              if (void 0 === this._intervalId) {
                let b3 = this._intervalEnd - a3;
                if (!(b3 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                  this._onResumeInterval();
                }, b3)), true;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
              }
              return false;
            }
            _tryToStartAnother() {
              if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
              if (!this._isPaused) {
                let a3 = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                  let b3 = this._queue.dequeue();
                  return !!b3 && (this.emit("active"), b3(), a3 && this._initializeIntervalIfNeeded(), true);
                }
              }
              return false;
            }
            _initializeIntervalIfNeeded() {
              this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
              }, this._interval), this._intervalEnd = Date.now() + this._interval);
            }
            _onInterval() {
              0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
            }
            _processQueue() {
              for (; this._tryToStartAnother(); ) ;
            }
            get concurrency() {
              return this._concurrency;
            }
            set concurrency(a3) {
              if (!("number" == typeof a3 && a3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${a3}\` (${typeof a3})`);
              this._concurrency = a3, this._processQueue();
            }
            async add(a3, c3 = {}) {
              return new Promise((d2, e2) => {
                let f2 = async () => {
                  this._pendingCount++, this._intervalCount++;
                  try {
                    let f3 = void 0 === this._timeout && void 0 === c3.timeout ? a3() : b2.default(Promise.resolve(a3()), void 0 === c3.timeout ? this._timeout : c3.timeout, () => {
                      (void 0 === c3.throwOnTimeout ? this._throwOnTimeout : c3.throwOnTimeout) && e2(g);
                    });
                    d2(await f3);
                  } catch (a4) {
                    e2(a4);
                  }
                  this._next();
                };
                this._queue.enqueue(f2, c3), this._tryToStartAnother(), this.emit("add");
              });
            }
            async addAll(a3, b3) {
              return Promise.all(a3.map(async (a4) => this.add(a4, b3)));
            }
            start() {
              return this._isPaused && (this._isPaused = false, this._processQueue()), this;
            }
            pause() {
              this._isPaused = true;
            }
            clear() {
              this._queue = new this._queueClass();
            }
            async onEmpty() {
              if (0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveEmpty;
                this._resolveEmpty = () => {
                  b3(), a3();
                };
              });
            }
            async onIdle() {
              if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveIdle;
                this._resolveIdle = () => {
                  b3(), a3();
                };
              });
            }
            get size() {
              return this._queue.size;
            }
            sizeBy(a3) {
              return this._queue.filter(a3).length;
            }
            get pending() {
              return this._pendingCount;
            }
            get isPaused() {
              return this._isPaused;
            }
            get timeout() {
              return this._timeout;
            }
            set timeout(a3) {
              this._timeout = a3;
            }
          }
          e.default = h;
        })(), a.exports = e;
      })();
    }, 807: (a, b, c) => {
      "use strict";
      let d;
      c.r(b), c.d(b, { default: () => hl });
      var e = {};
      async function f() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      c.r(e), c.d(e, { config: () => hh, default: () => hg });
      let g = null;
      async function h() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        g || (g = f());
        let a10 = await g;
        if (null == a10 ? void 0 : a10.register) try {
          await a10.register();
        } catch (a11) {
          throw a11.message = `An error occurred while loading instrumentation hook: ${a11.message}`, a11;
        }
      }
      async function i(...a10) {
        let b10 = await f();
        try {
          var c10;
          await (null == b10 || null == (c10 = b10.onRequestError) ? void 0 : c10.call(b10, ...a10));
        } catch (a11) {
          console.error("Error in instrumentation.onRequestError:", a11);
        }
      }
      let j = null;
      function k() {
        return j || (j = h()), j;
      }
      function l(a10) {
        return `The edge runtime does not support Node.js '${a10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== c.g.process && (process.env = c.g.process.env, c.g.process = process), Object.defineProperty(globalThis, "__import_unsupported", { value: function(a10) {
        let b10 = new Proxy(function() {
        }, { get(b11, c10) {
          if ("then" === c10) return {};
          throw Object.defineProperty(Error(l(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }, construct() {
          throw Object.defineProperty(Error(l(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }, apply(c10, d10, e10) {
          if ("function" == typeof e10[0]) return e10[0](b10);
          throw Object.defineProperty(Error(l(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        } });
        return new Proxy({}, { get: () => b10 });
      }, enumerable: false, configurable: false }), k();
      class m extends Error {
        constructor({ page: a10 }) {
          super(`The middleware "${a10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class n extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class o extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let p = "_N_T_", q = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function r(a10) {
        var b10, c10, d10, e10, f10, g10 = [], h2 = 0;
        function i2() {
          for (; h2 < a10.length && /\s/.test(a10.charAt(h2)); ) h2 += 1;
          return h2 < a10.length;
        }
        for (; h2 < a10.length; ) {
          for (b10 = h2, f10 = false; i2(); ) if ("," === (c10 = a10.charAt(h2))) {
            for (d10 = h2, h2 += 1, i2(), e10 = h2; h2 < a10.length && "=" !== (c10 = a10.charAt(h2)) && ";" !== c10 && "," !== c10; ) h2 += 1;
            h2 < a10.length && "=" === a10.charAt(h2) ? (f10 = true, h2 = e10, g10.push(a10.substring(b10, d10)), b10 = h2) : h2 = d10 + 1;
          } else h2 += 1;
          (!f10 || h2 >= a10.length) && g10.push(a10.substring(b10, a10.length));
        }
        return g10;
      }
      function s(a10) {
        let b10 = {}, c10 = [];
        if (a10) for (let [d10, e10] of a10.entries()) "set-cookie" === d10.toLowerCase() ? (c10.push(...r(e10)), b10[d10] = 1 === c10.length ? c10[0] : c10) : b10[d10] = e10;
        return b10;
      }
      function t(a10) {
        try {
          return String(new URL(String(a10)));
        } catch (b10) {
          throw Object.defineProperty(Error(`URL is malformed "${String(a10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: b10 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      ({ ...q, GROUP: { builtinReact: [q.reactServerComponents, q.actionBrowser], serverOnly: [q.reactServerComponents, q.actionBrowser, q.instrument, q.middleware], neutralTarget: [q.apiNode, q.apiEdge], clientOnly: [q.serverSideRendering, q.appPagesBrowser], bundled: [q.reactServerComponents, q.actionBrowser, q.serverSideRendering, q.appPagesBrowser, q.shared, q.instrument, q.middleware], appPages: [q.reactServerComponents, q.serverSideRendering, q.appPagesBrowser, q.actionBrowser] } });
      let u = Symbol("response"), v = Symbol("passThrough"), w = Symbol("waitUntil");
      class x {
        constructor(a10, b10) {
          this[v] = false, this[w] = b10 ? { kind: "external", function: b10 } : { kind: "internal", promises: [] };
        }
        respondWith(a10) {
          this[u] || (this[u] = Promise.resolve(a10));
        }
        passThroughOnException() {
          this[v] = true;
        }
        waitUntil(a10) {
          if ("external" === this[w].kind) return (0, this[w].function)(a10);
          this[w].promises.push(a10);
        }
      }
      class y extends x {
        constructor(a10) {
          var b10;
          super(a10.request, null == (b10 = a10.context) ? void 0 : b10.waitUntil), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new m({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new m({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      function z(a10) {
        return a10.replace(/\/$/, "") || "/";
      }
      function A(a10) {
        let b10 = a10.indexOf("#"), c10 = a10.indexOf("?"), d10 = c10 > -1 && (b10 < 0 || c10 < b10);
        return d10 || b10 > -1 ? { pathname: a10.substring(0, d10 ? c10 : b10), query: d10 ? a10.substring(c10, b10 > -1 ? b10 : void 0) : "", hash: b10 > -1 ? a10.slice(b10) : "" } : { pathname: a10, query: "", hash: "" };
      }
      function B(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e10 } = A(a10);
        return "" + b10 + c10 + d10 + e10;
      }
      function C(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e10 } = A(a10);
        return "" + c10 + b10 + d10 + e10;
      }
      function D(a10, b10) {
        if ("string" != typeof a10) return false;
        let { pathname: c10 } = A(a10);
        return c10 === b10 || c10.startsWith(b10 + "/");
      }
      let E = /* @__PURE__ */ new WeakMap();
      function F(a10, b10) {
        let c10;
        if (!b10) return { pathname: a10 };
        let d10 = E.get(b10);
        d10 || (d10 = b10.map((a11) => a11.toLowerCase()), E.set(b10, d10));
        let e10 = a10.split("/", 2);
        if (!e10[1]) return { pathname: a10 };
        let f10 = e10[1].toLowerCase(), g10 = d10.indexOf(f10);
        return g10 < 0 ? { pathname: a10 } : (c10 = b10[g10], { pathname: a10 = a10.slice(c10.length + 1) || "/", detectedLocale: c10 });
      }
      let G = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function H(a10, b10) {
        return new URL(String(a10).replace(G, "localhost"), b10 && String(b10).replace(G, "localhost"));
      }
      let I = Symbol("NextURLInternal");
      class J {
        constructor(a10, b10, c10) {
          let d10, e10;
          "object" == typeof b10 && "pathname" in b10 || "string" == typeof b10 ? (d10 = b10, e10 = c10 || {}) : e10 = c10 || b10 || {}, this[I] = { url: H(a10, d10 ?? e10.base), options: e10, basePath: "" }, this.analyze();
        }
        analyze() {
          var a10, b10, c10, d10, e10;
          let f10 = function(a11, b11) {
            var c11, d11;
            let { basePath: e11, i18n: f11, trailingSlash: g11 } = null != (c11 = b11.nextConfig) ? c11 : {}, h3 = { pathname: a11, trailingSlash: "/" !== a11 ? a11.endsWith("/") : g11 };
            e11 && D(h3.pathname, e11) && (h3.pathname = function(a12, b12) {
              if (!D(a12, b12)) return a12;
              let c12 = a12.slice(b12.length);
              return c12.startsWith("/") ? c12 : "/" + c12;
            }(h3.pathname, e11), h3.basePath = e11);
            let i2 = h3.pathname;
            if (h3.pathname.startsWith("/_next/data/") && h3.pathname.endsWith(".json")) {
              let a12 = h3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              h3.buildId = a12[0], i2 = "index" !== a12[1] ? "/" + a12.slice(1).join("/") : "/", true === b11.parseData && (h3.pathname = i2);
            }
            if (f11) {
              let a12 = b11.i18nProvider ? b11.i18nProvider.analyze(h3.pathname) : F(h3.pathname, f11.locales);
              h3.locale = a12.detectedLocale, h3.pathname = null != (d11 = a12.pathname) ? d11 : h3.pathname, !a12.detectedLocale && h3.buildId && (a12 = b11.i18nProvider ? b11.i18nProvider.analyze(i2) : F(i2, f11.locales)).detectedLocale && (h3.locale = a12.detectedLocale);
            }
            return h3;
          }(this[I].url.pathname, { nextConfig: this[I].options.nextConfig, parseData: true, i18nProvider: this[I].options.i18nProvider }), g10 = function(a11, b11) {
            let c11;
            if ((null == b11 ? void 0 : b11.host) && !Array.isArray(b11.host)) c11 = b11.host.toString().split(":", 1)[0];
            else {
              if (!a11.hostname) return;
              c11 = a11.hostname;
            }
            return c11.toLowerCase();
          }(this[I].url, this[I].options.headers);
          this[I].domainLocale = this[I].options.i18nProvider ? this[I].options.i18nProvider.detectDomainLocale(g10) : function(a11, b11, c11) {
            if (a11) for (let f11 of (c11 && (c11 = c11.toLowerCase()), a11)) {
              var d11, e11;
              if (b11 === (null == (d11 = f11.domain) ? void 0 : d11.split(":", 1)[0].toLowerCase()) || c11 === f11.defaultLocale.toLowerCase() || (null == (e11 = f11.locales) ? void 0 : e11.some((a12) => a12.toLowerCase() === c11))) return f11;
            }
          }(null == (b10 = this[I].options.nextConfig) || null == (a10 = b10.i18n) ? void 0 : a10.domains, g10);
          let h2 = (null == (c10 = this[I].domainLocale) ? void 0 : c10.defaultLocale) || (null == (e10 = this[I].options.nextConfig) || null == (d10 = e10.i18n) ? void 0 : d10.defaultLocale);
          this[I].url.pathname = f10.pathname, this[I].defaultLocale = h2, this[I].basePath = f10.basePath ?? "", this[I].buildId = f10.buildId, this[I].locale = f10.locale ?? h2, this[I].trailingSlash = f10.trailingSlash;
        }
        formatPathname() {
          var a10;
          let b10;
          return b10 = function(a11, b11, c10, d10) {
            if (!b11 || b11 === c10) return a11;
            let e10 = a11.toLowerCase();
            return !d10 && (D(e10, "/api") || D(e10, "/" + b11.toLowerCase())) ? a11 : B(a11, "/" + b11);
          }((a10 = { basePath: this[I].basePath, buildId: this[I].buildId, defaultLocale: this[I].options.forceLocale ? void 0 : this[I].defaultLocale, locale: this[I].locale, pathname: this[I].url.pathname, trailingSlash: this[I].trailingSlash }).pathname, a10.locale, a10.buildId ? void 0 : a10.defaultLocale, a10.ignorePrefix), (a10.buildId || !a10.trailingSlash) && (b10 = z(b10)), a10.buildId && (b10 = C(B(b10, "/_next/data/" + a10.buildId), "/" === a10.pathname ? "index.json" : ".json")), b10 = B(b10, a10.basePath), !a10.buildId && a10.trailingSlash ? b10.endsWith("/") ? b10 : C(b10, "/") : z(b10);
        }
        formatSearch() {
          return this[I].url.search;
        }
        get buildId() {
          return this[I].buildId;
        }
        set buildId(a10) {
          this[I].buildId = a10;
        }
        get locale() {
          return this[I].locale ?? "";
        }
        set locale(a10) {
          var b10, c10;
          if (!this[I].locale || !(null == (c10 = this[I].options.nextConfig) || null == (b10 = c10.i18n) ? void 0 : b10.locales.includes(a10))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${a10}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[I].locale = a10;
        }
        get defaultLocale() {
          return this[I].defaultLocale;
        }
        get domainLocale() {
          return this[I].domainLocale;
        }
        get searchParams() {
          return this[I].url.searchParams;
        }
        get host() {
          return this[I].url.host;
        }
        set host(a10) {
          this[I].url.host = a10;
        }
        get hostname() {
          return this[I].url.hostname;
        }
        set hostname(a10) {
          this[I].url.hostname = a10;
        }
        get port() {
          return this[I].url.port;
        }
        set port(a10) {
          this[I].url.port = a10;
        }
        get protocol() {
          return this[I].url.protocol;
        }
        set protocol(a10) {
          this[I].url.protocol = a10;
        }
        get href() {
          let a10 = this.formatPathname(), b10 = this.formatSearch();
          return `${this.protocol}//${this.host}${a10}${b10}${this.hash}`;
        }
        set href(a10) {
          this[I].url = H(a10), this.analyze();
        }
        get origin() {
          return this[I].url.origin;
        }
        get pathname() {
          return this[I].url.pathname;
        }
        set pathname(a10) {
          this[I].url.pathname = a10;
        }
        get hash() {
          return this[I].url.hash;
        }
        set hash(a10) {
          this[I].url.hash = a10;
        }
        get search() {
          return this[I].url.search;
        }
        set search(a10) {
          this[I].url.search = a10;
        }
        get password() {
          return this[I].url.password;
        }
        set password(a10) {
          this[I].url.password = a10;
        }
        get username() {
          return this[I].url.username;
        }
        set username(a10) {
          this[I].url.username = a10;
        }
        get basePath() {
          return this[I].basePath;
        }
        set basePath(a10) {
          this[I].basePath = a10.startsWith("/") ? a10 : `/${a10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new J(String(this), this[I].options);
        }
      }
      var K = c(725);
      let L = Symbol("internal request");
      class M extends Request {
        constructor(a10, b10 = {}) {
          let c10 = "string" != typeof a10 && "url" in a10 ? a10.url : String(a10);
          t(c10), a10 instanceof Request ? super(a10, b10) : super(c10, b10);
          let d10 = new J(c10, { headers: s(this.headers), nextConfig: b10.nextConfig });
          this[L] = { cookies: new K.tm(this.headers), nextUrl: d10, url: d10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[L].cookies;
        }
        get nextUrl() {
          return this[L].nextUrl;
        }
        get page() {
          throw new n();
        }
        get ua() {
          throw new o();
        }
        get url() {
          return this[L].url;
        }
      }
      var N = c(716);
      let O = Symbol("internal response"), P = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function Q(a10, b10) {
        var c10;
        if (null == a10 || null == (c10 = a10.request) ? void 0 : c10.headers) {
          if (!(a10.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let c11 = [];
          for (let [d10, e10] of a10.request.headers) b10.set("x-middleware-request-" + d10, e10), c11.push(d10);
          b10.set("x-middleware-override-headers", c11.join(","));
        }
      }
      class R extends Response {
        constructor(a10, b10 = {}) {
          super(a10, b10);
          let c10 = this.headers, d10 = new Proxy(new K.VO(c10), { get(a11, d11, e10) {
            switch (d11) {
              case "delete":
              case "set":
                return (...e11) => {
                  let f10 = Reflect.apply(a11[d11], a11, e11), g10 = new Headers(c10);
                  return f10 instanceof K.VO && c10.set("x-middleware-set-cookie", f10.getAll().map((a12) => (0, K.Ud)(a12)).join(",")), Q(b10, g10), f10;
                };
              default:
                return N.l.get(a11, d11, e10);
            }
          } });
          this[O] = { cookies: d10, url: b10.url ? new J(b10.url, { headers: s(c10), nextConfig: b10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[O].cookies;
        }
        static json(a10, b10) {
          let c10 = Response.json(a10, b10);
          return new R(c10.body, c10);
        }
        static redirect(a10, b10) {
          let c10 = "number" == typeof b10 ? b10 : (null == b10 ? void 0 : b10.status) ?? 307;
          if (!P.has(c10)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let d10 = "object" == typeof b10 ? b10 : {}, e10 = new Headers(null == d10 ? void 0 : d10.headers);
          return e10.set("Location", t(a10)), new R(null, { ...d10, headers: e10, status: c10 });
        }
        static rewrite(a10, b10) {
          let c10 = new Headers(null == b10 ? void 0 : b10.headers);
          return c10.set("x-middleware-rewrite", t(a10)), Q(b10, c10), new R(null, { ...b10, headers: c10 });
        }
        static next(a10) {
          let b10 = new Headers(null == a10 ? void 0 : a10.headers);
          return b10.set("x-middleware-next", "1"), Q(a10, b10), new R(null, { ...a10, headers: b10 });
        }
      }
      function S(a10, b10) {
        let c10 = "string" == typeof b10 ? new URL(b10) : b10, d10 = new URL(a10, b10), e10 = d10.origin === c10.origin;
        return { url: e10 ? d10.toString().slice(c10.origin.length) : d10.toString(), isRelative: e10 };
      }
      let T = "Next-Router-Prefetch", U = ["RSC", "Next-Router-State-Tree", T, "Next-HMR-Refresh", "Next-Router-Segment-Prefetch"];
      var V = c(381), W = c(818), X = function(a10) {
        return a10.handleRequest = "BaseServer.handleRequest", a10.run = "BaseServer.run", a10.pipe = "BaseServer.pipe", a10.getStaticHTML = "BaseServer.getStaticHTML", a10.render = "BaseServer.render", a10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", a10.renderToResponse = "BaseServer.renderToResponse", a10.renderToHTML = "BaseServer.renderToHTML", a10.renderError = "BaseServer.renderError", a10.renderErrorToResponse = "BaseServer.renderErrorToResponse", a10.renderErrorToHTML = "BaseServer.renderErrorToHTML", a10.render404 = "BaseServer.render404", a10;
      }(X || {}), Y = function(a10) {
        return a10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", a10.loadComponents = "LoadComponents.loadComponents", a10;
      }(Y || {}), Z = function(a10) {
        return a10.getRequestHandler = "NextServer.getRequestHandler", a10.getServer = "NextServer.getServer", a10.getServerRequestHandler = "NextServer.getServerRequestHandler", a10.createServer = "createServer.createServer", a10;
      }(Z || {}), $ = function(a10) {
        return a10.compression = "NextNodeServer.compression", a10.getBuildId = "NextNodeServer.getBuildId", a10.createComponentTree = "NextNodeServer.createComponentTree", a10.clientComponentLoading = "NextNodeServer.clientComponentLoading", a10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", a10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", a10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", a10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", a10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", a10.sendRenderResult = "NextNodeServer.sendRenderResult", a10.proxyRequest = "NextNodeServer.proxyRequest", a10.runApi = "NextNodeServer.runApi", a10.render = "NextNodeServer.render", a10.renderHTML = "NextNodeServer.renderHTML", a10.imageOptimizer = "NextNodeServer.imageOptimizer", a10.getPagePath = "NextNodeServer.getPagePath", a10.getRoutesManifest = "NextNodeServer.getRoutesManifest", a10.findPageComponents = "NextNodeServer.findPageComponents", a10.getFontManifest = "NextNodeServer.getFontManifest", a10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", a10.getRequestHandler = "NextNodeServer.getRequestHandler", a10.renderToHTML = "NextNodeServer.renderToHTML", a10.renderError = "NextNodeServer.renderError", a10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", a10.render404 = "NextNodeServer.render404", a10.startResponse = "NextNodeServer.startResponse", a10.route = "route", a10.onProxyReq = "onProxyReq", a10.apiResolver = "apiResolver", a10.internalFetch = "internalFetch", a10;
      }($ || {}), _ = function(a10) {
        return a10.startServer = "startServer.startServer", a10;
      }(_ || {}), aa = function(a10) {
        return a10.getServerSideProps = "Render.getServerSideProps", a10.getStaticProps = "Render.getStaticProps", a10.renderToString = "Render.renderToString", a10.renderDocument = "Render.renderDocument", a10.createBodyResult = "Render.createBodyResult", a10;
      }(aa || {}), ab = function(a10) {
        return a10.renderToString = "AppRender.renderToString", a10.renderToReadableStream = "AppRender.renderToReadableStream", a10.getBodyResult = "AppRender.getBodyResult", a10.fetch = "AppRender.fetch", a10;
      }(ab || {}), ac = function(a10) {
        return a10.executeRoute = "Router.executeRoute", a10;
      }(ac || {}), ad = function(a10) {
        return a10.runHandler = "Node.runHandler", a10;
      }(ad || {}), ae = function(a10) {
        return a10.runHandler = "AppRouteRouteHandlers.runHandler", a10;
      }(ae || {}), af = function(a10) {
        return a10.generateMetadata = "ResolveMetadata.generateMetadata", a10.generateViewport = "ResolveMetadata.generateViewport", a10;
      }(af || {}), ag = function(a10) {
        return a10.execute = "Middleware.execute", a10;
      }(ag || {});
      let ah = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], ai = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"];
      function aj(a10) {
        return null !== a10 && "object" == typeof a10 && "then" in a10 && "function" == typeof a10.then;
      }
      let { context: ak, propagation: al, trace: am, SpanStatusCode: an, SpanKind: ao, ROOT_CONTEXT: ap } = d = c(956);
      class aq extends Error {
        constructor(a10, b10) {
          super(), this.bubble = a10, this.result = b10;
        }
      }
      let ar = (a10, b10) => {
        (function(a11) {
          return "object" == typeof a11 && null !== a11 && a11 instanceof aq;
        })(b10) && b10.bubble ? a10.setAttribute("next.bubble", true) : (b10 && a10.recordException(b10), a10.setStatus({ code: an.ERROR, message: null == b10 ? void 0 : b10.message })), a10.end();
      }, as = /* @__PURE__ */ new Map(), at = d.createContextKey("next.rootSpanId"), au = 0, av = { set(a10, b10, c10) {
        a10.push({ key: b10, value: c10 });
      } };
      class aw {
        getTracerInstance() {
          return am.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return ak;
        }
        getTracePropagationData() {
          let a10 = ak.active(), b10 = [];
          return al.inject(a10, b10, av), b10;
        }
        getActiveScopeSpan() {
          return am.getSpan(null == ak ? void 0 : ak.active());
        }
        withPropagatedContext(a10, b10, c10) {
          let d10 = ak.active();
          if (am.getSpanContext(d10)) return b10();
          let e10 = al.extract(d10, a10, c10);
          return ak.with(e10, b10);
        }
        trace(...a10) {
          var b10;
          let [c10, d10, e10] = a10, { fn: f10, options: g10 } = "function" == typeof d10 ? { fn: d10, options: {} } : { fn: e10, options: { ...d10 } }, h2 = g10.spanName ?? c10;
          if (!ah.includes(c10) && "1" !== process.env.NEXT_OTEL_VERBOSE || g10.hideSpan) return f10();
          let i2 = this.getSpanContext((null == g10 ? void 0 : g10.parentSpan) ?? this.getActiveScopeSpan()), j2 = false;
          i2 ? (null == (b10 = am.getSpanContext(i2)) ? void 0 : b10.isRemote) && (j2 = true) : (i2 = (null == ak ? void 0 : ak.active()) ?? ap, j2 = true);
          let k2 = au++;
          return g10.attributes = { "next.span_name": h2, "next.span_type": c10, ...g10.attributes }, ak.with(i2.setValue(at, k2), () => this.getTracerInstance().startActiveSpan(h2, g10, (a11) => {
            let b11 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0, d11 = () => {
              as.delete(k2), b11 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && ai.includes(c10 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(c10.split(".").pop() || "").replace(/[A-Z]/g, (a12) => "-" + a12.toLowerCase())}`, { start: b11, end: performance.now() });
            };
            j2 && as.set(k2, new Map(Object.entries(g10.attributes ?? {})));
            try {
              if (f10.length > 1) return f10(a11, (b13) => ar(a11, b13));
              let b12 = f10(a11);
              if (aj(b12)) return b12.then((b13) => (a11.end(), b13)).catch((b13) => {
                throw ar(a11, b13), b13;
              }).finally(d11);
              return a11.end(), d11(), b12;
            } catch (b12) {
              throw ar(a11, b12), d11(), b12;
            }
          }));
        }
        wrap(...a10) {
          let b10 = this, [c10, d10, e10] = 3 === a10.length ? a10 : [a10[0], {}, a10[1]];
          return ah.includes(c10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let a11 = d10;
            "function" == typeof a11 && "function" == typeof e10 && (a11 = a11.apply(this, arguments));
            let f10 = arguments.length - 1, g10 = arguments[f10];
            if ("function" != typeof g10) return b10.trace(c10, a11, () => e10.apply(this, arguments));
            {
              let d11 = b10.getContext().bind(ak.active(), g10);
              return b10.trace(c10, a11, (a12, b11) => (arguments[f10] = function(a13) {
                return null == b11 || b11(a13), d11.apply(this, arguments);
              }, e10.apply(this, arguments)));
            }
          } : e10;
        }
        startSpan(...a10) {
          let [b10, c10] = a10, d10 = this.getSpanContext((null == c10 ? void 0 : c10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(b10, c10, d10);
        }
        getSpanContext(a10) {
          return a10 ? am.setSpan(ak.active(), a10) : void 0;
        }
        getRootSpanAttributes() {
          let a10 = ak.active().getValue(at);
          return as.get(a10);
        }
        setRootSpanAttribute(a10, b10) {
          let c10 = ak.active().getValue(at), d10 = as.get(c10);
          d10 && d10.set(a10, b10);
        }
      }
      let ax = (() => {
        let a10 = new aw();
        return () => a10;
      })(), ay = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(ay);
      class az {
        constructor(a10, b10, c10, d10) {
          var e10;
          let f10 = a10 && function(a11, b11) {
            let c11 = V.o.from(a11.headers);
            return { isOnDemandRevalidate: c11.get("x-prerender-revalidate") === b11.previewModeId, revalidateOnlyGenerated: c11.has("x-prerender-revalidate-if-generated") };
          }(b10, a10).isOnDemandRevalidate, g10 = null == (e10 = c10.get(ay)) ? void 0 : e10.value;
          this._isEnabled = !!(!f10 && g10 && a10 && g10 === a10.previewModeId), this._previewModeId = null == a10 ? void 0 : a10.previewModeId, this._mutableCookies = d10;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: ay, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: ay, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      function aA(a10, b10) {
        if ("x-middleware-set-cookie" in a10.headers && "string" == typeof a10.headers["x-middleware-set-cookie"]) {
          let c10 = a10.headers["x-middleware-set-cookie"], d10 = new Headers();
          for (let a11 of r(c10)) d10.append("set-cookie", a11);
          for (let a11 of new K.VO(d10).getAll()) b10.set(a11);
        }
      }
      var aB = c(115), aC = c(802), aD = c.n(aC), aE = c(730), aF = c(535);
      class aG {
        constructor(a10, b10) {
          this.cache = /* @__PURE__ */ new Map(), this.sizes = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = a10, this.calculateSize = b10 || (() => 1);
        }
        set(a10, b10) {
          if (!a10 || !b10) return;
          let c10 = this.calculateSize(b10);
          if (c10 > this.maxSize) return void console.warn("Single item size exceeds maxSize");
          this.cache.has(a10) && (this.totalSize -= this.sizes.get(a10) || 0), this.cache.set(a10, b10), this.sizes.set(a10, c10), this.totalSize += c10, this.touch(a10);
        }
        has(a10) {
          return !!a10 && (this.touch(a10), !!this.cache.get(a10));
        }
        get(a10) {
          if (!a10) return;
          let b10 = this.cache.get(a10);
          if (void 0 !== b10) return this.touch(a10), b10;
        }
        touch(a10) {
          let b10 = this.cache.get(a10);
          void 0 !== b10 && (this.cache.delete(a10), this.cache.set(a10, b10), this.evictIfNecessary());
        }
        evictIfNecessary() {
          for (; this.totalSize > this.maxSize && this.cache.size > 0; ) this.evictLeastRecentlyUsed();
        }
        evictLeastRecentlyUsed() {
          let a10 = this.cache.keys().next().value;
          if (void 0 !== a10) {
            let b10 = this.sizes.get(a10) || 0;
            this.totalSize -= b10, this.cache.delete(a10), this.sizes.delete(a10);
          }
        }
        reset() {
          this.cache.clear(), this.sizes.clear(), this.totalSize = 0;
        }
        keys() {
          return [...this.cache.keys()];
        }
        remove(a10) {
          this.cache.has(a10) && (this.totalSize -= this.sizes.get(a10) || 0, this.cache.delete(a10), this.sizes.delete(a10));
        }
        clear() {
          this.cache.clear(), this.sizes.clear(), this.totalSize = 0;
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
      c(356).Buffer, new aG(52428800, (a10) => a10.size), process.env.NEXT_PRIVATE_DEBUG_CACHE && console.debug.bind(console, "DefaultCacheHandler:"), process.env.NEXT_PRIVATE_DEBUG_CACHE && ((a10, ...b10) => {
        console.log(`use-cache: ${a10}`, ...b10);
      }), Symbol.for("@next/cache-handlers");
      let aH = Symbol.for("@next/cache-handlers-map"), aI = Symbol.for("@next/cache-handlers-set"), aJ = globalThis;
      function aK() {
        if (aJ[aH]) return aJ[aH].entries();
      }
      async function aL(a10, b10) {
        if (!a10) return b10();
        let c10 = aM(a10);
        try {
          return await b10();
        } finally {
          let b11 = function(a11, b12) {
            let c11 = new Set(a11.pendingRevalidatedTags), d10 = new Set(a11.pendingRevalidateWrites);
            return { pendingRevalidatedTags: b12.pendingRevalidatedTags.filter((a12) => !c11.has(a12)), pendingRevalidates: Object.fromEntries(Object.entries(b12.pendingRevalidates).filter(([b13]) => !(b13 in a11.pendingRevalidates))), pendingRevalidateWrites: b12.pendingRevalidateWrites.filter((a12) => !d10.has(a12)) };
          }(c10, aM(a10));
          await aO(a10, b11);
        }
      }
      function aM(a10) {
        return { pendingRevalidatedTags: a10.pendingRevalidatedTags ? [...a10.pendingRevalidatedTags] : [], pendingRevalidates: { ...a10.pendingRevalidates }, pendingRevalidateWrites: a10.pendingRevalidateWrites ? [...a10.pendingRevalidateWrites] : [] };
      }
      async function aN(a10, b10) {
        if (0 === a10.length) return;
        let c10 = [];
        b10 && c10.push(b10.revalidateTag(a10));
        let d10 = function() {
          if (aJ[aI]) return aJ[aI].values();
        }();
        if (d10) for (let b11 of d10) c10.push(b11.expireTags(...a10));
        await Promise.all(c10);
      }
      async function aO(a10, b10) {
        let c10 = (null == b10 ? void 0 : b10.pendingRevalidatedTags) ?? a10.pendingRevalidatedTags ?? [], d10 = (null == b10 ? void 0 : b10.pendingRevalidates) ?? a10.pendingRevalidates ?? {}, e10 = (null == b10 ? void 0 : b10.pendingRevalidateWrites) ?? a10.pendingRevalidateWrites ?? [];
        return Promise.all([aN(c10, a10.incrementalCache), ...Object.values(d10), ...e10]);
      }
      var aP = c(620), aQ = c(427);
      class aR {
        constructor({ waitUntil: a10, onClose: b10, onTaskError: c10 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = a10, this.onClose = b10, this.onTaskError = c10, this.callbackQueue = new (aD())(), this.callbackQueue.pause();
        }
        after(a10) {
          if (aj(a10)) this.waitUntil || aS(), this.waitUntil(a10.catch((a11) => this.reportTaskError("promise", a11)));
          else if ("function" == typeof a10) this.addCallback(a10);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addCallback(a10) {
          this.waitUntil || aS();
          let b10 = aB.FP.getStore();
          b10 && this.workUnitStores.add(b10);
          let c10 = aQ.Z.getStore(), d10 = c10 ? c10.rootTaskSpawnPhase : null == b10 ? void 0 : b10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let e10 = (0, aP.cg)(async () => {
            try {
              await aQ.Z.run({ rootTaskSpawnPhase: d10 }, () => a10());
            } catch (a11) {
              this.reportTaskError("function", a11);
            }
          });
          this.callbackQueue.add(e10);
        }
        async runCallbacksOnClose() {
          return await new Promise((a10) => this.onClose(a10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let a11 of this.workUnitStores) a11.phase = "after";
          let a10 = aF.J.getStore();
          if (!a10) throw Object.defineProperty(new aE.z("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return aL(a10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(a10, b10) {
          if (console.error("promise" === a10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", b10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, b10);
          } catch (a11) {
            console.error(Object.defineProperty(new aE.z("`onTaskError` threw while handling an error thrown from an `after` task", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function aS() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      function aT(a10) {
        let b10, c10 = { then: (d10, e10) => (b10 || (b10 = a10()), b10.then((a11) => {
          c10.value = a11;
        }).catch(() => {
        }), b10.then(d10, e10)) };
        return c10;
      }
      class aU {
        onClose(a10) {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot subscribe to a closed CloseController"), "__NEXT_ERROR_CODE", { value: "E365", enumerable: false, configurable: true });
          this.target.addEventListener("close", a10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot close a CloseController multiple times"), "__NEXT_ERROR_CODE", { value: "E229", enumerable: false, configurable: true });
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      function aV() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let aW = Symbol.for("@next/request-context");
      async function aX(a10, b10, c10) {
        let d10 = [], e10 = c10 && c10.size > 0;
        for (let b11 of ((a11) => {
          let b12 = ["/layout"];
          if (a11.startsWith("/")) {
            let c11 = a11.split("/");
            for (let a12 = 1; a12 < c11.length + 1; a12++) {
              let d11 = c11.slice(0, a12).join("/");
              d11 && (d11.endsWith("/page") || d11.endsWith("/route") || (d11 = `${d11}${!d11.endsWith("/") ? "/" : ""}layout`), b12.push(d11));
            }
          }
          return b12;
        })(a10)) b11 = `${p}${b11}`, d10.push(b11);
        if (b10.pathname && !e10) {
          let a11 = `${p}${b10.pathname}`;
          d10.push(a11);
        }
        return { tags: d10, expirationsByCacheKind: function(a11) {
          let b11 = /* @__PURE__ */ new Map(), c11 = aK();
          if (c11) for (let [d11, e11] of c11) "getExpiration" in e11 && b11.set(d11, aT(async () => e11.getExpiration(...a11)));
          return b11;
        }(d10) };
      }
      class aY extends M {
        constructor(a10) {
          super(a10.input, a10.init), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new m({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new m({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new m({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let aZ = { keys: (a10) => Array.from(a10.keys()), get: (a10, b10) => a10.get(b10) ?? void 0 }, a$ = (a10, b10) => ax().withPropagatedContext(a10.headers, b10, aZ), a_ = false;
      async function a0(a10) {
        var b10;
        let d10, e10;
        if (!a_ && (a_ = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
          let { interceptTestApis: a11, wrapRequestHandler: b11 } = c(905);
          a11(), a$ = b11(a$);
        }
        await k();
        let f10 = void 0 !== globalThis.__BUILD_MANIFEST;
        a10.request.url = a10.request.url.replace(/\.rsc($|\?)/, "$1");
        let g10 = a10.bypassNextUrl ? new URL(a10.request.url) : new J(a10.request.url, { headers: a10.request.headers, nextConfig: a10.request.nextConfig });
        for (let a11 of [...g10.searchParams.keys()]) {
          let b11 = g10.searchParams.getAll(a11), c10 = function(a12) {
            for (let b12 of ["nxtP", "nxtI"]) if (a12 !== b12 && a12.startsWith(b12)) return a12.substring(b12.length);
            return null;
          }(a11);
          if (c10) {
            for (let a12 of (g10.searchParams.delete(c10), b11)) g10.searchParams.append(c10, a12);
            g10.searchParams.delete(a11);
          }
        }
        let h2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in g10 && (h2 = g10.buildId || "", g10.buildId = "");
        let i2 = function(a11) {
          let b11 = new Headers();
          for (let [c10, d11] of Object.entries(a11)) for (let a12 of Array.isArray(d11) ? d11 : [d11]) void 0 !== a12 && ("number" == typeof a12 && (a12 = a12.toString()), b11.append(c10, a12));
          return b11;
        }(a10.request.headers), j2 = i2.has("x-nextjs-data"), l2 = "1" === i2.get("RSC");
        j2 && "/index" === g10.pathname && (g10.pathname = "/");
        let m2 = /* @__PURE__ */ new Map();
        if (!f10) for (let a11 of U) {
          let b11 = a11.toLowerCase(), c10 = i2.get(b11);
          null !== c10 && (m2.set(b11, c10), i2.delete(b11));
        }
        let n2 = new aY({ page: a10.page, input: function(a11) {
          let b11 = "string" == typeof a11, c10 = b11 ? new URL(a11) : a11;
          return c10.searchParams.delete("_rsc"), b11 ? c10.toString() : c10;
        }(g10).toString(), init: { body: a10.request.body, headers: i2, method: a10.request.method, nextConfig: a10.request.nextConfig, signal: a10.request.signal } });
        j2 && Object.defineProperty(n2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && a10.IncrementalCache && (globalThis.__incrementalCache = new a10.IncrementalCache({ CurCacheHandler: a10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: a10.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: aV() }) }));
        let o2 = a10.request.waitUntil ?? (null == (b10 = function() {
          let a11 = globalThis[aW];
          return null == a11 ? void 0 : a11.get();
        }()) ? void 0 : b10.waitUntil), p2 = new y({ request: n2, page: a10.page, context: o2 ? { waitUntil: o2 } : void 0 });
        if ((d10 = await a$(n2, () => {
          if ("/middleware" === a10.page || "/src/middleware" === a10.page) {
            let b11 = p2.waitUntil.bind(p2), c10 = new aU();
            return ax().trace(ag.execute, { spanName: `middleware ${n2.method} ${n2.nextUrl.pathname}`, attributes: { "http.target": n2.nextUrl.pathname, "http.method": n2.method } }, async () => {
              try {
                var d11, f11, g11, i3, j3, k2;
                let l3 = aV(), m3 = await aX("/", n2.nextUrl, null), o3 = (j3 = n2.nextUrl, k2 = (a11) => {
                  e10 = a11;
                }, function(a11, b12, c11, d12, e11, f12, g12, h3, i4, j4, k3) {
                  function l4(a12) {
                    c11 && c11.setHeader("Set-Cookie", a12);
                  }
                  let m4 = {};
                  return { type: "request", phase: a11, implicitTags: f12, url: { pathname: d12.pathname, search: d12.search ?? "" }, rootParams: e11, get headers() {
                    return m4.headers || (m4.headers = function(a12) {
                      let b13 = V.o.from(a12);
                      for (let a13 of U) b13.delete(a13.toLowerCase());
                      return V.o.seal(b13);
                    }(b12.headers)), m4.headers;
                  }, get cookies() {
                    if (!m4.cookies) {
                      let a12 = new K.tm(V.o.from(b12.headers));
                      aA(b12, a12), m4.cookies = W.Ck.seal(a12);
                    }
                    return m4.cookies;
                  }, set cookies(value) {
                    m4.cookies = value;
                  }, get mutableCookies() {
                    if (!m4.mutableCookies) {
                      let a12 = function(a13, b13) {
                        let c12 = new K.tm(V.o.from(a13));
                        return W.K8.wrap(c12, b13);
                      }(b12.headers, g12 || (c11 ? l4 : void 0));
                      aA(b12, a12), m4.mutableCookies = a12;
                    }
                    return m4.mutableCookies;
                  }, get userspaceMutableCookies() {
                    return m4.userspaceMutableCookies || (m4.userspaceMutableCookies = (0, W.hm)(this.mutableCookies)), m4.userspaceMutableCookies;
                  }, get draftMode() {
                    return m4.draftMode || (m4.draftMode = new az(i4, b12, this.cookies, this.mutableCookies)), m4.draftMode;
                  }, renderResumeDataCache: h3 ?? null, isHmrRefresh: j4, serverComponentsHmrCache: k3 || globalThis.__serverComponentsHmrCache };
                }("action", n2, void 0, j3, {}, m3, k2, void 0, l3, false, void 0)), q3 = function({ page: a11, fallbackRouteParams: b12, renderOpts: c11, requestEndedState: d12, isPrefetchRequest: e11, buildId: f12, previouslyRevalidatedTags: g12 }) {
                  var h3;
                  let i4 = { isStaticGeneration: !c11.shouldWaitOnAllReady && !c11.supportsDynamicResponse && !c11.isDraftMode && !c11.isPossibleServerAction, page: a11, fallbackRouteParams: b12, route: (h3 = a11.split("/").reduce((a12, b13, c12, d13) => b13 ? "(" === b13[0] && b13.endsWith(")") || "@" === b13[0] || ("page" === b13 || "route" === b13) && c12 === d13.length - 1 ? a12 : a12 + "/" + b13 : a12, "")).startsWith("/") ? h3 : "/" + h3, incrementalCache: c11.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: c11.cacheLifeProfiles, isRevalidate: c11.isRevalidate, isBuildTimePrerendering: c11.nextExport, hasReadableErrorStacks: c11.hasReadableErrorStacks, fetchCache: c11.fetchCache, isOnDemandRevalidate: c11.isOnDemandRevalidate, isDraftMode: c11.isDraftMode, requestEndedState: d12, isPrefetchRequest: e11, buildId: f12, reactLoadableManifest: (null == c11 ? void 0 : c11.reactLoadableManifest) || {}, assetPrefix: (null == c11 ? void 0 : c11.assetPrefix) || "", afterContext: function(a12) {
                    let { waitUntil: b13, onClose: c12, onAfterTaskError: d13 } = a12;
                    return new aR({ waitUntil: b13, onClose: c12, onTaskError: d13 });
                  }(c11), dynamicIOEnabled: c11.experimental.dynamicIO, dev: c11.dev ?? false, previouslyRevalidatedTags: g12, refreshTagsByCacheKind: function() {
                    let a12 = /* @__PURE__ */ new Map(), b13 = aK();
                    if (b13) for (let [c12, d13] of b13) "refreshTags" in d13 && a12.set(c12, aT(async () => d13.refreshTags()));
                    return a12;
                  }(), runInCleanSnapshot: (0, aP.$p)() };
                  return c11.store = i4, i4;
                }({ page: "/", fallbackRouteParams: null, renderOpts: { cacheLifeProfiles: null == (f11 = a10.request.nextConfig) || null == (d11 = f11.experimental) ? void 0 : d11.cacheLife, experimental: { isRoutePPREnabled: false, dynamicIO: false, authInterrupts: !!(null == (i3 = a10.request.nextConfig) || null == (g11 = i3.experimental) ? void 0 : g11.authInterrupts) }, supportsDynamicResponse: true, waitUntil: b11, onClose: c10.onClose.bind(c10), onAfterTaskError: void 0 }, requestEndedState: { ended: false }, isPrefetchRequest: n2.headers.has(T), buildId: h2 ?? "", previouslyRevalidatedTags: [] });
                return await aF.J.run(q3, () => aB.FP.run(o3, a10.handler, n2, p2));
              } finally {
                setTimeout(() => {
                  c10.dispatchClose();
                }, 0);
              }
            });
          }
          return a10.handler(n2, p2);
        })) && !(d10 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        d10 && e10 && d10.headers.set("set-cookie", e10);
        let q2 = null == d10 ? void 0 : d10.headers.get("x-middleware-rewrite");
        if (d10 && q2 && (l2 || !f10)) {
          let b11 = new J(q2, { forceLocale: true, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          f10 || b11.host !== n2.nextUrl.host || (b11.buildId = h2 || b11.buildId, d10.headers.set("x-middleware-rewrite", String(b11)));
          let { url: c10, isRelative: e11 } = S(b11.toString(), g10.toString());
          !f10 && j2 && d10.headers.set("x-nextjs-rewrite", c10), l2 && e11 && (g10.pathname !== b11.pathname && d10.headers.set("x-nextjs-rewritten-path", b11.pathname), g10.search !== b11.search && d10.headers.set("x-nextjs-rewritten-query", b11.search.slice(1)));
        }
        let r2 = null == d10 ? void 0 : d10.headers.get("Location");
        if (d10 && r2 && !f10) {
          let b11 = new J(r2, { forceLocale: false, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          d10 = new Response(d10.body, d10), b11.host === g10.host && (b11.buildId = h2 || b11.buildId, d10.headers.set("Location", b11.toString())), j2 && (d10.headers.delete("Location"), d10.headers.set("x-nextjs-redirect", S(b11.toString(), g10.toString()).url));
        }
        let s2 = d10 || R.next(), t2 = s2.headers.get("x-middleware-override-headers"), u2 = [];
        if (t2) {
          for (let [a11, b11] of m2) s2.headers.set(`x-middleware-request-${a11}`, b11), u2.push(a11);
          u2.length > 0 && s2.headers.set("x-middleware-override-headers", t2 + "," + u2.join(","));
        }
        return { response: s2, waitUntil: ("internal" === p2[w].kind ? Promise.all(p2[w].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: n2.fetchMetrics };
      }
      function a1(a10) {
        return a10.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
      }
      function a2(a10) {
        return a10 && a10.sensitive ? "" : "i";
      }
      function a3(a10, b10, c10) {
        var d10;
        return a10 instanceof RegExp ? function(a11, b11) {
          if (!b11) return a11;
          for (var c11 = /\((?:\?<(.*?)>)?(?!\?)/g, d11 = 0, e10 = c11.exec(a11.source); e10; ) b11.push({ name: e10[1] || d11++, prefix: "", suffix: "", modifier: "", pattern: "" }), e10 = c11.exec(a11.source);
          return a11;
        }(a10, b10) : Array.isArray(a10) ? (d10 = a10.map(function(a11) {
          return a3(a11, b10, c10).source;
        }), new RegExp("(?:".concat(d10.join("|"), ")"), a2(c10))) : function(a11, b11, c11) {
          void 0 === c11 && (c11 = {});
          for (var d11 = c11.strict, e10 = void 0 !== d11 && d11, f10 = c11.start, g10 = c11.end, h2 = c11.encode, i2 = void 0 === h2 ? function(a12) {
            return a12;
          } : h2, j2 = c11.delimiter, k2 = c11.endsWith, l2 = "[".concat(a1(void 0 === k2 ? "" : k2), "]|$"), m2 = "[".concat(a1(void 0 === j2 ? "/#?" : j2), "]"), n2 = void 0 === f10 || f10 ? "^" : "", o2 = 0; o2 < a11.length; o2++) {
            var p2 = a11[o2];
            if ("string" == typeof p2) n2 += a1(i2(p2));
            else {
              var q2 = a1(i2(p2.prefix)), r2 = a1(i2(p2.suffix));
              if (p2.pattern) if (b11 && b11.push(p2), q2 || r2) if ("+" === p2.modifier || "*" === p2.modifier) {
                var s2 = "*" === p2.modifier ? "?" : "";
                n2 += "(?:".concat(q2, "((?:").concat(p2.pattern, ")(?:").concat(r2).concat(q2, "(?:").concat(p2.pattern, "))*)").concat(r2, ")").concat(s2);
              } else n2 += "(?:".concat(q2, "(").concat(p2.pattern, ")").concat(r2, ")").concat(p2.modifier);
              else {
                if ("+" === p2.modifier || "*" === p2.modifier) throw TypeError('Can not repeat "'.concat(p2.name, '" without a prefix and suffix'));
                n2 += "(".concat(p2.pattern, ")").concat(p2.modifier);
              }
              else n2 += "(?:".concat(q2).concat(r2, ")").concat(p2.modifier);
            }
          }
          if (void 0 === g10 || g10) e10 || (n2 += "".concat(m2, "?")), n2 += c11.endsWith ? "(?=".concat(l2, ")") : "$";
          else {
            var t2 = a11[a11.length - 1], u2 = "string" == typeof t2 ? m2.indexOf(t2[t2.length - 1]) > -1 : void 0 === t2;
            e10 || (n2 += "(?:".concat(m2, "(?=").concat(l2, "))?")), u2 || (n2 += "(?=".concat(m2, "|").concat(l2, ")"));
          }
          return new RegExp(n2, a2(c11));
        }(function(a11, b11) {
          void 0 === b11 && (b11 = {});
          for (var c11 = function(a12) {
            for (var b12 = [], c12 = 0; c12 < a12.length; ) {
              var d12 = a12[c12];
              if ("*" === d12 || "+" === d12 || "?" === d12) {
                b12.push({ type: "MODIFIER", index: c12, value: a12[c12++] });
                continue;
              }
              if ("\\" === d12) {
                b12.push({ type: "ESCAPED_CHAR", index: c12++, value: a12[c12++] });
                continue;
              }
              if ("{" === d12) {
                b12.push({ type: "OPEN", index: c12, value: a12[c12++] });
                continue;
              }
              if ("}" === d12) {
                b12.push({ type: "CLOSE", index: c12, value: a12[c12++] });
                continue;
              }
              if (":" === d12) {
                for (var e11 = "", f11 = c12 + 1; f11 < a12.length; ) {
                  var g11 = a12.charCodeAt(f11);
                  if (g11 >= 48 && g11 <= 57 || g11 >= 65 && g11 <= 90 || g11 >= 97 && g11 <= 122 || 95 === g11) {
                    e11 += a12[f11++];
                    continue;
                  }
                  break;
                }
                if (!e11) throw TypeError("Missing parameter name at ".concat(c12));
                b12.push({ type: "NAME", index: c12, value: e11 }), c12 = f11;
                continue;
              }
              if ("(" === d12) {
                var h3 = 1, i3 = "", f11 = c12 + 1;
                if ("?" === a12[f11]) throw TypeError('Pattern cannot start with "?" at '.concat(f11));
                for (; f11 < a12.length; ) {
                  if ("\\" === a12[f11]) {
                    i3 += a12[f11++] + a12[f11++];
                    continue;
                  }
                  if (")" === a12[f11]) {
                    if (0 == --h3) {
                      f11++;
                      break;
                    }
                  } else if ("(" === a12[f11] && (h3++, "?" !== a12[f11 + 1])) throw TypeError("Capturing groups are not allowed at ".concat(f11));
                  i3 += a12[f11++];
                }
                if (h3) throw TypeError("Unbalanced pattern at ".concat(c12));
                if (!i3) throw TypeError("Missing pattern at ".concat(c12));
                b12.push({ type: "PATTERN", index: c12, value: i3 }), c12 = f11;
                continue;
              }
              b12.push({ type: "CHAR", index: c12, value: a12[c12++] });
            }
            return b12.push({ type: "END", index: c12, value: "" }), b12;
          }(a11), d11 = b11.prefixes, e10 = void 0 === d11 ? "./" : d11, f10 = b11.delimiter, g10 = void 0 === f10 ? "/#?" : f10, h2 = [], i2 = 0, j2 = 0, k2 = "", l2 = function(a12) {
            if (j2 < c11.length && c11[j2].type === a12) return c11[j2++].value;
          }, m2 = function(a12) {
            var b12 = l2(a12);
            if (void 0 !== b12) return b12;
            var d12 = c11[j2], e11 = d12.type, f11 = d12.index;
            throw TypeError("Unexpected ".concat(e11, " at ").concat(f11, ", expected ").concat(a12));
          }, n2 = function() {
            for (var a12, b12 = ""; a12 = l2("CHAR") || l2("ESCAPED_CHAR"); ) b12 += a12;
            return b12;
          }, o2 = function(a12) {
            for (var b12 = 0; b12 < g10.length; b12++) {
              var c12 = g10[b12];
              if (a12.indexOf(c12) > -1) return true;
            }
            return false;
          }, p2 = function(a12) {
            var b12 = h2[h2.length - 1], c12 = a12 || (b12 && "string" == typeof b12 ? b12 : "");
            if (b12 && !c12) throw TypeError('Must have text between two parameters, missing text after "'.concat(b12.name, '"'));
            return !c12 || o2(c12) ? "[^".concat(a1(g10), "]+?") : "(?:(?!".concat(a1(c12), ")[^").concat(a1(g10), "])+?");
          }; j2 < c11.length; ) {
            var q2 = l2("CHAR"), r2 = l2("NAME"), s2 = l2("PATTERN");
            if (r2 || s2) {
              var t2 = q2 || "";
              -1 === e10.indexOf(t2) && (k2 += t2, t2 = ""), k2 && (h2.push(k2), k2 = ""), h2.push({ name: r2 || i2++, prefix: t2, suffix: "", pattern: s2 || p2(t2), modifier: l2("MODIFIER") || "" });
              continue;
            }
            var u2 = q2 || l2("ESCAPED_CHAR");
            if (u2) {
              k2 += u2;
              continue;
            }
            if (k2 && (h2.push(k2), k2 = ""), l2("OPEN")) {
              var t2 = n2(), v2 = l2("NAME") || "", w2 = l2("PATTERN") || "", x2 = n2();
              m2("CLOSE"), h2.push({ name: v2 || (w2 ? i2++ : ""), pattern: v2 && !w2 ? p2(t2) : w2, prefix: t2, suffix: x2, modifier: l2("MODIFIER") || "" });
              continue;
            }
            m2("END");
          }
          return h2;
        }(a10, c10), b10, c10);
      }
      let a4 = () => {
        try {
          return true;
        } catch {
        }
        return false;
      }, a5 = /* @__PURE__ */ new Set(), a6 = (a10, b10, c10) => {
        let d10 = a4(), e10 = c10 ?? a10;
        a5.has(e10) || d10 || (a5.add(e10), console.warn(`Clerk - DEPRECATION WARNING: "${a10}" is deprecated and will be removed in the next major release.
${b10}`));
      }, a7 = [".lcl.dev", ".lclstage.dev", ".lclclerk.com"], a8 = [".accounts.dev", ".accountsstage.dev", ".accounts.lclclerk.com"], a9 = [".lcl.dev", ".stg.dev", ".lclstage.dev", ".stgstage.dev", ".dev.lclclerk.com", ".stg.lclclerk.com", ".accounts.lclclerk.com", "accountsstage.dev", "accounts.dev"], ba = [".lcl.dev", "lclstage.dev", ".lclclerk.com", ".accounts.lclclerk.com"], bb = [".accountsstage.dev"], bc = "https://api.clerk.com", bd = (a10) => "undefined" != typeof atob && "function" == typeof atob ? atob(a10) : "undefined" != typeof global && global.Buffer ? new global.Buffer(a10, "base64").toString() : a10, be = "pk_live_";
      function bf(a10) {
        if (!a10.endsWith("$")) return false;
        let b10 = a10.slice(0, -1);
        return !b10.includes("$") && b10.includes(".");
      }
      function bg(a10, b10 = {}) {
        let c10;
        if (!(a10 = a10 || "") || !bh(a10)) {
          if (b10.fatal && !a10) throw Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");
          if (b10.fatal && !bh(a10)) throw Error("Publishable key not valid.");
          return null;
        }
        let d10 = a10.startsWith(be) ? "production" : "development";
        try {
          c10 = bd(a10.split("_")[2]);
        } catch {
          if (b10.fatal) throw Error("Publishable key not valid: Failed to decode key.");
          return null;
        }
        if (!bf(c10)) {
          if (b10.fatal) throw Error("Publishable key not valid: Decoded key has invalid format.");
          return null;
        }
        let e10 = c10.slice(0, -1);
        return b10.proxyUrl ? e10 = b10.proxyUrl : "development" !== d10 && b10.domain && b10.isSatellite && (e10 = `clerk.${b10.domain}`), { instanceType: d10, frontendApi: e10 };
      }
      function bh(a10 = "") {
        try {
          if (!(a10.startsWith(be) || a10.startsWith("pk_test_"))) return false;
          let b10 = a10.split("_");
          if (3 !== b10.length) return false;
          let c10 = b10[2];
          if (!c10) return false;
          return bf(bd(c10));
        } catch {
          return false;
        }
      }
      function bi(a10) {
        return a10.startsWith("test_") || a10.startsWith("sk_test_");
      }
      async function bj(a10, b10 = globalThis.crypto.subtle) {
        var c10;
        let d10 = new TextEncoder().encode(a10);
        return (c10 = String.fromCharCode(...new Uint8Array(await b10.digest("sha-1", d10))), "undefined" != typeof btoa && "function" == typeof btoa ? btoa(c10) : "undefined" != typeof global && global.Buffer ? new global.Buffer(c10).toString("base64") : c10).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
      }
      let bk = { initialDelay: 125, maxDelayBetweenRetries: 0, factor: 2, shouldRetry: (a10, b10) => b10 < 5, retryImmediately: false, jitter: true }, bl = async (a10) => new Promise((b10) => setTimeout(b10, a10)), bm = (a10, b10) => b10 ? a10 * (1 + Math.random()) : a10, bn = async (a10, b10 = {}) => {
        let c10 = 0, { shouldRetry: d10, initialDelay: e10, maxDelayBetweenRetries: f10, factor: g10, retryImmediately: h2, jitter: i2, onBeforeRetry: j2 } = { ...bk, ...b10 }, k2 = /* @__PURE__ */ ((a11) => {
          let b11 = 0;
          return async () => {
            await bl((() => {
              let c11 = a11.initialDelay * Math.pow(a11.factor, b11);
              return c11 = bm(c11, a11.jitter), Math.min(a11.maxDelayBetweenRetries || c11, c11);
            })()), b11++;
          };
        })({ initialDelay: e10, maxDelayBetweenRetries: f10, factor: g10, jitter: i2 });
        for (; ; ) try {
          return await a10();
        } catch (a11) {
          if (!d10(a11, ++c10)) throw a11;
          j2 && await j2(c10), h2 && 1 === c10 ? await bl(bm(100, i2)) : await k2();
        }
      };
      function bo(a10) {
        return function(b10) {
          let c10 = b10 ?? this;
          if (!c10) throw TypeError(`${a10.kind || a10.name} type guard requires an error object`);
          return !!a10.kind && "object" == typeof c10 && null !== c10 && "constructor" in c10 && c10.constructor?.kind === a10.kind || c10 instanceof a10;
        };
      }
      var bp = class {
        static kind = "ClerkApiError";
        code;
        message;
        longMessage;
        meta;
        constructor(a10) {
          let b10 = { code: a10.code, message: a10.message, longMessage: a10.long_message, meta: { paramName: a10.meta?.param_name, sessionId: a10.meta?.session_id, emailAddresses: a10.meta?.email_addresses, identifiers: a10.meta?.identifiers, zxcvbn: a10.meta?.zxcvbn, plan: a10.meta?.plan, isPlanUpgradePossible: a10.meta?.is_plan_upgrade_possible } };
          this.code = b10.code, this.message = b10.message, this.longMessage = b10.longMessage, this.meta = b10.meta;
        }
      };
      function bq(a10) {
        return new bp(a10);
      }
      bo(bp);
      var br = class a10 extends Error {
        static kind = "ClerkError";
        clerkError = true;
        code;
        longMessage;
        docsUrl;
        cause;
        get name() {
          return this.constructor.name;
        }
        constructor(b10) {
          super(new.target.formatMessage(new.target.kind, b10.message, b10.code, b10.docsUrl), { cause: b10.cause }), Object.setPrototypeOf(this, a10.prototype), this.code = b10.code, this.docsUrl = b10.docsUrl, this.longMessage = b10.longMessage, this.cause = b10.cause;
        }
        toString() {
          return `[${this.name}]
Message:${this.message}`;
        }
        static formatMessage(a11, b10, c10, d10) {
          let e10 = "Clerk:", f10 = RegExp(e10.replace(" ", "\\s*"), "i");
          return b10 = b10.replace(f10, ""), b10 = `${e10} ${b10.trim()}

(code="${c10}")

`, d10 && (b10 += `

Docs: ${d10}`), b10;
        }
      }, bs = class a10 extends br {
        static kind = "ClerkAPIResponseError";
        status;
        clerkTraceId;
        retryAfter;
        errors;
        constructor(b10, c10) {
          let { data: d10, status: e10, clerkTraceId: f10, retryAfter: g10 } = c10;
          super({ ...c10, message: b10, code: "api_response_error" }), Object.setPrototypeOf(this, a10.prototype), this.status = e10, this.clerkTraceId = f10, this.retryAfter = g10, this.errors = (d10 || []).map((a11) => new bp(a11));
        }
        toString() {
          let a11 = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map((a12) => JSON.stringify(a12))}`;
          return this.clerkTraceId && (a11 += `
Clerk Trace ID: ${this.clerkTraceId}`), a11;
        }
        static formatMessage(a11, b10, c10, d10) {
          return b10;
        }
      };
      let bt = bo(bs), bu = Object.freeze({ InvalidProxyUrlErrorMessage: "The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})", InvalidPublishableKeyErrorMessage: "The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})", MissingPublishableKeyErrorMessage: "Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.", MissingSecretKeyErrorMessage: "Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.", MissingClerkProvider: "{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider" });
      function bv({ packageName: a10, customMessages: b10 }) {
        let c10 = a10;
        function d10(a11, b11) {
          if (!b11) return `${c10}: ${a11}`;
          let d11 = a11;
          for (let c11 of a11.matchAll(/{{([a-zA-Z0-9-_]+)}}/g)) {
            let a12 = (b11[c11[1]] || "").toString();
            d11 = d11.replace(`{{${c11[1]}}}`, a12);
          }
          return `${c10}: ${d11}`;
        }
        let e10 = { ...bu, ...b10 };
        return { setPackageName({ packageName: a11 }) {
          return "string" == typeof a11 && (c10 = a11), this;
        }, setMessages({ customMessages: a11 }) {
          return Object.assign(e10, a11 || {}), this;
        }, throwInvalidPublishableKeyError(a11) {
          throw Error(d10(e10.InvalidPublishableKeyErrorMessage, a11));
        }, throwInvalidProxyUrl(a11) {
          throw Error(d10(e10.InvalidProxyUrlErrorMessage, a11));
        }, throwMissingPublishableKeyError() {
          throw Error(d10(e10.MissingPublishableKeyErrorMessage));
        }, throwMissingSecretKeyError() {
          throw Error(d10(e10.MissingSecretKeyErrorMessage));
        }, throwMissingClerkProviderError(a11) {
          throw Error(d10(e10.MissingClerkProvider, a11));
        }, throw(a11) {
          throw Error(d10(a11));
        } };
      }
      bo(class a10 extends br {
        static kind = "ClerkRuntimeError";
        clerkRuntimeError = true;
        constructor(b10, c10) {
          super({ ...c10, message: b10 }), Object.setPrototypeOf(this, a10.prototype);
        }
      });
      var bw = bv({ packageName: "@clerk/backend" }), { isDevOrStagingUrl: bx } = /* @__PURE__ */ function() {
        let a10 = /* @__PURE__ */ new Map();
        return { isDevOrStagingUrl: (b10) => {
          if (!b10) return false;
          let c10 = "string" == typeof b10 ? b10 : b10.hostname, d10 = a10.get(c10);
          return void 0 === d10 && (d10 = a9.some((a11) => c10.endsWith(a11)), a10.set(c10, d10)), d10;
        } };
      }(), by = { InvalidSecretKey: "clerk_key_invalid" }, bz = { TokenExpired: "token-expired", TokenInvalid: "token-invalid", TokenInvalidAlgorithm: "token-invalid-algorithm", TokenInvalidAuthorizedParties: "token-invalid-authorized-parties", TokenInvalidSignature: "token-invalid-signature", TokenNotActiveYet: "token-not-active-yet", TokenIatInTheFuture: "token-iat-in-the-future", TokenVerificationFailed: "token-verification-failed", InvalidSecretKey: "secret-key-invalid", LocalJWKMissing: "jwk-local-missing", RemoteJWKFailedToLoad: "jwk-remote-failed-to-load", JWKFailedToResolve: "jwk-failed-to-resolve", JWKKidMismatch: "jwk-kid-mismatch" }, bA = { ContactSupport: "Contact support@clerk.com", EnsureClerkJWT: "Make sure that this is a valid Clerk-generated JWT.", SetClerkJWTKey: "Set the CLERK_JWT_KEY environment variable.", SetClerkSecretKey: "Set the CLERK_SECRET_KEY environment variable." }, bB = class a10 extends Error {
        constructor({ action: b10, message: c10, reason: d10 }) {
          super(c10), Object.setPrototypeOf(this, a10.prototype), this.reason = d10, this.message = c10, this.action = b10;
        }
        getFullMessage() {
          return `${[this.message, this.action].filter((a11) => a11).join(" ")} (reason=${this.reason}, token-carrier=${this.tokenCarrier})`;
        }
      }, bC = { TokenInvalid: "token-invalid", InvalidSecretKey: "secret-key-invalid", UnexpectedError: "unexpected-error", TokenVerificationFailed: "token-verification-failed" }, bD = class a10 extends Error {
        constructor({ message: b10, code: c10, status: d10, action: e10 }) {
          super(b10), Object.setPrototypeOf(this, a10.prototype), this.code = c10, this.status = d10, this.action = e10;
        }
        getFullMessage() {
          return `${this.message} (code=${this.code}, status=${this.status || "n/a"})`;
        }
      };
      let bE = crypto;
      var bF = fetch.bind(globalThis), bG = { crypto: bE, get fetch() {
        return bF;
      }, AbortController: globalThis.AbortController, Blob: globalThis.Blob, FormData: globalThis.FormData, Headers: globalThis.Headers, Request: globalThis.Request, Response: globalThis.Response }, bH = { parse: (a10, b10) => function(a11, b11, c10 = {}) {
        if (!b11.codes) {
          b11.codes = {};
          for (let a12 = 0; a12 < b11.chars.length; ++a12) b11.codes[b11.chars[a12]] = a12;
        }
        if (!c10.loose && a11.length * b11.bits & 7) throw SyntaxError("Invalid padding");
        let d10 = a11.length;
        for (; "=" === a11[d10 - 1]; ) if (--d10, !c10.loose && !((a11.length - d10) * b11.bits & 7)) throw SyntaxError("Invalid padding");
        let e10 = new (c10.out ?? Uint8Array)(d10 * b11.bits / 8 | 0), f10 = 0, g10 = 0, h2 = 0;
        for (let c11 = 0; c11 < d10; ++c11) {
          let d11 = b11.codes[a11[c11]];
          if (void 0 === d11) throw SyntaxError("Invalid character " + a11[c11]);
          g10 = g10 << b11.bits | d11, (f10 += b11.bits) >= 8 && (f10 -= 8, e10[h2++] = 255 & g10 >> f10);
        }
        if (f10 >= b11.bits || 255 & g10 << 8 - f10) throw SyntaxError("Unexpected end of data");
        return e10;
      }(a10, bI, b10) }, bI = { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_", bits: 6 }, bJ = { RS256: "SHA-256", RS384: "SHA-384", RS512: "SHA-512" }, bK = "RSASSA-PKCS1-v1_5", bL = { RS256: bK, RS384: bK, RS512: bK }, bM = Object.keys(bJ), bN = (a10, b10 = "JWT") => {
        if (void 0 === a10) return;
        let c10 = Array.isArray(b10) ? b10 : [b10];
        if (!c10.includes(a10)) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenInvalid, message: `Invalid JWT type ${JSON.stringify(a10)}. Expected "${c10.join(", ")}".` });
      }, bO = (a10) => {
        if (!bM.includes(a10)) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenInvalidAlgorithm, message: `Invalid JWT algorithm ${JSON.stringify(a10)}. Supported: ${bM}.` });
      };
      async function bP(a10, b10) {
        let { header: c10, signature: d10, raw: e10 } = a10, f10 = new TextEncoder().encode([e10.header, e10.payload].join(".")), g10 = function(a11) {
          let b11 = bJ[a11], c11 = bL[a11];
          if (!b11 || !c11) throw Error(`Unsupported algorithm ${a11}, expected one of ${bM.join(",")}.`);
          return { hash: { name: bJ[a11] }, name: bL[a11] };
        }(c10.alg);
        try {
          let a11 = await function(a12, b11, c11) {
            if ("object" == typeof a12) return bG.crypto.subtle.importKey("jwk", a12, b11, false, [c11]);
            let d11 = function(a13) {
              let b12 = bd(a13.replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "").replace(/\s/g, "")), c12 = new Uint8Array(new ArrayBuffer(b12.length));
              for (let a14 = 0, d12 = b12.length; a14 < d12; a14++) c12[a14] = b12.charCodeAt(a14);
              return c12;
            }(a12), e11 = "sign" === c11 ? "pkcs8" : "spki";
            return bG.crypto.subtle.importKey(e11, d11, b11, false, [c11]);
          }(b10, g10, "verify");
          return { data: await bG.crypto.subtle.verify(g10.name, a11, d10, f10) };
        } catch (a11) {
          return { errors: [new bB({ reason: bz.TokenInvalidSignature, message: a11?.message })] };
        }
      }
      function bQ(a10) {
        let b10 = (a10 || "").toString().split(".");
        if (3 !== b10.length) return { errors: [new bB({ reason: bz.TokenInvalid, message: "Invalid JWT form. A JWT consists of three parts separated by dots." })] };
        let [c10, d10, e10] = b10, f10 = new TextDecoder(), g10 = JSON.parse(f10.decode(bH.parse(c10, { loose: true }))), h2 = JSON.parse(f10.decode(bH.parse(d10, { loose: true })));
        return { data: { header: g10, payload: h2, signature: bH.parse(e10, { loose: true }), raw: { header: c10, payload: d10, signature: e10, text: a10 } } };
      }
      async function bR(a10, b10) {
        let { audience: c10, authorizedParties: d10, clockSkewInMs: e10, key: f10, headerType: g10 } = b10, h2 = e10 || 5e3, { data: i2, errors: j2 } = bQ(a10);
        if (j2) return { errors: j2 };
        let { header: k2, payload: l2 } = i2;
        try {
          let { typ: a11, alg: b11 } = k2;
          bN(a11, g10), bO(b11);
          let { azp: e11, sub: f11, aud: i3, iat: j3, exp: m3, nbf: n3 } = l2;
          if ("string" != typeof f11) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(f11)}.` });
          ((a12, b12) => {
            let c11 = [b12].flat().filter((a13) => !!a13), d11 = [a12].flat().filter((a13) => !!a13);
            if (c11.length > 0 && d11.length > 0) if ("string" == typeof a12) {
              if (!c11.includes(a12)) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Invalid JWT audience claim (aud) ${JSON.stringify(a12)}. Is not included in "${JSON.stringify(c11)}".` });
            } else {
              let b13;
              if (b13 = a12, Array.isArray(b13) && b13.length > 0 && b13.every((a13) => "string" == typeof a13) && !a12.some((a13) => c11.includes(a13))) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Invalid JWT audience claim array (aud) ${JSON.stringify(a12)}. Is not included in "${JSON.stringify(c11)}".` });
            }
          })([i3], [c10]);
          if (e11 && d10 && 0 !== d10.length && !d10.includes(e11)) throw new bB({ reason: bz.TokenInvalidAuthorizedParties, message: `Invalid JWT Authorized party claim (azp) ${JSON.stringify(e11)}. Expected "${d10}".` });
          if ("number" != typeof m3) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Invalid JWT expiry date claim (exp) ${JSON.stringify(m3)}. Expected number.` });
          let o2 = new Date(Date.now()), p2 = /* @__PURE__ */ new Date(0);
          if (p2.setUTCSeconds(m3), p2.getTime() <= o2.getTime() - h2) throw new bB({ reason: bz.TokenExpired, message: `JWT is expired. Expiry date: ${p2.toUTCString()}, Current date: ${o2.toUTCString()}.` });
          ((a12, b12) => {
            if (void 0 === a12) return;
            if ("number" != typeof a12) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Invalid JWT not before date claim (nbf) ${JSON.stringify(a12)}. Expected number.` });
            let c11 = new Date(Date.now()), d11 = /* @__PURE__ */ new Date(0);
            if (d11.setUTCSeconds(a12), d11.getTime() > c11.getTime() + b12) throw new bB({ reason: bz.TokenNotActiveYet, message: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${d11.toUTCString()}; Current date: ${c11.toUTCString()};` });
          })(n3, h2), ((a12, b12) => {
            if (void 0 === a12) return;
            if ("number" != typeof a12) throw new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Invalid JWT issued at date claim (iat) ${JSON.stringify(a12)}. Expected number.` });
            let c11 = new Date(Date.now()), d11 = /* @__PURE__ */ new Date(0);
            if (d11.setUTCSeconds(a12), d11.getTime() > c11.getTime() + b12) throw new bB({ reason: bz.TokenIatInTheFuture, message: `JWT issued at date claim (iat) is in the future. Issued at date: ${d11.toUTCString()}; Current date: ${c11.toUTCString()};` });
          })(j3, h2);
        } catch (a11) {
          return { errors: [a11] };
        }
        let { data: m2, errors: n2 } = await bP(i2, f10);
        return n2 ? { errors: [new bB({ action: bA.EnsureClerkJWT, reason: bz.TokenVerificationFailed, message: `Error verifying JWT signature. ${n2[0]}` })] } : m2 ? { data: l2 } : { errors: [new bB({ reason: bz.TokenInvalidSignature, message: "JWT signature is invalid." })] };
      }
      var bS = Object.create, bT = Object.defineProperty, bU = Object.getOwnPropertyDescriptor, bV = Object.getOwnPropertyNames, bW = Object.getPrototypeOf, bX = Object.prototype.hasOwnProperty, bY = (a10) => {
        throw TypeError(a10);
      }, bZ = (a10, b10, c10) => (b10.has(a10) || bY("Cannot access private method"), c10);
      function b$(a10) {
        return a10 ? `https://${a10.replace(/clerk\.accountsstage\./, "accountsstage.").replace(/clerk\.accounts\.|clerk\./, "accounts.")}` : "";
      }
      let b_ = { strict_mfa: { afterMinutes: 10, level: "multi_factor" }, strict: { afterMinutes: 10, level: "second_factor" }, moderate: { afterMinutes: 60, level: "second_factor" }, lax: { afterMinutes: 1440, level: "second_factor" } }, b0 = /* @__PURE__ */ new Set(["first_factor", "second_factor", "multi_factor"]), b1 = /* @__PURE__ */ new Set(["strict_mfa", "strict", "moderate", "lax"]), b2 = (a10) => a10.replace(/^(org:)*/, "org:"), b3 = (a10, b10) => {
        let { org: c10, user: d10 } = b4(a10), [e10, f10] = b10.split(":"), g10 = f10 || e10;
        return "org" === e10 ? c10.includes(g10) : "user" === e10 ? d10.includes(g10) : [...c10, ...d10].includes(g10);
      }, b4 = (a10) => {
        let b10 = a10 ? a10.split(",").map((a11) => a11.trim()) : [];
        return { org: b10.filter((a11) => a11.split(":")[0].includes("o")).map((a11) => a11.split(":")[1]), user: b10.filter((a11) => a11.split(":")[0].includes("u")).map((a11) => a11.split(":")[1]) };
      };
      var b5 = /* @__PURE__ */ ((a10, b10) => function() {
        return b10 || (0, a10[bV(a10)[0]])((b10 = { exports: {} }).exports, b10), b10.exports;
      })({ "../../node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js"(a10) {
        Object.defineProperty(a10, "__esModule", { value: true }), a10.parse = function(a11, b11) {
          let c11 = new g10(), d11 = a11.length;
          if (d11 < 2) return c11;
          let e11 = b11?.decode || j2, f11 = 0;
          do {
            let b12 = a11.indexOf("=", f11);
            if (-1 === b12) break;
            let g11 = a11.indexOf(";", f11), j3 = -1 === g11 ? d11 : g11;
            if (b12 > j3) {
              f11 = a11.lastIndexOf(";", b12 - 1) + 1;
              continue;
            }
            let k2 = h2(a11, f11, b12), l2 = i2(a11, b12, k2), m2 = a11.slice(k2, l2);
            if (void 0 === c11[m2]) {
              let d12 = h2(a11, b12 + 1, j3), f12 = i2(a11, j3, d12), g12 = e11(a11.slice(d12, f12));
              c11[m2] = g12;
            }
            f11 = j3 + 1;
          } while (f11 < d11);
          return c11;
        }, a10.serialize = function(a11, g11, h3) {
          let i3 = h3?.encode || encodeURIComponent;
          if (!b10.test(a11)) throw TypeError(`argument name is invalid: ${a11}`);
          let j3 = i3(g11);
          if (!c10.test(j3)) throw TypeError(`argument val is invalid: ${g11}`);
          let k2 = a11 + "=" + j3;
          if (!h3) return k2;
          if (void 0 !== h3.maxAge) {
            if (!Number.isInteger(h3.maxAge)) throw TypeError(`option maxAge is invalid: ${h3.maxAge}`);
            k2 += "; Max-Age=" + h3.maxAge;
          }
          if (h3.domain) {
            if (!d10.test(h3.domain)) throw TypeError(`option domain is invalid: ${h3.domain}`);
            k2 += "; Domain=" + h3.domain;
          }
          if (h3.path) {
            if (!e10.test(h3.path)) throw TypeError(`option path is invalid: ${h3.path}`);
            k2 += "; Path=" + h3.path;
          }
          if (h3.expires) {
            var l2;
            if (l2 = h3.expires, "[object Date]" !== f10.call(l2) || !Number.isFinite(h3.expires.valueOf())) throw TypeError(`option expires is invalid: ${h3.expires}`);
            k2 += "; Expires=" + h3.expires.toUTCString();
          }
          if (h3.httpOnly && (k2 += "; HttpOnly"), h3.secure && (k2 += "; Secure"), h3.partitioned && (k2 += "; Partitioned"), h3.priority) switch ("string" == typeof h3.priority ? h3.priority.toLowerCase() : void 0) {
            case "low":
              k2 += "; Priority=Low";
              break;
            case "medium":
              k2 += "; Priority=Medium";
              break;
            case "high":
              k2 += "; Priority=High";
              break;
            default:
              throw TypeError(`option priority is invalid: ${h3.priority}`);
          }
          if (h3.sameSite) switch ("string" == typeof h3.sameSite ? h3.sameSite.toLowerCase() : h3.sameSite) {
            case true:
            case "strict":
              k2 += "; SameSite=Strict";
              break;
            case "lax":
              k2 += "; SameSite=Lax";
              break;
            case "none":
              k2 += "; SameSite=None";
              break;
            default:
              throw TypeError(`option sameSite is invalid: ${h3.sameSite}`);
          }
          return k2;
        };
        var b10 = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/, c10 = /^[\u0021-\u003A\u003C-\u007E]*$/, d10 = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, e10 = /^[\u0020-\u003A\u003D-\u007E]*$/, f10 = Object.prototype.toString, g10 = (() => {
          let a11 = function() {
          };
          return a11.prototype = /* @__PURE__ */ Object.create(null), a11;
        })();
        function h2(a11, b11, c11) {
          do {
            let c12 = a11.charCodeAt(b11);
            if (32 !== c12 && 9 !== c12) return b11;
          } while (++b11 < c11);
          return c11;
        }
        function i2(a11, b11, c11) {
          for (; b11 > c11; ) {
            let c12 = a11.charCodeAt(--b11);
            if (32 !== c12 && 9 !== c12) return b11 + 1;
          }
          return c11;
        }
        function j2(a11) {
          if (-1 === a11.indexOf("%")) return a11;
          try {
            return decodeURIComponent(a11);
          } catch (b11) {
            return a11;
          }
        }
      } }), b6 = "https://api.clerk.com", b7 = "@clerk/backend@2.29.3", b8 = "2025-11-10", b9 = { Session: "__session", Refresh: "__refresh", ClientUat: "__client_uat", Handshake: "__clerk_handshake", DevBrowser: "__clerk_db_jwt", RedirectCount: "__clerk_redirect_count", HandshakeNonce: "__clerk_handshake_nonce" }, ca = { ClerkSynced: "__clerk_synced", SuffixedCookies: "suffixed_cookies", ClerkRedirectUrl: "__clerk_redirect_url", DevBrowser: b9.DevBrowser, Handshake: b9.Handshake, HandshakeHelp: "__clerk_help", LegacyDevBrowser: "__dev_session", HandshakeReason: "__clerk_hs_reason", HandshakeNonce: b9.HandshakeNonce, HandshakeFormat: "format", Session: "__session" }, cb = { Cookies: b9, Headers: { Accept: "accept", AuthMessage: "x-clerk-auth-message", Authorization: "authorization", AuthReason: "x-clerk-auth-reason", AuthSignature: "x-clerk-auth-signature", AuthStatus: "x-clerk-auth-status", AuthToken: "x-clerk-auth-token", CacheControl: "cache-control", ClerkRedirectTo: "x-clerk-redirect-to", ClerkRequestData: "x-clerk-request-data", ClerkUrl: "x-clerk-clerk-url", CloudFrontForwardedProto: "cloudfront-forwarded-proto", ContentType: "content-type", ContentSecurityPolicy: "content-security-policy", ContentSecurityPolicyReportOnly: "content-security-policy-report-only", EnableDebug: "x-clerk-debug", ForwardedHost: "x-forwarded-host", ForwardedPort: "x-forwarded-port", ForwardedProto: "x-forwarded-proto", Host: "host", Location: "location", Nonce: "x-nonce", Origin: "origin", Referrer: "referer", SecFetchDest: "sec-fetch-dest", SecFetchSite: "sec-fetch-site", UserAgent: "user-agent", ReportingEndpoints: "reporting-endpoints" }, ContentTypes: { Json: "application/json" }, QueryParameters: ca }, cc = (a10, b10, c10, d10) => {
        if ("" === a10) return cd(b10.toString(), c10?.toString());
        let e10 = new URL(a10), f10 = c10 ? new URL(c10, e10) : void 0, g10 = new URL(b10, e10), h2 = `${e10.hostname}:${e10.port}` != `${g10.hostname}:${g10.port}`;
        return f10 && (h2 && f10.searchParams.delete(cb.QueryParameters.ClerkSynced), g10.searchParams.set("redirect_url", f10.toString())), h2 && d10 && g10.searchParams.set(cb.QueryParameters.DevBrowser, d10), g10.toString();
      }, cd = (a10, b10) => {
        let c10;
        if (a10.startsWith("http")) c10 = new URL(a10);
        else {
          if (!b10 || !b10.startsWith("http")) throw Error("destination url or return back url should be an absolute path url!");
          let d10 = new URL(b10);
          c10 = new URL(a10, d10.origin);
        }
        return b10 && c10.searchParams.set("redirect_url", b10), c10.toString();
      };
      function ce(a10, b10) {
        return Object.keys(a10).reduce((a11, c10) => ({ ...a11, [c10]: b10[c10] || a11[c10] }), { ...a10 });
      }
      function cf(a10) {
        if (!a10 || "string" != typeof a10) throw Error("Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance.");
      }
      var cg = { SessionToken: "session_token", ApiKey: "api_key", M2MToken: "m2m_token", OAuthToken: "oauth_token" }, ch = class {
        constructor(a10, b10, c10) {
          this.cookieSuffix = a10, this.clerkRequest = b10, this.originalFrontendApi = "", c10.acceptsToken === cg.M2MToken || c10.acceptsToken === cg.ApiKey ? this.initHeaderValues() : (this.initPublishableKeyValues(c10), this.initHeaderValues(), this.initCookieValues(), this.initHandshakeValues()), Object.assign(this, c10), this.clerkUrl = this.clerkRequest.clerkUrl;
        }
        get sessionToken() {
          return this.sessionTokenInCookie || this.tokenInHeader;
        }
        usesSuffixedCookies() {
          let a10 = this.getSuffixedCookie(cb.Cookies.ClientUat), b10 = this.getCookie(cb.Cookies.ClientUat), c10 = this.getSuffixedCookie(cb.Cookies.Session) || "", d10 = this.getCookie(cb.Cookies.Session) || "";
          if (d10 && !this.tokenHasIssuer(d10)) return false;
          if (d10 && !this.tokenBelongsToInstance(d10)) return true;
          if (!a10 && !c10) return false;
          let { data: e10 } = bQ(d10), f10 = e10?.payload.iat || 0, { data: g10 } = bQ(c10), h2 = g10?.payload.iat || 0;
          if ("0" !== a10 && "0" !== b10 && f10 > h2 || "0" === a10 && "0" !== b10) return false;
          if ("production" !== this.instanceType) {
            let c11 = this.sessionExpired(g10);
            if ("0" !== a10 && "0" === b10 && c11) return false;
          }
          return !!a10 || !c10;
        }
        isCrossOriginReferrer() {
          if (!this.referrer || !this.clerkUrl.origin) return false;
          try {
            return new URL(this.referrer).origin !== this.clerkUrl.origin;
          } catch {
            return false;
          }
        }
        isKnownClerkReferrer() {
          if (!this.referrer) return false;
          try {
            let a10 = new URL(this.referrer), b10 = a10.hostname;
            if (this.frontendApi) {
              let a11 = this.frontendApi.startsWith("http") ? new URL(this.frontendApi).hostname : this.frontendApi;
              if (b10 === a11) return true;
            }
            if (a7.some((a11) => b10.startsWith("accounts.") && b10.endsWith(a11)) || a8.some((a11) => b10.endsWith(a11) && !b10.endsWith(".clerk" + a11))) return true;
            let c10 = b$(this.frontendApi);
            if (c10) {
              let b11 = new URL(c10).origin;
              if (a10.origin === b11) return true;
            }
            if (b10.startsWith("accounts.")) return true;
            return false;
          } catch {
            return false;
          }
        }
        initPublishableKeyValues(a10) {
          bg(a10.publishableKey, { fatal: true }), this.publishableKey = a10.publishableKey;
          let b10 = bg(this.publishableKey, { fatal: true, domain: a10.domain, isSatellite: a10.isSatellite });
          this.originalFrontendApi = b10.frontendApi;
          let c10 = bg(this.publishableKey, { fatal: true, proxyUrl: a10.proxyUrl, domain: a10.domain, isSatellite: a10.isSatellite });
          this.instanceType = c10.instanceType, this.frontendApi = c10.frontendApi;
        }
        initHeaderValues() {
          this.tokenInHeader = this.parseAuthorizationHeader(this.getHeader(cb.Headers.Authorization)), this.origin = this.getHeader(cb.Headers.Origin), this.host = this.getHeader(cb.Headers.Host), this.forwardedHost = this.getHeader(cb.Headers.ForwardedHost), this.forwardedProto = this.getHeader(cb.Headers.CloudFrontForwardedProto) || this.getHeader(cb.Headers.ForwardedProto), this.referrer = this.getHeader(cb.Headers.Referrer), this.userAgent = this.getHeader(cb.Headers.UserAgent), this.secFetchDest = this.getHeader(cb.Headers.SecFetchDest), this.accept = this.getHeader(cb.Headers.Accept);
        }
        initCookieValues() {
          this.sessionTokenInCookie = this.getSuffixedOrUnSuffixedCookie(cb.Cookies.Session), this.refreshTokenInCookie = this.getSuffixedCookie(cb.Cookies.Refresh), this.clientUat = Number.parseInt(this.getSuffixedOrUnSuffixedCookie(cb.Cookies.ClientUat) || "") || 0;
        }
        initHandshakeValues() {
          this.devBrowserToken = this.getQueryParam(cb.QueryParameters.DevBrowser) || this.getSuffixedOrUnSuffixedCookie(cb.Cookies.DevBrowser), this.handshakeToken = this.getQueryParam(cb.QueryParameters.Handshake) || this.getCookie(cb.Cookies.Handshake), this.handshakeRedirectLoopCounter = Number(this.getCookie(cb.Cookies.RedirectCount)) || 0, this.handshakeNonce = this.getQueryParam(cb.QueryParameters.HandshakeNonce) || this.getCookie(cb.Cookies.HandshakeNonce);
        }
        getQueryParam(a10) {
          return this.clerkRequest.clerkUrl.searchParams.get(a10);
        }
        getHeader(a10) {
          return this.clerkRequest.headers.get(a10) || void 0;
        }
        getCookie(a10) {
          return this.clerkRequest.cookies.get(a10) || void 0;
        }
        getSuffixedCookie(a10) {
          let b10;
          return this.getCookie((b10 = this.cookieSuffix, `${a10}_${b10}`)) || void 0;
        }
        getSuffixedOrUnSuffixedCookie(a10) {
          return this.usesSuffixedCookies() ? this.getSuffixedCookie(a10) : this.getCookie(a10);
        }
        parseAuthorizationHeader(a10) {
          if (!a10) return;
          let [b10, c10] = a10.split(" ", 2);
          return c10 ? "Bearer" === b10 ? c10 : void 0 : b10;
        }
        tokenHasIssuer(a10) {
          let { data: b10, errors: c10 } = bQ(a10);
          return !c10 && !!b10.payload.iss;
        }
        tokenBelongsToInstance(a10) {
          if (!a10) return false;
          let { data: b10, errors: c10 } = bQ(a10);
          if (c10) return false;
          let d10 = b10.payload.iss.replace(/https?:\/\//gi, "");
          return this.originalFrontendApi === d10;
        }
        sessionExpired(a10) {
          return !!a10 && a10?.payload.exp <= (Date.now() / 1e3 | 0);
        }
      }, ci = async (a10, b10) => new ch(b10.publishableKey ? await bj(b10.publishableKey, bG.crypto.subtle) : "", a10, b10), cj = RegExp("(?<!:)/{1,}", "g");
      function ck(...a10) {
        return a10.filter((a11) => a11).join("/").replace(cj, "/");
      }
      var cl = class {
        constructor(a10) {
          this.request = a10;
        }
        requireId(a10) {
          if (!a10) throw Error("A valid resource ID is required.");
        }
      }, cm = "/actor_tokens", cn = class extends cl {
        async create(a10) {
          return this.request({ method: "POST", path: cm, bodyParams: a10 });
        }
        async revoke(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(cm, a10, "revoke") });
        }
      }, co = "/accountless_applications", cp = class extends cl {
        async createAccountlessApplication(a10) {
          let b10 = a10?.requestHeaders ? Object.fromEntries(a10.requestHeaders.entries()) : void 0;
          return this.request({ method: "POST", path: co, headerParams: b10 });
        }
        async completeAccountlessApplicationOnboarding(a10) {
          let b10 = a10?.requestHeaders ? Object.fromEntries(a10.requestHeaders.entries()) : void 0;
          return this.request({ method: "POST", path: ck(co, "complete"), headerParams: b10 });
        }
      }, cq = "/allowlist_identifiers", cr = class extends cl {
        async getAllowlistIdentifierList(a10 = {}) {
          return this.request({ method: "GET", path: cq, queryParams: { ...a10, paginated: true } });
        }
        async createAllowlistIdentifier(a10) {
          return this.request({ method: "POST", path: cq, bodyParams: a10 });
        }
        async deleteAllowlistIdentifier(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cq, a10) });
        }
      }, cs = "/api_keys", ct = class extends cl {
        async list(a10) {
          return this.request({ method: "GET", path: cs, queryParams: a10 });
        }
        async create(a10) {
          return this.request({ method: "POST", path: cs, bodyParams: a10 });
        }
        async get(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cs, a10) });
        }
        async update(a10) {
          let { apiKeyId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "PATCH", path: ck(cs, b10), bodyParams: c10 });
        }
        async delete(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cs, a10) });
        }
        async revoke(a10) {
          let { apiKeyId: b10, revocationReason: c10 = null } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(cs, b10, "revoke"), bodyParams: { revocationReason: c10 } });
        }
        async getSecret(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cs, a10, "secret") });
        }
        async verify(a10) {
          return this.request({ method: "POST", path: ck(cs, "verify"), bodyParams: { secret: a10 } });
        }
        async verifySecret(a10) {
          return a6("apiKeys.verifySecret()", "Use `apiKeys.verify()` instead."), this.verify(a10);
        }
      }, cu = class extends cl {
        async changeDomain(a10) {
          return this.request({ method: "POST", path: ck("/beta_features", "change_domain"), bodyParams: a10 });
        }
      }, cv = "/blocklist_identifiers", cw = class extends cl {
        async getBlocklistIdentifierList(a10 = {}) {
          return this.request({ method: "GET", path: cv, queryParams: a10 });
        }
        async createBlocklistIdentifier(a10) {
          return this.request({ method: "POST", path: cv, bodyParams: a10 });
        }
        async deleteBlocklistIdentifier(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cv, a10) });
        }
      }, cx = "/clients", cy = class extends cl {
        async getClientList(a10 = {}) {
          return this.request({ method: "GET", path: cx, queryParams: { ...a10, paginated: true } });
        }
        async getClient(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cx, a10) });
        }
        verifyClient(a10) {
          return this.request({ method: "POST", path: ck(cx, "verify"), bodyParams: { token: a10 } });
        }
        async getHandshakePayload(a10) {
          return this.request({ method: "GET", path: ck(cx, "handshake_payload"), queryParams: a10 });
        }
      }, cz = "/domains", cA = class extends cl {
        async list() {
          return this.request({ method: "GET", path: cz });
        }
        async add(a10) {
          return this.request({ method: "POST", path: cz, bodyParams: a10 });
        }
        async update(a10) {
          let { domainId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "PATCH", path: ck(cz, b10), bodyParams: c10 });
        }
        async delete(a10) {
          return this.deleteDomain(a10);
        }
        async deleteDomain(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cz, a10) });
        }
      }, cB = "/email_addresses", cC = class extends cl {
        async getEmailAddress(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cB, a10) });
        }
        async createEmailAddress(a10) {
          return this.request({ method: "POST", path: cB, bodyParams: a10 });
        }
        async updateEmailAddress(a10, b10 = {}) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(cB, a10), bodyParams: b10 });
        }
        async deleteEmailAddress(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cB, a10) });
        }
      }, cD = class extends cl {
        async verify(a10) {
          return this.request({ method: "POST", path: ck("/oauth_applications/access_tokens", "verify"), bodyParams: { access_token: a10 } });
        }
        async verifyAccessToken(a10) {
          return a6("idPOAuthAccessToken.verifyAccessToken()", "Use `idPOAuthAccessToken.verify()` instead."), this.verify(a10);
        }
      }, cE = "/instance", cF = class extends cl {
        async get() {
          return this.request({ method: "GET", path: cE });
        }
        async update(a10) {
          return this.request({ method: "PATCH", path: cE, bodyParams: a10 });
        }
        async updateRestrictions(a10) {
          return this.request({ method: "PATCH", path: ck(cE, "restrictions"), bodyParams: a10 });
        }
        async updateOrganizationSettings(a10) {
          return this.request({ method: "PATCH", path: ck(cE, "organization_settings"), bodyParams: a10 });
        }
      }, cG = "/invitations", cH = class extends cl {
        async getInvitationList(a10 = {}) {
          return this.request({ method: "GET", path: cG, queryParams: { ...a10, paginated: true } });
        }
        async createInvitation(a10) {
          return this.request({ method: "POST", path: cG, bodyParams: a10 });
        }
        async createInvitationBulk(a10) {
          return this.request({ method: "POST", path: ck(cG, "bulk"), bodyParams: a10 });
        }
        async revokeInvitation(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(cG, a10, "revoke") });
        }
      }, cI = "/machines", cJ = class extends cl {
        async get(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cI, a10) });
        }
        async list(a10 = {}) {
          return this.request({ method: "GET", path: cI, queryParams: a10 });
        }
        async create(a10) {
          return this.request({ method: "POST", path: cI, bodyParams: a10 });
        }
        async update(a10) {
          let { machineId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "PATCH", path: ck(cI, b10), bodyParams: c10 });
        }
        async delete(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cI, a10) });
        }
        async getSecretKey(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cI, a10, "secret_key") });
        }
        async rotateSecretKey(a10) {
          let { machineId: b10, previousTokenTtl: c10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(cI, b10, "secret_key", "rotate"), bodyParams: { previousTokenTtl: c10 } });
        }
        async createScope(a10, b10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(cI, a10, "scopes"), bodyParams: { toMachineId: b10 } });
        }
        async deleteScope(a10, b10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cI, a10, "scopes", b10) });
        }
      }, cK = "/m2m_tokens", cL = class extends cl {
        constructor() {
          super(...arguments), ((a10, b10, c10) => b10.has(a10) ? bY("Cannot add the same private member more than once") : b10 instanceof WeakSet ? b10.add(a10) : b10.set(a10, c10))(this, fW);
        }
        async createToken(a10) {
          let { claims: b10 = null, machineSecretKey: c10, secondsUntilExpiration: d10 = null } = a10 || {}, e10 = bZ(this, fW, fX).call(this, { method: "POST", path: cK, bodyParams: { secondsUntilExpiration: d10, claims: b10 } }, c10);
          return this.request(e10);
        }
        async revokeToken(a10) {
          let { m2mTokenId: b10, revocationReason: c10 = null, machineSecretKey: d10 } = a10;
          this.requireId(b10);
          let e10 = bZ(this, fW, fX).call(this, { method: "POST", path: ck(cK, b10, "revoke"), bodyParams: { revocationReason: c10 } }, d10);
          return this.request(e10);
        }
        async verify(a10) {
          let { token: b10, machineSecretKey: c10 } = a10, d10 = bZ(this, fW, fX).call(this, { method: "POST", path: ck(cK, "verify"), bodyParams: { token: b10 } }, c10);
          return this.request(d10);
        }
        async verifyToken(a10) {
          return a6("m2m.verifyToken()", "Use `m2m.verify()` instead."), this.verify(a10);
        }
      };
      fW = /* @__PURE__ */ new WeakSet(), fX = function(a10, b10) {
        return b10 ? { ...a10, headerParams: { ...a10.headerParams, Authorization: `Bearer ${b10}` } } : a10;
      };
      var cM = class extends cl {
        async getJwks() {
          return this.request({ method: "GET", path: "/jwks" });
        }
      }, cN = "/jwt_templates", cO = class extends cl {
        async list(a10 = {}) {
          return this.request({ method: "GET", path: cN, queryParams: { ...a10, paginated: true } });
        }
        async get(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cN, a10) });
        }
        async create(a10) {
          return this.request({ method: "POST", path: cN, bodyParams: a10 });
        }
        async update(a10) {
          let { templateId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "PATCH", path: ck(cN, b10), bodyParams: c10 });
        }
        async delete(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cN, a10) });
        }
      }, cP = "/organizations", cQ = class extends cl {
        async getOrganizationList(a10) {
          return this.request({ method: "GET", path: cP, queryParams: a10 });
        }
        async createOrganization(a10) {
          return this.request({ method: "POST", path: cP, bodyParams: a10 });
        }
        async getOrganization(a10) {
          let { includeMembersCount: b10 } = a10, c10 = "organizationId" in a10 ? a10.organizationId : a10.slug;
          return this.requireId(c10), this.request({ method: "GET", path: ck(cP, c10), queryParams: { includeMembersCount: b10 } });
        }
        async updateOrganization(a10, b10) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(cP, a10), bodyParams: b10 });
        }
        async updateOrganizationLogo(a10, b10) {
          this.requireId(a10);
          let c10 = new bG.FormData();
          return c10.append("file", b10?.file), b10?.uploaderUserId && c10.append("uploader_user_id", b10?.uploaderUserId), this.request({ method: "PUT", path: ck(cP, a10, "logo"), formData: c10 });
        }
        async deleteOrganizationLogo(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cP, a10, "logo") });
        }
        async updateOrganizationMetadata(a10, b10) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(cP, a10, "metadata"), bodyParams: b10 });
        }
        async deleteOrganization(a10) {
          return this.request({ method: "DELETE", path: ck(cP, a10) });
        }
        async getOrganizationMembershipList(a10) {
          let { organizationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "GET", path: ck(cP, b10, "memberships"), queryParams: c10 });
        }
        async getInstanceOrganizationMembershipList(a10) {
          return this.request({ method: "GET", path: "/organization_memberships", queryParams: a10 });
        }
        async createOrganizationMembership(a10) {
          let { organizationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(cP, b10, "memberships"), bodyParams: c10 });
        }
        async updateOrganizationMembership(a10) {
          let { organizationId: b10, userId: c10, ...d10 } = a10;
          return this.requireId(b10), this.request({ method: "PATCH", path: ck(cP, b10, "memberships", c10), bodyParams: d10 });
        }
        async updateOrganizationMembershipMetadata(a10) {
          let { organizationId: b10, userId: c10, ...d10 } = a10;
          return this.request({ method: "PATCH", path: ck(cP, b10, "memberships", c10, "metadata"), bodyParams: d10 });
        }
        async deleteOrganizationMembership(a10) {
          let { organizationId: b10, userId: c10 } = a10;
          return this.requireId(b10), this.request({ method: "DELETE", path: ck(cP, b10, "memberships", c10) });
        }
        async getOrganizationInvitationList(a10) {
          let { organizationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "GET", path: ck(cP, b10, "invitations"), queryParams: c10 });
        }
        async createOrganizationInvitation(a10) {
          let { organizationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(cP, b10, "invitations"), bodyParams: c10 });
        }
        async createOrganizationInvitationBulk(a10, b10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(cP, a10, "invitations", "bulk"), bodyParams: b10 });
        }
        async getOrganizationInvitation(a10) {
          let { organizationId: b10, invitationId: c10 } = a10;
          return this.requireId(b10), this.requireId(c10), this.request({ method: "GET", path: ck(cP, b10, "invitations", c10) });
        }
        async revokeOrganizationInvitation(a10) {
          let { organizationId: b10, invitationId: c10, ...d10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(cP, b10, "invitations", c10, "revoke"), bodyParams: d10 });
        }
        async getOrganizationDomainList(a10) {
          let { organizationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "GET", path: ck(cP, b10, "domains"), queryParams: c10 });
        }
        async createOrganizationDomain(a10) {
          let { organizationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(cP, b10, "domains"), bodyParams: { ...c10, verified: c10.verified ?? true } });
        }
        async updateOrganizationDomain(a10) {
          let { organizationId: b10, domainId: c10, ...d10 } = a10;
          return this.requireId(b10), this.requireId(c10), this.request({ method: "PATCH", path: ck(cP, b10, "domains", c10), bodyParams: d10 });
        }
        async deleteOrganizationDomain(a10) {
          let { organizationId: b10, domainId: c10 } = a10;
          return this.requireId(b10), this.requireId(c10), this.request({ method: "DELETE", path: ck(cP, b10, "domains", c10) });
        }
      }, cR = "/oauth_applications", cS = class extends cl {
        async list(a10 = {}) {
          return this.request({ method: "GET", path: cR, queryParams: a10 });
        }
        async get(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cR, a10) });
        }
        async create(a10) {
          return this.request({ method: "POST", path: cR, bodyParams: a10 });
        }
        async update(a10) {
          let { oauthApplicationId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "PATCH", path: ck(cR, b10), bodyParams: c10 });
        }
        async delete(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cR, a10) });
        }
        async rotateSecret(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(cR, a10, "rotate_secret") });
        }
      }, cT = "/phone_numbers", cU = class extends cl {
        async getPhoneNumber(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cT, a10) });
        }
        async createPhoneNumber(a10) {
          return this.request({ method: "POST", path: cT, bodyParams: a10 });
        }
        async updatePhoneNumber(a10, b10 = {}) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(cT, a10), bodyParams: b10 });
        }
        async deletePhoneNumber(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cT, a10) });
        }
      }, cV = class extends cl {
        async verify(a10) {
          return this.request({ method: "POST", path: "/proxy_checks", bodyParams: a10 });
        }
      }, cW = "/redirect_urls", cX = class extends cl {
        async getRedirectUrlList() {
          return this.request({ method: "GET", path: cW, queryParams: { paginated: true } });
        }
        async getRedirectUrl(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cW, a10) });
        }
        async createRedirectUrl(a10) {
          return this.request({ method: "POST", path: cW, bodyParams: a10 });
        }
        async deleteRedirectUrl(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cW, a10) });
        }
      }, cY = "/saml_connections", cZ = class extends cl {
        async getSamlConnectionList(a10 = {}) {
          return this.request({ method: "GET", path: cY, queryParams: a10 });
        }
        async createSamlConnection(a10) {
          return this.request({ method: "POST", path: cY, bodyParams: a10, options: { deepSnakecaseBodyParamKeys: true } });
        }
        async getSamlConnection(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(cY, a10) });
        }
        async updateSamlConnection(a10, b10 = {}) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(cY, a10), bodyParams: b10, options: { deepSnakecaseBodyParamKeys: true } });
        }
        async deleteSamlConnection(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(cY, a10) });
        }
      }, c$ = "/sessions", c_ = class extends cl {
        async getSessionList(a10 = {}) {
          return this.request({ method: "GET", path: c$, queryParams: { ...a10, paginated: true } });
        }
        async getSession(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(c$, a10) });
        }
        async createSession(a10) {
          return this.request({ method: "POST", path: c$, bodyParams: a10 });
        }
        async revokeSession(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c$, a10, "revoke") });
        }
        async verifySession(a10, b10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c$, a10, "verify"), bodyParams: { token: b10 } });
        }
        async getToken(a10, b10, c10) {
          this.requireId(a10);
          let d10 = { method: "POST", path: b10 ? ck(c$, a10, "tokens", b10) : ck(c$, a10, "tokens") };
          return void 0 !== c10 && (d10.bodyParams = { expires_in_seconds: c10 }), this.request(d10);
        }
        async refreshSession(a10, b10) {
          this.requireId(a10);
          let { suffixed_cookies: c10, ...d10 } = b10;
          return this.request({ method: "POST", path: ck(c$, a10, "refresh"), bodyParams: d10, queryParams: { suffixed_cookies: c10 } });
        }
      }, c0 = "/sign_in_tokens", c1 = class extends cl {
        async createSignInToken(a10) {
          return this.request({ method: "POST", path: c0, bodyParams: a10 });
        }
        async revokeSignInToken(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c0, a10, "revoke") });
        }
      }, c2 = "/sign_ups", c3 = class extends cl {
        async get(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(c2, a10) });
        }
        async update(a10) {
          let { signUpAttemptId: b10, ...c10 } = a10;
          return this.request({ method: "PATCH", path: ck(c2, b10), bodyParams: c10 });
        }
      }, c4 = class extends cl {
        async createTestingToken() {
          return this.request({ method: "POST", path: "/testing_tokens" });
        }
      }, c5 = "/users", c6 = class extends cl {
        async getUserList(a10 = {}) {
          let { limit: b10, offset: c10, orderBy: d10, ...e10 } = a10, [f10, g10] = await Promise.all([this.request({ method: "GET", path: c5, queryParams: a10 }), this.getCount(e10)]);
          return { data: f10, totalCount: g10 };
        }
        async getUser(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck(c5, a10) });
        }
        async createUser(a10) {
          return this.request({ method: "POST", path: c5, bodyParams: a10 });
        }
        async updateUser(a10, b10 = {}) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(c5, a10), bodyParams: b10 });
        }
        async updateUserProfileImage(a10, b10) {
          this.requireId(a10);
          let c10 = new bG.FormData();
          return c10.append("file", b10?.file), this.request({ method: "POST", path: ck(c5, a10, "profile_image"), formData: c10 });
        }
        async updateUserMetadata(a10, b10) {
          return this.requireId(a10), this.request({ method: "PATCH", path: ck(c5, a10, "metadata"), bodyParams: b10 });
        }
        async deleteUser(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(c5, a10) });
        }
        async getCount(a10 = {}) {
          return this.request({ method: "GET", path: ck(c5, "count"), queryParams: a10 });
        }
        async getUserOauthAccessToken(a10, b10) {
          this.requireId(a10);
          let c10 = b10.startsWith("oauth_"), d10 = c10 ? b10 : `oauth_${b10}`;
          return c10 && a6("getUserOauthAccessToken(userId, provider)", "Remove the `oauth_` prefix from the `provider` argument."), this.request({ method: "GET", path: ck(c5, a10, "oauth_access_tokens", d10), queryParams: { paginated: true } });
        }
        async disableUserMFA(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(c5, a10, "mfa") });
        }
        async getOrganizationMembershipList(a10) {
          let { userId: b10, limit: c10, offset: d10 } = a10;
          return this.requireId(b10), this.request({ method: "GET", path: ck(c5, b10, "organization_memberships"), queryParams: { limit: c10, offset: d10 } });
        }
        async getOrganizationInvitationList(a10) {
          let { userId: b10, ...c10 } = a10;
          return this.requireId(b10), this.request({ method: "GET", path: ck(c5, b10, "organization_invitations"), queryParams: c10 });
        }
        async verifyPassword(a10) {
          let { userId: b10, password: c10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(c5, b10, "verify_password"), bodyParams: { password: c10 } });
        }
        async verifyTOTP(a10) {
          let { userId: b10, code: c10 } = a10;
          return this.requireId(b10), this.request({ method: "POST", path: ck(c5, b10, "verify_totp"), bodyParams: { code: c10 } });
        }
        async banUser(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c5, a10, "ban") });
        }
        async unbanUser(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c5, a10, "unban") });
        }
        async lockUser(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c5, a10, "lock") });
        }
        async unlockUser(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c5, a10, "unlock") });
        }
        async deleteUserProfileImage(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(c5, a10, "profile_image") });
        }
        async deleteUserPasskey(a10) {
          return this.requireId(a10.userId), this.requireId(a10.passkeyIdentificationId), this.request({ method: "DELETE", path: ck(c5, a10.userId, "passkeys", a10.passkeyIdentificationId) });
        }
        async deleteUserWeb3Wallet(a10) {
          return this.requireId(a10.userId), this.requireId(a10.web3WalletIdentificationId), this.request({ method: "DELETE", path: ck(c5, a10.userId, "web3_wallets", a10.web3WalletIdentificationId) });
        }
        async deleteUserExternalAccount(a10) {
          return this.requireId(a10.userId), this.requireId(a10.externalAccountId), this.request({ method: "DELETE", path: ck(c5, a10.userId, "external_accounts", a10.externalAccountId) });
        }
        async deleteUserBackupCodes(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(c5, a10, "backup_code") });
        }
        async deleteUserTOTP(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(c5, a10, "totp") });
        }
        async setPasswordCompromised(a10, b10 = { revokeAllSessions: false }) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c5, a10, "password", "set_compromised"), bodyParams: b10 });
        }
        async unsetPasswordCompromised(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c5, a10, "password", "unset_compromised") });
        }
      }, c7 = "/waitlist_entries", c8 = class extends cl {
        async list(a10 = {}) {
          return this.request({ method: "GET", path: c7, queryParams: a10 });
        }
        async create(a10) {
          return this.request({ method: "POST", path: c7, bodyParams: a10 });
        }
        async invite(a10, b10 = {}) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c7, a10, "invite"), bodyParams: b10 });
        }
        async reject(a10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck(c7, a10, "reject") });
        }
        async delete(a10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(c7, a10) });
        }
      }, c9 = "/webhooks", da = class extends cl {
        async createSvixApp() {
          return this.request({ method: "POST", path: ck(c9, "svix") });
        }
        async generateSvixAuthURL() {
          return this.request({ method: "POST", path: ck(c9, "svix_url") });
        }
        async deleteSvixApp() {
          return this.request({ method: "DELETE", path: ck(c9, "svix") });
        }
      }, db = "/billing", dc = class extends cl {
        async getPlanList(a10) {
          return this.request({ method: "GET", path: ck(db, "plans"), queryParams: a10 });
        }
        async cancelSubscriptionItem(a10, b10) {
          return this.requireId(a10), this.request({ method: "DELETE", path: ck(db, "subscription_items", a10), queryParams: b10 });
        }
        async extendSubscriptionItemFreeTrial(a10, b10) {
          return this.requireId(a10), this.request({ method: "POST", path: ck("/billing", "subscription_items", a10, "extend_free_trial"), bodyParams: b10 });
        }
        async getOrganizationBillingSubscription(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck("/organizations", a10, "billing", "subscription") });
        }
        async getUserBillingSubscription(a10) {
          return this.requireId(a10), this.request({ method: "GET", path: ck("/users", a10, "billing", "subscription") });
        }
      }, dd = (a10) => "object" == typeof a10 && null !== a10, de = (a10) => dd(a10) && !(a10 instanceof RegExp) && !(a10 instanceof Error) && !(a10 instanceof Date) && !(globalThis.Blob && a10 instanceof globalThis.Blob), df = Symbol("mapObjectSkip"), dg = (a10, b10, c10, d10 = /* @__PURE__ */ new WeakMap()) => {
        if (c10 = { deep: false, target: {}, ...c10 }, d10.has(a10)) return d10.get(a10);
        d10.set(a10, c10.target);
        let { target: e10 } = c10;
        delete c10.target;
        let f10 = (a11) => a11.map((a12) => de(a12) ? dg(a12, b10, c10, d10) : a12);
        if (Array.isArray(a10)) return f10(a10);
        for (let [g10, h2] of Object.entries(a10)) {
          let i2 = b10(g10, h2, a10);
          if (i2 === df) continue;
          let [j2, k2, { shouldRecurse: l2 = true } = {}] = i2;
          "__proto__" !== j2 && (c10.deep && l2 && de(k2) && (k2 = Array.isArray(k2) ? f10(k2) : dg(k2, b10, c10, d10)), e10[j2] = k2);
        }
        return e10;
      };
      function dh(a10, b10, c10) {
        if (!dd(a10)) throw TypeError(`Expected an object, got \`${a10}\` (${typeof a10})`);
        if (Array.isArray(a10)) throw TypeError("Expected an object, got an array");
        return dg(a10, b10, c10);
      }
      var di = /([\p{Ll}\d])(\p{Lu})/gu, dj = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu, dk = /(\d)\p{Ll}|(\p{L})\d/u, dl = /[^\p{L}\d]+/giu, dm = "$1\0$2";
      function dn(a10) {
        let b10 = a10.trim();
        b10 = (b10 = b10.replace(di, dm).replace(dj, dm)).replace(dl, "\0");
        let c10 = 0, d10 = b10.length;
        for (; "\0" === b10.charAt(c10); ) c10++;
        if (c10 === d10) return [];
        for (; "\0" === b10.charAt(d10 - 1); ) d10--;
        return b10.slice(c10, d10).split(/\0/g);
      }
      function dp(a10) {
        let b10 = dn(a10);
        for (let a11 = 0; a11 < b10.length; a11++) {
          let c10 = b10[a11], d10 = dk.exec(c10);
          if (d10) {
            let e10 = d10.index + (d10[1] ?? d10[2]).length;
            b10.splice(a11, 1, c10.slice(0, e10), c10.slice(e10));
          }
        }
        return b10;
      }
      function dq(a10, b10) {
        var c10, d10 = { delimiter: "_", ...b10 };
        let [e10, f10, g10] = function(a11, b11 = {}) {
          let c11 = b11.split ?? (b11.separateNumbers ? dp : dn), d11 = b11.prefixCharacters ?? "", e11 = b11.suffixCharacters ?? "", f11 = 0, g11 = a11.length;
          for (; f11 < a11.length; ) {
            let b12 = a11.charAt(f11);
            if (!d11.includes(b12)) break;
            f11++;
          }
          for (; g11 > f11; ) {
            let b12 = g11 - 1, c12 = a11.charAt(b12);
            if (!e11.includes(c12)) break;
            g11 = b12;
          }
          return [a11.slice(0, f11), c11(a11.slice(f11, g11)), a11.slice(g11)];
        }(a10, d10);
        return e10 + f10.map(false === (c10 = d10?.locale) ? (a11) => a11.toLowerCase() : (a11) => a11.toLocaleLowerCase(c10)).join(d10?.delimiter ?? " ") + g10;
      }
      var dr = {}.constructor;
      function ds(a10, b10) {
        return a10.some((a11) => "string" == typeof a11 ? a11 === b10 : a11.test(b10));
      }
      function dt(a10, b10, c10) {
        return c10.shouldRecurse ? { shouldRecurse: c10.shouldRecurse(a10, b10) } : void 0;
      }
      var du = function(a10, b10) {
        if (Array.isArray(a10)) {
          if (a10.some((a11) => a11.constructor !== dr)) throw Error("obj must be array of plain objects");
          let c11 = (b10 = { deep: true, exclude: [], parsingOptions: {}, ...b10 }).snakeCase || ((a11) => dq(a11, b10.parsingOptions));
          return a10.map((a11) => dh(a11, (a12, d10) => [ds(b10.exclude, a12) ? a12 : c11(a12), d10, dt(a12, d10, b10)], b10));
        }
        if (a10.constructor !== dr) throw Error("obj must be an plain object");
        let c10 = (b10 = { deep: true, exclude: [], parsingOptions: {}, ...b10 }).snakeCase || ((a11) => dq(a11, b10.parsingOptions));
        return dh(a10, (a11, d10) => [ds(b10.exclude, a11) ? a11 : c10(a11), d10, dt(a11, d10, b10)], b10);
      }, dv = class a10 {
        constructor(a11, b10, c10, d10) {
          this.publishableKey = a11, this.secretKey = b10, this.claimUrl = c10, this.apiKeysUrl = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.publishable_key, b10.secret_key, b10.claim_url, b10.api_keys_url);
        }
      }, dw = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2) {
          this.id = a11, this.status = b10, this.userId = c10, this.actor = d10, this.token = e10, this.url = f10, this.createdAt = g10, this.updatedAt = h2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.status, b10.user_id, b10.actor, b10.token, b10.url, b10.created_at, b10.updated_at);
        }
      }, dx = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10) {
          this.id = a11, this.identifier = b10, this.identifierType = c10, this.createdAt = d10, this.updatedAt = e10, this.instanceId = f10, this.invitationId = g10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.identifier, b10.identifier_type, b10.created_at, b10.updated_at, b10.instance_id, b10.invitation_id);
        }
      }, dy = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
          this.id = a11, this.type = b10, this.name = c10, this.subject = d10, this.scopes = e10, this.claims = f10, this.revoked = g10, this.revocationReason = h2, this.expired = i2, this.expiration = j2, this.createdBy = k2, this.description = l2, this.lastUsedAt = m2, this.createdAt = n2, this.updatedAt = o2, this.secret = p2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.type, b10.name, b10.subject, b10.scopes, b10.claims, b10.revoked, b10.revocation_reason, b10.expired, b10.expiration, b10.created_by, b10.description, b10.last_used_at, b10.created_at, b10.updated_at, b10.secret);
        }
      }, dz = class a10 {
        constructor(a11, b10, c10, d10, e10, f10) {
          this.id = a11, this.identifier = b10, this.identifierType = c10, this.createdAt = d10, this.updatedAt = e10, this.instanceId = f10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.identifier, b10.identifier_type, b10.created_at, b10.updated_at, b10.instance_id);
        }
      }, dA = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2) {
          this.id = a11, this.isMobile = b10, this.ipAddress = c10, this.city = d10, this.country = e10, this.browserVersion = f10, this.browserName = g10, this.deviceType = h2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.is_mobile, b10.ip_address, b10.city, b10.country, b10.browser_version, b10.browser_name, b10.device_type);
        }
      }, dB = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2 = null) {
          this.id = a11, this.clientId = b10, this.userId = c10, this.status = d10, this.lastActiveAt = e10, this.expireAt = f10, this.abandonAt = g10, this.createdAt = h2, this.updatedAt = i2, this.lastActiveOrganizationId = j2, this.latestActivity = k2, this.actor = l2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.client_id, b10.user_id, b10.status, b10.last_active_at, b10.expire_at, b10.abandon_at, b10.created_at, b10.updated_at, b10.last_active_organization_id, b10.latest_activity && dA.fromJSON(b10.latest_activity), b10.actor);
        }
      }, dC = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2) {
          this.id = a11, this.sessionIds = b10, this.sessions = c10, this.signInId = d10, this.signUpId = e10, this.lastActiveSessionId = f10, this.lastAuthenticationStrategy = g10, this.createdAt = h2, this.updatedAt = i2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.session_ids, b10.sessions.map((a11) => dB.fromJSON(a11)), b10.sign_in_id, b10.sign_up_id, b10.last_active_session_id, b10.last_authentication_strategy, b10.created_at, b10.updated_at);
        }
      }, dD = class a10 {
        constructor(a11, b10, c10) {
          this.host = a11, this.value = b10, this.required = c10;
        }
        static fromJSON(b10) {
          return new a10(b10.host, b10.value, b10.required);
        }
      }, dE = class a10 {
        constructor(a11) {
          this.cookies = a11;
        }
        static fromJSON(b10) {
          return new a10(b10.cookies);
        }
      }, dF = class a10 {
        constructor(a11, b10, c10, d10) {
          this.object = a11, this.id = b10, this.slug = c10, this.deleted = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.object, b10.id || null, b10.slug || null, b10.deleted);
        }
      }, dG = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2) {
          this.id = a11, this.name = b10, this.isSatellite = c10, this.frontendApiUrl = d10, this.developmentOrigin = e10, this.cnameTargets = f10, this.accountsPortalUrl = g10, this.proxyUrl = h2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.name, b10.is_satellite, b10.frontend_api_url, b10.development_origin, b10.cname_targets && b10.cname_targets.map((a11) => dD.fromJSON(a11)), b10.accounts_portal_url, b10.proxy_url);
        }
      }, dH = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2) {
          this.id = a11, this.fromEmailName = b10, this.emailAddressId = c10, this.toEmailAddress = d10, this.subject = e10, this.body = f10, this.bodyPlain = g10, this.status = h2, this.slug = i2, this.data = j2, this.deliveredByClerk = k2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.from_email_name, b10.email_address_id, b10.to_email_address, b10.subject, b10.body, b10.body_plain, b10.status, b10.slug, b10.data, b10.delivered_by_clerk);
        }
      }, dI = class a10 {
        constructor(a11, b10) {
          this.id = a11, this.type = b10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.type);
        }
      }, dJ = class a10 {
        constructor(a11, b10, c10 = null, d10 = null, e10 = null, f10 = null, g10 = null) {
          this.status = a11, this.strategy = b10, this.externalVerificationRedirectURL = c10, this.attempts = d10, this.expireAt = e10, this.nonce = f10, this.message = g10;
        }
        static fromJSON(b10) {
          return new a10(b10.status, b10.strategy, b10.external_verification_redirect_url ? new URL(b10.external_verification_redirect_url) : null, b10.attempts, b10.expire_at, b10.nonce);
        }
      }, dK = class a10 {
        constructor(a11, b10, c10, d10) {
          this.id = a11, this.emailAddress = b10, this.verification = c10, this.linkedTo = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.email_address, b10.verification && dJ.fromJSON(b10.verification), b10.linked_to.map((a11) => dI.fromJSON(a11)));
        }
      }, dL = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2 = {}, m2, n2) {
          this.id = a11, this.provider = b10, this.identificationId = c10, this.externalId = d10, this.approvedScopes = e10, this.emailAddress = f10, this.firstName = g10, this.lastName = h2, this.imageUrl = i2, this.username = j2, this.phoneNumber = k2, this.publicMetadata = l2, this.label = m2, this.verification = n2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.provider, b10.identification_id, b10.provider_user_id, b10.approved_scopes, b10.email_address, b10.first_name, b10.last_name, b10.image_url || "", b10.username, b10.phone_number, b10.public_metadata, b10.label, b10.verification && dJ.fromJSON(b10.verification));
        }
      }, dM = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2) {
          this.id = a11, this.clientId = b10, this.type = c10, this.subject = d10, this.scopes = e10, this.revoked = f10, this.revocationReason = g10, this.expired = h2, this.expiration = i2, this.createdAt = j2, this.updatedAt = k2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.client_id, b10.type, b10.subject, b10.scopes, b10.revoked, b10.revocation_reason, b10.expired, b10.expiration, b10.created_at, b10.updated_at);
        }
        static fromJwtPayload(b10, c10 = 5e3) {
          return new a10(b10.jti ?? "", b10.client_id ?? "", "oauth_token", b10.sub, b10.scp ?? b10.scope?.split(" ") ?? [], false, null, 1e3 * b10.exp <= Date.now() - c10, b10.exp, b10.iat, b10.iat);
        }
      }, dN = class a10 {
        constructor(a11, b10, c10) {
          this.id = a11, this.environmentType = b10, this.allowedOrigins = c10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.environment_type, b10.allowed_origins);
        }
      }, dO = class a10 {
        constructor(a11, b10, c10, d10, e10) {
          this.allowlist = a11, this.blocklist = b10, this.blockEmailSubaddresses = c10, this.blockDisposableEmailDomains = d10, this.ignoreDotsForGmailAddresses = e10;
        }
        static fromJSON(b10) {
          return new a10(b10.allowlist, b10.blocklist, b10.block_email_subaddresses, b10.block_disposable_email_domains, b10.ignore_dots_for_gmail_addresses);
        }
      }, dP = class a10 {
        constructor(a11, b10, c10, d10, e10) {
          this.id = a11, this.restrictedToAllowlist = b10, this.fromEmailAddress = c10, this.progressiveSignUp = d10, this.enhancedEmailDeliverability = e10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.restricted_to_allowlist, b10.from_email_address, b10.progressive_sign_up, b10.enhanced_email_deliverability);
        }
      }, dQ = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2) {
          this.id = a11, this.emailAddress = b10, this.publicMetadata = c10, this.createdAt = d10, this.updatedAt = e10, this.status = f10, this.url = g10, this.revoked = h2, this._raw = null;
        }
        get raw() {
          return this._raw;
        }
        static fromJSON(b10) {
          let c10 = new a10(b10.id, b10.email_address, b10.public_metadata, b10.created_at, b10.updated_at, b10.status, b10.url, b10.revoked);
          return c10._raw = b10, c10;
        }
      }, dR = { AccountlessApplication: "accountless_application", ActorToken: "actor_token", AllowlistIdentifier: "allowlist_identifier", ApiKey: "api_key", BlocklistIdentifier: "blocklist_identifier", Client: "client", Cookies: "cookies", Domain: "domain", Email: "email", EmailAddress: "email_address", Instance: "instance", InstanceRestrictions: "instance_restrictions", InstanceSettings: "instance_settings", Invitation: "invitation", Machine: "machine", MachineScope: "machine_scope", MachineSecretKey: "machine_secret_key", M2MToken: "machine_to_machine_token", JwtTemplate: "jwt_template", OauthAccessToken: "oauth_access_token", IdpOAuthAccessToken: "clerk_idp_oauth_access_token", OAuthApplication: "oauth_application", Organization: "organization", OrganizationInvitation: "organization_invitation", OrganizationMembership: "organization_membership", OrganizationSettings: "organization_settings", PhoneNumber: "phone_number", ProxyCheck: "proxy_check", RedirectUrl: "redirect_url", SamlConnection: "saml_connection", Session: "session", SignInToken: "sign_in_token", SignUpAttempt: "sign_up_attempt", SmsMessage: "sms_message", User: "user", WaitlistEntry: "waitlist_entry", Token: "token", TotalCount: "total_count", BillingSubscription: "commerce_subscription", BillingSubscriptionItem: "commerce_subscription_item", BillingPlan: "commerce_plan", Feature: "feature" }, dS = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2) {
          this.id = a11, this.name = b10, this.instanceId = c10, this.createdAt = d10, this.updatedAt = e10, this.scopedMachines = f10, this.defaultTokenTtl = g10, this.secretKey = h2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.name, b10.instance_id, b10.created_at, b10.updated_at, b10.scoped_machines.map((b11) => new a10(b11.id, b11.name, b11.instance_id, b11.created_at, b11.updated_at, [], b11.default_token_ttl)), b10.default_token_ttl, b10.secret_key);
        }
      }, dT = class a10 {
        constructor(a11, b10, c10, d10) {
          this.fromMachineId = a11, this.toMachineId = b10, this.createdAt = c10, this.deleted = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.from_machine_id, b10.to_machine_id, b10.created_at, b10.deleted);
        }
      }, dU = class a10 {
        constructor(a11) {
          this.secret = a11;
        }
        static fromJSON(b10) {
          return new a10(b10.secret);
        }
      }, dV = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2) {
          this.id = a11, this.subject = b10, this.scopes = c10, this.claims = d10, this.revoked = e10, this.revocationReason = f10, this.expired = g10, this.expiration = h2, this.createdAt = i2, this.updatedAt = j2, this.token = k2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.subject, b10.scopes, b10.claims, b10.revoked, b10.revocation_reason, b10.expired, b10.expiration, b10.created_at, b10.updated_at, b10.token);
        }
      }, dW = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2) {
          this.id = a11, this.name = b10, this.claims = c10, this.lifetime = d10, this.allowedClockSkew = e10, this.customSigningKey = f10, this.signingAlgorithm = g10, this.createdAt = h2, this.updatedAt = i2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.name, b10.claims, b10.lifetime, b10.allowed_clock_skew, b10.custom_signing_key, b10.signing_algorithm, b10.created_at, b10.updated_at);
        }
      }, dX = class a10 {
        constructor(a11, b10, c10, d10 = {}, e10, f10, g10, h2, i2) {
          this.externalAccountId = a11, this.provider = b10, this.token = c10, this.publicMetadata = d10, this.label = e10, this.scopes = f10, this.tokenSecret = g10, this.expiresAt = h2, this.idToken = i2;
        }
        static fromJSON(b10) {
          return new a10(b10.external_account_id, b10.provider, b10.token, b10.public_metadata, b10.label || "", b10.scopes, b10.token_secret, b10.expires_at, b10.id_token);
        }
      }, dY = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2, n2, o2, p2, q2, r2, s2, t2) {
          this.id = a11, this.instanceId = b10, this.name = c10, this.clientId = d10, this.clientUri = e10, this.clientImageUrl = f10, this.dynamicallyRegistered = g10, this.consentScreenEnabled = h2, this.pkceRequired = i2, this.isPublic = j2, this.scopes = k2, this.redirectUris = l2, this.authorizeUrl = m2, this.tokenFetchUrl = n2, this.userInfoUrl = o2, this.discoveryUrl = p2, this.tokenIntrospectionUrl = q2, this.createdAt = r2, this.updatedAt = s2, this.clientSecret = t2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.instance_id, b10.name, b10.client_id, b10.client_uri, b10.client_image_url, b10.dynamically_registered, b10.consent_screen_enabled, b10.pkce_required, b10.public, b10.scopes, b10.redirect_uris, b10.authorize_url, b10.token_fetch_url, b10.user_info_url, b10.discovery_url, b10.token_introspection_url, b10.created_at, b10.updated_at, b10.client_secret);
        }
      }, dZ = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2 = {}, i2 = {}, j2, k2, l2, m2) {
          this.id = a11, this.name = b10, this.slug = c10, this.imageUrl = d10, this.hasImage = e10, this.createdAt = f10, this.updatedAt = g10, this.publicMetadata = h2, this.privateMetadata = i2, this.maxAllowedMemberships = j2, this.adminDeleteEnabled = k2, this.membersCount = l2, this.createdBy = m2, this._raw = null;
        }
        get raw() {
          return this._raw;
        }
        static fromJSON(b10) {
          let c10 = new a10(b10.id, b10.name, b10.slug, b10.image_url || "", b10.has_image, b10.created_at, b10.updated_at, b10.public_metadata, b10.private_metadata, b10.max_allowed_memberships, b10.admin_delete_enabled, b10.members_count, b10.created_by);
          return c10._raw = b10, c10;
        }
      }, d$ = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2 = {}, l2 = {}, m2) {
          this.id = a11, this.emailAddress = b10, this.role = c10, this.roleName = d10, this.organizationId = e10, this.createdAt = f10, this.updatedAt = g10, this.expiresAt = h2, this.url = i2, this.status = j2, this.publicMetadata = k2, this.privateMetadata = l2, this.publicOrganizationData = m2, this._raw = null;
        }
        get raw() {
          return this._raw;
        }
        static fromJSON(b10) {
          let c10 = new a10(b10.id, b10.email_address, b10.role, b10.role_name, b10.organization_id, b10.created_at, b10.updated_at, b10.expires_at, b10.url, b10.status, b10.public_metadata, b10.private_metadata, b10.public_organization_data);
          return c10._raw = b10, c10;
        }
      }, d_ = class a10 {
        constructor(a11, b10, c10, d10 = {}, e10 = {}, f10, g10, h2, i2) {
          this.id = a11, this.role = b10, this.permissions = c10, this.publicMetadata = d10, this.privateMetadata = e10, this.createdAt = f10, this.updatedAt = g10, this.organization = h2, this.publicUserData = i2, this._raw = null;
        }
        get raw() {
          return this._raw;
        }
        static fromJSON(b10) {
          let c10 = new a10(b10.id, b10.role, b10.permissions, b10.public_metadata, b10.private_metadata, b10.created_at, b10.updated_at, dZ.fromJSON(b10.organization), d0.fromJSON(b10.public_user_data));
          return c10._raw = b10, c10;
        }
      }, d0 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10) {
          this.identifier = a11, this.firstName = b10, this.lastName = c10, this.imageUrl = d10, this.hasImage = e10, this.userId = f10;
        }
        static fromJSON(b10) {
          return new a10(b10.identifier, b10.first_name, b10.last_name, b10.image_url, b10.has_image, b10.user_id);
        }
      }, d1 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2) {
          this.enabled = a11, this.maxAllowedMemberships = b10, this.maxAllowedRoles = c10, this.maxAllowedPermissions = d10, this.creatorRole = e10, this.adminDeleteEnabled = f10, this.domainsEnabled = g10, this.slugDisabled = h2, this.domainsEnrollmentModes = i2, this.domainsDefaultRole = j2;
        }
        static fromJSON(b10) {
          return new a10(b10.enabled, b10.max_allowed_memberships, b10.max_allowed_roles, b10.max_allowed_permissions, b10.creator_role, b10.admin_delete_enabled, b10.domains_enabled, b10.slug_disabled, b10.domains_enrollment_modes, b10.domains_default_role);
        }
      }, d2 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10) {
          this.id = a11, this.phoneNumber = b10, this.reservedForSecondFactor = c10, this.defaultSecondFactor = d10, this.verification = e10, this.linkedTo = f10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.phone_number, b10.reserved_for_second_factor, b10.default_second_factor, b10.verification && dJ.fromJSON(b10.verification), b10.linked_to.map((a11) => dI.fromJSON(a11)));
        }
      }, d3 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10) {
          this.id = a11, this.domainId = b10, this.lastRunAt = c10, this.proxyUrl = d10, this.successful = e10, this.createdAt = f10, this.updatedAt = g10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.domain_id, b10.last_run_at, b10.proxy_url, b10.successful, b10.created_at, b10.updated_at);
        }
      }, d4 = class a10 {
        constructor(a11, b10, c10, d10) {
          this.id = a11, this.url = b10, this.createdAt = c10, this.updatedAt = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.url, b10.created_at, b10.updated_at);
        }
      }, d5 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2, n2, o2, p2, q2, r2, s2, t2, u2) {
          this.id = a11, this.name = b10, this.domain = c10, this.organizationId = d10, this.idpEntityId = e10, this.idpSsoUrl = f10, this.idpCertificate = g10, this.idpMetadataUrl = h2, this.idpMetadata = i2, this.acsUrl = j2, this.spEntityId = k2, this.spMetadataUrl = l2, this.active = m2, this.provider = n2, this.userCount = o2, this.syncUserAttributes = p2, this.allowSubdomains = q2, this.allowIdpInitiated = r2, this.createdAt = s2, this.updatedAt = t2, this.attributeMapping = u2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.name, b10.domain, b10.organization_id, b10.idp_entity_id, b10.idp_sso_url, b10.idp_certificate, b10.idp_metadata_url, b10.idp_metadata, b10.acs_url, b10.sp_entity_id, b10.sp_metadata_url, b10.active, b10.provider, b10.user_count, b10.sync_user_attributes, b10.allow_subdomains, b10.allow_idp_initiated, b10.created_at, b10.updated_at, b10.attribute_mapping && d7.fromJSON(b10.attribute_mapping));
        }
      }, d6 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2) {
          this.id = a11, this.name = b10, this.domain = c10, this.active = d10, this.provider = e10, this.syncUserAttributes = f10, this.allowSubdomains = g10, this.allowIdpInitiated = h2, this.createdAt = i2, this.updatedAt = j2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.name, b10.domain, b10.active, b10.provider, b10.sync_user_attributes, b10.allow_subdomains, b10.allow_idp_initiated, b10.created_at, b10.updated_at);
        }
      }, d7 = class a10 {
        constructor(a11, b10, c10, d10) {
          this.userId = a11, this.emailAddress = b10, this.firstName = c10, this.lastName = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.user_id, b10.email_address, b10.first_name, b10.last_name);
        }
      }, d8 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2) {
          this.id = a11, this.provider = b10, this.providerUserId = c10, this.active = d10, this.emailAddress = e10, this.firstName = f10, this.lastName = g10, this.verification = h2, this.samlConnection = i2, this.lastAuthenticatedAt = j2, this.enterpriseConnectionId = k2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.provider, b10.provider_user_id, b10.active, b10.email_address, b10.first_name, b10.last_name, b10.verification && dJ.fromJSON(b10.verification), b10.saml_connection && d6.fromJSON(b10.saml_connection), b10.last_authenticated_at ?? null, b10.enterprise_connection_id);
        }
      }, d9 = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10) {
          this.id = a11, this.userId = b10, this.token = c10, this.status = d10, this.url = e10, this.createdAt = f10, this.updatedAt = g10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.user_id, b10.token, b10.status, b10.url, b10.created_at, b10.updated_at);
        }
      }, ea = class a10 {
        constructor(a11, b10) {
          this.nextAction = a11, this.supportedStrategies = b10;
        }
        static fromJSON(b10) {
          return new a10(b10.next_action, b10.supported_strategies);
        }
      }, eb = class a10 {
        constructor(a11, b10, c10, d10) {
          this.emailAddress = a11, this.phoneNumber = b10, this.web3Wallet = c10, this.externalAccount = d10;
        }
        static fromJSON(b10) {
          return new a10(b10.email_address && ea.fromJSON(b10.email_address), b10.phone_number && ea.fromJSON(b10.phone_number), b10.web3_wallet && ea.fromJSON(b10.web3_wallet), b10.external_account);
        }
      }, ec = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2, n2, o2, p2, q2, r2, s2, t2, u2, v2) {
          this.id = a11, this.status = b10, this.requiredFields = c10, this.optionalFields = d10, this.missingFields = e10, this.unverifiedFields = f10, this.verifications = g10, this.username = h2, this.emailAddress = i2, this.phoneNumber = j2, this.web3Wallet = k2, this.passwordEnabled = l2, this.firstName = m2, this.lastName = n2, this.customAction = o2, this.externalId = p2, this.createdSessionId = q2, this.createdUserId = r2, this.abandonAt = s2, this.legalAcceptedAt = t2, this.publicMetadata = u2, this.unsafeMetadata = v2;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.status, b10.required_fields, b10.optional_fields, b10.missing_fields, b10.unverified_fields, b10.verifications ? eb.fromJSON(b10.verifications) : null, b10.username, b10.email_address, b10.phone_number, b10.web3_wallet, b10.password_enabled, b10.first_name, b10.last_name, b10.custom_action, b10.external_id, b10.created_session_id, b10.created_user_id, b10.abandon_at, b10.legal_accepted_at, b10.public_metadata, b10.unsafe_metadata);
        }
      }, ed = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10) {
          this.id = a11, this.fromPhoneNumber = b10, this.toPhoneNumber = c10, this.message = d10, this.status = e10, this.phoneNumberId = f10, this.data = g10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.from_phone_number, b10.to_phone_number, b10.message, b10.status, b10.phone_number_id, b10.data);
        }
      }, ee = class a10 {
        constructor(a11) {
          this.jwt = a11;
        }
        static fromJSON(b10) {
          return new a10(b10.jwt);
        }
      }, ef = class a10 {
        constructor(a11, b10, c10) {
          this.id = a11, this.web3Wallet = b10, this.verification = c10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.web3_wallet, b10.verification && dJ.fromJSON(b10.verification));
        }
      }, eg = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2, n2, o2, p2, q2, r2, s2, t2 = {}, u2 = {}, v2 = {}, w2 = [], x2 = [], y2 = [], z2 = [], A2 = [], B2, C2, D2 = null, E2, F2, G2) {
          this.id = a11, this.passwordEnabled = b10, this.totpEnabled = c10, this.backupCodeEnabled = d10, this.twoFactorEnabled = e10, this.banned = f10, this.locked = g10, this.createdAt = h2, this.updatedAt = i2, this.imageUrl = j2, this.hasImage = k2, this.primaryEmailAddressId = l2, this.primaryPhoneNumberId = m2, this.primaryWeb3WalletId = n2, this.lastSignInAt = o2, this.externalId = p2, this.username = q2, this.firstName = r2, this.lastName = s2, this.publicMetadata = t2, this.privateMetadata = u2, this.unsafeMetadata = v2, this.emailAddresses = w2, this.phoneNumbers = x2, this.web3Wallets = y2, this.externalAccounts = z2, this.samlAccounts = A2, this.lastActiveAt = B2, this.createOrganizationEnabled = C2, this.createOrganizationsLimit = D2, this.deleteSelfEnabled = E2, this.legalAcceptedAt = F2, this.locale = G2, this._raw = null;
        }
        get raw() {
          return this._raw;
        }
        static fromJSON(b10) {
          let c10 = new a10(b10.id, b10.password_enabled, b10.totp_enabled, b10.backup_code_enabled, b10.two_factor_enabled, b10.banned, b10.locked, b10.created_at, b10.updated_at, b10.image_url, b10.has_image, b10.primary_email_address_id, b10.primary_phone_number_id, b10.primary_web3_wallet_id, b10.last_sign_in_at, b10.external_id, b10.username, b10.first_name, b10.last_name, b10.public_metadata, b10.private_metadata, b10.unsafe_metadata, (b10.email_addresses || []).map((a11) => dK.fromJSON(a11)), (b10.phone_numbers || []).map((a11) => d2.fromJSON(a11)), (b10.web3_wallets || []).map((a11) => ef.fromJSON(a11)), (b10.external_accounts || []).map((a11) => dL.fromJSON(a11)), (b10.saml_accounts || []).map((a11) => d8.fromJSON(a11)), b10.last_active_at, b10.create_organization_enabled, b10.create_organizations_limit, b10.delete_self_enabled, b10.legal_accepted_at, b10.locale);
          return c10._raw = b10, c10;
        }
        get primaryEmailAddress() {
          return this.emailAddresses.find(({ id: a11 }) => a11 === this.primaryEmailAddressId) ?? null;
        }
        get primaryPhoneNumber() {
          return this.phoneNumbers.find(({ id: a11 }) => a11 === this.primaryPhoneNumberId) ?? null;
        }
        get primaryWeb3Wallet() {
          return this.web3Wallets.find(({ id: a11 }) => a11 === this.primaryWeb3WalletId) ?? null;
        }
        get fullName() {
          return [this.firstName, this.lastName].join(" ").trim() || null;
        }
      }, eh = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10) {
          this.id = a11, this.emailAddress = b10, this.status = c10, this.invitation = d10, this.createdAt = e10, this.updatedAt = f10, this.isLocked = g10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.email_address, b10.status, b10.invitation && dQ.fromJSON(b10.invitation), b10.created_at, b10.updated_at, b10.is_locked);
        }
      }, ei = class a10 {
        constructor(a11, b10, c10, d10, e10) {
          this.id = a11, this.name = b10, this.description = c10, this.slug = d10, this.avatarUrl = e10;
        }
        static fromJSON(b10) {
          return new a10(b10.id, b10.name, b10.description ?? null, b10.slug, b10.avatar_url ?? null);
        }
      }, ej = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2) {
          this.id = a11, this.name = b10, this.slug = c10, this.description = d10, this.isDefault = e10, this.isRecurring = f10, this.hasBaseFee = g10, this.publiclyVisible = h2, this.fee = i2, this.annualFee = j2, this.annualMonthlyFee = k2, this.forPayerType = l2, this.features = m2;
        }
        static fromJSON(b10) {
          let c10 = (a11) => a11 ? { amount: a11.amount, amountFormatted: a11.amount_formatted, currency: a11.currency, currencySymbol: a11.currency_symbol } : null;
          return new a10(b10.id, b10.name, b10.slug, b10.description ?? null, b10.is_default, b10.is_recurring, b10.has_base_fee, b10.publicly_visible, c10(b10.fee), c10(b10.annual_fee), c10(b10.annual_monthly_fee), b10.for_payer_type, (b10.features ?? []).map((a11) => ei.fromJSON(a11)));
        }
      }, ek = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2, k2, l2, m2, n2, o2, p2, q2) {
          this.id = a11, this.status = b10, this.planPeriod = c10, this.periodStart = d10, this.nextPayment = e10, this.amount = f10, this.plan = g10, this.planId = h2, this.createdAt = i2, this.updatedAt = j2, this.periodEnd = k2, this.canceledAt = l2, this.pastDueAt = m2, this.endedAt = n2, this.payerId = o2, this.isFreeTrial = p2, this.lifetimePaid = q2;
        }
        static fromJSON(b10) {
          function c10(a11) {
            return a11 ? { amount: a11.amount, amountFormatted: a11.amount_formatted, currency: a11.currency, currencySymbol: a11.currency_symbol } : a11;
          }
          return new a10(b10.id, b10.status, b10.plan_period, b10.period_start, b10.next_payment, c10(b10.amount) ?? void 0, b10.plan ? ej.fromJSON(b10.plan) : null, b10.plan_id ?? null, b10.created_at, b10.updated_at, b10.period_end, b10.canceled_at, b10.past_due_at, b10.ended_at, b10.payer_id, b10.is_free_trial, c10(b10.lifetime_paid) ?? void 0);
        }
      }, el = class a10 {
        constructor(a11, b10, c10, d10, e10, f10, g10, h2, i2, j2) {
          this.id = a11, this.status = b10, this.payerId = c10, this.createdAt = d10, this.updatedAt = e10, this.activeAt = f10, this.pastDueAt = g10, this.subscriptionItems = h2, this.nextPayment = i2, this.eligibleForFreeTrial = j2;
        }
        static fromJSON(b10) {
          let c10 = b10.next_payment ? { date: b10.next_payment.date, amount: { amount: b10.next_payment.amount.amount, amountFormatted: b10.next_payment.amount.amount_formatted, currency: b10.next_payment.amount.currency, currencySymbol: b10.next_payment.amount.currency_symbol } } : null;
          return new a10(b10.id, b10.status, b10.payer_id, b10.created_at, b10.updated_at, b10.active_at ?? null, b10.past_due_at ?? null, (b10.subscription_items ?? []).map((a11) => ek.fromJSON(a11)), c10, b10.eligible_for_free_trial ?? false);
        }
      };
      function em(a10) {
        if ("string" != typeof a10 && "object" in a10 && "deleted" in a10) return dF.fromJSON(a10);
        switch (a10.object) {
          case dR.AccountlessApplication:
            return dv.fromJSON(a10);
          case dR.ActorToken:
            return dw.fromJSON(a10);
          case dR.AllowlistIdentifier:
            return dx.fromJSON(a10);
          case dR.ApiKey:
            return dy.fromJSON(a10);
          case dR.BlocklistIdentifier:
            return dz.fromJSON(a10);
          case dR.Client:
            return dC.fromJSON(a10);
          case dR.Cookies:
            return dE.fromJSON(a10);
          case dR.Domain:
            return dG.fromJSON(a10);
          case dR.EmailAddress:
            return dK.fromJSON(a10);
          case dR.Email:
            return dH.fromJSON(a10);
          case dR.IdpOAuthAccessToken:
            return dM.fromJSON(a10);
          case dR.Instance:
            return dN.fromJSON(a10);
          case dR.InstanceRestrictions:
            return dO.fromJSON(a10);
          case dR.InstanceSettings:
            return dP.fromJSON(a10);
          case dR.Invitation:
            return dQ.fromJSON(a10);
          case dR.JwtTemplate:
            return dW.fromJSON(a10);
          case dR.Machine:
            return dS.fromJSON(a10);
          case dR.MachineScope:
            return dT.fromJSON(a10);
          case dR.MachineSecretKey:
            return dU.fromJSON(a10);
          case dR.M2MToken:
            return dV.fromJSON(a10);
          case dR.OauthAccessToken:
            return dX.fromJSON(a10);
          case dR.OAuthApplication:
            return dY.fromJSON(a10);
          case dR.Organization:
            return dZ.fromJSON(a10);
          case dR.OrganizationInvitation:
            return d$.fromJSON(a10);
          case dR.OrganizationMembership:
            return d_.fromJSON(a10);
          case dR.OrganizationSettings:
            return d1.fromJSON(a10);
          case dR.PhoneNumber:
            return d2.fromJSON(a10);
          case dR.ProxyCheck:
            return d3.fromJSON(a10);
          case dR.RedirectUrl:
            return d4.fromJSON(a10);
          case dR.SamlConnection:
            return d5.fromJSON(a10);
          case dR.SignInToken:
            return d9.fromJSON(a10);
          case dR.SignUpAttempt:
            return ec.fromJSON(a10);
          case dR.Session:
            return dB.fromJSON(a10);
          case dR.SmsMessage:
            return ed.fromJSON(a10);
          case dR.Token:
            return ee.fromJSON(a10);
          case dR.TotalCount:
            return a10.total_count;
          case dR.User:
            return eg.fromJSON(a10);
          case dR.WaitlistEntry:
            return eh.fromJSON(a10);
          case dR.BillingPlan:
            return ej.fromJSON(a10);
          case dR.BillingSubscription:
            return el.fromJSON(a10);
          case dR.BillingSubscriptionItem:
            return ek.fromJSON(a10);
          case dR.Feature:
            return ei.fromJSON(a10);
          default:
            return a10;
        }
      }
      function en(a10) {
        var b10;
        return b10 = async (b11) => {
          let c10, { secretKey: d10, machineSecretKey: e10, useMachineSecretKey: f10 = false, requireSecretKey: g10 = true, apiUrl: h2 = b6, apiVersion: i2 = "v1", userAgent: j2 = b7, skipApiVersionInUrl: k2 = false } = a10, { path: l2, method: m2, queryParams: n2, headerParams: o2, bodyParams: p2, formData: q2, options: r2 } = b11, { deepSnakecaseBodyParamKeys: s2 = false } = r2 || {};
          g10 && cf(d10);
          let t2 = new URL(k2 ? ck(h2, l2) : ck(h2, i2, l2));
          if (n2) for (let [a11, b12] of Object.entries(du({ ...n2 }))) b12 && [b12].flat().forEach((b13) => t2.searchParams.append(a11, b13));
          let u2 = new Headers({ "Clerk-API-Version": b8, [cb.Headers.UserAgent]: j2, ...o2 }), v2 = cb.Headers.Authorization;
          !u2.has(v2) && (f10 && e10 ? u2.set(v2, `Bearer ${e10}`) : d10 && u2.set(v2, `Bearer ${d10}`));
          try {
            var w2;
            q2 ? c10 = await bG.fetch(t2.href, { method: m2, headers: u2, body: q2 }) : (u2.set("Content-Type", "application/json"), c10 = await bG.fetch(t2.href, { method: m2, headers: u2, ...(() => {
              if (!("GET" !== m2 && p2 && Object.keys(p2).length > 0)) return null;
              let a12 = (a13) => du(a13, { deep: s2 });
              return { body: JSON.stringify(Array.isArray(p2) ? p2.map(a12) : a12(p2)) };
            })() }));
            let a11 = c10?.headers && c10.headers?.get(cb.Headers.ContentType) === cb.ContentTypes.Json, b12 = await (a11 ? c10.json() : c10.text());
            if (!c10.ok) return { data: null, errors: eq(b12), status: c10?.status, statusText: c10?.statusText, clerkTraceId: eo(b12, c10?.headers), retryAfter: ep(c10?.headers) };
            return { ...Array.isArray(b12) ? { data: b12.map((a12) => em(a12)) } : (w2 = b12) && "object" == typeof w2 && "data" in w2 && Array.isArray(w2.data) && void 0 !== w2.data ? { data: b12.data.map((a12) => em(a12)), totalCount: b12.total_count } : { data: em(b12) }, errors: null };
          } catch (a11) {
            if (a11 instanceof Error) return { data: null, errors: [{ code: "unexpected_error", message: a11.message || "Unexpected error" }], clerkTraceId: eo(a11, c10?.headers) };
            return { data: null, errors: eq(a11), status: c10?.status, statusText: c10?.statusText, clerkTraceId: eo(a11, c10?.headers), retryAfter: ep(c10?.headers) };
          }
        }, async (...a11) => {
          let { data: c10, errors: d10, totalCount: e10, status: f10, statusText: g10, clerkTraceId: h2, retryAfter: i2 } = await b10(...a11);
          if (d10) {
            let a12 = new bs(g10 || "", { data: [], status: f10, clerkTraceId: h2, retryAfter: i2 });
            throw a12.errors = d10, a12;
          }
          return void 0 !== e10 ? { data: c10, totalCount: e10 } : c10;
        };
      }
      function eo(a10, b10) {
        return a10 && "object" == typeof a10 && "clerk_trace_id" in a10 && "string" == typeof a10.clerk_trace_id ? a10.clerk_trace_id : b10?.get("cf-ray") || "";
      }
      function ep(a10) {
        let b10 = a10?.get("Retry-After");
        if (!b10) return;
        let c10 = parseInt(b10, 10);
        if (!isNaN(c10)) return c10;
      }
      function eq(a10) {
        if (a10 && "object" == typeof a10 && "errors" in a10) {
          let b10 = a10.errors;
          return b10.length > 0 ? b10.map(bq) : [];
        }
        return [];
      }
      function er(a10) {
        let b10 = en(a10);
        return { __experimental_accountlessApplications: new cp(en({ ...a10, requireSecretKey: false })), actorTokens: new cn(b10), allowlistIdentifiers: new cr(b10), apiKeys: new ct(en({ ...a10, skipApiVersionInUrl: true })), betaFeatures: new cu(b10), blocklistIdentifiers: new cw(b10), billing: new dc(b10), clients: new cy(b10), domains: new cA(b10), emailAddresses: new cC(b10), idPOAuthAccessToken: new cD(en({ ...a10, skipApiVersionInUrl: true })), instance: new cF(b10), invitations: new cH(b10), jwks: new cM(b10), jwtTemplates: new cO(b10), machines: new cJ(b10), m2m: new cL(en({ ...a10, skipApiVersionInUrl: true, requireSecretKey: false, useMachineSecretKey: true })), oauthApplications: new cS(b10), organizations: new cQ(b10), phoneNumbers: new cU(b10), proxyChecks: new cV(b10), redirectUrls: new cX(b10), samlConnections: new cZ(b10), sessions: new c_(b10), signInTokens: new c1(b10), signUps: new c3(b10), testingTokens: new c4(b10), users: new c6(b10), waitlistEntries: new c8(b10), webhooks: new da(b10) };
      }
      var es = "oat_", et = ["mt_", es, "ak_"], eu = /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;
      function ev(a10) {
        return eu.test(a10);
      }
      var ew = ["at+jwt", "application/at+jwt"];
      function ex(a10) {
        if (!ev(a10)) return false;
        try {
          let { data: b10, errors: c10 } = bQ(a10);
          return !c10 && !!b10 && ew.includes(b10.header.typ);
        } catch {
          return false;
        }
      }
      function ey(a10) {
        return et.some((b10) => a10.startsWith(b10));
      }
      function ez(a10) {
        return ey(a10) || ex(a10);
      }
      function eA(a10) {
        if (a10.startsWith("mt_")) return cg.M2MToken;
        if (a10.startsWith(es) || ex(a10)) return cg.OAuthToken;
        if (a10.startsWith("ak_")) return cg.ApiKey;
        throw Error("Unknown machine token type");
      }
      var eB = (a10, b10) => !!a10 && ("any" === b10 || (Array.isArray(b10) ? b10 : [b10]).includes(a10)), eC = (a10) => () => {
        let b10 = { ...a10 };
        return b10.secretKey = (b10.secretKey || "").substring(0, 7), b10.jwtKey = (b10.jwtKey || "").substring(0, 7), { ...b10 };
      };
      function eD(a10, b10) {
        return { tokenType: cg.SessionToken, sessionClaims: null, sessionId: null, sessionStatus: b10 ?? null, userId: null, actor: null, orgId: null, orgRole: null, orgSlug: null, orgPermissions: null, factorVerificationAge: null, getToken: () => Promise.resolve(null), has: () => false, debug: eC(a10), isAuthenticated: false };
      }
      function eE(a10, b10) {
        let c10 = { id: null, subject: null, scopes: null, has: () => false, getToken: () => Promise.resolve(null), debug: eC(b10), isAuthenticated: false };
        switch (a10) {
          case cg.ApiKey:
            return { ...c10, tokenType: a10, name: null, claims: null, scopes: null, userId: null, orgId: null };
          case cg.M2MToken:
            return { ...c10, tokenType: a10, claims: null, scopes: null, machineId: null };
          case cg.OAuthToken:
            return { ...c10, tokenType: a10, scopes: null, userId: null, clientId: null };
          default:
            throw Error(`Invalid token type: ${a10}`);
        }
      }
      function eF() {
        return { isAuthenticated: false, tokenType: null, getToken: () => Promise.resolve(null), has: () => false, debug: () => ({}) };
      }
      var eG = ({ authObject: a10, acceptsToken: b10 = cg.SessionToken }) => "any" === b10 ? a10 : Array.isArray(b10) ? eB(a10.tokenType, b10) ? a10 : eF() : eB(a10.tokenType, b10) ? a10 : !function(a11) {
        return a11 === cg.ApiKey || a11 === cg.M2MToken || a11 === cg.OAuthToken;
      }(b10) ? eD(a10.debug) : eE(b10, a10.debug), eH = { SignedIn: "signed-in", SignedOut: "signed-out", Handshake: "handshake" }, eI = { ClientUATWithoutSessionToken: "client-uat-but-no-session-token", DevBrowserMissing: "dev-browser-missing", DevBrowserSync: "dev-browser-sync", PrimaryRespondsToSyncing: "primary-responds-to-syncing", PrimaryDomainCrossOriginSync: "primary-domain-cross-origin-sync", SatelliteCookieNeedsSyncing: "satellite-needs-syncing", SessionTokenAndUATMissing: "session-token-and-uat-missing", SessionTokenMissing: "session-token-missing", SessionTokenExpired: "session-token-expired", SessionTokenIATBeforeClientUAT: "session-token-iat-before-client-uat", SessionTokenNBF: "session-token-nbf", SessionTokenIatInTheFuture: "session-token-iat-in-the-future", SessionTokenWithoutClientUAT: "session-token-but-no-client-uat", ActiveOrganizationMismatch: "active-organization-mismatch", TokenTypeMismatch: "token-type-mismatch", UnexpectedError: "unexpected-error" };
      function eJ(a10) {
        let { authenticateContext: b10, headers: c10 = new Headers(), token: d10 } = a10;
        return { status: eH.SignedIn, reason: null, message: null, proxyUrl: b10.proxyUrl || "", publishableKey: b10.publishableKey || "", isSatellite: b10.isSatellite || false, domain: b10.domain || "", signInUrl: b10.signInUrl || "", signUpUrl: b10.signUpUrl || "", afterSignInUrl: b10.afterSignInUrl || "", afterSignUpUrl: b10.afterSignUpUrl || "", isSignedIn: true, isAuthenticated: true, tokenType: a10.tokenType, toAuth: ({ treatPendingAsSignedOut: c11 = true } = {}) => {
          if (a10.tokenType === cg.SessionToken) {
            let { sessionClaims: e11 } = a10, f11 = function(a11, b11, c12) {
              let d11, { actor: e12, sessionId: f12, sessionStatus: g11, userId: h2, orgId: i2, orgRole: j2, orgSlug: k2, orgPermissions: l2, factorVerificationAge: m2 } = ((a12) => {
                let b12, c13, d12, e13, f13 = a12.fva ?? null, g12 = a12.sts ?? null;
                if (2 === a12.v) {
                  if (a12.o) {
                    b12 = a12.o?.id, d12 = a12.o?.slg, a12.o?.rol && (c13 = `org:${a12.o?.rol}`);
                    let { org: f14 } = b4(a12.fea), { permissions: g13, featurePermissionMap: h3 } = (({ per: a13, fpm: b13 }) => {
                      if (!a13 || !b13) return { permissions: [], featurePermissionMap: [] };
                      let c14 = a13.split(",").map((a14) => a14.trim());
                      return { permissions: c14, featurePermissionMap: b13.split(",").map((a14) => Number.parseInt(a14.trim(), 10)).map((a14) => a14.toString(2).padStart(c14.length, "0").split("").map((a15) => Number.parseInt(a15, 10)).reverse()).filter(Boolean) };
                    })({ per: a12.o?.per, fpm: a12.o?.fpm });
                    e13 = function({ features: a13, permissions: b13, featurePermissionMap: c14 }) {
                      if (!a13 || !b13 || !c14) return [];
                      let d13 = [];
                      for (let e14 = 0; e14 < a13.length; e14++) {
                        let f15 = a13[e14];
                        if (e14 >= c14.length) continue;
                        let g14 = c14[e14];
                        if (g14) for (let a14 = 0; a14 < g14.length; a14++) 1 === g14[a14] && d13.push(`org:${f15}:${b13[a14]}`);
                      }
                      return d13;
                    }({ features: f14, featurePermissionMap: h3, permissions: g13 });
                  }
                } else b12 = a12.org_id, c13 = a12.org_role, d12 = a12.org_slug, e13 = a12.org_permissions;
                return { sessionClaims: a12, sessionId: a12.sid, sessionStatus: g12, actor: a12.act, userId: a12.sub, orgId: b12, orgRole: c13, orgSlug: d12, orgPermissions: e13, factorVerificationAge: f13 };
              })(c12), n2 = er(a11), o2 = ((a12) => {
                let { fetcher: b12, sessionToken: c13, sessionId: d12 } = a12 || {};
                return async (a13 = {}) => d12 ? a13.template || void 0 !== a13.expiresInSeconds ? b12(d12, a13.template, a13.expiresInSeconds) : c13 : null;
              })({ sessionId: f12, sessionToken: b11, fetcher: async (a12, b12, c13) => (await n2.sessions.getToken(a12, b12 || "", c13)).jwt });
              return { tokenType: cg.SessionToken, actor: e12, sessionClaims: c12, sessionId: f12, sessionStatus: g11, userId: h2, orgId: i2, orgRole: j2, orgSlug: k2, orgPermissions: l2, factorVerificationAge: m2, getToken: o2, has: (d11 = { orgId: i2, orgRole: j2, orgPermissions: l2, userId: h2, factorVerificationAge: m2, features: c12.fea || "", plans: c12.pla || "" }, (a12) => {
                if (!d11.userId) return false;
                let b12 = ((a13, b13) => {
                  let { features: c14, plans: d12 } = b13;
                  return a13.feature && c14 ? b3(c14, a13.feature) : a13.plan && d12 ? b3(d12, a13.plan) : null;
                })(a12, d11), c13 = ((a13, b13) => {
                  let { orgId: c14, orgRole: d12, orgPermissions: e14 } = b13;
                  return (a13.role || a13.permission) && c14 && d12 && e14 ? a13.permission ? e14.includes(b2(a13.permission)) : a13.role ? b2(d12) === b2(a13.role) : null : null;
                })(a12, d11), e13 = ((a13, { factorVerificationAge: b13 }) => {
                  if (!a13.reverification || !b13) return null;
                  let c14 = ((a14) => {
                    let b14, c15;
                    if (!a14) return false;
                    let d13 = "string" == typeof a14 && b1.has(a14), e15 = "object" == typeof a14 && (b14 = a14.level, b0.has(b14)) && "number" == typeof (c15 = a14.afterMinutes) && c15 > 0;
                    return (!!d13 || !!e15) && ((a15) => "string" == typeof a15 ? b_[a15] : a15).bind(null, a14);
                  })(a13.reverification);
                  if (!c14) return null;
                  let { level: d12, afterMinutes: e14 } = c14(), [f13, g12] = b13, h3 = -1 !== f13 ? e14 > f13 : null, i3 = -1 !== g12 ? e14 > g12 : null;
                  switch (d12) {
                    case "first_factor":
                      return h3;
                    case "second_factor":
                      return -1 !== g12 ? i3 : h3;
                    case "multi_factor":
                      return -1 === g12 ? h3 : h3 && i3;
                  }
                })(a12, d11);
                return [b12 || c13, e13].some((a13) => null === a13) ? [b12 || c13, e13].some((a13) => true === a13) : [b12 || c13, e13].every((a13) => true === a13);
              }), debug: eC({ ...a11, sessionToken: b11 }), isAuthenticated: true };
            }(b10, d10, e11);
            return c11 && "pending" === f11.sessionStatus ? eD(void 0, f11.sessionStatus) : f11;
          }
          let { machineData: e10 } = a10;
          var f10 = a10.tokenType;
          let g10 = { id: e10.id, subject: e10.subject, getToken: () => Promise.resolve(d10), has: () => false, debug: eC(b10), isAuthenticated: true };
          switch (f10) {
            case cg.ApiKey:
              return { ...g10, tokenType: f10, name: e10.name, claims: e10.claims, scopes: e10.scopes, userId: e10.subject.startsWith("user_") ? e10.subject : null, orgId: e10.subject.startsWith("org_") ? e10.subject : null };
            case cg.M2MToken:
              return { ...g10, tokenType: f10, claims: e10.claims, scopes: e10.scopes, machineId: e10.subject };
            case cg.OAuthToken:
              return { ...g10, tokenType: f10, scopes: e10.scopes, userId: e10.subject, clientId: e10.clientId };
            default:
              throw Error(`Invalid token type: ${f10}`);
          }
        }, headers: c10, token: d10 };
      }
      function eK(a10) {
        let { authenticateContext: b10, headers: c10 = new Headers(), reason: d10, message: e10 = "", tokenType: f10 } = a10;
        return eL({ status: eH.SignedOut, reason: d10, message: e10, proxyUrl: b10.proxyUrl || "", publishableKey: b10.publishableKey || "", isSatellite: b10.isSatellite || false, domain: b10.domain || "", signInUrl: b10.signInUrl || "", signUpUrl: b10.signUpUrl || "", afterSignInUrl: b10.afterSignInUrl || "", afterSignUpUrl: b10.afterSignUpUrl || "", isSignedIn: false, isAuthenticated: false, tokenType: f10, toAuth: () => f10 === cg.SessionToken ? eD({ ...b10, status: eH.SignedOut, reason: d10, message: e10 }) : eE(f10, { reason: d10, message: e10, headers: c10 }), headers: c10, token: null });
      }
      var eL = (a10) => {
        let b10 = new Headers(a10.headers || {});
        if (a10.message) try {
          b10.set(cb.Headers.AuthMessage, a10.message);
        } catch {
        }
        if (a10.reason) try {
          b10.set(cb.Headers.AuthReason, a10.reason);
        } catch {
        }
        if (a10.status) try {
          b10.set(cb.Headers.AuthStatus, a10.status);
        } catch {
        }
        return a10.headers = b10, a10;
      }, eM = ((a10, b10, c10) => (c10 = null != a10 ? bS(bW(a10)) : {}, ((a11, b11, c11, d10) => {
        if (b11 && "object" == typeof b11 || "function" == typeof b11) for (let e10 of bV(b11)) bX.call(a11, e10) || e10 === c11 || bT(a11, e10, { get: () => b11[e10], enumerable: !(d10 = bU(b11, e10)) || d10.enumerable });
        return a11;
      })(!b10 && a10 && a10.__esModule ? c10 : bT(c10, "default", { value: a10, enumerable: true }), a10)))(b5()), eN = class extends URL {
        isCrossOrigin(a10) {
          return this.origin !== new URL(a10.toString()).origin;
        }
      }, eO = (...a10) => new eN(...a10), eP = class extends Request {
        constructor(a10, b10) {
          super("string" != typeof a10 && "url" in a10 ? a10.url : String(a10), b10 || "string" == typeof a10 ? void 0 : a10), this.clerkUrl = this.deriveUrlFromHeaders(this), this.cookies = this.parseCookies(this);
        }
        toJSON() {
          return { url: this.clerkUrl.href, method: this.method, headers: JSON.stringify(Object.fromEntries(this.headers)), clerkUrl: this.clerkUrl.toString(), cookies: JSON.stringify(Object.fromEntries(this.cookies)) };
        }
        deriveUrlFromHeaders(a10) {
          let b10 = new URL(a10.url), c10 = a10.headers.get(cb.Headers.ForwardedProto), d10 = a10.headers.get(cb.Headers.ForwardedHost), e10 = a10.headers.get(cb.Headers.Host), f10 = b10.protocol, g10 = this.getFirstValueFromHeader(d10) ?? e10, h2 = this.getFirstValueFromHeader(c10) ?? f10?.replace(/[:/]/, ""), i2 = g10 && h2 ? `${h2}://${g10}` : b10.origin;
          return i2 === b10.origin ? eO(b10) : eO(b10.pathname + b10.search, i2);
        }
        getFirstValueFromHeader(a10) {
          return a10?.split(",")[0];
        }
        parseCookies(a10) {
          return new Map(Object.entries((0, eM.parse)(this.decodeCookieValue(a10.headers.get("cookie") || ""))));
        }
        decodeCookieValue(a10) {
          return a10 ? a10.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent) : a10;
        }
      }, eQ = (...a10) => a10[0] && "object" == typeof a10[0] && "clerkUrl" in a10[0] && "cookies" in a10[0] ? a10[0] : new eP(...a10), eR = (a10) => a10.split(";")[0]?.split("=")[0], eS = (a10) => a10.split(";")[0]?.split("=")[1], eT = {}, eU = 0;
      function eV(a10, b10, c10 = true) {
        eT[a10] = b10, eU = c10 ? Date.now() : -1;
      }
      function eW(a10) {
        let { kid: b10, pem: c10 } = a10, d10 = `local-${b10}`, e10 = eT[d10];
        if (e10) return e10;
        if (!c10) throw new bB({ action: bA.SetClerkJWTKey, message: "Missing local JWK.", reason: bz.LocalJWKMissing });
        let f10 = { kid: d10, kty: "RSA", alg: "RS256", n: c10.replace(/\r\n|\n|\r/g, "").replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replace("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA", "").replace("IDAQAB", "").replace(/\+/g, "-").replace(/\//g, "_"), e: "AQAB" };
        return eV(d10, f10, false), f10;
      }
      async function eX(a10) {
        let { secretKey: b10, apiUrl: c10 = b6, apiVersion: d10 = "v1", kid: e10, skipJwksCache: f10 } = a10;
        if (f10 || function() {
          if (-1 === eU) return false;
          let a11 = Date.now() - eU >= 3e5;
          return a11 && (eT = {}), a11;
        }() || !eT[e10]) {
          if (!b10) throw new bB({ action: bA.ContactSupport, message: "Failed to load JWKS from Clerk Backend or Frontend API.", reason: bz.RemoteJWKFailedToLoad });
          let { keys: a11 } = await bn(() => eY(c10, b10, d10));
          if (!a11 || !a11.length) throw new bB({ action: bA.ContactSupport, message: "The JWKS endpoint did not contain any signing keys. Contact support@clerk.com.", reason: bz.RemoteJWKFailedToLoad });
          a11.forEach((a12) => eV(a12.kid, a12));
        }
        let g10 = eT[e10];
        if (!g10) {
          let a11 = Object.values(eT).map((a12) => a12.kid).sort().join(", ");
          throw new bB({ action: `Go to your Dashboard and validate your secret and public keys are correct. ${bA.ContactSupport} if the issue persists.`, message: `Unable to find a signing key in JWKS that matches the kid='${e10}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid is available: ${a11}`, reason: bz.JWKKidMismatch });
        }
        return g10;
      }
      async function eY(a10, b10, c10) {
        if (!b10) throw new bB({ action: bA.SetClerkSecretKey, message: "Missing Clerk Secret Key or API Key. Go to https://dashboard.clerk.com and get your key for your instance.", reason: bz.RemoteJWKFailedToLoad });
        let d10 = new URL(a10);
        d10.pathname = ck(d10.pathname, c10, "/jwks");
        let e10 = await bG.fetch(d10.href, { headers: { Authorization: `Bearer ${b10}`, "Clerk-API-Version": b8, "Content-Type": "application/json", "User-Agent": b7 } });
        if (!e10.ok) {
          let a11 = await e10.json(), b11 = eZ(a11?.errors, by.InvalidSecretKey);
          if (b11) {
            let a12 = bz.InvalidSecretKey;
            throw new bB({ action: bA.ContactSupport, message: b11.message, reason: a12 });
          }
          throw new bB({ action: bA.ContactSupport, message: `Error loading Clerk JWKS from ${d10.href} with code=${e10.status}`, reason: bz.RemoteJWKFailedToLoad });
        }
        return e10.json();
      }
      var eZ = (a10, b10) => a10 ? a10.find((a11) => a11.code === b10) : null;
      async function e$(a10, b10) {
        let { data: c10, errors: d10 } = bQ(a10);
        if (d10) return { errors: d10 };
        let { header: e10 } = c10, { kid: f10 } = e10;
        try {
          let c11;
          if (b10.jwtKey) c11 = eW({ kid: f10, pem: b10.jwtKey });
          else {
            if (!b10.secretKey) return { errors: [new bB({ action: bA.SetClerkJWTKey, message: "Failed to resolve JWK during verification.", reason: bz.JWKFailedToResolve })] };
            c11 = await eX({ ...b10, kid: f10 });
          }
          return await bR(a10, { ...b10, key: c11 });
        } catch (a11) {
          return { errors: [a11] };
        }
      }
      function e_(a10, b10, c10) {
        if (bt(b10)) {
          let d10, e10;
          switch (b10.status) {
            case 401:
              d10 = bC.InvalidSecretKey, e10 = b10.errors[0]?.message || "Invalid secret key";
              break;
            case 404:
              d10 = bC.TokenInvalid, e10 = c10;
              break;
            default:
              d10 = bC.UnexpectedError, e10 = "Unexpected error";
          }
          return { data: void 0, tokenType: a10, errors: [new bD({ message: e10, code: d10, status: b10.status })] };
        }
        return { data: void 0, tokenType: a10, errors: [new bD({ message: "Unexpected error", code: bC.UnexpectedError, status: b10.status })] };
      }
      async function e0(a10, b10) {
        try {
          let c10 = er(b10);
          return { data: await c10.m2m.verify({ token: a10 }), tokenType: cg.M2MToken, errors: void 0 };
        } catch (a11) {
          return e_(cg.M2MToken, a11, "Machine token not found");
        }
      }
      async function e1(a10, b10) {
        let c10, d10;
        try {
          c10 = bQ(a10);
        } catch (a11) {
          return { data: void 0, tokenType: cg.OAuthToken, errors: [new bD({ code: bC.TokenInvalid, message: a11.message })] };
        }
        let { data: e10, errors: f10 } = c10;
        if (f10) return { data: void 0, tokenType: cg.OAuthToken, errors: [new bD({ code: bC.TokenInvalid, message: f10[0].message })] };
        let { header: g10 } = e10, { kid: h2 } = g10;
        try {
          if (b10.jwtKey) d10 = eW({ kid: h2, pem: b10.jwtKey });
          else {
            if (!b10.secretKey) return { data: void 0, tokenType: cg.OAuthToken, errors: [new bD({ action: bA.SetClerkJWTKey, message: "Failed to resolve JWK during verification.", code: bC.TokenVerificationFailed })] };
            d10 = await eX({ ...b10, kid: h2 });
          }
          let { data: c11, errors: e11 } = await bR(a10, { ...b10, key: d10, headerType: ew });
          if (e11) return { data: void 0, tokenType: cg.OAuthToken, errors: [new bD({ code: bC.TokenVerificationFailed, message: e11[0].message })] };
          return { data: dM.fromJwtPayload(c11, b10.clockSkewInMs), tokenType: cg.OAuthToken, errors: void 0 };
        } catch (a11) {
          return { tokenType: cg.OAuthToken, errors: [new bD({ code: bC.TokenVerificationFailed, message: a11.message })] };
        }
      }
      async function e2(a10, b10) {
        if (ev(a10)) return e1(a10, b10);
        try {
          let c10 = er(b10);
          return { data: await c10.idPOAuthAccessToken.verify(a10), tokenType: cg.OAuthToken, errors: void 0 };
        } catch (a11) {
          return e_(cg.OAuthToken, a11, "OAuth token not found");
        }
      }
      async function e3(a10, b10) {
        try {
          let c10 = er(b10);
          return { data: await c10.apiKeys.verify(a10), tokenType: cg.ApiKey, errors: void 0 };
        } catch (a11) {
          return e_(cg.ApiKey, a11, "API key not found");
        }
      }
      async function e4(a10, b10) {
        if (a10.startsWith("mt_")) return e0(a10, b10);
        if (a10.startsWith(es) || ev(a10)) return e2(a10, b10);
        if (a10.startsWith("ak_")) return e3(a10, b10);
        throw Error("Unknown machine token type");
      }
      async function e5(a10, { key: b10 }) {
        let { data: c10, errors: d10 } = bQ(a10);
        if (d10) throw d10[0];
        let { header: e10, payload: f10 } = c10, { typ: g10, alg: h2 } = e10;
        bN(g10), bO(h2);
        let { data: i2, errors: j2 } = await bP(c10, b10);
        if (j2) throw new bB({ reason: bz.TokenVerificationFailed, message: `Error verifying handshake token. ${j2[0]}` });
        if (!i2) throw new bB({ reason: bz.TokenInvalidSignature, message: "Handshake signature is invalid." });
        return f10;
      }
      async function e6(a10, b10) {
        let c10, { secretKey: d10, apiUrl: e10, apiVersion: f10, jwksCacheTtlInMs: g10, jwtKey: h2, skipJwksCache: i2 } = b10, { data: j2, errors: k2 } = bQ(a10);
        if (k2) throw k2[0];
        let { kid: l2 } = j2.header;
        if (h2) c10 = eW({ kid: l2, pem: h2 });
        else if (d10) c10 = await eX({ secretKey: d10, apiUrl: e10, apiVersion: f10, kid: l2, jwksCacheTtlInMs: g10, skipJwksCache: i2 });
        else throw new bB({ action: bA.SetClerkJWTKey, message: "Failed to resolve JWK during handshake verification.", reason: bz.JWKFailedToResolve });
        return e5(a10, { key: c10 });
      }
      var e7 = class {
        constructor(a10, b10, c10) {
          this.authenticateContext = a10, this.options = b10, this.organizationMatcher = c10;
        }
        isRequestEligibleForHandshake() {
          let { accept: a10, secFetchDest: b10 } = this.authenticateContext;
          return !!("document" === b10 || "iframe" === b10 || !b10 && a10?.startsWith("text/html"));
        }
        buildRedirectToHandshake(a10) {
          if (!this.authenticateContext?.clerkUrl) throw Error("Missing clerkUrl in authenticateContext");
          let b10 = this.removeDevBrowserFromURL(this.authenticateContext.clerkUrl), c10 = this.authenticateContext.frontendApi.startsWith("http") ? this.authenticateContext.frontendApi : `https://${this.authenticateContext.frontendApi}`, d10 = new URL("v1/client/handshake", c10 = c10.replace(/\/+$/, "") + "/");
          d10.searchParams.append("redirect_url", b10?.href || ""), d10.searchParams.append("__clerk_api_version", b8), d10.searchParams.append(cb.QueryParameters.SuffixedCookies, this.authenticateContext.usesSuffixedCookies().toString()), d10.searchParams.append(cb.QueryParameters.HandshakeReason, a10), d10.searchParams.append(cb.QueryParameters.HandshakeFormat, "nonce"), this.authenticateContext.sessionToken && d10.searchParams.append(cb.QueryParameters.Session, this.authenticateContext.sessionToken), "development" === this.authenticateContext.instanceType && this.authenticateContext.devBrowserToken && d10.searchParams.append(cb.QueryParameters.DevBrowser, this.authenticateContext.devBrowserToken);
          let e10 = this.getOrganizationSyncTarget(this.authenticateContext.clerkUrl, this.organizationMatcher);
          return e10 && this.getOrganizationSyncQueryParams(e10).forEach((a11, b11) => {
            d10.searchParams.append(b11, a11);
          }), new Headers({ [cb.Headers.Location]: d10.href });
        }
        async getCookiesFromHandshake() {
          let a10 = [];
          if (this.authenticateContext.handshakeNonce) try {
            let b10 = await this.authenticateContext.apiClient?.clients.getHandshakePayload({ nonce: this.authenticateContext.handshakeNonce });
            b10 && a10.push(...b10.directives);
          } catch (a11) {
            console.error("Clerk: HandshakeService: error getting handshake payload:", a11);
          }
          else if (this.authenticateContext.handshakeToken) {
            let b10 = await e6(this.authenticateContext.handshakeToken, this.authenticateContext);
            b10 && Array.isArray(b10.handshake) && a10.push(...b10.handshake);
          }
          return a10;
        }
        async resolveHandshake() {
          let a10 = new Headers({ "Access-Control-Allow-Origin": "null", "Access-Control-Allow-Credentials": "true" }), b10 = await this.getCookiesFromHandshake(), c10 = "";
          if (b10.forEach((b11) => {
            a10.append("Set-Cookie", b11), eR(b11).startsWith(cb.Cookies.Session) && (c10 = eS(b11));
          }), "development" === this.authenticateContext.instanceType) {
            let b11 = new URL(this.authenticateContext.clerkUrl);
            b11.searchParams.delete(cb.QueryParameters.Handshake), b11.searchParams.delete(cb.QueryParameters.HandshakeHelp), b11.searchParams.delete(cb.QueryParameters.DevBrowser), b11.searchParams.delete(cb.QueryParameters.HandshakeNonce), a10.append(cb.Headers.Location, b11.toString()), a10.set(cb.Headers.CacheControl, "no-store");
          }
          if ("" === c10) return eK({ tokenType: cg.SessionToken, authenticateContext: this.authenticateContext, reason: eI.SessionTokenMissing, message: "", headers: a10 });
          let { data: d10, errors: [e10] = [] } = await e$(c10, this.authenticateContext);
          if (d10) return eJ({ tokenType: cg.SessionToken, authenticateContext: this.authenticateContext, sessionClaims: d10, headers: a10, token: c10 });
          if ("development" === this.authenticateContext.instanceType && (e10?.reason === bz.TokenExpired || e10?.reason === bz.TokenNotActiveYet || e10?.reason === bz.TokenIatInTheFuture)) {
            let b11 = new bB({ action: e10.action, message: e10.message, reason: e10.reason });
            b11.tokenCarrier = "cookie", console.error(`Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${b11.getFullMessage()}`);
            let { data: d11, errors: [f10] = [] } = await e$(c10, { ...this.authenticateContext, clockSkewInMs: 864e5 });
            if (d11) return eJ({ tokenType: cg.SessionToken, authenticateContext: this.authenticateContext, sessionClaims: d11, headers: a10, token: c10 });
            throw Error(f10?.message || "Clerk: Handshake retry failed.");
          }
          throw Error(e10?.message || "Clerk: Handshake failed.");
        }
        handleTokenVerificationErrorInDevelopment(a10) {
          if (a10.reason === bz.TokenInvalidSignature) throw Error("Clerk: Handshake token verification failed due to an invalid signature. If you have switched Clerk keys locally, clear your cookies and try again.");
          throw Error(`Clerk: Handshake token verification failed: ${a10.getFullMessage()}.`);
        }
        checkAndTrackRedirectLoop(a10) {
          if (3 === this.authenticateContext.handshakeRedirectLoopCounter) return true;
          let b10 = this.authenticateContext.handshakeRedirectLoopCounter + 1, c10 = cb.Cookies.RedirectCount;
          return a10.append("Set-Cookie", `${c10}=${b10}; SameSite=Lax; HttpOnly; Max-Age=2`), false;
        }
        removeDevBrowserFromURL(a10) {
          let b10 = new URL(a10);
          return b10.searchParams.delete(cb.QueryParameters.DevBrowser), b10.searchParams.delete(cb.QueryParameters.LegacyDevBrowser), b10;
        }
        getOrganizationSyncTarget(a10, b10) {
          return b10.findTarget(a10);
        }
        getOrganizationSyncQueryParams(a10) {
          let b10 = /* @__PURE__ */ new Map();
          return "personalAccount" === a10.type && b10.set("organization_id", ""), "organization" === a10.type && (a10.organizationId && b10.set("organization_id", a10.organizationId), a10.organizationSlug && b10.set("organization_id", a10.organizationSlug)), b10;
        }
      }, e8 = class {
        constructor(a10) {
          this.organizationPattern = this.createMatcher(a10?.organizationPatterns), this.personalAccountPattern = this.createMatcher(a10?.personalAccountPatterns);
        }
        createMatcher(a10) {
          if (!a10) return null;
          try {
            return function(a11, b10) {
              try {
                var c10, d10, e10, f10, g10, h2, i2;
                return c10 = void 0, d10 = [], e10 = a3(a11, d10, c10), f10 = d10, g10 = c10, void 0 === g10 && (g10 = {}), h2 = g10.decode, i2 = void 0 === h2 ? function(a12) {
                  return a12;
                } : h2, function(a12) {
                  var b11 = e10.exec(a12);
                  if (!b11) return false;
                  for (var c11 = b11[0], d11 = b11.index, g11 = /* @__PURE__ */ Object.create(null), h3 = 1; h3 < b11.length; h3++) !function(a13) {
                    if (void 0 !== b11[a13]) {
                      var c12 = f10[a13 - 1];
                      "*" === c12.modifier || "+" === c12.modifier ? g11[c12.name] = b11[a13].split(c12.prefix + c12.suffix).map(function(a14) {
                        return i2(a14, c12);
                      }) : g11[c12.name] = i2(b11[a13], c12);
                    }
                  }(h3);
                  return { path: c11, index: d11, params: g11 };
                };
              } catch (a12) {
                throw Error(`Invalid path and options: Consult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x
${a12.message}`);
              }
            }(a10);
          } catch (b10) {
            throw Error(`Invalid pattern "${a10}": ${b10}`);
          }
        }
        findTarget(a10) {
          let b10 = this.findOrganizationTarget(a10);
          return b10 || this.findPersonalAccountTarget(a10);
        }
        findOrganizationTarget(a10) {
          if (!this.organizationPattern) return null;
          try {
            let b10 = this.organizationPattern(a10.pathname);
            if (!b10 || !("params" in b10)) return null;
            let c10 = b10.params;
            if (c10.id) return { type: "organization", organizationId: c10.id };
            if (c10.slug) return { type: "organization", organizationSlug: c10.slug };
            return null;
          } catch (a11) {
            return console.error("Failed to match organization pattern:", a11), null;
          }
        }
        findPersonalAccountTarget(a10) {
          if (!this.personalAccountPattern) return null;
          try {
            return this.personalAccountPattern(a10.pathname) ? { type: "personalAccount" } : null;
          } catch (a11) {
            return console.error("Failed to match personal account pattern:", a11), null;
          }
        }
      }, e9 = { NonEligibleNoCookie: "non-eligible-no-refresh-cookie", NonEligibleNonGet: "non-eligible-non-get", InvalidSessionToken: "invalid-session-token", MissingApiClient: "missing-api-client", MissingSessionToken: "missing-session-token", MissingRefreshToken: "missing-refresh-token", ExpiredSessionTokenDecodeFailed: "expired-session-token-decode-failed", ExpiredSessionTokenMissingSidClaim: "expired-session-token-missing-sid-claim", FetchError: "fetch-error", UnexpectedSDKError: "unexpected-sdk-error", UnexpectedBAPIError: "unexpected-bapi-error" };
      function fa(a10, b10, c10) {
        return eB(a10, b10) ? null : eK({ tokenType: "string" == typeof b10 ? b10 : a10, authenticateContext: c10, reason: eI.TokenTypeMismatch });
      }
      var fb = async (a10, b10) => {
        let c10 = await ci(eQ(a10), b10), d10 = b10.acceptsToken ?? cg.SessionToken;
        if (d10 !== cg.M2MToken && (cf(c10.secretKey), c10.isSatellite)) {
          var e10 = c10.signInUrl, f10 = c10.secretKey;
          if (!e10 && bi(f10)) throw Error("Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite");
          if (c10.signInUrl && c10.origin && function(a11, b11) {
            let c11;
            try {
              c11 = new URL(a11);
            } catch {
              throw Error("The signInUrl needs to have a absolute url format.");
            }
            if (c11.origin === b11) throw Error("The signInUrl needs to be on a different origin than your satellite application.");
          }(c10.signInUrl, c10.origin), !(c10.proxyUrl || c10.domain)) throw Error("Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl");
        }
        d10 === cg.M2MToken && function(a11) {
          if (!a11.machineSecretKey && !a11.secretKey) throw Error("Machine token authentication requires either a Machine secret key or a Clerk secret key. Ensure a Clerk secret key or Machine secret key is set.");
        }(c10);
        let g10 = new e8(b10.organizationSyncOptions), h2 = new e7(c10, { organizationSyncOptions: b10.organizationSyncOptions }, g10);
        async function i2(c11) {
          if (!b10.apiClient) return { data: null, error: { message: "An apiClient is needed to perform token refresh.", cause: { reason: e9.MissingApiClient } } };
          let { sessionToken: d11, refreshTokenInCookie: e11 } = c11;
          if (!d11) return { data: null, error: { message: "Session token must be provided.", cause: { reason: e9.MissingSessionToken } } };
          if (!e11) return { data: null, error: { message: "Refresh token must be provided.", cause: { reason: e9.MissingRefreshToken } } };
          let { data: f11, errors: g11 } = bQ(d11);
          if (!f11 || g11) return { data: null, error: { message: "Unable to decode the expired session token.", cause: { reason: e9.ExpiredSessionTokenDecodeFailed, errors: g11 } } };
          if (!f11?.payload?.sid) return { data: null, error: { message: "Expired session token is missing the `sid` claim.", cause: { reason: e9.ExpiredSessionTokenMissingSidClaim } } };
          try {
            return { data: (await b10.apiClient.sessions.refreshSession(f11.payload.sid, { format: "cookie", suffixed_cookies: c11.usesSuffixedCookies(), expired_token: d11 || "", refresh_token: e11 || "", request_origin: c11.clerkUrl.origin, request_headers: Object.fromEntries(Array.from(a10.headers.entries()).map(([a11, b11]) => [a11, [b11]])) })).cookies, error: null };
          } catch (a11) {
            if (!a11?.errors?.length) return { data: null, error: { message: "Unexpected Server/BAPI error", cause: { reason: e9.UnexpectedBAPIError, errors: [a11] } } };
            if ("unexpected_error" === a11.errors[0].code) return { data: null, error: { message: "Fetch unexpected error", cause: { reason: e9.FetchError, errors: a11.errors } } };
            return { data: null, error: { message: a11.errors[0].code, cause: { reason: a11.errors[0].code, errors: a11.errors } } };
          }
        }
        async function j2(a11) {
          let { data: b11, error: c11 } = await i2(a11);
          if (!b11 || 0 === b11.length) return { data: null, error: c11 };
          let d11 = new Headers(), e11 = "";
          b11.forEach((a12) => {
            d11.append("Set-Cookie", a12), eR(a12).startsWith(cb.Cookies.Session) && (e11 = eS(a12));
          });
          let { data: f11, errors: g11 } = await e$(e11, a11);
          return g11 ? { data: null, error: { message: "Clerk: unable to verify refreshed session token.", cause: { reason: e9.InvalidSessionToken, errors: g11 } } } : { data: { jwtPayload: f11, sessionToken: e11, headers: d11 }, error: null };
        }
        function k2(a11, b11, c11, d11) {
          if (!h2.isRequestEligibleForHandshake()) return eK({ tokenType: cg.SessionToken, authenticateContext: a11, reason: b11, message: c11 });
          let e11 = d11 ?? h2.buildRedirectToHandshake(b11);
          return (e11.get(cb.Headers.Location) && e11.set(cb.Headers.CacheControl, "no-store"), h2.checkAndTrackRedirectLoop(e11)) ? (console.log("Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match - make sure to copy the correct publishable and secret keys from the Clerk dashboard."), eK({ tokenType: cg.SessionToken, authenticateContext: a11, reason: b11, message: c11 })) : function(a12, b12, c12 = "", d12) {
            return eL({ status: eH.Handshake, reason: b12, message: c12, publishableKey: a12.publishableKey || "", isSatellite: a12.isSatellite || false, domain: a12.domain || "", proxyUrl: a12.proxyUrl || "", signInUrl: a12.signInUrl || "", signUpUrl: a12.signUpUrl || "", afterSignInUrl: a12.afterSignInUrl || "", afterSignUpUrl: a12.afterSignUpUrl || "", isSignedIn: false, isAuthenticated: false, tokenType: cg.SessionToken, toAuth: () => null, headers: d12, token: null });
          }(a11, b11, c11, e11);
        }
        async function l2() {
          let { tokenInHeader: a11 } = c10;
          try {
            let { data: b11, errors: d11 } = await e$(a11, c10);
            if (d11) throw d11[0];
            return eJ({ tokenType: cg.SessionToken, authenticateContext: c10, sessionClaims: b11, headers: new Headers(), token: a11 });
          } catch (a12) {
            return n2(a12, "header");
          }
        }
        async function m2() {
          let a11 = c10.clientUat, b11 = !!c10.sessionTokenInCookie, d11 = !!c10.devBrowserToken;
          if (c10.handshakeNonce || c10.handshakeToken) try {
            return await h2.resolveHandshake();
          } catch (a12) {
            a12 instanceof bB && "development" === c10.instanceType ? h2.handleTokenVerificationErrorInDevelopment(a12) : console.error("Clerk: unable to resolve handshake:", a12);
          }
          let e11 = c10.isSatellite && "document" === c10.secFetchDest;
          if ("production" === c10.instanceType && e11) return k2(c10, eI.SatelliteCookieNeedsSyncing, "");
          if ("development" === c10.instanceType && e11 && !c10.clerkUrl.searchParams.has(cb.QueryParameters.ClerkSynced)) {
            let a12 = new URL(c10.signInUrl);
            a12.searchParams.append(cb.QueryParameters.ClerkRedirectUrl, c10.clerkUrl.toString());
            let b12 = new Headers({ [cb.Headers.Location]: a12.toString() });
            return k2(c10, eI.SatelliteCookieNeedsSyncing, "", b12);
          }
          let f11 = new URL(c10.clerkUrl).searchParams.get(cb.QueryParameters.ClerkRedirectUrl);
          if ("development" === c10.instanceType && !c10.isSatellite && f11) {
            let a12 = new URL(f11);
            c10.devBrowserToken && a12.searchParams.append(cb.QueryParameters.DevBrowser, c10.devBrowserToken), a12.searchParams.append(cb.QueryParameters.ClerkSynced, "true");
            let b12 = new Headers({ [cb.Headers.Location]: a12.toString() });
            return k2(c10, eI.PrimaryRespondsToSyncing, "", b12);
          }
          if ("development" === c10.instanceType && c10.clerkUrl.searchParams.has(cb.QueryParameters.DevBrowser)) return k2(c10, eI.DevBrowserSync, "");
          if ("development" === c10.instanceType && !d11) return k2(c10, eI.DevBrowserMissing, "");
          if (!a11 && !b11) return eK({ tokenType: cg.SessionToken, authenticateContext: c10, reason: eI.SessionTokenAndUATMissing });
          if (!a11 && b11) return k2(c10, eI.SessionTokenWithoutClientUAT, "");
          if (a11 && !b11) return k2(c10, eI.ClientUATWithoutSessionToken, "");
          let { data: i3, errors: j3 } = bQ(c10.sessionTokenInCookie);
          if (j3) return n2(j3[0], "cookie");
          if (i3.payload.iat < c10.clientUat) return k2(c10, eI.SessionTokenIATBeforeClientUAT, "");
          try {
            let { data: a12, errors: b12 } = await e$(c10.sessionTokenInCookie, c10);
            if (b12) throw b12[0];
            let d12 = eJ({ tokenType: cg.SessionToken, authenticateContext: c10, sessionClaims: a12, headers: new Headers(), token: c10.sessionTokenInCookie });
            if (!c10.isSatellite && "document" === c10.secFetchDest && c10.isCrossOriginReferrer() && !c10.isKnownClerkReferrer() && 0 === c10.handshakeRedirectLoopCounter) return k2(c10, eI.PrimaryDomainCrossOriginSync, "Cross-origin request from satellite domain requires handshake");
            let e12 = d12.toAuth();
            if (e12.userId) {
              let a13 = function(a14, b13) {
                let c11 = g10.findTarget(a14.clerkUrl);
                if (!c11) return null;
                let d13 = false;
                if ("organization" === c11.type && (c11.organizationSlug && c11.organizationSlug !== b13.orgSlug && (d13 = true), c11.organizationId && c11.organizationId !== b13.orgId && (d13 = true)), "personalAccount" === c11.type && b13.orgId && (d13 = true), !d13) return null;
                if (a14.handshakeRedirectLoopCounter >= 3) return console.warn("Clerk: Organization activation handshake loop detected. This is likely due to an invalid organization ID or slug. Skipping organization activation."), null;
                let e13 = k2(a14, eI.ActiveOrganizationMismatch, "");
                return "handshake" !== e13.status ? null : e13;
              }(c10, e12);
              if (a13) return a13;
            }
            return d12;
          } catch (a12) {
            return n2(a12, "cookie");
          }
        }
        async function n2(b11, d11) {
          let e11;
          if (!(b11 instanceof bB)) return eK({ tokenType: cg.SessionToken, authenticateContext: c10, reason: eI.UnexpectedError });
          if (b11.reason === bz.TokenExpired && c10.refreshTokenInCookie && "GET" === a10.method) {
            let { data: a11, error: b12 } = await j2(c10);
            if (a11) return eJ({ tokenType: cg.SessionToken, authenticateContext: c10, sessionClaims: a11.jwtPayload, headers: a11.headers, token: a11.sessionToken });
            e11 = b12?.cause?.reason ? b12.cause.reason : e9.UnexpectedSDKError;
          } else e11 = "GET" !== a10.method ? e9.NonEligibleNonGet : c10.refreshTokenInCookie ? null : e9.NonEligibleNoCookie;
          return (b11.tokenCarrier = d11, [bz.TokenExpired, bz.TokenNotActiveYet, bz.TokenIatInTheFuture].includes(b11.reason)) ? k2(c10, fd({ tokenError: b11.reason, refreshError: e11 }), b11.getFullMessage()) : eK({ tokenType: cg.SessionToken, authenticateContext: c10, reason: b11.reason, message: b11.getFullMessage() });
        }
        function o2(a11, b11) {
          return b11 instanceof bD ? eK({ tokenType: a11, authenticateContext: c10, reason: b11.code, message: b11.getFullMessage() }) : eK({ tokenType: a11, authenticateContext: c10, reason: eI.UnexpectedError });
        }
        async function p2() {
          let { tokenInHeader: a11 } = c10;
          if (!a11) return n2(Error("Missing token in header"), "header");
          if (!ez(a11)) return eK({ tokenType: d10, authenticateContext: c10, reason: eI.TokenTypeMismatch, message: "" });
          let b11 = fa(eA(a11), d10, c10);
          if (b11) return b11;
          let { data: e11, tokenType: f11, errors: g11 } = await e4(a11, c10);
          return g11 ? o2(f11, g11[0]) : eJ({ tokenType: f11, authenticateContext: c10, machineData: e11, token: a11 });
        }
        async function q2() {
          let { tokenInHeader: a11 } = c10;
          if (!a11) return n2(Error("Missing token in header"), "header");
          if (ez(a11)) {
            let b12 = fa(eA(a11), d10, c10);
            if (b12) return b12;
            let { data: e12, tokenType: f11, errors: g11 } = await e4(a11, c10);
            return g11 ? o2(f11, g11[0]) : eJ({ tokenType: f11, authenticateContext: c10, machineData: e12, token: a11 });
          }
          let { data: b11, errors: e11 } = await e$(a11, c10);
          return e11 ? n2(e11[0], "header") : eJ({ tokenType: cg.SessionToken, authenticateContext: c10, sessionClaims: b11, token: a11 });
        }
        return Array.isArray(d10) && !function(a11, b11) {
          let c11 = null, { tokenInHeader: d11 } = b11;
          return d11 && (c11 = ez(d11) ? eA(d11) : cg.SessionToken), eB(c11 ?? cg.SessionToken, a11);
        }(d10, c10) ? function() {
          let a11 = eF();
          return eL({ status: eH.SignedOut, reason: eI.TokenTypeMismatch, message: "", proxyUrl: "", publishableKey: "", isSatellite: false, domain: "", signInUrl: "", signUpUrl: "", afterSignInUrl: "", afterSignUpUrl: "", isSignedIn: false, isAuthenticated: false, tokenType: null, toAuth: () => a11, headers: new Headers(), token: null });
        }() : c10.tokenInHeader ? "any" === d10 || Array.isArray(d10) ? q2() : d10 === cg.SessionToken ? l2() : p2() : d10 === cg.OAuthToken || d10 === cg.ApiKey || d10 === cg.M2MToken ? eK({ tokenType: d10, authenticateContext: c10, reason: "No token in header" }) : m2();
      }, fc = (a10) => {
        let { isSignedIn: b10, isAuthenticated: c10, proxyUrl: d10, reason: e10, message: f10, publishableKey: g10, isSatellite: h2, domain: i2 } = a10;
        return { isSignedIn: b10, isAuthenticated: c10, proxyUrl: d10, reason: e10, message: f10, publishableKey: g10, isSatellite: h2, domain: i2 };
      }, fd = ({ tokenError: a10, refreshError: b10 }) => {
        switch (a10) {
          case bz.TokenExpired:
            return `${eI.SessionTokenExpired}-refresh-${b10}`;
          case bz.TokenNotActiveYet:
            return eI.SessionTokenNBF;
          case bz.TokenIatInTheFuture:
            return eI.SessionTokenIatInTheFuture;
          default:
            return eI.UnexpectedError;
        }
      }, fe = { secretKey: "", machineSecretKey: "", jwtKey: "", apiUrl: void 0, apiVersion: void 0, proxyUrl: "", publishableKey: "", isSatellite: false, domain: "", audience: "" };
      c(821), c(167), c(830).s;
      var ff = c(159);
      let fg = "" + ff.s8 + ";404";
      ff.s8, ff.s8, c(792).X, c(280), "undefined" == typeof URLPattern || URLPattern, c(557), c(602), c(801), c(335), /* @__PURE__ */ new WeakMap();
      let fh = { Headers: { NextRewrite: "x-middleware-rewrite", NextResume: "x-middleware-next", NextRedirect: "Location", NextUrl: "next-url", NextAction: "next-action", NextjsData: "x-nextjs-data" } }, fi = (a10, b10, c10) => (a10.headers.set(b10, c10), a10), fj = "__clerk_db_jwt", fk = { rE: "15.4.10" }, fl = (a10) => {
        if (!a10 || "string" != typeof a10) return a10;
        try {
          return (a10 || "").replace(/^(sk_(live|test)_)(.+?)(.{3})$/, "$1*********$4");
        } catch {
          return "";
        }
      }, fm = (a10) => (Array.isArray(a10) ? a10 : [a10]).map((a11) => "string" == typeof a11 ? fl(a11) : JSON.stringify(Object.fromEntries(Object.entries(a11).map(([a12, b10]) => [a12, fl(b10)])), null, 2)).join(", "), fn = (a10) => {
        let b10 = (c10) => {
          if (!c10) return c10;
          if (Array.isArray(c10)) return c10.map((a11) => "object" == typeof a11 || Array.isArray(a11) ? b10(a11) : a11);
          let d10 = { ...c10 };
          for (let c11 of Object.keys(d10)) {
            let e10 = a10(c11.toString());
            e10 !== c11 && (d10[e10] = d10[c11], delete d10[c11]), "object" == typeof d10[e10] && (d10[e10] = b10(d10[e10]));
          }
          return d10;
        };
        return b10;
      };
      function fo(a10) {
        if ("boolean" == typeof a10) return a10;
        if (null == a10) return false;
        if ("string" == typeof a10) {
          if ("true" === a10.toLowerCase()) return true;
          if ("false" === a10.toLowerCase()) return false;
        }
        let b10 = parseInt(a10, 10);
        return !isNaN(b10) && b10 > 0;
      }
      fn(function(a10) {
        return a10 ? a10.replace(/[A-Z]/g, (a11) => `_${a11.toLowerCase()}`) : "";
      }), fn(function(a10) {
        return a10 ? a10.replace(/([-_][a-z])/g, (a11) => a11.toUpperCase().replace(/-|_/, "")) : "";
      }), process.env.NEXT_PUBLIC_CLERK_JS_VERSION, process.env.NEXT_PUBLIC_CLERK_JS_URL;
      let fp = process.env.CLERK_API_VERSION || "v1", fq = process.env.CLERK_SECRET_KEY || "", fr = process.env.CLERK_MACHINE_SECRET_KEY || "", fs = "pk_test_bGlrZWQtZmxvdW5kZXItNDkuY2xlcmsuYWNjb3VudHMuZGV2JA", ft = process.env.CLERK_ENCRYPTION_KEY || "", fu = process.env.CLERK_API_URL || ((a10) => {
        let b10 = bg(a10)?.frontendApi;
        return b10?.startsWith("clerk.") && a7.some((a11) => b10?.endsWith(a11)) ? bc : ba.some((a11) => b10?.endsWith(a11)) ? "https://api.lclclerk.com" : bb.some((a11) => b10?.endsWith(a11)) ? "https://api.clerkstage.dev" : bc;
      })(fs), fv = process.env.NEXT_PUBLIC_CLERK_DOMAIN || "", fw = process.env.NEXT_PUBLIC_CLERK_PROXY_URL || "", fx = fo(process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE) || false, fy = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "", fz = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "", fA = fo(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED), fB = fo(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG), fC = fo(process.env.NEXT_PUBLIC_CLERK_KEYLESS_DISABLED) || false, fD = !(fk.rE.startsWith("13.") || fk.rE.startsWith("14.0")) && false, fE = (a10) => {
        if (!(a10 instanceof Error) || !("message" in a10)) return false;
        let { message: b10 } = a10, c10 = b10.toLowerCase(), d10 = c10.includes("dynamic server usage"), e10 = c10.includes("this page needs to bail out of prerendering");
        return /Route .*? needs to bail out of prerendering at this point because it used .*?./.test(b10) || d10 || e10;
      };
      async function fF() {
        try {
          let { headers: a10 } = await Promise.resolve().then(c.bind(c, 221)), b10 = await a10();
          return new M("https://placeholder.com", { headers: b10 });
        } catch (a10) {
          if (a10 && fE(a10)) throw a10;
          throw Error(`Clerk: auth(), currentUser() and clerkClient(), are only supported in App Router (/app directory).
If you're using /pages, try getAuth() instead.
Original error: ${a10}`);
        }
      }
      var fG = class {
        #a;
        #b = 864e5;
        constructor(a10) {
          this.#a = a10;
        }
        isEventThrottled(a10) {
          let b10 = Date.now(), c10 = this.#c(a10), d10 = this.#a.getItem(c10);
          return !!d10 && !(b10 - d10 > this.#b) || (this.#a.setItem(c10, b10), false);
        }
        #c(a10) {
          let { sk: b10, pk: c10, payload: d10, ...e10 } = a10, f10 = { ...d10, ...e10 };
          return JSON.stringify(Object.keys({ ...d10, ...e10 }).sort().map((a11) => f10[a11]));
        }
      }, fH = class {
        #d = "clerk_telemetry_throttler";
        getItem(a10) {
          return this.#e()[a10];
        }
        setItem(a10, b10) {
          try {
            let c10 = this.#e();
            c10[a10] = b10, localStorage.setItem(this.#d, JSON.stringify(c10));
          } catch (a11) {
            a11 instanceof DOMException && ("QuotaExceededError" === a11.name || "NS_ERROR_DOM_QUOTA_REACHED" === a11.name) && localStorage.length > 0 && localStorage.removeItem(this.#d);
          }
        }
        removeItem(a10) {
          try {
            let b10 = this.#e();
            delete b10[a10], localStorage.setItem(this.#d, JSON.stringify(b10));
          } catch {
          }
        }
        #e() {
          try {
            let a10 = localStorage.getItem(this.#d);
            if (!a10) return {};
            return JSON.parse(a10);
          } catch {
            return {};
          }
        }
        static isSupported() {
          return "undefined" != typeof window && !!window.localStorage;
        }
      }, fI = class {
        #a = /* @__PURE__ */ new Map();
        #f = 1e4;
        getItem(a10) {
          return this.#a.size > this.#f ? void this.#a.clear() : this.#a.get(a10);
        }
        setItem(a10, b10) {
          this.#a.set(a10, b10);
        }
        removeItem(a10) {
          this.#a.delete(a10);
        }
      };
      let fJ = /* @__PURE__ */ new Set(["error", "warn", "info", "debug", "trace"]), fK = { samplingRate: 1, maxBufferSize: 5, endpoint: "https://clerk-telemetry.com" };
      var fL = class {
        #g;
        #h;
        #i = {};
        #j = [];
        #k = null;
        constructor(a10) {
          this.#g = { maxBufferSize: a10.maxBufferSize ?? fK.maxBufferSize, samplingRate: a10.samplingRate ?? fK.samplingRate, perEventSampling: a10.perEventSampling ?? true, disabled: a10.disabled ?? false, debug: a10.debug ?? false, endpoint: fK.endpoint }, a10.clerkVersion || "undefined" != typeof window ? this.#i.clerkVersion = a10.clerkVersion ?? "" : this.#i.clerkVersion = "", this.#i.sdk = a10.sdk, this.#i.sdkVersion = a10.sdkVersion, this.#i.publishableKey = a10.publishableKey ?? "";
          let b10 = bg(a10.publishableKey);
          b10 && (this.#i.instanceType = b10.instanceType), a10.secretKey && (this.#i.secretKey = a10.secretKey.substring(0, 16)), this.#h = new fG(fH.isSupported() ? new fH() : new fI());
        }
        get isEnabled() {
          return !("development" !== this.#i.instanceType || this.#g.disabled || "undefined" != typeof process && process.env && fo(process.env.CLERK_TELEMETRY_DISABLED) || "undefined" != typeof window && window?.navigator?.webdriver);
        }
        get isDebug() {
          return this.#g.debug || "undefined" != typeof process && process.env && fo(process.env.CLERK_TELEMETRY_DEBUG);
        }
        record(a10) {
          try {
            let b10 = this.#l(a10.event, a10.payload);
            if (this.#m(b10.event, b10), !this.#n(b10, a10.eventSamplingRate)) return;
            this.#j.push({ kind: "event", value: b10 }), this.#o();
          } catch (a11) {
            console.error("[clerk/telemetry] Error recording telemetry event", a11);
          }
        }
        recordLog(a10) {
          try {
            if (!this.#p(a10)) return;
            let b10 = "string" == typeof a10?.level && fJ.has(a10.level), c10 = "string" == typeof a10?.message && a10.message.trim().length > 0, d10 = null, e10 = a10?.timestamp;
            if ("number" == typeof e10 || "string" == typeof e10) {
              let a11 = new Date(e10);
              Number.isNaN(a11.getTime()) || (d10 = a11);
            }
            if (!b10 || !c10 || null === d10) {
              this.isDebug && "undefined" != typeof console && console.warn("[clerk/telemetry] Dropping invalid telemetry log entry", { levelIsValid: b10, messageIsValid: c10, timestampIsValid: null !== d10 });
              return;
            }
            let f10 = this.#q(), g10 = { sdk: f10.name, sdkv: f10.version, cv: this.#i.clerkVersion ?? "", lvl: a10.level, msg: a10.message, ts: d10.toISOString(), pk: this.#i.publishableKey || null, payload: this.#r(a10.context) };
            this.#j.push({ kind: "log", value: g10 }), this.#o();
          } catch (a11) {
            console.error("[clerk/telemetry] Error recording telemetry log entry", a11);
          }
        }
        #n(a10, b10) {
          return this.isEnabled && !this.isDebug && this.#s(a10, b10);
        }
        #p(a10) {
          return true;
        }
        #s(a10, b10) {
          let c10 = Math.random();
          return !!(c10 <= this.#g.samplingRate && (false === this.#g.perEventSampling || void 0 === b10 || c10 <= b10)) && !this.#h.isEventThrottled(a10);
        }
        #o() {
          if ("undefined" == typeof window) return void this.#t();
          if (this.#j.length >= this.#g.maxBufferSize) {
            this.#k && ("undefined" != typeof cancelIdleCallback ? cancelIdleCallback(Number(this.#k)) : clearTimeout(Number(this.#k))), this.#t();
            return;
          }
          this.#k || ("requestIdleCallback" in window ? this.#k = requestIdleCallback(() => {
            this.#t(), this.#k = null;
          }) : this.#k = setTimeout(() => {
            this.#t(), this.#k = null;
          }, 0));
        }
        #t() {
          let a10 = [...this.#j];
          if (this.#j = [], this.#k = null, 0 === a10.length) return;
          let b10 = a10.filter((a11) => "event" === a11.kind).map((a11) => a11.value), c10 = a10.filter((a11) => "log" === a11.kind).map((a11) => a11.value);
          b10.length > 0 && fetch(new URL("/v1/event", this.#g.endpoint), { headers: { "Content-Type": "application/json" }, keepalive: true, method: "POST", body: JSON.stringify({ events: b10 }) }).catch(() => void 0), c10.length > 0 && fetch(new URL("/v1/logs", this.#g.endpoint), { headers: { "Content-Type": "application/json" }, keepalive: true, method: "POST", body: JSON.stringify({ logs: c10 }) }).catch(() => void 0);
        }
        #m(a10, b10) {
          this.isDebug && (void 0 !== console.groupCollapsed ? (console.groupCollapsed("[clerk/telemetry]", a10), console.log(b10), console.groupEnd()) : console.log("[clerk/telemetry]", a10, b10));
        }
        #q() {
          let a10 = { name: this.#i.sdk, version: this.#i.sdkVersion };
          if ("undefined" != typeof window) {
            let b10 = window;
            if (b10.Clerk) {
              let c10 = b10.Clerk;
              if ("object" == typeof c10 && null !== c10 && "constructor" in c10 && "function" == typeof c10.constructor && c10.constructor.sdkMetadata) {
                let { name: b11, version: d10 } = c10.constructor.sdkMetadata;
                void 0 !== b11 && (a10.name = b11), void 0 !== d10 && (a10.version = d10);
              }
            }
          }
          return a10;
        }
        #l(a10, b10) {
          let c10 = this.#q();
          return { event: a10, cv: this.#i.clerkVersion ?? "", it: this.#i.instanceType ?? "", sdk: c10.name, sdkv: c10.version, ...this.#i.publishableKey ? { pk: this.#i.publishableKey } : {}, ...this.#i.secretKey ? { sk: this.#i.secretKey } : {}, payload: b10 };
        }
        #r(a10) {
          if (null == a10 || "object" != typeof a10) return null;
          try {
            let b10 = JSON.parse(JSON.stringify(a10));
            if (b10 && "object" == typeof b10 && !Array.isArray(b10)) return b10;
            return null;
          } catch {
            return null;
          }
        }
      };
      let fM = { secretKey: fq, publishableKey: fs, apiUrl: fu, apiVersion: fp, userAgent: "@clerk/nextjs@6.36.8", proxyUrl: fw, domain: fv, isSatellite: fx, machineSecretKey: fr, sdkMetadata: { name: "@clerk/nextjs", version: "6.36.8", environment: "production" }, telemetry: { disabled: fA, debug: fB } }, fN = (a10) => function(a11) {
        let b10 = { ...a11 }, c10 = er(b10), d10 = function(a12) {
          let b11 = ce(fe, a12.options), c11 = a12.apiClient;
          return { authenticateRequest: (a13, d11 = {}) => {
            let { apiUrl: e11, apiVersion: f10 } = b11, g10 = ce(b11, d11);
            return fb(a13, { ...d11, ...g10, apiUrl: e11, apiVersion: f10, apiClient: c11 });
          }, debugRequestState: fc };
        }({ options: b10, apiClient: c10 }), e10 = new fL({ publishableKey: b10.publishableKey, secretKey: b10.secretKey, samplingRate: 0.1, ...b10.sdkMetadata ? { sdk: b10.sdkMetadata.name, sdkVersion: b10.sdkMetadata.version } : {}, ...b10.telemetry || {} });
        return { ...c10, ...d10, telemetry: e10 };
      }({ ...fM, ...a10 });
      function fO(a10, b10) {
        var c10, d10;
        return function(a11) {
          try {
            let { headers: b11, nextUrl: c11, cookies: d11 } = a11 || {};
            return "function" == typeof (null == b11 ? void 0 : b11.get) && "function" == typeof (null == c11 ? void 0 : c11.searchParams.get) && "function" == typeof (null == d11 ? void 0 : d11.get);
          } catch {
            return false;
          }
        }(a10) || function(a11) {
          try {
            let { headers: b11 } = a11 || {};
            return "function" == typeof (null == b11 ? void 0 : b11.get);
          } catch {
            return false;
          }
        }(a10) ? a10.headers.get(b10) : a10.headers[b10] || a10.headers[b10.toLowerCase()] || (null == (d10 = null == (c10 = a10.socket) ? void 0 : c10._httpMessage) ? void 0 : d10.getHeader(b10));
      }
      var fP = c(521);
      let fQ = /* @__PURE__ */ new Map(), fR = new fP.AsyncLocalStorage(), fS = /* @__PURE__ */ new Set(), fT = { warnOnce: (a10) => {
        fS.has(a10) || (fS.add(a10), console.warn(a10));
      } };
      function fU(a10) {
        return /^http(s)?:\/\//.test(a10 || "");
      }
      function fV(a10, b10, c10) {
        return "function" == typeof a10 ? a10(b10) : void 0 !== a10 ? a10 : void 0 !== c10 ? c10 : void 0;
      }
      var fW, fX, fY, fZ, f$, f_, f0, f1, f2, f3 = Object.defineProperty, f4 = (null == (fY = "undefined" != typeof globalThis ? globalThis : void 0) ? void 0 : fY.crypto) || (null == (fZ = void 0 !== c.g ? c.g : void 0) ? void 0 : fZ.crypto) || (null == (f$ = "undefined" != typeof window ? window : void 0) ? void 0 : f$.crypto) || (null == (f_ = "undefined" != typeof self ? self : void 0) ? void 0 : f_.crypto) || (null == (f1 = null == (f0 = "undefined" != typeof frames ? frames : void 0) ? void 0 : f0[0]) ? void 0 : f1.crypto);
      f2 = f4 ? (a10) => {
        let b10 = [];
        for (let c10 = 0; c10 < a10; c10 += 4) b10.push(f4.getRandomValues(new Uint32Array(1))[0]);
        return new f6(b10, a10);
      } : (a10) => {
        let b10 = [], c10 = (a11) => {
          let b11 = a11, c11 = 987654321;
          return () => {
            let a12 = ((c11 = 36969 * (65535 & c11) + (c11 >> 16) | 0) << 16) + (b11 = 18e3 * (65535 & b11) + (b11 >> 16) | 0) | 0;
            return a12 /= 4294967296, (a12 += 0.5) * (Math.random() > 0.5 ? 1 : -1);
          };
        };
        for (let d10 = 0, e10; d10 < a10; d10 += 4) {
          let a11 = c10(4294967296 * (e10 || Math.random()));
          e10 = 987654071 * a11(), b10.push(4294967296 * a11() | 0);
        }
        return new f6(b10, a10);
      };
      var f5 = class {
        static create(...a10) {
          return new this(...a10);
        }
        mixIn(a10) {
          return Object.assign(this, a10);
        }
        clone() {
          let a10 = new this.constructor();
          return Object.assign(a10, this), a10;
        }
      }, f6 = class extends f5 {
        constructor(a10 = [], b10 = 4 * a10.length) {
          super();
          let c10 = a10;
          if (c10 instanceof ArrayBuffer && (c10 = new Uint8Array(c10)), (c10 instanceof Int8Array || c10 instanceof Uint8ClampedArray || c10 instanceof Int16Array || c10 instanceof Uint16Array || c10 instanceof Int32Array || c10 instanceof Uint32Array || c10 instanceof Float32Array || c10 instanceof Float64Array) && (c10 = new Uint8Array(c10.buffer, c10.byteOffset, c10.byteLength)), c10 instanceof Uint8Array) {
            let a11 = c10.byteLength, b11 = [];
            for (let d10 = 0; d10 < a11; d10 += 1) b11[d10 >>> 2] |= c10[d10] << 24 - d10 % 4 * 8;
            this.words = b11, this.sigBytes = a11;
          } else this.words = a10, this.sigBytes = b10;
        }
        toString(a10 = f7) {
          return a10.stringify(this);
        }
        concat(a10) {
          let b10 = this.words, c10 = a10.words, d10 = this.sigBytes, e10 = a10.sigBytes;
          if (this.clamp(), d10 % 4) for (let a11 = 0; a11 < e10; a11 += 1) {
            let e11 = c10[a11 >>> 2] >>> 24 - a11 % 4 * 8 & 255;
            b10[d10 + a11 >>> 2] |= e11 << 24 - (d10 + a11) % 4 * 8;
          }
          else for (let a11 = 0; a11 < e10; a11 += 4) b10[d10 + a11 >>> 2] = c10[a11 >>> 2];
          return this.sigBytes += e10, this;
        }
        clamp() {
          let { words: a10, sigBytes: b10 } = this;
          a10[b10 >>> 2] &= 4294967295 << 32 - b10 % 4 * 8, a10.length = Math.ceil(b10 / 4);
        }
        clone() {
          let a10 = super.clone.call(this);
          return a10.words = this.words.slice(0), a10;
        }
      };
      ((a10, b10, c10) => ((a11, b11, c11) => b11 in a11 ? f3(a11, b11, { enumerable: true, configurable: true, writable: true, value: c11 }) : a11[b11] = c11)(a10, "symbol" != typeof b10 ? b10 + "" : b10, c10))(f6, "random", f2);
      var f7 = { stringify(a10) {
        let { words: b10, sigBytes: c10 } = a10, d10 = [];
        for (let a11 = 0; a11 < c10; a11 += 1) {
          let c11 = b10[a11 >>> 2] >>> 24 - a11 % 4 * 8 & 255;
          d10.push((c11 >>> 4).toString(16)), d10.push((15 & c11).toString(16));
        }
        return d10.join("");
      }, parse(a10) {
        let b10 = a10.length, c10 = [];
        for (let d10 = 0; d10 < b10; d10 += 2) c10[d10 >>> 3] |= parseInt(a10.substr(d10, 2), 16) << 24 - d10 % 8 * 4;
        return new f6(c10, b10 / 2);
      } }, f8 = { stringify(a10) {
        let { words: b10, sigBytes: c10 } = a10, d10 = [];
        for (let a11 = 0; a11 < c10; a11 += 1) {
          let c11 = b10[a11 >>> 2] >>> 24 - a11 % 4 * 8 & 255;
          d10.push(String.fromCharCode(c11));
        }
        return d10.join("");
      }, parse(a10) {
        let b10 = a10.length, c10 = [];
        for (let d10 = 0; d10 < b10; d10 += 1) c10[d10 >>> 2] |= (255 & a10.charCodeAt(d10)) << 24 - d10 % 4 * 8;
        return new f6(c10, b10);
      } }, f9 = { stringify(a10) {
        try {
          return decodeURIComponent(escape(f8.stringify(a10)));
        } catch {
          throw Error("Malformed UTF-8 data");
        }
      }, parse: (a10) => f8.parse(unescape(encodeURIComponent(a10))) }, ga = class extends f5 {
        constructor() {
          super(), this._minBufferSize = 0;
        }
        reset() {
          this._data = new f6(), this._nDataBytes = 0;
        }
        _append(a10) {
          let b10 = a10;
          "string" == typeof b10 && (b10 = f9.parse(b10)), this._data.concat(b10), this._nDataBytes += b10.sigBytes;
        }
        _process(a10) {
          let b10, { _data: c10, blockSize: d10 } = this, e10 = c10.words, f10 = c10.sigBytes, g10 = f10 / (4 * d10), h2 = (g10 = a10 ? Math.ceil(g10) : Math.max((0 | g10) - this._minBufferSize, 0)) * d10, i2 = Math.min(4 * h2, f10);
          if (h2) {
            for (let a11 = 0; a11 < h2; a11 += d10) this._doProcessBlock(e10, a11);
            b10 = e10.splice(0, h2), c10.sigBytes -= i2;
          }
          return new f6(b10, i2);
        }
        clone() {
          let a10 = super.clone.call(this);
          return a10._data = this._data.clone(), a10;
        }
      }, gb = class extends ga {
        constructor(a10) {
          super(), this.blockSize = 16, this.cfg = Object.assign(new f5(), a10), this.reset();
        }
        static _createHelper(a10) {
          return (b10, c10) => new a10(c10).finalize(b10);
        }
        static _createHmacHelper(a10) {
          return (b10, c10) => new gc(a10, c10).finalize(b10);
        }
        reset() {
          super.reset.call(this), this._doReset();
        }
        update(a10) {
          return this._append(a10), this._process(), this;
        }
        finalize(a10) {
          return a10 && this._append(a10), this._doFinalize();
        }
      }, gc = class extends f5 {
        constructor(a10, b10) {
          super();
          let c10 = new a10();
          this._hasher = c10;
          let d10 = b10;
          "string" == typeof d10 && (d10 = f9.parse(d10));
          let e10 = c10.blockSize, f10 = 4 * e10;
          d10.sigBytes > f10 && (d10 = c10.finalize(b10)), d10.clamp();
          let g10 = d10.clone();
          this._oKey = g10;
          let h2 = d10.clone();
          this._iKey = h2;
          let i2 = g10.words, j2 = h2.words;
          for (let a11 = 0; a11 < e10; a11 += 1) i2[a11] ^= 1549556828, j2[a11] ^= 909522486;
          g10.sigBytes = f10, h2.sigBytes = f10, this.reset();
        }
        reset() {
          let a10 = this._hasher;
          a10.reset(), a10.update(this._iKey);
        }
        update(a10) {
          return this._hasher.update(a10), this;
        }
        finalize(a10) {
          let b10 = this._hasher, c10 = b10.finalize(a10);
          return b10.reset(), b10.finalize(this._oKey.clone().concat(c10));
        }
      }, gd = { stringify(a10) {
        let { words: b10, sigBytes: c10 } = a10, d10 = this._map;
        a10.clamp();
        let e10 = [];
        for (let a11 = 0; a11 < c10; a11 += 3) {
          let f11 = (b10[a11 >>> 2] >>> 24 - a11 % 4 * 8 & 255) << 16 | (b10[a11 + 1 >>> 2] >>> 24 - (a11 + 1) % 4 * 8 & 255) << 8 | b10[a11 + 2 >>> 2] >>> 24 - (a11 + 2) % 4 * 8 & 255;
          for (let b11 = 0; b11 < 4 && a11 + 0.75 * b11 < c10; b11 += 1) e10.push(d10.charAt(f11 >>> 6 * (3 - b11) & 63));
        }
        let f10 = d10.charAt(64);
        if (f10) for (; e10.length % 4; ) e10.push(f10);
        return e10.join("");
      }, parse(a10) {
        let b10 = a10.length, c10 = this._map, d10 = this._reverseMap;
        if (!d10) {
          this._reverseMap = [], d10 = this._reverseMap;
          for (let a11 = 0; a11 < c10.length; a11 += 1) d10[c10.charCodeAt(a11)] = a11;
        }
        let e10 = c10.charAt(64);
        if (e10) {
          let c11 = a10.indexOf(e10);
          -1 !== c11 && (b10 = c11);
        }
        var f10 = b10, g10 = d10;
        let h2 = [], i2 = 0;
        for (let b11 = 0; b11 < f10; b11 += 1) if (b11 % 4) {
          let c11 = g10[a10.charCodeAt(b11 - 1)] << b11 % 4 * 2 | g10[a10.charCodeAt(b11)] >>> 6 - b11 % 4 * 2;
          h2[i2 >>> 2] |= c11 << 24 - i2 % 4 * 8, i2 += 1;
        }
        return f6.create(h2, i2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" }, ge = [];
      for (let a10 = 0; a10 < 64; a10 += 1) ge[a10] = 4294967296 * Math.abs(Math.sin(a10 + 1)) | 0;
      var gf = (a10, b10, c10, d10, e10, f10, g10) => {
        let h2 = a10 + (b10 & c10 | ~b10 & d10) + e10 + g10;
        return (h2 << f10 | h2 >>> 32 - f10) + b10;
      }, gg = (a10, b10, c10, d10, e10, f10, g10) => {
        let h2 = a10 + (b10 & d10 | c10 & ~d10) + e10 + g10;
        return (h2 << f10 | h2 >>> 32 - f10) + b10;
      }, gh = (a10, b10, c10, d10, e10, f10, g10) => {
        let h2 = a10 + (b10 ^ c10 ^ d10) + e10 + g10;
        return (h2 << f10 | h2 >>> 32 - f10) + b10;
      }, gi = (a10, b10, c10, d10, e10, f10, g10) => {
        let h2 = a10 + (c10 ^ (b10 | ~d10)) + e10 + g10;
        return (h2 << f10 | h2 >>> 32 - f10) + b10;
      }, gj = class extends gb {
        _doReset() {
          this._hash = new f6([1732584193, 4023233417, 2562383102, 271733878]);
        }
        _doProcessBlock(a10, b10) {
          for (let c11 = 0; c11 < 16; c11 += 1) {
            let d11 = b10 + c11, e11 = a10[d11];
            a10[d11] = (e11 << 8 | e11 >>> 24) & 16711935 | (e11 << 24 | e11 >>> 8) & 4278255360;
          }
          let c10 = this._hash.words, d10 = a10[b10 + 0], e10 = a10[b10 + 1], f10 = a10[b10 + 2], g10 = a10[b10 + 3], h2 = a10[b10 + 4], i2 = a10[b10 + 5], j2 = a10[b10 + 6], k2 = a10[b10 + 7], l2 = a10[b10 + 8], m2 = a10[b10 + 9], n2 = a10[b10 + 10], o2 = a10[b10 + 11], p2 = a10[b10 + 12], q2 = a10[b10 + 13], r2 = a10[b10 + 14], s2 = a10[b10 + 15], t2 = c10[0], u2 = c10[1], v2 = c10[2], w2 = c10[3];
          t2 = gf(t2, u2, v2, w2, d10, 7, ge[0]), w2 = gf(w2, t2, u2, v2, e10, 12, ge[1]), v2 = gf(v2, w2, t2, u2, f10, 17, ge[2]), u2 = gf(u2, v2, w2, t2, g10, 22, ge[3]), t2 = gf(t2, u2, v2, w2, h2, 7, ge[4]), w2 = gf(w2, t2, u2, v2, i2, 12, ge[5]), v2 = gf(v2, w2, t2, u2, j2, 17, ge[6]), u2 = gf(u2, v2, w2, t2, k2, 22, ge[7]), t2 = gf(t2, u2, v2, w2, l2, 7, ge[8]), w2 = gf(w2, t2, u2, v2, m2, 12, ge[9]), v2 = gf(v2, w2, t2, u2, n2, 17, ge[10]), u2 = gf(u2, v2, w2, t2, o2, 22, ge[11]), t2 = gf(t2, u2, v2, w2, p2, 7, ge[12]), w2 = gf(w2, t2, u2, v2, q2, 12, ge[13]), v2 = gf(v2, w2, t2, u2, r2, 17, ge[14]), u2 = gf(u2, v2, w2, t2, s2, 22, ge[15]), t2 = gg(t2, u2, v2, w2, e10, 5, ge[16]), w2 = gg(w2, t2, u2, v2, j2, 9, ge[17]), v2 = gg(v2, w2, t2, u2, o2, 14, ge[18]), u2 = gg(u2, v2, w2, t2, d10, 20, ge[19]), t2 = gg(t2, u2, v2, w2, i2, 5, ge[20]), w2 = gg(w2, t2, u2, v2, n2, 9, ge[21]), v2 = gg(v2, w2, t2, u2, s2, 14, ge[22]), u2 = gg(u2, v2, w2, t2, h2, 20, ge[23]), t2 = gg(t2, u2, v2, w2, m2, 5, ge[24]), w2 = gg(w2, t2, u2, v2, r2, 9, ge[25]), v2 = gg(v2, w2, t2, u2, g10, 14, ge[26]), u2 = gg(u2, v2, w2, t2, l2, 20, ge[27]), t2 = gg(t2, u2, v2, w2, q2, 5, ge[28]), w2 = gg(w2, t2, u2, v2, f10, 9, ge[29]), v2 = gg(v2, w2, t2, u2, k2, 14, ge[30]), u2 = gg(u2, v2, w2, t2, p2, 20, ge[31]), t2 = gh(t2, u2, v2, w2, i2, 4, ge[32]), w2 = gh(w2, t2, u2, v2, l2, 11, ge[33]), v2 = gh(v2, w2, t2, u2, o2, 16, ge[34]), u2 = gh(u2, v2, w2, t2, r2, 23, ge[35]), t2 = gh(t2, u2, v2, w2, e10, 4, ge[36]), w2 = gh(w2, t2, u2, v2, h2, 11, ge[37]), v2 = gh(v2, w2, t2, u2, k2, 16, ge[38]), u2 = gh(u2, v2, w2, t2, n2, 23, ge[39]), t2 = gh(t2, u2, v2, w2, q2, 4, ge[40]), w2 = gh(w2, t2, u2, v2, d10, 11, ge[41]), v2 = gh(v2, w2, t2, u2, g10, 16, ge[42]), u2 = gh(u2, v2, w2, t2, j2, 23, ge[43]), t2 = gh(t2, u2, v2, w2, m2, 4, ge[44]), w2 = gh(w2, t2, u2, v2, p2, 11, ge[45]), v2 = gh(v2, w2, t2, u2, s2, 16, ge[46]), u2 = gh(u2, v2, w2, t2, f10, 23, ge[47]), t2 = gi(t2, u2, v2, w2, d10, 6, ge[48]), w2 = gi(w2, t2, u2, v2, k2, 10, ge[49]), v2 = gi(v2, w2, t2, u2, r2, 15, ge[50]), u2 = gi(u2, v2, w2, t2, i2, 21, ge[51]), t2 = gi(t2, u2, v2, w2, p2, 6, ge[52]), w2 = gi(w2, t2, u2, v2, g10, 10, ge[53]), v2 = gi(v2, w2, t2, u2, n2, 15, ge[54]), u2 = gi(u2, v2, w2, t2, e10, 21, ge[55]), t2 = gi(t2, u2, v2, w2, l2, 6, ge[56]), w2 = gi(w2, t2, u2, v2, s2, 10, ge[57]), v2 = gi(v2, w2, t2, u2, j2, 15, ge[58]), u2 = gi(u2, v2, w2, t2, q2, 21, ge[59]), t2 = gi(t2, u2, v2, w2, h2, 6, ge[60]), w2 = gi(w2, t2, u2, v2, o2, 10, ge[61]), v2 = gi(v2, w2, t2, u2, f10, 15, ge[62]), u2 = gi(u2, v2, w2, t2, m2, 21, ge[63]), c10[0] = c10[0] + t2 | 0, c10[1] = c10[1] + u2 | 0, c10[2] = c10[2] + v2 | 0, c10[3] = c10[3] + w2 | 0;
        }
        _doFinalize() {
          let a10 = this._data, b10 = a10.words, c10 = 8 * this._nDataBytes, d10 = 8 * a10.sigBytes;
          b10[d10 >>> 5] |= 128 << 24 - d10 % 32;
          let e10 = Math.floor(c10 / 4294967296);
          b10[(d10 + 64 >>> 9 << 4) + 15] = (e10 << 8 | e10 >>> 24) & 16711935 | (e10 << 24 | e10 >>> 8) & 4278255360, b10[(d10 + 64 >>> 9 << 4) + 14] = (c10 << 8 | c10 >>> 24) & 16711935 | (c10 << 24 | c10 >>> 8) & 4278255360, a10.sigBytes = (b10.length + 1) * 4, this._process();
          let f10 = this._hash, g10 = f10.words;
          for (let a11 = 0; a11 < 4; a11 += 1) {
            let b11 = g10[a11];
            g10[a11] = (b11 << 8 | b11 >>> 24) & 16711935 | (b11 << 24 | b11 >>> 8) & 4278255360;
          }
          return f10;
        }
        clone() {
          let a10 = super.clone.call(this);
          return a10._hash = this._hash.clone(), a10;
        }
      };
      gb._createHelper(gj), gb._createHmacHelper(gj);
      var gk = class extends f5 {
        constructor(a10) {
          super(), this.cfg = Object.assign(new f5(), { keySize: 4, hasher: gj, iterations: 1 }, a10);
        }
        compute(a10, b10) {
          let c10, { cfg: d10 } = this, e10 = d10.hasher.create(), f10 = f6.create(), g10 = f10.words, { keySize: h2, iterations: i2 } = d10;
          for (; g10.length < h2; ) {
            c10 && e10.update(c10), c10 = e10.update(a10).finalize(b10), e10.reset();
            for (let a11 = 1; a11 < i2; a11 += 1) c10 = e10.finalize(c10), e10.reset();
            f10.concat(c10);
          }
          return f10.sigBytes = 4 * h2, f10;
        }
      }, gl = class extends ga {
        constructor(a10, b10, c10) {
          super(), this.cfg = Object.assign(new f5(), c10), this._xformMode = a10, this._key = b10, this.reset();
        }
        static createEncryptor(a10, b10) {
          return this.create(this._ENC_XFORM_MODE, a10, b10);
        }
        static createDecryptor(a10, b10) {
          return this.create(this._DEC_XFORM_MODE, a10, b10);
        }
        static _createHelper(a10) {
          let b10 = (a11) => "string" == typeof a11 ? gt : gs;
          return { encrypt: (c10, d10, e10) => b10(d10).encrypt(a10, c10, d10, e10), decrypt: (c10, d10, e10) => b10(d10).decrypt(a10, c10, d10, e10) };
        }
        reset() {
          super.reset.call(this), this._doReset();
        }
        process(a10) {
          return this._append(a10), this._process();
        }
        finalize(a10) {
          return a10 && this._append(a10), this._doFinalize();
        }
      };
      gl._ENC_XFORM_MODE = 1, gl._DEC_XFORM_MODE = 2, gl.keySize = 4, gl.ivSize = 4;
      var gm = class extends f5 {
        constructor(a10, b10) {
          super(), this._cipher = a10, this._iv = b10;
        }
        static createEncryptor(a10, b10) {
          return this.Encryptor.create(a10, b10);
        }
        static createDecryptor(a10, b10) {
          return this.Decryptor.create(a10, b10);
        }
      };
      function gn(a10, b10, c10) {
        let d10, e10 = this._iv;
        e10 ? (d10 = e10, this._iv = void 0) : d10 = this._prevBlock;
        for (let e11 = 0; e11 < c10; e11 += 1) a10[b10 + e11] ^= d10[e11];
      }
      var go = class extends gm {
      };
      go.Encryptor = class extends go {
        processBlock(a10, b10) {
          let c10 = this._cipher, { blockSize: d10 } = c10;
          gn.call(this, a10, b10, d10), c10.encryptBlock(a10, b10), this._prevBlock = a10.slice(b10, b10 + d10);
        }
      }, go.Decryptor = class extends go {
        processBlock(a10, b10) {
          let c10 = this._cipher, { blockSize: d10 } = c10, e10 = a10.slice(b10, b10 + d10);
          c10.decryptBlock(a10, b10), gn.call(this, a10, b10, d10), this._prevBlock = e10;
        }
      };
      var gp = { pad(a10, b10) {
        let c10 = 4 * b10, d10 = c10 - a10.sigBytes % c10, e10 = d10 << 24 | d10 << 16 | d10 << 8 | d10, f10 = [];
        for (let a11 = 0; a11 < d10; a11 += 4) f10.push(e10);
        let g10 = f6.create(f10, d10);
        a10.concat(g10);
      }, unpad(a10) {
        let b10 = 255 & a10.words[a10.sigBytes - 1 >>> 2];
        a10.sigBytes -= b10;
      } }, gq = class extends gl {
        constructor(a10, b10, c10) {
          super(a10, b10, Object.assign({ mode: go, padding: gp }, c10)), this.blockSize = 4;
        }
        reset() {
          let a10;
          super.reset.call(this);
          let { cfg: b10 } = this, { iv: c10, mode: d10 } = b10;
          this._xformMode === this.constructor._ENC_XFORM_MODE ? a10 = d10.createEncryptor : (a10 = d10.createDecryptor, this._minBufferSize = 1), this._mode = a10.call(d10, this, c10 && c10.words), this._mode.__creator = a10;
        }
        _doProcessBlock(a10, b10) {
          this._mode.processBlock(a10, b10);
        }
        _doFinalize() {
          let a10, { padding: b10 } = this.cfg;
          return this._xformMode === this.constructor._ENC_XFORM_MODE ? (b10.pad(this._data, this.blockSize), a10 = this._process(true)) : (a10 = this._process(true), b10.unpad(a10)), a10;
        }
      }, gr = class extends f5 {
        constructor(a10) {
          super(), this.mixIn(a10);
        }
        toString(a10) {
          return (a10 || this.formatter).stringify(this);
        }
      }, gs = class extends f5 {
        static encrypt(a10, b10, c10, d10) {
          let e10 = Object.assign(new f5(), this.cfg, d10), f10 = a10.createEncryptor(c10, e10), g10 = f10.finalize(b10), h2 = f10.cfg;
          return gr.create({ ciphertext: g10, key: c10, iv: h2.iv, algorithm: a10, mode: h2.mode, padding: h2.padding, blockSize: f10.blockSize, formatter: e10.format });
        }
        static decrypt(a10, b10, c10, d10) {
          let e10 = b10, f10 = Object.assign(new f5(), this.cfg, d10);
          return e10 = this._parse(e10, f10.format), a10.createDecryptor(c10, f10).finalize(e10.ciphertext);
        }
        static _parse(a10, b10) {
          return "string" == typeof a10 ? b10.parse(a10, this) : a10;
        }
      };
      gs.cfg = Object.assign(new f5(), { format: { stringify(a10) {
        let { ciphertext: b10, salt: c10 } = a10;
        return (c10 ? f6.create([1398893684, 1701076831]).concat(c10).concat(b10) : b10).toString(gd);
      }, parse(a10) {
        let b10, c10 = gd.parse(a10), d10 = c10.words;
        return 1398893684 === d10[0] && 1701076831 === d10[1] && (b10 = f6.create(d10.slice(2, 4)), d10.splice(0, 4), c10.sigBytes -= 16), gr.create({ ciphertext: c10, salt: b10 });
      } } });
      var gt = class extends gs {
        static encrypt(a10, b10, c10, d10) {
          let e10 = Object.assign(new f5(), this.cfg, d10), f10 = e10.kdf.execute(c10, a10.keySize, a10.ivSize, e10.salt, e10.hasher);
          e10.iv = f10.iv;
          let g10 = gs.encrypt.call(this, a10, b10, f10.key, e10);
          return g10.mixIn(f10), g10;
        }
        static decrypt(a10, b10, c10, d10) {
          let e10 = b10, f10 = Object.assign(new f5(), this.cfg, d10);
          e10 = this._parse(e10, f10.format);
          let g10 = f10.kdf.execute(c10, a10.keySize, a10.ivSize, e10.salt, f10.hasher);
          return f10.iv = g10.iv, gs.decrypt.call(this, a10, e10, g10.key, f10);
        }
      };
      gt.cfg = Object.assign(gs.cfg, { kdf: { execute(a10, b10, c10, d10, e10) {
        let f10, g10 = d10;
        g10 || (g10 = f6.random(8)), f10 = e10 ? gk.create({ keySize: b10 + c10, hasher: e10 }).compute(a10, g10) : gk.create({ keySize: b10 + c10 }).compute(a10, g10);
        let h2 = f6.create(f10.words.slice(b10), 4 * c10);
        return f10.sigBytes = 4 * b10, gr.create({ key: f10, iv: h2, salt: g10 });
      } } });
      var gu = [], gv = [], gw = [], gx = [], gy = [], gz = [], gA = [], gB = [], gC = [], gD = [], gE = [];
      for (let a10 = 0; a10 < 256; a10 += 1) a10 < 128 ? gE[a10] = a10 << 1 : gE[a10] = a10 << 1 ^ 283;
      var gF = 0, gG = 0;
      for (let a10 = 0; a10 < 256; a10 += 1) {
        let a11 = gG ^ gG << 1 ^ gG << 2 ^ gG << 3 ^ gG << 4;
        a11 = a11 >>> 8 ^ 255 & a11 ^ 99, gu[gF] = a11, gv[a11] = gF;
        let b10 = gE[gF], c10 = gE[b10], d10 = gE[c10], e10 = 257 * gE[a11] ^ 16843008 * a11;
        gw[gF] = e10 << 24 | e10 >>> 8, gx[gF] = e10 << 16 | e10 >>> 16, gy[gF] = e10 << 8 | e10 >>> 24, gz[gF] = e10, e10 = 16843009 * d10 ^ 65537 * c10 ^ 257 * b10 ^ 16843008 * gF, gA[a11] = e10 << 24 | e10 >>> 8, gB[a11] = e10 << 16 | e10 >>> 16, gC[a11] = e10 << 8 | e10 >>> 24, gD[a11] = e10, gF ? (gF = b10 ^ gE[gE[gE[d10 ^ b10]]], gG ^= gE[gE[gG]]) : gF = gG = 1;
      }
      var gH = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], gI = class extends gq {
        _doReset() {
          let a10;
          if (this._nRounds && this._keyPriorReset === this._key) return;
          this._keyPriorReset = this._key;
          let b10 = this._keyPriorReset, c10 = b10.words, d10 = b10.sigBytes / 4;
          this._nRounds = d10 + 6;
          let e10 = (this._nRounds + 1) * 4;
          this._keySchedule = [];
          let f10 = this._keySchedule;
          for (let b11 = 0; b11 < e10; b11 += 1) b11 < d10 ? f10[b11] = c10[b11] : (a10 = f10[b11 - 1], b11 % d10 ? d10 > 6 && b11 % d10 == 4 && (a10 = gu[a10 >>> 24] << 24 | gu[a10 >>> 16 & 255] << 16 | gu[a10 >>> 8 & 255] << 8 | gu[255 & a10]) : a10 = (gu[(a10 = a10 << 8 | a10 >>> 24) >>> 24] << 24 | gu[a10 >>> 16 & 255] << 16 | gu[a10 >>> 8 & 255] << 8 | gu[255 & a10]) ^ gH[b11 / d10 | 0] << 24, f10[b11] = f10[b11 - d10] ^ a10);
          this._invKeySchedule = [];
          let g10 = this._invKeySchedule;
          for (let b11 = 0; b11 < e10; b11 += 1) {
            let c11 = e10 - b11;
            a10 = b11 % 4 ? f10[c11] : f10[c11 - 4], b11 < 4 || c11 <= 4 ? g10[b11] = a10 : g10[b11] = gA[gu[a10 >>> 24]] ^ gB[gu[a10 >>> 16 & 255]] ^ gC[gu[a10 >>> 8 & 255]] ^ gD[gu[255 & a10]];
          }
        }
        encryptBlock(a10, b10) {
          this._doCryptBlock(a10, b10, this._keySchedule, gw, gx, gy, gz, gu);
        }
        decryptBlock(a10, b10) {
          let c10 = a10[b10 + 1];
          a10[b10 + 1] = a10[b10 + 3], a10[b10 + 3] = c10, this._doCryptBlock(a10, b10, this._invKeySchedule, gA, gB, gC, gD, gv), c10 = a10[b10 + 1], a10[b10 + 1] = a10[b10 + 3], a10[b10 + 3] = c10;
        }
        _doCryptBlock(a10, b10, c10, d10, e10, f10, g10, h2) {
          let i2 = this._nRounds, j2 = a10[b10] ^ c10[0], k2 = a10[b10 + 1] ^ c10[1], l2 = a10[b10 + 2] ^ c10[2], m2 = a10[b10 + 3] ^ c10[3], n2 = 4;
          for (let a11 = 1; a11 < i2; a11 += 1) {
            let a12 = d10[j2 >>> 24] ^ e10[k2 >>> 16 & 255] ^ f10[l2 >>> 8 & 255] ^ g10[255 & m2] ^ c10[n2];
            n2 += 1;
            let b11 = d10[k2 >>> 24] ^ e10[l2 >>> 16 & 255] ^ f10[m2 >>> 8 & 255] ^ g10[255 & j2] ^ c10[n2];
            n2 += 1;
            let h3 = d10[l2 >>> 24] ^ e10[m2 >>> 16 & 255] ^ f10[j2 >>> 8 & 255] ^ g10[255 & k2] ^ c10[n2];
            n2 += 1;
            let i3 = d10[m2 >>> 24] ^ e10[j2 >>> 16 & 255] ^ f10[k2 >>> 8 & 255] ^ g10[255 & l2] ^ c10[n2];
            n2 += 1, j2 = a12, k2 = b11, l2 = h3, m2 = i3;
          }
          let o2 = (h2[j2 >>> 24] << 24 | h2[k2 >>> 16 & 255] << 16 | h2[l2 >>> 8 & 255] << 8 | h2[255 & m2]) ^ c10[n2];
          n2 += 1;
          let p2 = (h2[k2 >>> 24] << 24 | h2[l2 >>> 16 & 255] << 16 | h2[m2 >>> 8 & 255] << 8 | h2[255 & j2]) ^ c10[n2];
          n2 += 1;
          let q2 = (h2[l2 >>> 24] << 24 | h2[m2 >>> 16 & 255] << 16 | h2[j2 >>> 8 & 255] << 8 | h2[255 & k2]) ^ c10[n2];
          n2 += 1;
          let r2 = (h2[m2 >>> 24] << 24 | h2[j2 >>> 16 & 255] << 16 | h2[k2 >>> 8 & 255] << 8 | h2[255 & l2]) ^ c10[n2];
          n2 += 1, a10[b10] = o2, a10[b10 + 1] = p2, a10[b10 + 2] = q2, a10[b10 + 3] = r2;
        }
      };
      gI.keySize = 8;
      var gJ = gq._createHelper(gI), gK = [], gL = class extends gb {
        _doReset() {
          this._hash = new f6([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
        }
        _doProcessBlock(a10, b10) {
          let c10 = this._hash.words, d10 = c10[0], e10 = c10[1], f10 = c10[2], g10 = c10[3], h2 = c10[4];
          for (let c11 = 0; c11 < 80; c11 += 1) {
            if (c11 < 16) gK[c11] = 0 | a10[b10 + c11];
            else {
              let a11 = gK[c11 - 3] ^ gK[c11 - 8] ^ gK[c11 - 14] ^ gK[c11 - 16];
              gK[c11] = a11 << 1 | a11 >>> 31;
            }
            let i2 = (d10 << 5 | d10 >>> 27) + h2 + gK[c11];
            c11 < 20 ? i2 += (e10 & f10 | ~e10 & g10) + 1518500249 : c11 < 40 ? i2 += (e10 ^ f10 ^ g10) + 1859775393 : c11 < 60 ? i2 += (e10 & f10 | e10 & g10 | f10 & g10) - 1894007588 : i2 += (e10 ^ f10 ^ g10) - 899497514, h2 = g10, g10 = f10, f10 = e10 << 30 | e10 >>> 2, e10 = d10, d10 = i2;
          }
          c10[0] = c10[0] + d10 | 0, c10[1] = c10[1] + e10 | 0, c10[2] = c10[2] + f10 | 0, c10[3] = c10[3] + g10 | 0, c10[4] = c10[4] + h2 | 0;
        }
        _doFinalize() {
          let a10 = this._data, b10 = a10.words, c10 = 8 * this._nDataBytes, d10 = 8 * a10.sigBytes;
          return b10[d10 >>> 5] |= 128 << 24 - d10 % 32, b10[(d10 + 64 >>> 9 << 4) + 14] = Math.floor(c10 / 4294967296), b10[(d10 + 64 >>> 9 << 4) + 15] = c10, a10.sigBytes = 4 * b10.length, this._process(), this._hash;
        }
        clone() {
          let a10 = super.clone.call(this);
          return a10._hash = this._hash.clone(), a10;
        }
      }, gM = (gb._createHelper(gL), gb._createHmacHelper(gL));
      let gN = `
Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.

1) With middleware
   e.g. export default clerkMiddleware({domain:'YOUR_DOMAIN',isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_DOMAIN='YOUR_DOMAIN'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'
   `, gO = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL

1) With middleware
   e.g. export default clerkMiddleware({signInUrl:'SOME_URL', isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_SIGN_IN_URL='SOME_URL'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'`, gP = `Clerk: Unable to decrypt request data.

Refresh the page if your .env file was just updated. If the issue persists, ensure the encryption key is valid and properly set.

For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_invalid)`, gQ = bv({ packageName: "@clerk/nextjs" }), gR = "x-middleware-override-headers", gS = "x-middleware-request", gT = (a10, b10, c10) => {
        a10.headers.get(gR) || (a10.headers.set(gR, [...b10.headers.keys()]), b10.headers.forEach((b11, c11) => {
          a10.headers.set(`${gS}-${c11}`, b11);
        })), Object.entries(c10).forEach(([b11, c11]) => {
          a10.headers.set(gR, `${a10.headers.get(gR)},${b11}`), a10.headers.set(`${gS}-${b11}`, c11);
        });
      }, gU = (a10) => R.redirect(a10, { headers: { [cb.Headers.ClerkRedirectTo]: "true" } }), gV = "clerk_keyless_dummy_key";
      function gW() {
        if (a4()) throw Error("Clerk: Unable to decrypt request data, this usually means the encryption key is invalid. Ensure the encryption key is properly set. For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys. (code=encryption_key_invalid)");
        throw Error(gP);
      }
      function gX(a10, b10) {
        return JSON.parse(gJ.decrypt(a10, b10).toString(f9));
      }
      let gY = async () => {
        var a10, b10;
        let c10;
        try {
          let a11 = await fF(), b11 = fO(a11, cb.Headers.ClerkRequestData);
          c10 = function(a12) {
            if (!a12) return {};
            let b12 = a4() ? ft || fq : ft || fq || gV;
            try {
              return gX(a12, b12);
            } catch {
              if (fD) try {
                return gX(a12, gV);
              } catch {
                gW();
              }
              gW();
            }
          }(b11);
        } catch (a11) {
          if (a11 && fE(a11)) throw a11;
        }
        let d10 = null != (b10 = null == (a10 = fR.getStore()) ? void 0 : a10.get("requestData")) ? b10 : c10;
        return (null == d10 ? void 0 : d10.secretKey) || (null == d10 ? void 0 : d10.publishableKey) ? fN(d10) : fN({});
      };
      class gZ {
        static createDefaultDirectives() {
          return Object.entries(this.DEFAULT_DIRECTIVES).reduce((a10, [b10, c10]) => (a10[b10] = new Set(c10), a10), {});
        }
        static isKeyword(a10) {
          return this.KEYWORDS.has(a10.replace(/^'|'$/g, ""));
        }
        static formatValue(a10) {
          let b10 = a10.replace(/^'|'$/g, "");
          return this.isKeyword(b10) ? `'${b10}'` : a10;
        }
        static handleDirectiveValues(a10) {
          let b10 = /* @__PURE__ */ new Set();
          return a10.includes("'none'") || a10.includes("none") ? b10.add("'none'") : a10.forEach((a11) => b10.add(this.formatValue(a11))), b10;
        }
      }
      gZ.KEYWORDS = /* @__PURE__ */ new Set(["none", "self", "strict-dynamic", "unsafe-eval", "unsafe-hashes", "unsafe-inline"]), gZ.DEFAULT_DIRECTIVES = { "connect-src": ["self", "https://clerk-telemetry.com", "https://*.clerk-telemetry.com", "https://api.stripe.com", "https://maps.googleapis.com", "https://img.clerk.com", "https://images.clerkstage.dev"], "default-src": ["self"], "form-action": ["self"], "frame-src": ["self", "https://challenges.cloudflare.com", "https://*.js.stripe.com", "https://js.stripe.com", "https://hooks.stripe.com"], "img-src": ["self", "https://img.clerk.com"], "script-src": ["self", "unsafe-inline", "https:", "http:", "https://*.js.stripe.com", "https://js.stripe.com", "https://maps.googleapis.com"], "style-src": ["self", "unsafe-inline"], "worker-src": ["self", "blob:"] };
      let g$ = "__clerk_keys_";
      async function g_(a10) {
        let b10 = new TextEncoder().encode(a10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b10))).map((a11) => a11.toString(16).padStart(2, "0")).join("").slice(0, 16);
      }
      async function g0() {
        let a10 = process.env.PWD;
        if (!a10) return `${g$}0`;
        let b10 = a10.split("/").filter(Boolean).slice(-3).reverse().join("/"), c10 = await g_(b10);
        return `${g$}${c10}`;
      }
      async function g1(a10) {
        let b10;
        if (!fD) return;
        let c10 = await g0();
        try {
          c10 && (b10 = JSON.parse(a10(c10) || "{}"));
        } catch {
          b10 = void 0;
        }
        return b10;
      }
      let g2 = { REDIRECT_TO_URL: "CLERK_PROTECT_REDIRECT_TO_URL", REDIRECT_TO_SIGN_IN: "CLERK_PROTECT_REDIRECT_TO_SIGN_IN", REDIRECT_TO_SIGN_UP: "CLERK_PROTECT_REDIRECT_TO_SIGN_UP" }, g3 = { NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 }, g4 = new Set(Object.values(g3)), g5 = "NEXT_HTTP_ERROR_FALLBACK";
      function g6(a10) {
        if (!function(a11) {
          if ("object" != typeof a11 || null === a11 || !("digest" in a11) || "string" != typeof a11.digest) return false;
          let [b11, c10] = a11.digest.split(";");
          return b11 === g5 && g4.has(Number(c10));
        }(a10)) return;
        let [, b10] = a10.digest.split(";");
        return Number(b10);
      }
      let g7 = "NEXT_REDIRECT";
      function g8(a10, b10, c10 = "replace", d10 = 307) {
        let e10 = Error(g7);
        throw e10.digest = `${g7};${c10};${a10};${d10};`, e10.clerk_digest = g2.REDIRECT_TO_URL, Object.assign(e10, b10), e10;
      }
      function g9(a10, b10) {
        return null === b10 ? "" : b10 || a10;
      }
      function ha(a10) {
        if ("object" != typeof a10 || null === a10 || !("digest" in a10) || "string" != typeof a10.digest) return false;
        let b10 = a10.digest.split(";"), [c10, d10] = b10, e10 = b10.slice(2, -2).join(";"), f10 = Number(b10.at(-2));
        return c10 === g7 && ("replace" === d10 || "push" === d10) && "string" == typeof e10 && !isNaN(f10) && 307 === f10;
      }
      function hb() {
        let a10 = Error(g5);
        throw a10.digest = `${g5};${g3.UNAUTHORIZED}`, a10;
      }
      let hc = (a10) => !!a10.headers.get(fh.Headers.NextUrl) && !((a11) => {
        var b10, c10;
        return !!a11.headers.get(fh.Headers.NextUrl) && ((null == (b10 = a11.headers.get(cb.Headers.Accept)) ? void 0 : b10.includes("text/x-component")) || (null == (c10 = a11.headers.get(cb.Headers.ContentType)) ? void 0 : c10.includes("multipart/form-data")) || !!a11.headers.get(fh.Headers.NextAction));
      })(a10) || hd(), hd = () => {
        let a10 = globalThis.fetch;
        if (!function(a11) {
          return "__nextPatched" in a11 && true === a11.__nextPatched;
        }(a10)) return false;
        let { page: b10, pagePath: c10 } = a10.__nextGetStaticStore().getStore() || {};
        return !!(c10 || b10);
      }, he = (a10) => !!a10.headers.get(fh.Headers.NextjsData), hf = ((a10) => {
        if ("function" == typeof a10) return (b11) => a10(b11);
        let b10 = ((a11) => {
          let b11 = [a11 || ""].flat().filter(Boolean).map((a12) => a12 instanceof RegExp ? a12 : ((a13) => {
            try {
              return a3(a13);
            } catch (b12) {
              throw Error(`Invalid path: ${a13}.
Consult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x
${b12.message}`);
            }
          })(a12));
          return (a12) => b11.some((b12) => b12.test(a12));
        })(a10);
        return (a11) => b10(a11.nextUrl.pathname);
      })(["/dashboard(.*)", "/inventory(.*)", "/transactions(.*)", "/goals(.*)"]), hg = ((...a10) => {
        let [b10, c10] = ((a11) => [a11[0] instanceof Request ? a11[0] : void 0, a11[0] instanceof Request ? a11[1] : void 0])(a10), [d10, e10] = ((a11) => ["function" == typeof a11[0] ? a11[0] : void 0, (2 === a11.length ? a11[1] : "function" == typeof a11[0] ? {} : a11[0]) || {}])(a10);
        return fR.run(fQ, () => {
          let a11 = /* @__PURE__ */ ((a12, b11) => (...c11) => {
            let d11 = ("string" == typeof a12 ? /* @__PURE__ */ ((a13, b12) => () => {
              let c12 = [], d12 = false;
              return { enable: () => {
                d12 = true;
              }, debug: (...a14) => {
                d12 && c12.push(a14.map((a15) => "function" == typeof a15 ? a15() : a15));
              }, commit: () => {
                if (d12) {
                  var e12, f11;
                  for (let d13 of (console.log((e12 = a13, `[clerk debug start: ${e12}]`)), c12)) {
                    let a14 = b12(d13);
                    a14 = a14.split("\n").map((a15) => `  ${a15}`).join("\n"), process.env.VERCEL && (a14 = function(a15, b13) {
                      let c13 = new TextEncoder(), d14 = new TextDecoder("utf-8"), e13 = c13.encode(a15).slice(0, 4096);
                      return d14.decode(e13).replace(/\uFFFD/g, "");
                    }(a14, 4096)), console.log(a14);
                  }
                  console.log((f11 = a13, `[clerk debug end: ${f11}] (@clerk/nextjs=6.36.8,next=${fk.rE},timestamp=${Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3)})`));
                }
              } };
            })(a12, fm) : a12)(), e11 = b11(d11);
            try {
              let a13 = e11(...c11);
              if ("object" == typeof a13 && "then" in a13 && "function" == typeof a13.then) return a13.then((a14) => (d11.commit(), a14)).catch((a14) => {
                throw d11.commit(), a14;
              });
              return d11.commit(), a13;
            } catch (a13) {
              throw d11.commit(), a13;
            }
          })("clerkMiddleware", (a12) => async (b11, c11) => {
            var f11, g11;
            let h2, i2, j2, k2, l2, m2, n2, o2, p2 = "function" == typeof e10 ? await e10(b11) : e10, q2 = await g1((a13) => {
              var c12;
              return null == (c12 = b11.cookies.get(a13)) ? void 0 : c12.value;
            }), r2 = function(a13, b12) {
              return a13 || b12(), a13;
            }(p2.publishableKey || fs || (null == q2 ? void 0 : q2.publishableKey), () => gQ.throwMissingPublishableKeyError()), s2 = function(a13, b12) {
              return a13 || b12(), a13;
            }(p2.secretKey || fq || (null == q2 ? void 0 : q2.secretKey), () => gQ.throwMissingSecretKeyError()), t2 = { publishableKey: r2, secretKey: s2, signInUrl: p2.signInUrl || fy, signUpUrl: p2.signUpUrl || fz, ...p2 };
            fQ.set("requestData", t2);
            let u2 = await gY();
            t2.debug && a12.enable();
            let v2 = eQ(b11);
            a12.debug("options", t2), a12.debug("url", () => v2.toJSON());
            let w2 = b11.headers.get(cb.Headers.Authorization);
            w2 && w2.startsWith("Basic ") && a12.debug("Basic Auth detected");
            let x2 = b11.headers.get(cb.Headers.ContentSecurityPolicy);
            x2 && a12.debug("Content-Security-Policy detected", () => ({ value: x2 }));
            let y2 = await u2.authenticateRequest(v2, ((a13, b12) => ({ ...b12, ...((a14, b13) => {
              let c12, d11 = fV(null == b13 ? void 0 : b13.proxyUrl, a14.clerkUrl, fw);
              c12 = d11 && !fU(d11) ? new URL(d11, a14.clerkUrl).toString() : d11;
              let e11 = fV(b13.isSatellite, new URL(a14.url), fx), f12 = fV(b13.domain, new URL(a14.url), fv), g12 = (null == b13 ? void 0 : b13.signInUrl) || fy;
              if (e11 && !c12 && !f12) throw Error(gN);
              if (e11 && !fU(g12) && bi(b13.secretKey || fq)) throw Error(gO);
              return { proxyUrl: c12, isSatellite: e11, domain: f12, signInUrl: g12 };
            })(a13, b12), acceptsToken: "any" }))(v2, t2));
            a12.debug("requestState", () => ({ status: y2.status, headers: JSON.stringify(Object.fromEntries(y2.headers)), reason: y2.reason }));
            let z2 = y2.headers.get(cb.Headers.Location);
            if (z2) {
              let a13 = R.redirect(z2);
              return y2.headers.forEach((b12, c12) => {
                c12 !== cb.Headers.Location && a13.headers.append(c12, b12);
              }), a13;
            }
            if (y2.status === eH.Handshake) throw Error("Clerk: handshake status without redirect");
            let A2 = y2.toAuth();
            a12.debug("auth", () => ({ auth: A2, debug: A2.debug() }));
            let B2 = (h2 = v2, (a13 = {}) => {
              !function(a14, b12) {
                g8(a14, { clerk_digest: g2.REDIRECT_TO_SIGN_IN, returnBackUrl: g9(a14, b12) });
              }(h2.clerkUrl.toString(), a13.returnBackUrl);
            }), C2 = (i2 = v2, (a13 = {}) => {
              !function(a14, b12) {
                g8(a14, { clerk_digest: g2.REDIRECT_TO_SIGN_UP, returnBackUrl: g9(a14, b12) });
              }(i2.clerkUrl.toString(), a13.returnBackUrl);
            }), D2 = await (j2 = v2, k2 = A2, l2 = B2, async (a13, b12) => function(a14) {
              let { redirectToSignIn: b13, authObject: c12, redirect: d11, notFound: e11, request: f12, unauthorized: g12 } = a14;
              return async (...a15) => {
                var h3, i3, j3, k3, l3, m3, n3, o3;
                let p3 = ((a16) => {
                  if (a16 && !a16.unauthenticatedUrl && !a16.unauthorizedUrl && !a16.token && (1 !== Object.keys(a16).length || !("token" in a16))) return a16;
                })(a15[0]), q3 = (null == (h3 = a15[0]) ? void 0 : h3.unauthenticatedUrl) || (null == (i3 = a15[1]) ? void 0 : i3.unauthenticatedUrl), r3 = (null == (j3 = a15[0]) ? void 0 : j3.unauthorizedUrl) || (null == (k3 = a15[1]) ? void 0 : k3.unauthorizedUrl), s3 = (null == (l3 = a15[0]) ? void 0 : l3.token) || (null == (m3 = a15[1]) ? void 0 : m3.token) || cg.SessionToken, t3 = () => c12.tokenType !== cg.SessionToken ? g12() : r3 ? d11(r3) : e11();
                if (!eB(c12.tokenType, s3)) return t3();
                if (c12.tokenType !== cg.SessionToken) return c12.isAuthenticated ? c12 : t3();
                if ("pending" === c12.sessionStatus || !c12.userId) {
                  return q3 ? d11(q3) : "document" === (n3 = f12).headers.get(cb.Headers.SecFetchDest) || "iframe" === n3.headers.get(cb.Headers.SecFetchDest) || (null == (o3 = n3.headers.get(cb.Headers.Accept)) ? void 0 : o3.includes("text/html")) || hc(n3) || he(n3) ? b13() : e11();
                }
                return p3 ? "function" == typeof p3 ? p3(c12.has) ? c12 : t3() : c12.has(p3) ? c12 : t3() : c12;
              };
            }({ request: j2, redirect: (a14) => g8(a14, { redirectUrl: a14 }), notFound: () => function() {
              let a14 = Object.defineProperty(Error(fg), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
              throw a14.digest = fg, a14;
            }(), unauthorized: hb, authObject: eG({ authObject: k2, acceptsToken: (null == a13 ? void 0 : a13.token) || (null == b12 ? void 0 : b12.token) || cg.SessionToken }), redirectToSignIn: l2 })(a13, b12)), E2 = (m2 = y2, n2 = B2, o2 = C2, async (a13) => {
              var b12;
              let c12 = m2.toAuth({ treatPendingAsSignedOut: null == a13 ? void 0 : a13.treatPendingAsSignedOut }), d11 = null != (b12 = null == a13 ? void 0 : a13.acceptsToken) ? b12 : cg.SessionToken, e11 = eG({ authObject: c12, acceptsToken: d11 });
              return e11.tokenType === cg.SessionToken && eB(cg.SessionToken, d11) ? Object.assign(e11, { redirectToSignIn: n2, redirectToSignUp: o2 }) : e11;
            });
            E2.protect = D2;
            let F2 = R.next();
            try {
              F2 = await fR.run(fQ, async () => null == d10 ? void 0 : d10(E2, b11, c11)) || F2;
            } catch (a13) {
              F2 = ((a14, b12, c12, d11) => {
                var e11;
                if (g6(a14) === g3.UNAUTHORIZED) {
                  let a15 = new R(null, { status: 401 }), b13 = d11.toAuth();
                  if (b13 && b13.tokenType === cg.OAuthToken) {
                    let b14 = bg(d11.publishableKey);
                    return fi(a15, "WWW-Authenticate", `Bearer resource_metadata="https://${null == b14 ? void 0 : b14.frontendApi}/.well-known/oauth-protected-resource"`);
                  }
                  return a15;
                }
                if (function(a15) {
                  return "object" == typeof a15 && null !== a15 && "digest" in a15 && "NEXT_NOT_FOUND" === a15.digest || g6(a15) === g3.NOT_FOUND;
                }(a14)) return fi(R.rewrite(new URL(`/clerk_${Date.now()}`, c12.url)), cb.Headers.AuthReason, "protect-rewrite");
                let f12 = function(a15) {
                  return !!ha(a15) && "clerk_digest" in a15 && a15.clerk_digest === g2.REDIRECT_TO_SIGN_IN;
                }(a14), g12 = function(a15) {
                  return !!ha(a15) && "clerk_digest" in a15 && a15.clerk_digest === g2.REDIRECT_TO_SIGN_UP;
                }(a14);
                if (f12 || g12) {
                  let c13 = ((a15) => {
                    let { publishableKey: b13, redirectAdapter: c14, signInUrl: d12, signUpUrl: e12, baseUrl: f13, sessionStatus: g14 } = a15, h3 = bg(b13), i3 = h3?.frontendApi, j3 = h3?.instanceType === "development", k3 = b$(i3), l3 = "pending" === g14, m3 = (b14, { returnBackUrl: d13 }) => c14(cc(f13, `${b14}/tasks`, d13, j3 ? a15.devBrowserToken : null));
                    return { redirectToSignUp: ({ returnBackUrl: b14 } = {}) => {
                      e12 || k3 || bw.throwMissingPublishableKeyError();
                      let g15 = `${k3}/sign-up`, h4 = e12 || function(a16) {
                        if (!a16) return;
                        let b15 = new URL(a16, f13);
                        return b15.pathname = `${b15.pathname}/create`, b15.toString();
                      }(d12) || g15;
                      return l3 ? m3(h4, { returnBackUrl: b14 }) : c14(cc(f13, h4, b14, j3 ? a15.devBrowserToken : null));
                    }, redirectToSignIn: ({ returnBackUrl: b14 } = {}) => {
                      d12 || k3 || bw.throwMissingPublishableKeyError();
                      let e13 = `${k3}/sign-in`, g15 = d12 || e13;
                      return l3 ? m3(g15, { returnBackUrl: b14 }) : c14(cc(f13, g15, b14, j3 ? a15.devBrowserToken : null));
                    } };
                  })({ redirectAdapter: gU, baseUrl: b12.clerkUrl, signInUrl: d11.signInUrl, signUpUrl: d11.signUpUrl, publishableKey: d11.publishableKey, sessionStatus: null == (e11 = d11.toAuth()) ? void 0 : e11.sessionStatus }), { returnBackUrl: g13 } = a14;
                  return c13[f12 ? "redirectToSignIn" : "redirectToSignUp"]({ returnBackUrl: g13 });
                }
                if (ha(a14)) return gU(a14.redirectUrl);
                throw a14;
              })(a13, v2, b11, y2);
            }
            if (t2.contentSecurityPolicy) {
              let { headers: b12 } = function(a13, b13) {
                var c12;
                let d11 = [], e11 = b13.strict ? function() {
                  let a14 = new Uint8Array(16);
                  return crypto.getRandomValues(a14), btoa(Array.from(a14, (a15) => String.fromCharCode(a15)).join(""));
                }() : void 0, f12 = function(a14, b14, c13, d12) {
                  let e12 = Object.entries(gZ.DEFAULT_DIRECTIVES).reduce((a15, [b15, c14]) => (a15[b15] = new Set(c14), a15), {});
                  if (e12["connect-src"].add(b14), a14 && (e12["script-src"].delete("http:"), e12["script-src"].delete("https:"), e12["script-src"].add("'strict-dynamic'"), d12 && e12["script-src"].add(`'nonce-${d12}'`)), c13) {
                    let a15 = /* @__PURE__ */ new Map();
                    Object.entries(c13).forEach(([b15, c14]) => {
                      let d13 = Array.isArray(c14) ? c14 : [c14];
                      gZ.DEFAULT_DIRECTIVES[b15] ? function(a16, b16, c15) {
                        if (c15.includes("'none'") || c15.includes("none")) {
                          a16[b16] = /* @__PURE__ */ new Set(["'none'"]);
                          return;
                        }
                        let d14 = /* @__PURE__ */ new Set();
                        a16[b16].forEach((a17) => {
                          d14.add(gZ.formatValue(a17));
                        }), c15.forEach((a17) => {
                          d14.add(gZ.formatValue(a17));
                        }), a16[b16] = d14;
                      }(e12, b15, d13) : function(a16, b16, c15) {
                        if (c15.includes("'none'") || c15.includes("none")) return a16.set(b16, /* @__PURE__ */ new Set(["'none'"]));
                        let d14 = /* @__PURE__ */ new Set();
                        c15.forEach((a17) => {
                          let b17 = gZ.formatValue(a17);
                          d14.add(b17);
                        }), a16.set(b16, d14);
                      }(a15, b15, d13);
                    }), a15.forEach((a16, b15) => {
                      e12[b15] = a16;
                    });
                  }
                  return Object.entries(e12).sort(([a15], [b15]) => a15.localeCompare(b15)).map(([a15, b15]) => {
                    let c14 = Array.from(b15).map((a16) => ({ raw: a16, formatted: gZ.formatValue(a16) }));
                    return `${a15} ${c14.map((a16) => a16.formatted).join(" ")}`;
                  }).join("; ");
                }(null != (c12 = b13.strict) && c12, a13, b13.directives, e11);
                return b13.reportTo && (f12 += "; report-to csp-endpoint", d11.push([cb.Headers.ReportingEndpoints, `csp-endpoint="${b13.reportTo}"`])), b13.reportOnly ? d11.push([cb.Headers.ContentSecurityPolicyReportOnly, f12]) : d11.push([cb.Headers.ContentSecurityPolicy, f12]), e11 && d11.push([cb.Headers.Nonce, e11]), { headers: d11 };
              }((null != (g11 = null == (f11 = bg(r2)) ? void 0 : f11.frontendApi) ? g11 : "").replace("$", ""), t2.contentSecurityPolicy);
              b12.forEach(([a13, b13]) => {
                fi(F2, a13, b13);
              }), a12.debug("Clerk generated CSP", () => ({ headers: b12 }));
            }
            if (y2.headers && y2.headers.forEach((b12, c12) => {
              c12 === cb.Headers.ContentSecurityPolicy && a12.debug("Content-Security-Policy detected", () => ({ value: b12 })), F2.headers.append(c12, b12);
            }), F2.headers.get(fh.Headers.NextRedirect)) return a12.debug("handlerResult is redirect"), ((a13, b12, c12) => {
              let d11 = b12.headers.get("location");
              if ("true" === b12.headers.get(cb.Headers.ClerkRedirectTo) && d11 && bi(c12.secretKey) && a13.clerkUrl.isCrossOrigin(d11)) {
                let c13 = a13.cookies.get(fj) || "", e11 = function(a14, b13) {
                  let c14 = new URL(a14), d12 = c14.searchParams.get(fj);
                  c14.searchParams.delete(fj);
                  let e12 = d12 || b13;
                  return e12 && c14.searchParams.set(fj, e12), c14;
                }(new URL(d11), c13);
                return R.redirect(e11.href, b12);
              }
              return b12;
            })(v2, F2, t2);
            t2.debug && gT(F2, v2, { [cb.Headers.EnableDebug]: "true" });
            let G2 = s2 === (null == q2 ? void 0 : q2.secretKey) ? { publishableKey: null == q2 ? void 0 : q2.publishableKey, secretKey: null == q2 ? void 0 : q2.secretKey } : {};
            return !function(a13, b12, c12, d11, e11, f12) {
              let g12, { reason: h3, message: i3, status: j3, token: k3 } = c12;
              if (b12 || (b12 = R.next()), b12.headers.get(fh.Headers.NextRedirect)) return;
              "1" === b12.headers.get(fh.Headers.NextResume) && (b12.headers.delete(fh.Headers.NextResume), g12 = new URL(a13.url));
              let l3 = b12.headers.get(fh.Headers.NextRewrite);
              if (l3) {
                let b13 = new URL(a13.url);
                if ((g12 = new URL(l3)).origin !== b13.origin) return;
              }
              if (g12) {
                let c13 = function(a14, b13, c14) {
                  var d12;
                  let e12 = (a15) => !a15 || !Object.values(a15).some((a16) => void 0 !== a16);
                  if (e12(a14) && e12(b13) && !c14) return;
                  if (a14.secretKey && !ft) return void fT.warnOnce("Clerk: Missing `CLERK_ENCRYPTION_KEY`. Required for propagating `secretKey` middleware option. See docs: https://clerk.com/docs/reference/nextjs/clerk-middleware#dynamic-keys");
                  let f13 = a4() ? ft || (d12 = () => gQ.throwMissingSecretKeyError(), fq || d12(), fq) : ft || fq || gV;
                  return gJ.encrypt(JSON.stringify({ ...b13, ...a14, machineAuthObject: null != c14 ? c14 : void 0 }), f13).toString();
                }(d11, e11, f12);
                gT(b12, a13, { [cb.Headers.AuthStatus]: j3, [cb.Headers.AuthToken]: k3 || "", [cb.Headers.AuthSignature]: k3 ? gM(k3, (null == d11 ? void 0 : d11.secretKey) || fq || e11.secretKey || "").toString() : "", [cb.Headers.AuthMessage]: i3 || "", [cb.Headers.AuthReason]: h3 || "", [cb.Headers.ClerkUrl]: a13.clerkUrl.toString(), ...c13 ? { [cb.Headers.ClerkRequestData]: c13 } : {} }), b12.headers.set(fh.Headers.NextRewrite, g12.href);
              }
            }(v2, F2, y2, p2, G2, "session_token" === A2.tokenType ? null : ((a13) => {
              let { debug: b12, getToken: c12, has: d11, ...e11 } = a13;
              return e11;
            })(A2)), F2;
          }), f10 = async (b11, c11) => {
            var d11, f11;
            if ("/clerk-sync-keyless" === b11.nextUrl.pathname) return ((a12) => {
              let b12 = a12.nextUrl.searchParams.get("returnUrl"), c12 = new URL(a12.url);
              return c12.pathname = "", R.redirect(b12 || c12.toString());
            })(b11);
            let g11 = "function" == typeof e10 ? await e10(b11) : e10, h2 = await g1((a12) => {
              var c12;
              return null == (c12 = b11.cookies.get(a12)) ? void 0 : c12.value;
            }), i2 = !(g11.publishableKey || fs || (null == h2 ? void 0 : h2.publishableKey)), j2 = null != (f11 = null == (d11 = fO(b11, cb.Headers.Authorization)) ? void 0 : d11.replace("Bearer ", "")) ? f11 : "";
            if (i2 && !ey(j2)) {
              let a12 = R.next();
              return gT(a12, b11, { [cb.Headers.AuthStatus]: "signed-out" }), a12;
            }
            return a11(b11, c11);
          }, g10 = async (b11, c11) => fD ? f10(b11, c11) : a11(b11, c11);
          return b10 && c10 ? g10(b10, c10) : g10;
        });
      })(async (a10, b10) => {
        hf(b10) && await a10.protect();
      }), hh = { matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"] };
      c(199);
      let hi = { ...e }, hj = hi.middleware || hi.default, hk = "/middleware";
      if ("function" != typeof hj) throw Object.defineProperty(Error(`The Middleware "${hk}" must export a \`middleware\` or a \`default\` function`), "__NEXT_ERROR_CODE", { value: "E120", enumerable: false, configurable: true });
      function hl(a10) {
        return a0({ ...a10, page: hk, handler: async (...a11) => {
          try {
            return await hj(...a11);
          } catch (e10) {
            let b10 = a11[0], c10 = new URL(b10.url), d10 = c10.pathname + c10.search;
            throw await i(e10, { path: d10, method: b10.method, headers: Object.fromEntries(b10.headers.entries()) }, { routerKind: "Pages Router", routePath: "/middleware", routeType: "middleware", revalidateReason: void 0 }), e10;
          }
        } });
      }
    }, 815: (a, b, c) => {
      "use strict";
      a.exports = c(35);
    }, 818: (a, b, c) => {
      "use strict";
      c.d(b, { Ck: () => i, K8: () => k, hm: () => l });
      var d = c(725), e = c(716), f = c(535), g = c(115);
      class h extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new h();
        }
      }
      class i {
        static seal(a2) {
          return new Proxy(a2, { get(a3, b2, c2) {
            switch (b2) {
              case "clear":
              case "delete":
              case "set":
                return h.callable;
              default:
                return e.l.get(a3, b2, c2);
            }
          } });
        }
      }
      let j = Symbol.for("next.mutated.cookies");
      class k {
        static wrap(a2, b2) {
          let c2 = new d.VO(new Headers());
          for (let b3 of a2.getAll()) c2.set(b3);
          let g2 = [], h2 = /* @__PURE__ */ new Set(), i2 = () => {
            let a3 = f.J.getStore();
            if (a3 && (a3.pathWasRevalidated = true), g2 = c2.getAll().filter((a4) => h2.has(a4.name)), b2) {
              let a4 = [];
              for (let b3 of g2) {
                let c3 = new d.VO(new Headers());
                c3.set(b3), a4.push(c3.toString());
              }
              b2(a4);
            }
          }, k2 = new Proxy(c2, { get(a3, b3, c3) {
            switch (b3) {
              case j:
                return g2;
              case "delete":
                return function(...b4) {
                  h2.add("string" == typeof b4[0] ? b4[0] : b4[0].name);
                  try {
                    return a3.delete(...b4), k2;
                  } finally {
                    i2();
                  }
                };
              case "set":
                return function(...b4) {
                  h2.add("string" == typeof b4[0] ? b4[0] : b4[0].name);
                  try {
                    return a3.set(...b4), k2;
                  } finally {
                    i2();
                  }
                };
              default:
                return e.l.get(a3, b3, c3);
            }
          } });
          return k2;
        }
      }
      function l(a2) {
        let b2 = new Proxy(a2, { get(a3, c2, d2) {
          switch (c2) {
            case "delete":
              return function(...c3) {
                return m("cookies().delete"), a3.delete(...c3), b2;
              };
            case "set":
              return function(...c3) {
                return m("cookies().set"), a3.set(...c3), b2;
              };
            default:
              return e.l.get(a3, c2, d2);
          }
        } });
        return b2;
      }
      function m(a2) {
        if ("action" !== (0, g.XN)(a2).phase) throw new h();
      }
    }, 821: (a, b, c) => {
      "use strict";
      c.d(b, { Q: () => d });
      var d = function(a2) {
        return a2[a2.SeeOther = 303] = "SeeOther", a2[a2.TemporaryRedirect = 307] = "TemporaryRedirect", a2[a2.PermanentRedirect = 308] = "PermanentRedirect", a2;
      }({});
    }, 830: (a, b, c) => {
      "use strict";
      c.d(b, { s: () => d });
      let d = (0, c(58).xl)();
    }, 890: (a) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b = {};
        (() => {
          b.parse = function(b2, c2) {
            if ("string" != typeof b2) throw TypeError("argument str must be a string");
            for (var e2 = {}, f = b2.split(d), g = (c2 || {}).decode || a2, h = 0; h < f.length; h++) {
              var i = f[h], j = i.indexOf("=");
              if (!(j < 0)) {
                var k = i.substr(0, j).trim(), l = i.substr(++j, i.length).trim();
                '"' == l[0] && (l = l.slice(1, -1)), void 0 == e2[k] && (e2[k] = function(a3, b3) {
                  try {
                    return b3(a3);
                  } catch (b4) {
                    return a3;
                  }
                }(l, g));
              }
            }
            return e2;
          }, b.serialize = function(a3, b2, d2) {
            var f = d2 || {}, g = f.encode || c;
            if ("function" != typeof g) throw TypeError("option encode is invalid");
            if (!e.test(a3)) throw TypeError("argument name is invalid");
            var h = g(b2);
            if (h && !e.test(h)) throw TypeError("argument val is invalid");
            var i = a3 + "=" + h;
            if (null != f.maxAge) {
              var j = f.maxAge - 0;
              if (isNaN(j) || !isFinite(j)) throw TypeError("option maxAge is invalid");
              i += "; Max-Age=" + Math.floor(j);
            }
            if (f.domain) {
              if (!e.test(f.domain)) throw TypeError("option domain is invalid");
              i += "; Domain=" + f.domain;
            }
            if (f.path) {
              if (!e.test(f.path)) throw TypeError("option path is invalid");
              i += "; Path=" + f.path;
            }
            if (f.expires) {
              if ("function" != typeof f.expires.toUTCString) throw TypeError("option expires is invalid");
              i += "; Expires=" + f.expires.toUTCString();
            }
            if (f.httpOnly && (i += "; HttpOnly"), f.secure && (i += "; Secure"), f.sameSite) switch ("string" == typeof f.sameSite ? f.sameSite.toLowerCase() : f.sameSite) {
              case true:
              case "strict":
                i += "; SameSite=Strict";
                break;
              case "lax":
                i += "; SameSite=Lax";
                break;
              case "none":
                i += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return i;
          };
          var a2 = decodeURIComponent, c = encodeURIComponent, d = /; */, e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), a.exports = b;
      })();
    }, 905: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { interceptTestApis: function() {
        return f;
      }, wrapRequestHandler: function() {
        return g;
      } });
      let d = c(201), e = c(552);
      function f() {
        return (0, e.interceptFetch)(c.g.fetch);
      }
      function g(a2) {
        return (b2, c2) => (0, d.withRequest)(b2, e.reader, () => a2(b2, c2));
      }
    }, 956: (a, b, c) => {
      (() => {
        "use strict";
        var b2 = { 491: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ContextAPI = void 0;
          let d2 = c2(223), e2 = c2(172), f2 = c2(930), g = "context", h = new d2.NoopContextManager();
          class i {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new i()), this._instance;
            }
            setGlobalContextManager(a3) {
              return (0, e2.registerGlobal)(g, a3, f2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(a3, b4, c3, ...d3) {
              return this._getContextManager().with(a3, b4, c3, ...d3);
            }
            bind(a3, b4) {
              return this._getContextManager().bind(a3, b4);
            }
            _getContextManager() {
              return (0, e2.getGlobal)(g) || h;
            }
            disable() {
              this._getContextManager().disable(), (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b3.ContextAPI = i;
        }, 930: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagAPI = void 0;
          let d2 = c2(56), e2 = c2(912), f2 = c2(957), g = c2(172);
          class h {
            constructor() {
              function a3(a4) {
                return function(...b5) {
                  let c3 = (0, g.getGlobal)("diag");
                  if (c3) return c3[a4](...b5);
                };
              }
              let b4 = this;
              b4.setLogger = (a4, c3 = { logLevel: f2.DiagLogLevel.INFO }) => {
                var d3, h2, i;
                if (a4 === b4) {
                  let a5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return b4.error(null != (d3 = a5.stack) ? d3 : a5.message), false;
                }
                "number" == typeof c3 && (c3 = { logLevel: c3 });
                let j = (0, g.getGlobal)("diag"), k = (0, e2.createLogLevelDiagLogger)(null != (h2 = c3.logLevel) ? h2 : f2.DiagLogLevel.INFO, a4);
                if (j && !c3.suppressOverrideMessage) {
                  let a5 = null != (i = Error().stack) ? i : "<failed to generate stacktrace>";
                  j.warn(`Current logger will be overwritten from ${a5}`), k.warn(`Current logger will overwrite one already registered from ${a5}`);
                }
                return (0, g.registerGlobal)("diag", k, b4, true);
              }, b4.disable = () => {
                (0, g.unregisterGlobal)("diag", b4);
              }, b4.createComponentLogger = (a4) => new d2.DiagComponentLogger(a4), b4.verbose = a3("verbose"), b4.debug = a3("debug"), b4.info = a3("info"), b4.warn = a3("warn"), b4.error = a3("error");
            }
            static instance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
          }
          b3.DiagAPI = h;
        }, 653: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.MetricsAPI = void 0;
          let d2 = c2(660), e2 = c2(172), f2 = c2(930), g = "metrics";
          class h {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
            setGlobalMeterProvider(a3) {
              return (0, e2.registerGlobal)(g, a3, f2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, e2.getGlobal)(g) || d2.NOOP_METER_PROVIDER;
            }
            getMeter(a3, b4, c3) {
              return this.getMeterProvider().getMeter(a3, b4, c3);
            }
            disable() {
              (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b3.MetricsAPI = h;
        }, 181: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.PropagationAPI = void 0;
          let d2 = c2(172), e2 = c2(874), f2 = c2(194), g = c2(277), h = c2(369), i = c2(930), j = "propagation", k = new e2.NoopTextMapPropagator();
          class l {
            constructor() {
              this.createBaggage = h.createBaggage, this.getBaggage = g.getBaggage, this.getActiveBaggage = g.getActiveBaggage, this.setBaggage = g.setBaggage, this.deleteBaggage = g.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalPropagator(a3) {
              return (0, d2.registerGlobal)(j, a3, i.DiagAPI.instance());
            }
            inject(a3, b4, c3 = f2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(a3, b4, c3);
            }
            extract(a3, b4, c3 = f2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(a3, b4, c3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, d2.unregisterGlobal)(j, i.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, d2.getGlobal)(j) || k;
            }
          }
          b3.PropagationAPI = l;
        }, 997: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceAPI = void 0;
          let d2 = c2(172), e2 = c2(846), f2 = c2(139), g = c2(607), h = c2(930), i = "trace";
          class j {
            constructor() {
              this._proxyTracerProvider = new e2.ProxyTracerProvider(), this.wrapSpanContext = f2.wrapSpanContext, this.isSpanContextValid = f2.isSpanContextValid, this.deleteSpan = g.deleteSpan, this.getSpan = g.getSpan, this.getActiveSpan = g.getActiveSpan, this.getSpanContext = g.getSpanContext, this.setSpan = g.setSpan, this.setSpanContext = g.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new j()), this._instance;
            }
            setGlobalTracerProvider(a3) {
              let b4 = (0, d2.registerGlobal)(i, this._proxyTracerProvider, h.DiagAPI.instance());
              return b4 && this._proxyTracerProvider.setDelegate(a3), b4;
            }
            getTracerProvider() {
              return (0, d2.getGlobal)(i) || this._proxyTracerProvider;
            }
            getTracer(a3, b4) {
              return this.getTracerProvider().getTracer(a3, b4);
            }
            disable() {
              (0, d2.unregisterGlobal)(i, h.DiagAPI.instance()), this._proxyTracerProvider = new e2.ProxyTracerProvider();
            }
          }
          b3.TraceAPI = j;
        }, 277: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.deleteBaggage = b3.setBaggage = b3.getActiveBaggage = b3.getBaggage = void 0;
          let d2 = c2(491), e2 = (0, c2(780).createContextKey)("OpenTelemetry Baggage Key");
          function f2(a3) {
            return a3.getValue(e2) || void 0;
          }
          b3.getBaggage = f2, b3.getActiveBaggage = function() {
            return f2(d2.ContextAPI.getInstance().active());
          }, b3.setBaggage = function(a3, b4) {
            return a3.setValue(e2, b4);
          }, b3.deleteBaggage = function(a3) {
            return a3.deleteValue(e2);
          };
        }, 993: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.BaggageImpl = void 0;
          class c2 {
            constructor(a3) {
              this._entries = a3 ? new Map(a3) : /* @__PURE__ */ new Map();
            }
            getEntry(a3) {
              let b4 = this._entries.get(a3);
              if (b4) return Object.assign({}, b4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([a3, b4]) => [a3, b4]);
            }
            setEntry(a3, b4) {
              let d2 = new c2(this._entries);
              return d2._entries.set(a3, b4), d2;
            }
            removeEntry(a3) {
              let b4 = new c2(this._entries);
              return b4._entries.delete(a3), b4;
            }
            removeEntries(...a3) {
              let b4 = new c2(this._entries);
              for (let c3 of a3) b4._entries.delete(c3);
              return b4;
            }
            clear() {
              return new c2();
            }
          }
          b3.BaggageImpl = c2;
        }, 830: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataSymbol = void 0, b3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataFromString = b3.createBaggage = void 0;
          let d2 = c2(930), e2 = c2(993), f2 = c2(830), g = d2.DiagAPI.instance();
          b3.createBaggage = function(a3 = {}) {
            return new e2.BaggageImpl(new Map(Object.entries(a3)));
          }, b3.baggageEntryMetadataFromString = function(a3) {
            return "string" != typeof a3 && (g.error(`Cannot create baggage metadata from unknown type: ${typeof a3}`), a3 = ""), { __TYPE__: f2.baggageEntryMetadataSymbol, toString: () => a3 };
          };
        }, 67: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.context = void 0, b3.context = c2(491).ContextAPI.getInstance();
        }, 223: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopContextManager = void 0;
          let d2 = c2(780);
          class e2 {
            active() {
              return d2.ROOT_CONTEXT;
            }
            with(a3, b4, c3, ...d3) {
              return b4.call(c3, ...d3);
            }
            bind(a3, b4) {
              return b4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          b3.NoopContextManager = e2;
        }, 780: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ROOT_CONTEXT = b3.createContextKey = void 0, b3.createContextKey = function(a3) {
            return Symbol.for(a3);
          };
          class c2 {
            constructor(a3) {
              let b4 = this;
              b4._currentContext = a3 ? new Map(a3) : /* @__PURE__ */ new Map(), b4.getValue = (a4) => b4._currentContext.get(a4), b4.setValue = (a4, d2) => {
                let e2 = new c2(b4._currentContext);
                return e2._currentContext.set(a4, d2), e2;
              }, b4.deleteValue = (a4) => {
                let d2 = new c2(b4._currentContext);
                return d2._currentContext.delete(a4), d2;
              };
            }
          }
          b3.ROOT_CONTEXT = new c2();
        }, 506: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.diag = void 0, b3.diag = c2(930).DiagAPI.instance();
        }, 56: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagComponentLogger = void 0;
          let d2 = c2(172);
          class e2 {
            constructor(a3) {
              this._namespace = a3.namespace || "DiagComponentLogger";
            }
            debug(...a3) {
              return f2("debug", this._namespace, a3);
            }
            error(...a3) {
              return f2("error", this._namespace, a3);
            }
            info(...a3) {
              return f2("info", this._namespace, a3);
            }
            warn(...a3) {
              return f2("warn", this._namespace, a3);
            }
            verbose(...a3) {
              return f2("verbose", this._namespace, a3);
            }
          }
          function f2(a3, b4, c3) {
            let e3 = (0, d2.getGlobal)("diag");
            if (e3) return c3.unshift(b4), e3[a3](...c3);
          }
          b3.DiagComponentLogger = e2;
        }, 972: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagConsoleLogger = void 0;
          let c2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class d2 {
            constructor() {
              for (let a3 = 0; a3 < c2.length; a3++) this[c2[a3].n] = /* @__PURE__ */ function(a4) {
                return function(...b4) {
                  if (console) {
                    let c3 = console[a4];
                    if ("function" != typeof c3 && (c3 = console.log), "function" == typeof c3) return c3.apply(console, b4);
                  }
                };
              }(c2[a3].c);
            }
          }
          b3.DiagConsoleLogger = d2;
        }, 912: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createLogLevelDiagLogger = void 0;
          let d2 = c2(957);
          b3.createLogLevelDiagLogger = function(a3, b4) {
            function c3(c4, d3) {
              let e2 = b4[c4];
              return "function" == typeof e2 && a3 >= d3 ? e2.bind(b4) : function() {
              };
            }
            return a3 < d2.DiagLogLevel.NONE ? a3 = d2.DiagLogLevel.NONE : a3 > d2.DiagLogLevel.ALL && (a3 = d2.DiagLogLevel.ALL), b4 = b4 || {}, { error: c3("error", d2.DiagLogLevel.ERROR), warn: c3("warn", d2.DiagLogLevel.WARN), info: c3("info", d2.DiagLogLevel.INFO), debug: c3("debug", d2.DiagLogLevel.DEBUG), verbose: c3("verbose", d2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagLogLevel = void 0, function(a3) {
            a3[a3.NONE = 0] = "NONE", a3[a3.ERROR = 30] = "ERROR", a3[a3.WARN = 50] = "WARN", a3[a3.INFO = 60] = "INFO", a3[a3.DEBUG = 70] = "DEBUG", a3[a3.VERBOSE = 80] = "VERBOSE", a3[a3.ALL = 9999] = "ALL";
          }(b3.DiagLogLevel || (b3.DiagLogLevel = {}));
        }, 172: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.unregisterGlobal = b3.getGlobal = b3.registerGlobal = void 0;
          let d2 = c2(200), e2 = c2(521), f2 = c2(130), g = e2.VERSION.split(".")[0], h = Symbol.for(`opentelemetry.js.api.${g}`), i = d2._globalThis;
          b3.registerGlobal = function(a3, b4, c3, d3 = false) {
            var f3;
            let g2 = i[h] = null != (f3 = i[h]) ? f3 : { version: e2.VERSION };
            if (!d3 && g2[a3]) {
              let b5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${a3}`);
              return c3.error(b5.stack || b5.message), false;
            }
            if (g2.version !== e2.VERSION) {
              let b5 = Error(`@opentelemetry/api: Registration of version v${g2.version} for ${a3} does not match previously registered API v${e2.VERSION}`);
              return c3.error(b5.stack || b5.message), false;
            }
            return g2[a3] = b4, c3.debug(`@opentelemetry/api: Registered a global for ${a3} v${e2.VERSION}.`), true;
          }, b3.getGlobal = function(a3) {
            var b4, c3;
            let d3 = null == (b4 = i[h]) ? void 0 : b4.version;
            if (d3 && (0, f2.isCompatible)(d3)) return null == (c3 = i[h]) ? void 0 : c3[a3];
          }, b3.unregisterGlobal = function(a3, b4) {
            b4.debug(`@opentelemetry/api: Unregistering a global for ${a3} v${e2.VERSION}.`);
            let c3 = i[h];
            c3 && delete c3[a3];
          };
        }, 130: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.isCompatible = b3._makeCompatibilityCheck = void 0;
          let d2 = c2(521), e2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function f2(a3) {
            let b4 = /* @__PURE__ */ new Set([a3]), c3 = /* @__PURE__ */ new Set(), d3 = a3.match(e2);
            if (!d3) return () => false;
            let f3 = { major: +d3[1], minor: +d3[2], patch: +d3[3], prerelease: d3[4] };
            if (null != f3.prerelease) return function(b5) {
              return b5 === a3;
            };
            function g(a4) {
              return c3.add(a4), false;
            }
            return function(a4) {
              if (b4.has(a4)) return true;
              if (c3.has(a4)) return false;
              let d4 = a4.match(e2);
              if (!d4) return g(a4);
              let h = { major: +d4[1], minor: +d4[2], patch: +d4[3], prerelease: d4[4] };
              if (null != h.prerelease || f3.major !== h.major) return g(a4);
              if (0 === f3.major) return f3.minor === h.minor && f3.patch <= h.patch ? (b4.add(a4), true) : g(a4);
              return f3.minor <= h.minor ? (b4.add(a4), true) : g(a4);
            };
          }
          b3._makeCompatibilityCheck = f2, b3.isCompatible = f2(d2.VERSION);
        }, 886: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.metrics = void 0, b3.metrics = c2(653).MetricsAPI.getInstance();
        }, 901: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ValueType = void 0, function(a3) {
            a3[a3.INT = 0] = "INT", a3[a3.DOUBLE = 1] = "DOUBLE";
          }(b3.ValueType || (b3.ValueType = {}));
        }, 102: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createNoopMeter = b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = b3.NOOP_OBSERVABLE_GAUGE_METRIC = b3.NOOP_OBSERVABLE_COUNTER_METRIC = b3.NOOP_UP_DOWN_COUNTER_METRIC = b3.NOOP_HISTOGRAM_METRIC = b3.NOOP_COUNTER_METRIC = b3.NOOP_METER = b3.NoopObservableUpDownCounterMetric = b3.NoopObservableGaugeMetric = b3.NoopObservableCounterMetric = b3.NoopObservableMetric = b3.NoopHistogramMetric = b3.NoopUpDownCounterMetric = b3.NoopCounterMetric = b3.NoopMetric = b3.NoopMeter = void 0;
          class c2 {
            constructor() {
            }
            createHistogram(a3, c3) {
              return b3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(a3, c3) {
              return b3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(a3, c3) {
              return b3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(a3, c3) {
              return b3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(a3, b4) {
            }
            removeBatchObservableCallback(a3) {
            }
          }
          b3.NoopMeter = c2;
          class d2 {
          }
          b3.NoopMetric = d2;
          class e2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopCounterMetric = e2;
          class f2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopUpDownCounterMetric = f2;
          class g extends d2 {
            record(a3, b4) {
            }
          }
          b3.NoopHistogramMetric = g;
          class h {
            addCallback(a3) {
            }
            removeCallback(a3) {
            }
          }
          b3.NoopObservableMetric = h;
          class i extends h {
          }
          b3.NoopObservableCounterMetric = i;
          class j extends h {
          }
          b3.NoopObservableGaugeMetric = j;
          class k extends h {
          }
          b3.NoopObservableUpDownCounterMetric = k, b3.NOOP_METER = new c2(), b3.NOOP_COUNTER_METRIC = new e2(), b3.NOOP_HISTOGRAM_METRIC = new g(), b3.NOOP_UP_DOWN_COUNTER_METRIC = new f2(), b3.NOOP_OBSERVABLE_COUNTER_METRIC = new i(), b3.NOOP_OBSERVABLE_GAUGE_METRIC = new j(), b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new k(), b3.createNoopMeter = function() {
            return b3.NOOP_METER;
          };
        }, 660: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NOOP_METER_PROVIDER = b3.NoopMeterProvider = void 0;
          let d2 = c2(102);
          class e2 {
            getMeter(a3, b4, c3) {
              return d2.NOOP_METER;
            }
          }
          b3.NoopMeterProvider = e2, b3.NOOP_METER_PROVIDER = new e2();
        }, 200: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(46), b3);
        }, 651: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3._globalThis = void 0, b3._globalThis = "object" == typeof globalThis ? globalThis : c.g;
        }, 46: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(651), b3);
        }, 939: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.propagation = void 0, b3.propagation = c2(181).PropagationAPI.getInstance();
        }, 874: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTextMapPropagator = void 0;
          class c2 {
            inject(a3, b4) {
            }
            extract(a3, b4) {
              return a3;
            }
            fields() {
              return [];
            }
          }
          b3.NoopTextMapPropagator = c2;
        }, 194: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.defaultTextMapSetter = b3.defaultTextMapGetter = void 0, b3.defaultTextMapGetter = { get(a3, b4) {
            if (null != a3) return a3[b4];
          }, keys: (a3) => null == a3 ? [] : Object.keys(a3) }, b3.defaultTextMapSetter = { set(a3, b4, c2) {
            null != a3 && (a3[b4] = c2);
          } };
        }, 845: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.trace = void 0, b3.trace = c2(997).TraceAPI.getInstance();
        }, 403: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NonRecordingSpan = void 0;
          let d2 = c2(476);
          class e2 {
            constructor(a3 = d2.INVALID_SPAN_CONTEXT) {
              this._spanContext = a3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(a3, b4) {
              return this;
            }
            setAttributes(a3) {
              return this;
            }
            addEvent(a3, b4) {
              return this;
            }
            setStatus(a3) {
              return this;
            }
            updateName(a3) {
              return this;
            }
            end(a3) {
            }
            isRecording() {
              return false;
            }
            recordException(a3, b4) {
            }
          }
          b3.NonRecordingSpan = e2;
        }, 614: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracer = void 0;
          let d2 = c2(491), e2 = c2(607), f2 = c2(403), g = c2(139), h = d2.ContextAPI.getInstance();
          class i {
            startSpan(a3, b4, c3 = h.active()) {
              var d3;
              if (null == b4 ? void 0 : b4.root) return new f2.NonRecordingSpan();
              let i2 = c3 && (0, e2.getSpanContext)(c3);
              return "object" == typeof (d3 = i2) && "string" == typeof d3.spanId && "string" == typeof d3.traceId && "number" == typeof d3.traceFlags && (0, g.isSpanContextValid)(i2) ? new f2.NonRecordingSpan(i2) : new f2.NonRecordingSpan();
            }
            startActiveSpan(a3, b4, c3, d3) {
              let f3, g2, i2;
              if (arguments.length < 2) return;
              2 == arguments.length ? i2 = b4 : 3 == arguments.length ? (f3 = b4, i2 = c3) : (f3 = b4, g2 = c3, i2 = d3);
              let j = null != g2 ? g2 : h.active(), k = this.startSpan(a3, f3, j), l = (0, e2.setSpan)(j, k);
              return h.with(l, i2, void 0, k);
            }
          }
          b3.NoopTracer = i;
        }, 124: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracerProvider = void 0;
          let d2 = c2(614);
          class e2 {
            getTracer(a3, b4, c3) {
              return new d2.NoopTracer();
            }
          }
          b3.NoopTracerProvider = e2;
        }, 125: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracer = void 0;
          let d2 = new (c2(614)).NoopTracer();
          class e2 {
            constructor(a3, b4, c3, d3) {
              this._provider = a3, this.name = b4, this.version = c3, this.options = d3;
            }
            startSpan(a3, b4, c3) {
              return this._getTracer().startSpan(a3, b4, c3);
            }
            startActiveSpan(a3, b4, c3, d3) {
              let e3 = this._getTracer();
              return Reflect.apply(e3.startActiveSpan, e3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let a3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return a3 ? (this._delegate = a3, this._delegate) : d2;
            }
          }
          b3.ProxyTracer = e2;
        }, 846: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracerProvider = void 0;
          let d2 = c2(125), e2 = new (c2(124)).NoopTracerProvider();
          class f2 {
            getTracer(a3, b4, c3) {
              var e3;
              return null != (e3 = this.getDelegateTracer(a3, b4, c3)) ? e3 : new d2.ProxyTracer(this, a3, b4, c3);
            }
            getDelegate() {
              var a3;
              return null != (a3 = this._delegate) ? a3 : e2;
            }
            setDelegate(a3) {
              this._delegate = a3;
            }
            getDelegateTracer(a3, b4, c3) {
              var d3;
              return null == (d3 = this._delegate) ? void 0 : d3.getTracer(a3, b4, c3);
            }
          }
          b3.ProxyTracerProvider = f2;
        }, 996: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SamplingDecision = void 0, function(a3) {
            a3[a3.NOT_RECORD = 0] = "NOT_RECORD", a3[a3.RECORD = 1] = "RECORD", a3[a3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(b3.SamplingDecision || (b3.SamplingDecision = {}));
        }, 607: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.getSpanContext = b3.setSpanContext = b3.deleteSpan = b3.setSpan = b3.getActiveSpan = b3.getSpan = void 0;
          let d2 = c2(780), e2 = c2(403), f2 = c2(491), g = (0, d2.createContextKey)("OpenTelemetry Context Key SPAN");
          function h(a3) {
            return a3.getValue(g) || void 0;
          }
          function i(a3, b4) {
            return a3.setValue(g, b4);
          }
          b3.getSpan = h, b3.getActiveSpan = function() {
            return h(f2.ContextAPI.getInstance().active());
          }, b3.setSpan = i, b3.deleteSpan = function(a3) {
            return a3.deleteValue(g);
          }, b3.setSpanContext = function(a3, b4) {
            return i(a3, new e2.NonRecordingSpan(b4));
          }, b3.getSpanContext = function(a3) {
            var b4;
            return null == (b4 = h(a3)) ? void 0 : b4.spanContext();
          };
        }, 325: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceStateImpl = void 0;
          let d2 = c2(564);
          class e2 {
            constructor(a3) {
              this._internalState = /* @__PURE__ */ new Map(), a3 && this._parse(a3);
            }
            set(a3, b4) {
              let c3 = this._clone();
              return c3._internalState.has(a3) && c3._internalState.delete(a3), c3._internalState.set(a3, b4), c3;
            }
            unset(a3) {
              let b4 = this._clone();
              return b4._internalState.delete(a3), b4;
            }
            get(a3) {
              return this._internalState.get(a3);
            }
            serialize() {
              return this._keys().reduce((a3, b4) => (a3.push(b4 + "=" + this.get(b4)), a3), []).join(",");
            }
            _parse(a3) {
              !(a3.length > 512) && (this._internalState = a3.split(",").reverse().reduce((a4, b4) => {
                let c3 = b4.trim(), e3 = c3.indexOf("=");
                if (-1 !== e3) {
                  let f2 = c3.slice(0, e3), g = c3.slice(e3 + 1, b4.length);
                  (0, d2.validateKey)(f2) && (0, d2.validateValue)(g) && a4.set(f2, g);
                }
                return a4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let a3 = new e2();
              return a3._internalState = new Map(this._internalState), a3;
            }
          }
          b3.TraceStateImpl = e2;
        }, 564: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.validateValue = b3.validateKey = void 0;
          let c2 = "[_0-9a-z-*/]", d2 = `[a-z]${c2}{0,255}`, e2 = `[a-z0-9]${c2}{0,240}@[a-z]${c2}{0,13}`, f2 = RegExp(`^(?:${d2}|${e2})$`), g = /^[ -~]{0,255}[!-~]$/, h = /,|=/;
          b3.validateKey = function(a3) {
            return f2.test(a3);
          }, b3.validateValue = function(a3) {
            return g.test(a3) && !h.test(a3);
          };
        }, 98: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createTraceState = void 0;
          let d2 = c2(325);
          b3.createTraceState = function(a3) {
            return new d2.TraceStateImpl(a3);
          };
        }, 476: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.INVALID_SPAN_CONTEXT = b3.INVALID_TRACEID = b3.INVALID_SPANID = void 0;
          let d2 = c2(475);
          b3.INVALID_SPANID = "0000000000000000", b3.INVALID_TRACEID = "00000000000000000000000000000000", b3.INVALID_SPAN_CONTEXT = { traceId: b3.INVALID_TRACEID, spanId: b3.INVALID_SPANID, traceFlags: d2.TraceFlags.NONE };
        }, 357: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanKind = void 0, function(a3) {
            a3[a3.INTERNAL = 0] = "INTERNAL", a3[a3.SERVER = 1] = "SERVER", a3[a3.CLIENT = 2] = "CLIENT", a3[a3.PRODUCER = 3] = "PRODUCER", a3[a3.CONSUMER = 4] = "CONSUMER";
          }(b3.SpanKind || (b3.SpanKind = {}));
        }, 139: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.wrapSpanContext = b3.isSpanContextValid = b3.isValidSpanId = b3.isValidTraceId = void 0;
          let d2 = c2(476), e2 = c2(403), f2 = /^([0-9a-f]{32})$/i, g = /^[0-9a-f]{16}$/i;
          function h(a3) {
            return f2.test(a3) && a3 !== d2.INVALID_TRACEID;
          }
          function i(a3) {
            return g.test(a3) && a3 !== d2.INVALID_SPANID;
          }
          b3.isValidTraceId = h, b3.isValidSpanId = i, b3.isSpanContextValid = function(a3) {
            return h(a3.traceId) && i(a3.spanId);
          }, b3.wrapSpanContext = function(a3) {
            return new e2.NonRecordingSpan(a3);
          };
        }, 847: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanStatusCode = void 0, function(a3) {
            a3[a3.UNSET = 0] = "UNSET", a3[a3.OK = 1] = "OK", a3[a3.ERROR = 2] = "ERROR";
          }(b3.SpanStatusCode || (b3.SpanStatusCode = {}));
        }, 475: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceFlags = void 0, function(a3) {
            a3[a3.NONE = 0] = "NONE", a3[a3.SAMPLED = 1] = "SAMPLED";
          }(b3.TraceFlags || (b3.TraceFlags = {}));
        }, 521: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.VERSION = void 0, b3.VERSION = "1.6.0";
        } }, d = {};
        function e(a2) {
          var c2 = d[a2];
          if (void 0 !== c2) return c2.exports;
          var f2 = d[a2] = { exports: {} }, g = true;
          try {
            b2[a2].call(f2.exports, f2, f2.exports, e), g = false;
          } finally {
            g && delete d[a2];
          }
          return f2.exports;
        }
        e.ab = "//";
        var f = {};
        (() => {
          Object.defineProperty(f, "__esModule", { value: true }), f.trace = f.propagation = f.metrics = f.diag = f.context = f.INVALID_SPAN_CONTEXT = f.INVALID_TRACEID = f.INVALID_SPANID = f.isValidSpanId = f.isValidTraceId = f.isSpanContextValid = f.createTraceState = f.TraceFlags = f.SpanStatusCode = f.SpanKind = f.SamplingDecision = f.ProxyTracerProvider = f.ProxyTracer = f.defaultTextMapSetter = f.defaultTextMapGetter = f.ValueType = f.createNoopMeter = f.DiagLogLevel = f.DiagConsoleLogger = f.ROOT_CONTEXT = f.createContextKey = f.baggageEntryMetadataFromString = void 0;
          var a2 = e(369);
          Object.defineProperty(f, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return a2.baggageEntryMetadataFromString;
          } });
          var b3 = e(780);
          Object.defineProperty(f, "createContextKey", { enumerable: true, get: function() {
            return b3.createContextKey;
          } }), Object.defineProperty(f, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return b3.ROOT_CONTEXT;
          } });
          var c2 = e(972);
          Object.defineProperty(f, "DiagConsoleLogger", { enumerable: true, get: function() {
            return c2.DiagConsoleLogger;
          } });
          var d2 = e(957);
          Object.defineProperty(f, "DiagLogLevel", { enumerable: true, get: function() {
            return d2.DiagLogLevel;
          } });
          var g = e(102);
          Object.defineProperty(f, "createNoopMeter", { enumerable: true, get: function() {
            return g.createNoopMeter;
          } });
          var h = e(901);
          Object.defineProperty(f, "ValueType", { enumerable: true, get: function() {
            return h.ValueType;
          } });
          var i = e(194);
          Object.defineProperty(f, "defaultTextMapGetter", { enumerable: true, get: function() {
            return i.defaultTextMapGetter;
          } }), Object.defineProperty(f, "defaultTextMapSetter", { enumerable: true, get: function() {
            return i.defaultTextMapSetter;
          } });
          var j = e(125);
          Object.defineProperty(f, "ProxyTracer", { enumerable: true, get: function() {
            return j.ProxyTracer;
          } });
          var k = e(846);
          Object.defineProperty(f, "ProxyTracerProvider", { enumerable: true, get: function() {
            return k.ProxyTracerProvider;
          } });
          var l = e(996);
          Object.defineProperty(f, "SamplingDecision", { enumerable: true, get: function() {
            return l.SamplingDecision;
          } });
          var m = e(357);
          Object.defineProperty(f, "SpanKind", { enumerable: true, get: function() {
            return m.SpanKind;
          } });
          var n = e(847);
          Object.defineProperty(f, "SpanStatusCode", { enumerable: true, get: function() {
            return n.SpanStatusCode;
          } });
          var o = e(475);
          Object.defineProperty(f, "TraceFlags", { enumerable: true, get: function() {
            return o.TraceFlags;
          } });
          var p = e(98);
          Object.defineProperty(f, "createTraceState", { enumerable: true, get: function() {
            return p.createTraceState;
          } });
          var q = e(139);
          Object.defineProperty(f, "isSpanContextValid", { enumerable: true, get: function() {
            return q.isSpanContextValid;
          } }), Object.defineProperty(f, "isValidTraceId", { enumerable: true, get: function() {
            return q.isValidTraceId;
          } }), Object.defineProperty(f, "isValidSpanId", { enumerable: true, get: function() {
            return q.isValidSpanId;
          } });
          var r = e(476);
          Object.defineProperty(f, "INVALID_SPANID", { enumerable: true, get: function() {
            return r.INVALID_SPANID;
          } }), Object.defineProperty(f, "INVALID_TRACEID", { enumerable: true, get: function() {
            return r.INVALID_TRACEID;
          } }), Object.defineProperty(f, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return r.INVALID_SPAN_CONTEXT;
          } });
          let s = e(67);
          Object.defineProperty(f, "context", { enumerable: true, get: function() {
            return s.context;
          } });
          let t = e(506);
          Object.defineProperty(f, "diag", { enumerable: true, get: function() {
            return t.diag;
          } });
          let u = e(886);
          Object.defineProperty(f, "metrics", { enumerable: true, get: function() {
            return u.metrics;
          } });
          let v = e(939);
          Object.defineProperty(f, "propagation", { enumerable: true, get: function() {
            return v.propagation;
          } });
          let w = e(845);
          Object.defineProperty(f, "trace", { enumerable: true, get: function() {
            return w.trace;
          } }), f.default = { context: s.context, diag: t.diag, metrics: u.metrics, propagation: v.propagation, trace: w.trace };
        })(), a.exports = f;
      })();
    } }, (a) => {
      var b = a(a.s = 807);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES).middleware_middleware = b;
    }]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*))(\\.json)?[\\/#\\?]?$", "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/(api|trpc))(.*)(\\.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": false }, "typescript": { "ignoreBuildErrors": false, "tsconfigPath": "tsconfig.json" }, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": true }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/home/aaron/projects/card-comps", "experimental": { "useSkewCookie": false, "nodeMiddleware": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 0, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 3, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedRoutes": false, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "routerBFCache": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "dynamicIO": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "devtoolNewPanelUI": false, "devtoolSegmentExplorer": false, "browserDebugInfoInTerminal": false, "optimizeRouterScrolling": false, "strictNextHead": true, "middlewareClientMaxBodySize": 10485760, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "Mediapartners-Google|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "turbopack": { "root": "/home/aaron/projects/card-comps" } };
var BuildId = "qlWUzLkGU9F0B7Hm5ltin";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/dashboard", "regex": "^/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard(?:/)?$" }], "dynamic": [], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": {}, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "fa0c4f464a0e29ecd949d761dd02446e", "previewModeSigningKey": "8359dcb82a52462687bab829e1f7ff6e8c27c18917c5e3a4b2a9bbccea82b946", "previewModeEncryptionKey": "11bd7394dfd513f4a10428801dcdc3564a99578c77b3bcaca410c665694ae19c" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/middleware.js"], "name": "middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*))(\\.json)?[\\/#\\?]?$", "originalSource": "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)" }, { "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/(api|trpc))(.*)(\\.json)?[\\/#\\?]?$", "originalSource": "/(api|trpc)(.*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "qlWUzLkGU9F0B7Hm5ltin", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "9WBY8HBzi8M6/FlbCRPTIRQCVCiBANOlP8hSf9lbZoI=", "__NEXT_PREVIEW_MODE_ID": "fa0c4f464a0e29ecd949d761dd02446e", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "8359dcb82a52462687bab829e1f7ff6e8c27c18917c5e3a4b2a9bbccea82b946", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "11bd7394dfd513f4a10428801dcdc3564a99578c77b3bcaca410c665694ae19c" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/api/profile/route": "/api/profile", "/api/webhooks/clerk/route": "/api/webhooks/clerk", "/dashboard/page": "/dashboard", "/page": "/" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream2 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream2({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {});
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = Boolean(event.headers.rsc);
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath ?? "/") || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
