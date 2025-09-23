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

// 占位图：用于离线时图片加载失败的回退
const PLACEHOLDER_IMAGE = '/images/logo/logo-universal-square-256.png'

// 缓存容量控制配置
const CACHE_CONFIG = {
  MAX_ENTRIES: 50, // 最大缓存条目数
  MAX_AGE_SECONDS: 30 * 24 * 60 * 60, // 30天过期时间
  CLEANUP_THRESHOLD: 45 // 缓存数量达到45时开始清理
}

// 安装：预缓存壳文件
self.addEventListener('install', event => {
  event.waitUntil(caches.open(PRECACHE).then(cache => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

// 激活：清理旧缓存并优化当前缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()

      // 删除不再需要的旧版本缓存
      await Promise.all(
        keys.filter(k => ![PRECACHE, RUNTIME].includes(k)).map(k => caches.delete(k))
      )

      // 优化当前运行时缓存
      try {
        await manageCacheSize(RUNTIME)
        console.log('Service Worker激活完成，缓存已优化')
      } catch (error) {
        console.warn('缓存优化失败:', error)
      }

      await self.clients.claim()
    })()
  )
})

// 工具：判断是否为导航请求（HTML）
const isNavigationRequest = req =>
  req.mode === 'navigate' ||
  (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))

// 工具：判断图片（包含 ico）
const isImage = req =>
  req.destination === 'image' || /\.(png|jpg|jpeg|webp|gif|svg|ico)$/.test(req.url)

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

/** 缓存管理工具 **/

// 清理过期缓存和控制容量
async function manageCacheSize(cacheName = RUNTIME) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length <= CACHE_CONFIG.CLEANUP_THRESHOLD) {
    return // 未达到清理阈值
  }

  console.log(`缓存数量 ${keys.length}，开始清理过期和多余项`)

  // 获取所有缓存项的元数据
  const cacheEntries = await Promise.all(
    keys.map(async (request) => {
      const response = await cache.match(request)
      return {
        request,
        timestamp: new Date(response.headers.get('date') || Date.now()).getTime(),
        url: request.url
      }
    })
  )

  // 按时间排序，最旧的在前
  cacheEntries.sort((a, b) => a.timestamp - b.timestamp)

  // 计算需要删除的数量
  const now = Date.now()
  const maxAge = CACHE_CONFIG.MAX_AGE_SECONDS * 1000

  // 删除过期项
  const expiredEntries = cacheEntries.filter(
    entry => (now - entry.timestamp) > maxAge
  )

  // 如果还是超过限制，删除最旧的项
  const totalToDelete = Math.max(
    expiredEntries.length,
    keys.length - CACHE_CONFIG.MAX_ENTRIES
  )

  const entriesToDelete = cacheEntries.slice(0, totalToDelete)

  // 执行删除
  const deletePromises = entriesToDelete.map(entry => {
    console.log('删除过期缓存:', entry.url)
    return cache.delete(entry.request)
  })

  await Promise.all(deletePromises)

  if (entriesToDelete.length > 0) {
    console.log(`缓存清理完成，删除了 ${entriesToDelete.length} 项，剩余 ${keys.length - entriesToDelete.length} 项`)
  }
}

// 安全的缓存写入，带容量管理
async function safeCachePut(cache, request, response) {
  // 先写入缓存
  await cache.put(request, response.clone())

  // 后台异步清理，不阻塞主流程
  manageCacheSize().catch(error =>
    console.warn('缓存清理失败:', error)
  )

  return response
}

/** 策略实现 **/

// 缓存优先：命中缓存就用，否则走网络并写入
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const resp = await fetch(request)
    // 只缓存成功的 200 响应，且确保响应体可读
    if (resp && resp.status === 200 && resp.ok) {
      await safeCachePut(cache, request, resp)
    }
    return resp
  } catch (error) {
    // 网络失败时记录错误但不阻塞响应
    console.warn('缓存优先策略网络请求失败:', request.url, error)
    throw error
  }
}

// 网络优先：优先取网络，失败再回退缓存或离线页
async function networkFirst(request, offlineFallbackPath) {
  const cache = await caches.open(RUNTIME)
  try {
    const fresh = await fetch(request, { cache: 'no-store' })
    // 增强状态检查：确保响应成功且可读
    if (fresh && fresh.status === 200 && fresh.ok) {
      await safeCachePut(cache, request, fresh)
    }
    return fresh
  } catch (err) {
    console.warn('网络优先策略失败，尝试缓存回退:', request.url, err.message)
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

  // 后台网络请求，增强健康检查
  const networkFetch = fetch(request)
    .then(async resp => {
      // 增强状态检查：确保响应成功且可读
      if (resp && resp.status === 200 && resp.ok) {
        await safeCachePut(cache, request, resp)
      }
      return resp
    })
    .catch(error => {
      console.warn('SWR后台更新失败:', request.url, error.message)
      return undefined
    })

  // 如果有缓存，立即返回
  if (cached) return cached

  // 无缓存时等待网络，失败则返回占位图
  try {
    const networkResponse = await networkFetch
    if (networkResponse) return networkResponse

    // 网络请求失败且是图片资源，返回占位图
    if (isImage(request)) {
      const precache = await caches.open(PRECACHE)
      const placeholder = await precache.match(PLACEHOLDER_IMAGE)
      if (placeholder) {
        console.info('图片加载失败，返回占位图:', request.url)
        return placeholder
      }
    }

    throw new Error('网络请求失败且无占位图')
  } catch (error) {
    throw error
  }
}
