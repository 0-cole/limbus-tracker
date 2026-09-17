import { getCardImageUrl } from './textUtils.js';

/**
 * Intelligent background image preloader with idle scheduling and concurrency gating.
 * Ensures image assets are decoded off-thread in Chromium without blocking UI scrolling.
 */
class ImagePreloader {
  constructor() {
    this.preloadedUrls = new Set();
    this.loadingUrls = new Set();
    this.queue = [];
    this.isProcessing = false;
    this.concurrency = 4; // Max concurrent image network/decoding tasks
    this.activeWorkers = 0;
  }

  /**
   * Enqueue a single URL for preloading.
   */
  preloadUrl(url) {
    if (!url || this.preloadedUrls.has(url) || this.loadingUrls.has(url)) return;
    this.queue.push(url);
    this.processQueue();
  }

  /**
   * Enqueue an array of URLs for background preloading.
   * @param {string[]} urls
   * @param {boolean} [highPriority=false] - If true, insert at the front of the queue
   */
  preloadUrls(urls, highPriority = false) {
    if (!Array.isArray(urls)) return;
    const cleanUrls = urls.filter(u => u && !this.preloadedUrls.has(u) && !this.loadingUrls.has(u));
    if (cleanUrls.length === 0) return;

    if (highPriority) {
      this.queue.unshift(...cleanUrls);
    } else {
      this.queue.push(...cleanUrls);
    }
    this.processQueue();
  }

  /**
   * Process preloading queue during browser idle intervals.
   */
  processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const scheduleNext = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback((deadline) => {
          this.step(deadline);
        }, { timeout: 100 });
      } else {
        setTimeout(() => {
          this.step();
        }, 20);
      }
    };

    scheduleNext();
  }

  step(deadline) {
    while (this.activeWorkers < this.concurrency && this.queue.length > 0) {
      if (deadline && typeof deadline.timeRemaining === 'function' && deadline.timeRemaining() <= 1) {
        break; // Yield to higher-priority UI tasks
      }

      const url = this.queue.shift();
      if (!url || this.preloadedUrls.has(url) || this.loadingUrls.has(url)) {
        continue;
      }

      this.loadingUrls.add(url);
      this.activeWorkers++;

      const img = new Image();
      img.decoding = 'async';

      const onComplete = () => {
        this.loadingUrls.delete(url);
        this.preloadedUrls.add(url);
        this.activeWorkers--;
        this.step(deadline);
      };

      img.onload = onComplete;
      img.onerror = onComplete;
      img.src = url;
    }

    if (this.queue.length > 0) {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback((d) => this.step(d), { timeout: 100 });
      } else {
        setTimeout(() => this.step(), 25);
      }
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Preload all identity art (uptied art, base art, and slug fallbacks).
   * @param {Array} identities
   * @param {boolean} [highPriority=false]
   */
  preloadIdentities(identities = [], highPriority = false) {
    if (!Array.isArray(identities)) return;
    const urls = [];
    for (const id of identities) {
      const defaultUrl = getCardImageUrl(id);
      if (defaultUrl) urls.push(defaultUrl);
      if (id.slug) {
        urls.push(`https://assets.limbusdeck.com/identities/full/${id.slug}.webp`);
        urls.push(`https://assets.limbusdeck.com/identities/full-uptied/${id.slug}.webp`);
      }
    }
    this.preloadUrls(urls, highPriority);
  }

  /**
   * Preload all E.G.O art.
   * @param {Array} egos
   * @param {boolean} [highPriority=false]
   */
  preloadEgos(egos = [], highPriority = false) {
    if (!Array.isArray(egos)) return;
    const urls = [];
    for (const ego of egos) {
      const defaultUrl = getCardImageUrl(ego, true);
      if (defaultUrl) urls.push(defaultUrl);
      if (ego.slug) {
        urls.push(`https://assets.limbusdeck.com/egos/full/${ego.slug}.webp`);
      }
    }
    this.preloadUrls(urls, highPriority);
  }
}

export const imagePreloader = new ImagePreloader();
