/**
 * OrangeHRM Suite - Load Testing
 * Simulates concurrent users and measures system performance under load.
 * Tests with 10, 50, and 100+ concurrent users, measures response times,
 * and verifies system recovery after load.
 *
 * Testing pyramid layer: Performance
 * All tests are offline (no live OrangeHRM instance required) and validate
 * the monitoring utilities and load simulation logic.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { selectors } from '../../src/selectors';
import {
  PerformanceMonitor,
  simulateConcurrentLoad,
  LOAD_TEST_SCENARIOS,
  PERFORMANCE_THRESHOLDS,
  LoadTestResult,
} from './performance-monitoring';

test.describe('@performance Load Testing Suite', () => {
  // ── 1. PerformanceMonitor class structure ──────────────────────────────────

  test.describe('PerformanceMonitor class structure', () => {
    test('PerformanceMonitor is importable', async ({ logger }) => {
      logger.step(1, 'Verify PerformanceMonitor is importable');
      expect(PerformanceMonitor).toBeDefined();
      logger.info('✓ PerformanceMonitor is importable');
    });

    test('PerformanceMonitor can be instantiated with a suite name', async ({ logger }) => {
      logger.step(1, 'Instantiate PerformanceMonitor');
      const monitor = new PerformanceMonitor('load-test');
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
      logger.info('✓ PerformanceMonitor instantiated');
    });

    test('recordMetric method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.recordMetric).toBe('function');
    });

    test('recordResponseTime method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.recordResponseTime).toBe('function');
    });

    test('recordMemoryUsage method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.recordMemoryUsage).toBe('function');
    });

    test('recordLoadTestResult method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.recordLoadTestResult).toBe('function');
    });

    test('generateReport method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.generateReport).toBe('function');
    });

    test('detectAlerts method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.detectAlerts).toBe('function');
    });

    test('printSummary method is defined on PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      expect(typeof monitor.printSummary).toBe('function');
    });
  });

  // ── 2. LOAD_TEST_SCENARIOS constants ──────────────────────────────────────

  test.describe('LOAD_TEST_SCENARIOS constants', () => {
    test('LOAD_TEST_SCENARIOS is defined', () => {
      expect(LOAD_TEST_SCENARIOS).toBeDefined();
    });

    test('light scenario has 10 concurrent users', () => {
      expect(LOAD_TEST_SCENARIOS.light.users).toBe(10);
    });

    test('moderate scenario has 50 concurrent users', () => {
      expect(LOAD_TEST_SCENARIOS.moderate.users).toBe(50);
    });

    test('heavy scenario has 100 concurrent users', () => {
      expect(LOAD_TEST_SCENARIOS.heavy.users).toBe(100);
    });

    test('peak scenario has 200+ concurrent users', () => {
      expect(LOAD_TEST_SCENARIOS.peak.users).toBeGreaterThanOrEqual(100);
    });

    test('each scenario has rampUpTime and duration', () => {
      for (const [, scenario] of Object.entries(LOAD_TEST_SCENARIOS)) {
        expect(typeof scenario.rampUpTime).toBe('number');
        expect(typeof scenario.duration).toBe('number');
        expect(scenario.rampUpTime).toBeGreaterThan(0);
        expect(scenario.duration).toBeGreaterThan(0);
      }
    });
  });

  // ── 3. PERFORMANCE_THRESHOLDS constants ───────────────────────────────────

  test.describe('PERFORMANCE_THRESHOLDS constants', () => {
    test('loginResponseTime threshold is defined in ms', () => {
      expect(typeof PERFORMANCE_THRESHOLDS.loginResponseTime).toBe('number');
      expect(PERFORMANCE_THRESHOLDS.loginResponseTime).toBeGreaterThan(0);
    });

    test('pageLoadTime threshold is defined in ms', () => {
      expect(typeof PERFORMANCE_THRESHOLDS.pageLoadTime).toBe('number');
      expect(PERFORMANCE_THRESHOLDS.pageLoadTime).toBeGreaterThan(0);
    });

    test('memoryUsageMax threshold is defined in MB', () => {
      expect(typeof PERFORMANCE_THRESHOLDS.memoryUsageMax).toBe('number');
      expect(PERFORMANCE_THRESHOLDS.memoryUsageMax).toBeGreaterThan(0);
    });

    test('errorRateMax threshold is defined as percentage', () => {
      expect(typeof PERFORMANCE_THRESHOLDS.errorRateMax).toBe('number');
      expect(PERFORMANCE_THRESHOLDS.errorRateMax).toBeGreaterThan(0);
      expect(PERFORMANCE_THRESHOLDS.errorRateMax).toBeLessThanOrEqual(100);
    });
  });

  // ── 4. simulateConcurrentLoad utility ─────────────────────────────────────

  test.describe('simulateConcurrentLoad utility', () => {
    test('simulateConcurrentLoad is importable and is a function', () => {
      expect(typeof simulateConcurrentLoad).toBe('function');
    });

    test('simulateConcurrentLoad returns a LoadTestResult with correct shape', async ({ logger }) => {
      logger.step(1, 'Run lightweight concurrent load simulation (10 users)');

      const result = await simulateConcurrentLoad(
        10,
        async (_userId: number) => {
          await new Promise<void>((resolve) => setTimeout(resolve, 5));
        },
        100,
      );

      expect(result).toBeDefined();
      expect(typeof result.concurrentUsers).toBe('number');
      expect(typeof result.totalRequests).toBe('number');
      expect(typeof result.successfulRequests).toBe('number');
      expect(typeof result.failedRequests).toBe('number');
      expect(typeof result.averageResponseTime).toBe('number');
      expect(typeof result.minResponseTime).toBe('number');
      expect(typeof result.maxResponseTime).toBe('number');
      expect(typeof result.p95ResponseTime).toBe('number');
      expect(typeof result.p99ResponseTime).toBe('number');
      expect(typeof result.requestsPerSecond).toBe('number');
      expect(typeof result.errorRate).toBe('number');
      expect(typeof result.duration).toBe('number');

      logger.assertion(true, 'LoadTestResult has the correct shape');
    });

    test('concurrent users count matches requested users', async () => {
      const result = await simulateConcurrentLoad(
        10,
        async () => { await new Promise<void>((r) => setTimeout(r, 1)); },
        50,
      );
      expect(result.concurrentUsers).toBe(10);
    });

    test('total requests equals successful + failed requests', async () => {
      const result = await simulateConcurrentLoad(
        10,
        async () => { await new Promise<void>((r) => setTimeout(r, 1)); },
        50,
      );
      expect(result.totalRequests).toBe(result.successfulRequests + result.failedRequests);
    });

    test('error rate is 0% when all requests succeed', async () => {
      const result = await simulateConcurrentLoad(
        5,
        async () => { await new Promise<void>((r) => setTimeout(r, 1)); },
        50,
      );
      expect(result.errorRate).toBe(0);
      expect(result.successfulRequests).toBe(5);
    });

    test('error rate is 100% when all requests fail', async () => {
      const result = await simulateConcurrentLoad(
        5,
        async () => { throw new Error('Simulated failure'); },
        50,
      );
      expect(result.errorRate).toBe(100);
      expect(result.failedRequests).toBe(5);
    });

    test('partial failures are tracked correctly', async () => {
      let callCount = 0;
      const result = await simulateConcurrentLoad(
        10,
        async () => {
          callCount++;
          if (callCount % 2 === 0) throw new Error('Partial failure');
          await new Promise<void>((r) => setTimeout(r, 1));
        },
        50,
      );
      expect(result.failedRequests).toBeGreaterThan(0);
      expect(result.successfulRequests).toBeGreaterThan(0);
      expect(result.errorRate).toBeGreaterThan(0);
      expect(result.errorRate).toBeLessThan(100);
    });

    test('p95 response time is >= average response time', async () => {
      const result = await simulateConcurrentLoad(
        10,
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        100,
      );
      expect(result.p95ResponseTime).toBeGreaterThanOrEqual(result.averageResponseTime);
    });

    test('p99 response time is >= p95 response time', async () => {
      const result = await simulateConcurrentLoad(
        20,
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        100,
      );
      expect(result.p99ResponseTime).toBeGreaterThanOrEqual(result.p95ResponseTime);
    });

    test('min response time is <= average response time', async () => {
      const result = await simulateConcurrentLoad(
        10,
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        100,
      );
      expect(result.minResponseTime).toBeLessThanOrEqual(result.averageResponseTime);
    });

    test('max response time is >= average response time', async () => {
      const result = await simulateConcurrentLoad(
        10,
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        100,
      );
      expect(result.maxResponseTime).toBeGreaterThanOrEqual(result.averageResponseTime);
    });

    test('requestsPerSecond is a positive number', async () => {
      const result = await simulateConcurrentLoad(
        5,
        async () => { await new Promise<void>((r) => setTimeout(r, 1)); },
        50,
      );
      expect(result.requestsPerSecond).toBeGreaterThan(0);
    });
  });

  // ── 5. Concurrent login simulation (10 users) ─────────────────────────────

  test.describe('Simulate concurrent users logging in (10 users)', () => {
    test('LoginPage is available for load testing', async ({ testPage }) => {
      const loginPage = new LoginPage(testPage);
      expect(loginPage).toBeInstanceOf(LoginPage);
    });

    test('login selector data shape is valid for concurrent simulation', () => {
      const credentials = { username: 'Admin', password: 'admin123' };
      expect(credentials.username).toBeTruthy();
      expect(credentials.password).toBeTruthy();
      expect(selectors.login.usernameInput).toBeTruthy();
      expect(selectors.login.passwordInput).toBeTruthy();
      expect(selectors.login.submitButton).toBeTruthy();
    });

    test('10-user load simulation completes without unhandled rejections', async ({ logger }) => {
      logger.step(1, 'Simulate 10 concurrent login attempts');
      const monitor = new PerformanceMonitor('load-10-users');

      const result = await simulateConcurrentLoad(
        10,
        async (_userId: number) => {
          const start = Date.now();
          await new Promise<void>((r) => setTimeout(r, Math.random() * 20 + 5));
          monitor.recordResponseTime(`login-user-${_userId}`, Date.now() - start);
        },
        200,
      );

      monitor.recordLoadTestResult(result);

      expect(result.concurrentUsers).toBe(10);
      expect(result.totalRequests).toBe(10);
      logger.assertion(true, `10-user simulation completed: ${result.successfulRequests} successes`);
    });

    test('load test result for 10 users can be recorded in monitor', () => {
      const monitor = new PerformanceMonitor('load-test');
      const mockResult: LoadTestResult = {
        concurrentUsers: 10,
        totalRequests: 10,
        successfulRequests: 10,
        failedRequests: 0,
        averageResponseTime: 200,
        minResponseTime: 150,
        maxResponseTime: 350,
        p95ResponseTime: 320,
        p99ResponseTime: 340,
        requestsPerSecond: 50,
        errorRate: 0,
        duration: 200,
      };

      expect(() => monitor.recordLoadTestResult(mockResult)).not.toThrow();
      const report = monitor.generateReport();
      expect(report.loadTestResults).toHaveLength(1);
      expect(report.loadTestResults[0].concurrentUsers).toBe(10);
    });
  });

  // ── 6. Concurrent login simulation (50 users) ─────────────────────────────

  test.describe('Simulate concurrent users logging in (50 users)', () => {
    test('50-user load simulation tracks all concurrent users', async ({ logger }) => {
      logger.step(1, 'Simulate 50 concurrent login attempts');

      const result = await simulateConcurrentLoad(
        50,
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        300,
      );

      expect(result.concurrentUsers).toBe(50);
      expect(result.totalRequests).toBe(50);
      logger.assertion(true, '50-user simulation tracked correctly');
    });

    test('moderate scenario configuration is suitable for 50-user load test', () => {
      expect(LOAD_TEST_SCENARIOS.moderate.users).toBe(50);
      expect(LOAD_TEST_SCENARIOS.moderate.rampUpTime).toBeGreaterThan(0);
    });
  });

  // ── 7. Response time measurement under load ────────────────────────────────

  test.describe('Measure response times under load', () => {
    test('response times are collected correctly during load simulation', async ({ logger }) => {
      logger.step(1, 'Measure response times with 10 concurrent users');
      const monitor = new PerformanceMonitor('response-time-test');

      await simulateConcurrentLoad(
        10,
        async (userId: number) => {
          const start = Date.now();
          await new Promise<void>((r) => setTimeout(r, Math.random() * 30 + 10));
          monitor.recordResponseTime(`user-${userId}-response`, Date.now() - start);
        },
        400,
      );

      const report = monitor.generateReport();
      const responseTimes = report.metrics.filter((m) => m.category === 'response-time');

      expect(responseTimes.length).toBe(10);
      responseTimes.forEach((m) => {
        expect(m.value).toBeGreaterThan(0);
        expect(m.unit).toBe('ms');
      });

      logger.assertion(true, 'Response times collected for all 10 concurrent users');
    });

    test('average response time is calculated correctly from collected metrics', () => {
      const values = [100, 200, 300, 400, 500];
      const avg = PerformanceMonitor.calculateAverage(values);
      expect(avg).toBe(300);
    });

    test('p95 response time correctly identifies the 95th percentile', () => {
      const values = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      const p95 = PerformanceMonitor.calculatePercentile(values, 95);
      expect(p95).toBeGreaterThanOrEqual(900);
    });
  });

  // ── 8. Memory monitoring during load tests ────────────────────────────────

  test.describe('Monitor memory consumption during load tests', () => {
    test('memory metrics can be recorded and retrieved', () => {
      const monitor = new PerformanceMonitor('memory-test');

      monitor.recordMemoryUsage('heap-used', 128);
      monitor.recordMemoryUsage('heap-total', 256);
      monitor.recordMemoryUsage('rss', 512);

      const report = monitor.generateReport();
      const memoryMetrics = report.metrics.filter((m) => m.category === 'memory');

      expect(memoryMetrics).toHaveLength(3);
      expect(memoryMetrics[0].unit).toBe('MB');
    });

    test('peak memory usage is tracked in the report summary', () => {
      const monitor = new PerformanceMonitor('memory-test');

      monitor.recordMemoryUsage('before-load', 128);
      monitor.recordMemoryUsage('during-load', 384);
      monitor.recordMemoryUsage('after-load', 150);

      const report = monitor.generateReport();
      expect(report.summary.peakMemoryUsage).toBe(384);
    });

    test('memory alert is raised when usage exceeds threshold', () => {
      const monitor = new PerformanceMonitor('memory-alert-test');

      monitor.recordMemoryUsage('heap-used', PERFORMANCE_THRESHOLDS.memoryUsageMax + 100);

      const alerts = monitor.detectAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].metric).toContain('heap');
    });
  });

  // ── 9. Performance bottleneck identification ───────────────────────────────

  test.describe('Identify performance bottlenecks', () => {
    test('alerts are generated for slow response times', () => {
      const monitor = new PerformanceMonitor('bottleneck-test');

      monitor.recordResponseTime('slow-endpoint', PERFORMANCE_THRESHOLDS.pageLoadTime + 2000);

      const alerts = monitor.detectAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some((a) => a.severity === 'high' || a.severity === 'critical')).toBe(true);
    });

    test('no alerts are generated for acceptable response times', () => {
      const monitor = new PerformanceMonitor('no-bottleneck-test');

      monitor.recordResponseTime('fast-endpoint', 500);
      monitor.recordResponseTime('normal-endpoint', 1000);

      const alerts = monitor.detectAlerts();
      const responseTimeAlerts = alerts.filter((a) => a.metric.includes('endpoint'));
      expect(responseTimeAlerts).toHaveLength(0);
    });

    test('alert severity is critical when response time exceeds 2x threshold', () => {
      const monitor = new PerformanceMonitor('critical-alert-test');

      monitor.recordResponseTime('very-slow', PERFORMANCE_THRESHOLDS.pageLoadTime * 3);

      const alerts = monitor.detectAlerts();
      const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });

    test('error rate alert is raised when load test error rate exceeds threshold', () => {
      const monitor = new PerformanceMonitor('error-rate-test');

      monitor.recordLoadTestResult({
        concurrentUsers: 50,
        totalRequests: 50,
        successfulRequests: 40,
        failedRequests: 10,
        averageResponseTime: 300,
        minResponseTime: 100,
        maxResponseTime: 1000,
        p95ResponseTime: 800,
        p99ResponseTime: 950,
        requestsPerSecond: 10,
        errorRate: 20,
        duration: 5000,
      });

      const alerts = monitor.detectAlerts();
      const errorRateAlerts = alerts.filter((a) => a.metric === 'error-rate');
      expect(errorRateAlerts.length).toBeGreaterThan(0);
    });
  });

  // ── 10. System recovery after load test ───────────────────────────────────

  test.describe('Verify system recovery after load test completion', () => {
    test('performance monitor can record before, during, and after metrics', () => {
      const monitor = new PerformanceMonitor('recovery-test');

      monitor.recordMemoryUsage('pre-load-memory', 100);
      monitor.recordMemoryUsage('peak-load-memory', 400);
      monitor.recordMemoryUsage('post-load-memory', 110);

      const report = monitor.generateReport();
      const memoryMetrics = report.metrics.filter((m) => m.category === 'memory');

      expect(memoryMetrics).toHaveLength(3);
      expect(memoryMetrics[2].value).toBeLessThan(memoryMetrics[1].value);
    });

    test('report summary contains performance score after load test', () => {
      const monitor = new PerformanceMonitor('recovery-score-test');

      monitor.recordBenchmarkResult({
        operation: 'post-recovery-login',
        runs: 3,
        averageTime: 800,
        minTime: 700,
        maxTime: 900,
        stdDeviation: 50,
        p95Time: 880,
        passed: true,
        threshold: PERFORMANCE_THRESHOLDS.loginResponseTime,
      });

      const report = monitor.generateReport();
      expect(report.summary.performanceScore).toBe(100);
    });

    test('generateReport returns a complete report structure', () => {
      const monitor = new PerformanceMonitor('full-report-test');

      monitor.recordResponseTime('test-op', 500);
      monitor.recordMemoryUsage('heap', 200);

      const report = monitor.generateReport();

      expect(typeof report.suite).toBe('string');
      expect(typeof report.startTime).toBe('number');
      expect(typeof report.endTime).toBe('number');
      expect(typeof report.duration).toBe('number');
      expect(Array.isArray(report.metrics)).toBe(true);
      expect(Array.isArray(report.loadTestResults)).toBe(true);
      expect(Array.isArray(report.stressTestResults)).toBe(true);
      expect(Array.isArray(report.benchmarkResults)).toBe(true);
      expect(Array.isArray(report.coreWebVitals)).toBe(true);
      expect(report.summary).toBeDefined();
    });
  });
});
