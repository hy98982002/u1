// 版本号一变，旧缓存就会被清理
const CACHE_VERSION = 'v1.0.0'
const PRECACHE = `precache-${CACHE_VERSION}`
const RUNTIME = `runtime-${CACHE_VERSION}`

const APP_SHELL = [
  '/', // 让首页可离线打开
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/logo/logo-universal-square-256.png',
  '/images/logo/logo-universal-square-512.png',
  '/manifest.json'
]

// 安装：预缓存壳文件
self.addEventListener('install', event => {
  event.waitUntil(caches.open(PRECACHE).then(cache => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter(k => ![PRECACHE, RUNTIME].includes(k)).map(k => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

// 工具：判断是否为导航请求（HTML）
const isNavigationRequest = req =>
  req.mode === 'navigate' ||
  (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))

// 工具：判断图片
const isImage = req => req.destination === 'image' || /\.(png|jpg|jpeg|webp|gif|svg)$/.test(req.url)

// 工具：判断 API（示例匹配，可按你域名调整）
const isAPI = req => /api\.doviai\.com/.test(req.url)

// fetch 拦截：不同资源走不同策略
self.addEventListener('fetch', event => {
  const req = event.request

  // 1) HTML：网络优先，失败回离线页
  if (isNavigationRequest(req)) {
    event.respondWith(networkFirst(req, '/offline.html'))
    return
  }

  // 2) 图片：SWR 策略（先缓存后更新）
  if (isImage(req)) {
    event.respondWith(staleWhileRevalidate(req))
    return
  }

  // 3) API：网络优先，离线回缓存
  if (isAPI(req)) {
    event.respondWith(networkFirst(req))
    return
  }

  // 4) 其他静态资源：缓存优先
  event.respondWith(cacheFirst(req))
})

/** 策略实现 **/

// 缓存优先：命中缓存就用，否则走网络并写入
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME)
  const cached = await cache.match(request)
  if (cached) return cached
  const resp = await fetch(request)
  // 只缓存成功的 200 响应
  if (resp && resp.status === 200) cache.put(request, resp.clone())
  return resp
}

// 网络优先：优先取网络，失败再回退缓存或离线页
async function networkFirst(request, offlineFallbackPath) {
  const cache = await caches.open(RUNTIME)
  try {
    const fresh = await fetch(request, { cache: 'no-store' })
    if (fresh && fresh.status === 200) cache.put(request, fresh.clone())
    return fresh
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    if (offlineFallbackPath) {
      const precache = await caches.open(PRECACHE)
      const offline = await precache.match(offlineFallbackPath)
      if (offline) return offline
    }
    throw err
  }
}

// SWR：给缓存的旧内容，后台拉网络更新缓存
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME)
  const cached = await cache.match(request)
  const networkFetch = fetch(request)
    .then(resp => {
      if (resp && resp.status === 200) cache.put(request, resp.clone())
      return resp
    })
    .catch(() => undefined)

  // 先返回缓存；若无缓存，等网络
  return cached || networkFetch
}
