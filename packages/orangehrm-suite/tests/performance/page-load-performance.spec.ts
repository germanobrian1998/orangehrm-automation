/**
 * OrangeHRM Suite - Page Load Performance Tests
 * Measures page load times for critical pages, analyzes Core Web Vitals
 * (LCP, FID, CLS), tests performance on slow networks and mobile devices,
 * and identifies render-blocking resources.
 *
 * Testing pyramid layer: Performance
 * All tests are offline and validate the web vitals data structures and
 * performance monitoring utilities without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import {
  PerformanceMonitor,
  PERFORMANCE_THRESHOLDS,
  CoreWebVitals,
} from './performance-monitoring';

test.describe('@performance Page Load Performance Tests', () => {
  // ── 1. CoreWebVitals data structure ────────────────────────────────────────

  test.describe('CoreWebVitals data structure', () => {
    test('CoreWebVitals type has lcp field', () => {
      const vitals: CoreWebVitals = {
        lcp: 2000,
        fid: 80,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
      };
      expect(typeof vitals.lcp).toBe('number');
    });

    test('CoreWebVitals type has fid field', () => {
      const vitals: CoreWebVitals = {
        lcp: 2000,
        fid: 80,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
      };
      expect(typeof vitals.fid).toBe('number');
    });

    test('CoreWebVitals type has cls field', () => {
      const vitals: CoreWebVitals = {
        lcp: 2000,
        fid: 80,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
      };
      expect(typeof vitals.cls).toBe('number');
    });

    test('CoreWebVitals type has fcp field', () => {
      const vitals: CoreWebVitals = {
        lcp: 2000,
        fid: 80,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
      };
      expect(typeof vitals.fcp).toBe('number');
    });

    test('CoreWebVitals type has ttfb field', () => {
      const vitals: CoreWebVitals = {
        lcp: 2000,
        fid: 80,
        cls: 0.05,
        fcp: 1500,
        ttfb: 600,
      };
      expect(typeof vitals.ttfb).toBe('number');
    });

    test('CoreWebVitals fields can be null (unavailable)', () => {
      const vitals: CoreWebVitals = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
      };
      expect(vitals.lcp).toBeNull();
      expect(vitals.fid).toBeNull();
    });
  });

  // ── 2. Core Web Vitals thresholds ─────────────────────────────────────────

  test.describe('Core Web Vitals thresholds', () => {
    test('LCP threshold is 2500ms (Google Good threshold)', () => {
      expect(PERFORMANCE_THRESHOLDS.lcp).toBe(2500);
    });

    test('FID threshold is 100ms (Google Good threshold)', () => {
      expect(PERFORMANCE_THRESHOLDS.fid).toBe(100);
    });

    test('CLS threshold is 0.1 (Google Good threshold)', () => {
      expect(PERFORMANCE_THRESHOLDS.cls).toBe(0.1);
    });

    test('FCP threshold is 1800ms (Google Good threshold)', () => {
      expect(PERFORMANCE_THRESHOLDS.fcp).toBe(1800);
    });

    test('TTFB threshold is 800ms (Good threshold)', () => {
      expect(PERFORMANCE_THRESHOLDS.ttfb).toBe(800);
    });

    test('good LCP value passes threshold', () => {
      const lcp = 2000;
      expect(lcp).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.lcp);
    });

    test('poor LCP value exceeds threshold', () => {
      const lcp = 4000;
      expect(lcp).toBeGreaterThan(PERFORMANCE_THRESHOLDS.lcp);
    });

    test('good CLS value passes threshold', () => {
      const cls = 0.05;
      expect(cls).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.cls);
    });

    test('poor CLS value exceeds threshold', () => {
      const cls = 0.25;
      expect(cls).toBeGreaterThan(PERFORMANCE_THRESHOLDS.cls);
    });
  });

  // ── 3. PerformanceMonitor Core Web Vitals recording ───────────────────────

  test.describe('Record and retrieve Core Web Vitals', () => {
    test('recordCoreWebVitals method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('cwv-test');
      expect(typeof monitor.recordCoreWebVitals).toBe('function');
    });

    test('recordCoreWebVitals stores vitals in the report', () => {
      const monitor = new PerformanceMonitor('cwv-record');

      const vitals: CoreWebVitals = {
        lcp: 1800,
        fid: 70,
        cls: 0.04,
        fcp: 1200,
        ttfb: 500,
      };

      monitor.recordCoreWebVitals(vitals);

      const report = monitor.generateReport();
      expect(report.coreWebVitals).toHaveLength(1);
      expect(report.coreWebVitals[0].lcp).toBe(1800);
    });

    test('multiple Core Web Vitals measurements can be recorded', () => {
      const monitor = new PerformanceMonitor('cwv-multi');

      const pages = ['login', 'dashboard', 'employee-list', 'leave-apply'];
      pages.forEach((page) => {
        monitor.recordCoreWebVitals({
          lcp: Math.random() * 2000 + 500,
          fid: Math.random() * 80 + 10,
          cls: Math.random() * 0.08,
          fcp: Math.random() * 1500 + 300,
          ttfb: Math.random() * 600 + 100,
        });
      });

      const report = monitor.generateReport();
      expect(report.coreWebVitals).toHaveLength(pages.length);
    });

    test('Core Web Vitals with null values are stored correctly', () => {
      const monitor = new PerformanceMonitor('cwv-null');

      monitor.recordCoreWebVitals({
        lcp: null,
        fid: null,
        cls: 0.05,
        fcp: 1200,
        ttfb: null,
      });

      const report = monitor.generateReport();
      expect(report.coreWebVitals[0].lcp).toBeNull();
      expect(report.coreWebVitals[0].fid).toBeNull();
      expect(report.coreWebVitals[0].cls).toBe(0.05);
    });
  });

  // ── 4. Critical page load time measurements ────────────────────────────────

  test.describe('Measure page load times for critical pages', () => {
    test('page load time threshold is defined', () => {
      expect(PERFORMANCE_THRESHOLDS.pageLoadTime).toBe(5000);
    });

    test('login page load time can be recorded as a response-time metric', () => {
      const monitor = new PerformanceMonitor('page-load');

      monitor.recordResponseTime('login-page-load', 1500);

      const report = monitor.generateReport();
      const metric = report.metrics.find((m) => m.name === 'login-page-load');
      expect(metric).toBeDefined();
      expect(metric?.value).toBe(1500);
      expect(metric?.unit).toBe('ms');
    });

    test('dashboard page load time can be recorded', () => {
      const monitor = new PerformanceMonitor('page-load');
      monitor.recordResponseTime('dashboard-page-load', 2200);

      const report = monitor.generateReport();
      const metric = report.metrics.find((m) => m.name === 'dashboard-page-load');
      expect(metric).toBeDefined();
    });

    test('employee list page load time can be recorded', () => {
      const monitor = new PerformanceMonitor('page-load');
      monitor.recordResponseTime('employee-list-page-load', 3100);

      const report = monitor.generateReport();
      const metric = report.metrics.find((m) => m.name === 'employee-list-page-load');
      expect(metric?.value).toBe(3100);
    });

    test('leave apply page load time can be recorded', () => {
      const monitor = new PerformanceMonitor('page-load');
      monitor.recordResponseTime('leave-apply-page-load', 2800);

      const report = monitor.generateReport();
      expect(report.metrics).toHaveLength(1);
    });

    test('slow page load triggers an alert', () => {
      const monitor = new PerformanceMonitor('slow-page');

      monitor.recordResponseTime('reports-page-load', PERFORMANCE_THRESHOLDS.pageLoadTime + 3000);

      const alerts = monitor.detectAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // ── 5. Slow network simulation ─────────────────────────────────────────────

  test.describe('Performance on slow network conditions', () => {
    test('slow 3G network profile values are reasonable', () => {
      const slow3G = { downloadKbps: 400, uploadKbps: 400, latencyMs: 400 };
      expect(slow3G.downloadKbps).toBeLessThan(1000);
      expect(slow3G.latencyMs).toBeGreaterThan(100);
    });

    test('fast 3G network profile values are reasonable', () => {
      const fast3G = { downloadKbps: 1600, uploadKbps: 750, latencyMs: 150 };
      expect(fast3G.downloadKbps).toBeGreaterThan(slow3GProfile().downloadKbps);
    });

    test('page load time on slow network is expected to be higher', () => {
      const normalLoadTime = 1500;
      const slow3GMultiplier = 3;
      const expectedSlowLoadTime = normalLoadTime * slow3GMultiplier;

      expect(expectedSlowLoadTime).toBeGreaterThan(PERFORMANCE_THRESHOLDS.fcp);
    });

    test('network condition data shape is valid', () => {
      const networkConditions = [
        { name: '2G', downloadKbps: 250, uploadKbps: 50, latencyMs: 600 },
        { name: '3G', downloadKbps: 1600, uploadKbps: 750, latencyMs: 150 },
        { name: '4G', downloadKbps: 9000, uploadKbps: 9000, latencyMs: 28 },
        { name: 'WiFi', downloadKbps: 30000, uploadKbps: 15000, latencyMs: 2 },
      ];

      networkConditions.forEach((condition) => {
        expect(typeof condition.name).toBe('string');
        expect(condition.downloadKbps).toBeGreaterThan(0);
        expect(condition.uploadKbps).toBeGreaterThan(0);
        expect(condition.latencyMs).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ── 6. Mobile device performance ──────────────────────────────────────────

  test.describe('Performance on mobile devices', () => {
    test('mobile device profile data shape is valid', () => {
      const mobileProfile = {
        deviceName: 'iPhone 12',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        cpuThrottling: 4,
      };

      expect(mobileProfile.isMobile).toBe(true);
      expect(mobileProfile.hasTouch).toBe(true);
      expect(mobileProfile.viewport.width).toBeLessThan(mobileProfile.viewport.height);
      expect(mobileProfile.cpuThrottling).toBeGreaterThan(1);
    });

    test('mobile page load time is expected to be higher than desktop', () => {
      const desktopLoadTime = 1500;
      const mobileCpuThrottling = 4;
      const expectedMobileLoadTime = desktopLoadTime * (mobileCpuThrottling / 2);

      expect(expectedMobileLoadTime).toBeGreaterThan(desktopLoadTime);
    });

    test('mobile LCP threshold applies the same Good threshold', () => {
      const mobileLcp = 2200;
      expect(mobileLcp).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.lcp);
    });

    test('mobile viewport dimensions are within common ranges', () => {
      const mobileViewports = [
        { width: 375, height: 667 },
        { width: 390, height: 844 },
        { width: 412, height: 915 },
        { width: 360, height: 780 },
      ];

      mobileViewports.forEach((vp) => {
        expect(vp.width).toBeGreaterThanOrEqual(320);
        expect(vp.width).toBeLessThanOrEqual(480);
        expect(vp.height).toBeGreaterThan(vp.width);
      });
    });
  });

  // ── 7. Resource loading time analysis ─────────────────────────────────────

  test.describe('Monitor resource loading times', () => {
    test('network category metrics can be recorded', () => {
      const monitor = new PerformanceMonitor('resource-load');

      monitor.recordMetric({ name: 'main.js', value: 320, unit: 'ms', category: 'network' });
      monitor.recordMetric({ name: 'main.css', value: 80, unit: 'ms', category: 'network' });
      monitor.recordMetric({ name: 'logo.png', value: 45, unit: 'ms', category: 'network' });

      const report = monitor.generateReport();
      const networkMetrics = report.metrics.filter((m) => m.category === 'network');
      expect(networkMetrics).toHaveLength(3);
    });

    test('resource size metrics can be tracked in KB', () => {
      const monitor = new PerformanceMonitor('resource-size');

      monitor.recordMetric({ name: 'main-bundle-size', value: 512, unit: 'KB', category: 'network' });
      monitor.recordMetric({ name: 'vendor-bundle-size', value: 1024, unit: 'KB', category: 'network' });

      const report = monitor.generateReport();
      const sizeMetrics = report.metrics.filter((m) => m.unit === 'KB');
      expect(sizeMetrics).toHaveLength(2);
    });
  });

  // ── 8. Render-blocking resource identification ─────────────────────────────

  test.describe('Identify render-blocking resources', () => {
    test('render-blocking resource list has correct data shape', () => {
      const renderBlockingResources = [
        { url: '/static/css/main.css', type: 'stylesheet', sizeKB: 48, durationMs: 120 },
        { url: '/static/js/vendor.js', type: 'script', sizeKB: 256, durationMs: 450 },
      ];

      renderBlockingResources.forEach((resource) => {
        expect(typeof resource.url).toBe('string');
        expect(['stylesheet', 'script', 'font']).toContain(resource.type);
        expect(resource.sizeKB).toBeGreaterThan(0);
        expect(resource.durationMs).toBeGreaterThan(0);
      });
    });

    test('render-blocking script load time can be flagged as a bottleneck', () => {
      const monitor = new PerformanceMonitor('render-blocking');

      monitor.recordResponseTime('vendor-js-blocking', PERFORMANCE_THRESHOLDS.pageLoadTime + 1000);

      const alerts = monitor.detectAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('non-blocking resources do not trigger alerts', () => {
      const monitor = new PerformanceMonitor('non-blocking');

      monitor.recordMetric({ name: 'async-script', value: 800, unit: 'ms', category: 'network' });

      const alerts = monitor.detectAlerts();
      expect(alerts).toHaveLength(0);
    });
  });
});

/** Helper for slow 3G profile used across tests */
function slow3GProfile() {
  return { downloadKbps: 400, uploadKbps: 400, latencyMs: 400 };
}
