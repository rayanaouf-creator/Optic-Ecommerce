// Meta Pixel (Facebook Pixel) Utility for tracking events

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

const META_PIXEL_KEY = 'optica_meta_pixel_id';

export function getMetaPixelId(): string {
  // First check localStorage, then fallback to environment variable if configured
  const saved = localStorage.getItem(META_PIXEL_KEY);
  if (saved && saved.trim()) {
    return saved.trim();
  }
  const envPixel = (import.meta as any).env?.VITE_META_PIXEL_ID;
  return (envPixel || '').trim();
}

export function saveMetaPixelId(pixelId: string) {
  if (pixelId && pixelId.trim()) {
    localStorage.setItem(META_PIXEL_KEY, pixelId.trim());
    initMetaPixel(pixelId.trim());
  } else {
    localStorage.removeItem(META_PIXEL_KEY);
  }
}

let isPixelInitialized = false;

export function initMetaPixel(customPixelId?: string) {
  const pixelId = customPixelId || getMetaPixelId();
  if (!pixelId) {
    return false;
  }

  // If already loaded fbq script, just re-init with the pixel id
  if (window.fbq) {
    try {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      isPixelInitialized = true;
      return true;
    } catch (e) {
      console.warn('Error re-initializing Meta Pixel:', e);
      return false;
    }
  }

  // Inject the official Meta Pixel snippet
  try {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        if (n.callMethod) {
          n.callMethod.apply(n, arguments);
        } else {
          n.queue.push(arguments);
        }
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      isPixelInitialized = true;
    }
    return true;
  } catch (err) {
    console.error('Failed to initialize Meta Pixel:', err);
    return false;
  }
}

// Track standard Meta Pixel events
export function trackPixelEvent(eventName: string, data: Record<string, any> = {}) {
  const pixelId = getMetaPixelId();
  if (!pixelId) return;

  if (!isPixelInitialized) {
    initMetaPixel(pixelId);
  }

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', eventName, data);
      console.log(`[Meta Pixel] Tracked ${eventName}:`, data);
    } catch (error) {
      console.warn(`[Meta Pixel] Error tracking ${eventName}:`, error);
    }
  }
}

// Convenient helpers
export function trackPageView() {
  trackPixelEvent('PageView');
}

export function trackViewContent(product: { id: string; name: string; price: number; brand?: string }) {
  trackPixelEvent('ViewContent', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'DZD',
    content_category: product.brand || 'Eyewear'
  });
}

export function trackInitiateCheckout(product: { id: string; name: string; price: number }) {
  trackPixelEvent('InitiateCheckout', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'DZD',
    num_items: 1
  });
}

export function trackPurchase(order: { id: string; frameName: string; frameId: string; totalAmount: number }) {
  trackPixelEvent('Purchase', {
    content_name: order.frameName,
    content_ids: [order.frameId],
    content_type: 'product',
    value: order.totalAmount,
    currency: 'DZD',
    num_items: 1,
    order_id: order.id
  });
}
