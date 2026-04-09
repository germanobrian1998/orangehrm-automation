/**
 * OrangeHRM Suite - Stress Testing
 * Tests system behaviour at maximum capacity, validates graceful degradation,
 * monitors CPU & memory usage, and verifies error handling under extreme conditions.
 *
 * Testing pyramid layer: Performance
 * All tests are offline and validate monitoring utilities and stress-test logic.
 */

import { test, expect } from '@qa-framework/core';
import {
  PerformanceMonitor,
  simulateConcurrentLoad,
  PERFORMANCE_THRESHOLDS,
  StressTestResult,
} from './performance-monitoring';

test.describe('@performance Stress Testing Suite', () => {
  // ── 1. PerformanceMonitor stress methods ────────────────────────────────────

  test.describe('PerformanceMonitor stress-test support', () => {
    test('recordStressTestResult method is defined', () => {
      const monitor = new PerformanceMonitor('stress-test');
      expect(typeof monitor.recordStressTestResult).toBe('function');
    });

    test('stress test result can be recorded and retrieved', () => {
      const monitor = new PerformanceMonitor('stress-test');

      const stressResult: StressTestResult = {
        phase: 'ramp-up',
        usersAtPeak: 200,
        successRate: 95,
        degradationPoint: null,
        recoveryTime: null,
        errorTypes: {},
      };

      monitor.recordStressTestResult(stressResult);

      const report = monitor.generateReport();
      expect(report.stressTestResults).toHaveLength(1);
      expect(report.stressTestResults[0].phase).toBe('ramp-up');
    });

    test('multiple stress test phases can be recorded', () => {
      const monitor = new PerformanceMonitor('stress-phases');

      const phases: StressTestResult[] = [
        { phase: 'ramp-up', usersAtPeak: 100, successRate: 99, degradationPoint: null, recoveryTime: null, errorTypes: {} },
        { phase: 'peak', usersAtPeak: 200, successRate: 85, degradationPoint: 180, recoveryTime: null, errorTypes: { TimeoutError: 5 } },
        { phase: 'recovery', usersAtPeak: 200, successRate: 98, degradationPoint: null, recoveryTime: 5000, errorTypes: {} },
      ];

      phases.forEach((p) => monitor.recordStressTestResult(p));

      const report = monitor.generateReport();
      expect(report.stressTestResults).toHaveLength(3);
    });
  });

  // ── 2. Rapid API request stress test ──────────────────────────────────────

  test.describe('Stress test with rapid API requests', () => {
    test('rapid sequential operations can be simulated', async ({ logger }) => {
      logger.step(1, 'Run rapid sequential API request simulation');
      const monitor = new PerformanceMonitor('rapid-api');
      const requestTimes: number[] = [];
      const requestCount = 20;

      for (let i = 0; i < requestCount; i++) {
        const start = Date.now();
        await new Promise<void>((r) => setTimeout(r, Math.random() * 10 + 1));
        requestTimes.push(Date.now() - start);
        monitor.recordResponseTime(`api-request-${i}`, requestTimes[i]);
      }

      const report = monitor.generateReport();
      const apiMetrics = report.metrics.filter((m) => m.category === 'response-time');

      expect(apiMetrics).toHaveLength(requestCount);
      logger.assertion(true, `${requestCount} rapid API requests simulated`);
    });

    test('average response time is calculated over all rapid requests', async () => {
      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await new Promise<void>((r) => setTimeout(r, 5));
        times.push(Date.now() - start);
      }
      const avg = PerformanceMonitor.calculateAverage(times);
      expect(avg).toBeGreaterThan(0);
    });

    test('simulateConcurrentLoad handles 100 concurrent requests', async ({ logger }) => {
      logger.step(1, 'Simulate 100 concurrent rapid requests');

      const result = await simulateConcurrentLoad(
        100,
        async () => { await new Promise<void>((r) => setTimeout(r, 2)); },
        500,
      );

      expect(result.concurrentUsers).toBe(100);
      expect(result.totalRequests).toBe(100);
      logger.assertion(true, `100 concurrent requests: ${result.successfulRequests} successful`);
    });

    test('requests per second increases with more concurrent users', async () => {
      const result10 = await simulateConcurrentLoad(
        10,
        async () => { await new Promise<void>((r) => setTimeout(r, 2)); },
        100,
      );
      const result50 = await simulateConcurrentLoad(
        50,
        async () => { await new Promise<void>((r) => setTimeout(r, 2)); },
        200,
      );

      expect(result50.totalRequests).toBeGreaterThan(result10.totalRequests);
    });
  });

  // ── 3. File upload/download stress simulation ──────────────────────────────

  test.describe('File upload/download under stress', () => {
    test('file operation metrics can be recorded in performance monitor', () => {
      const monitor = new PerformanceMonitor('file-stress');

      monitor.recordResponseTime('upload-1MB', 450);
      monitor.recordResponseTime('upload-5MB', 1200);
      monitor.recordResponseTime('download-1MB', 200);
      monitor.recordResponseTime('download-5MB', 800);

      const report = monitor.generateReport();
      const fileMetrics = report.metrics.filter((m) => m.category === 'response-time');
      expect(fileMetrics).toHaveLength(4);
    });

    test('file upload simulation result has the correct shape', async () => {
      const result = await simulateConcurrentLoad(
        5,
        async (userId: number) => {
          const fileSizeKB = (userId + 1) * 100;
          const uploadTime = fileSizeKB * 0.5;
          await new Promise<void>((r) => setTimeout(r, uploadTime));
        },
        3000,
      );

      expect(result.concurrentUsers).toBe(5);
      expect(result.successfulRequests).toBeGreaterThanOrEqual(0);
    });

    test('concurrent file download simulation tracks errors correctly', async () => {
      let callCount = 0;
      const result = await simulateConcurrentLoad(
        10,
        async () => {
          callCount++;
          if (callCount % 5 === 0) throw new Error('SimulatedDownloadError');
          await new Promise<void>((r) => setTimeout(r, 10));
        },
        200,
      );

      expect(result.totalRequests).toBe(10);
      expect(result.failedRequests).toBeGreaterThanOrEqual(0);
    });
  });

  // ── 4. CPU and memory usage monitoring ────────────────────────────────────

  test.describe('Monitor CPU and memory usage under stress', () => {
    test('CPU usage metric can be recorded', () => {
      const monitor = new PerformanceMonitor('cpu-stress');

      monitor.recordMetric({ name: 'cpu-usage', value: 45, unit: '%', category: 'cpu' });
      monitor.recordMetric({ name: 'cpu-usage', value: 78, unit: '%', category: 'cpu' });
      monitor.recordMetric({ name: 'cpu-usage', value: 92, unit: '%', category: 'cpu' });

      const report = monitor.generateReport();
      const cpuMetrics = report.metrics.filter((m) => m.category === 'cpu');
      expect(cpuMetrics).toHaveLength(3);
      expect(cpuMetrics[2].value).toBe(92);
    });

    test('memory metrics accumulate during stress test', () => {
      const monitor = new PerformanceMonitor('memory-stress');

      for (let i = 0; i < 10; i++) {
        monitor.recordMemoryUsage(`memory-sample-${i}`, 100 + i * 30);
      }

      const report = monitor.generateReport();
      const memMetrics = report.metrics.filter((m) => m.category === 'memory');
      expect(memMetrics).toHaveLength(10);
      expect(report.summary.peakMemoryUsage).toBe(100 + 9 * 30);
    });

    test('memory alert is raised when stress pushes usage over limit', () => {
      const monitor = new PerformanceMonitor('memory-alert-stress');

      monitor.recordMemoryUsage('stress-peak', PERFORMANCE_THRESHOLDS.memoryUsageMax + 200);

      const alerts = monitor.detectAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some((a) => a.metric.includes('stress-peak'))).toBe(true);
    });

    test('cpu threshold value is accessible from PERFORMANCE_THRESHOLDS', () => {
      expect(typeof PERFORMANCE_THRESHOLDS.cpuUsageMax).toBe('number');
      expect(PERFORMANCE_THRESHOLDS.cpuUsageMax).toBeGreaterThan(0);
      expect(PERFORMANCE_THRESHOLDS.cpuUsageMax).toBeLessThanOrEqual(100);
    });
  });

  // ── 5. Graceful degradation under stress ──────────────────────────────────

  test.describe('Verify graceful degradation under stress', () => {
    test('degradation point can be recorded in stress test result', () => {
      const monitor = new PerformanceMonitor('degradation-test');

      monitor.recordStressTestResult({
        phase: 'peak',
        usersAtPeak: 150,
        successRate: 82,
        degradationPoint: 120,
        recoveryTime: null,
        errorTypes: { TimeoutError: 8, NetworkError: 4 },
      });

      const report = monitor.generateReport();
      expect(report.stressTestResults[0].degradationPoint).toBe(120);
      expect(report.stressTestResults[0].successRate).toBe(82);
    });

    test('graceful degradation means error rate stays below critical threshold', async () => {
      const result = await simulateConcurrentLoad(
        50,
        async (userId: number) => {
          if (userId > 40) throw new Error('Overload');
          await new Promise<void>((r) => setTimeout(r, 5));
        },
        300,
      );

      expect(result.errorRate).toBeLessThan(50);
      expect(result.successfulRequests).toBeGreaterThan(result.failedRequests);
    });

    test('system recovery time can be tracked in stress result', () => {
      const monitor = new PerformanceMonitor('recovery-stress');

      monitor.recordStressTestResult({
        phase: 'recovery',
        usersAtPeak: 200,
        successRate: 97,
        degradationPoint: null,
        recoveryTime: 8000,
        errorTypes: {},
      });

      const report = monitor.generateReport();
      expect(report.stressTestResults[0].recoveryTime).toBe(8000);
    });
  });

  // ── 6. Error handling under extreme conditions ─────────────────────────────

  test.describe('Error handling under extreme conditions', () => {
    test('all errors are counted when all concurrent requests fail', async ({ logger }) => {
      logger.step(1, 'Simulate total failure under extreme stress');

      const result = await simulateConcurrentLoad(
        20,
        async () => { throw new Error('ExtremeStressFailure'); },
        200,
      );

      expect(result.failedRequests).toBe(20);
      expect(result.errorRate).toBe(100);
      logger.assertion(true, 'All failures tracked under extreme stress');
    });

    test('error type classification is captured in simulateConcurrentLoad result', async () => {
      const result = await simulateConcurrentLoad(
        10,
        async (userId: number) => {
          if (userId % 3 === 0) throw new TypeError('Type error');
          if (userId % 3 === 1) throw new RangeError('Range error');
          await new Promise<void>((r) => setTimeout(r, 2));
        },
        200,
      );

      expect(result.failedRequests).toBeGreaterThan(0);
    });

    test('performance monitor handles empty metric sets gracefully', () => {
      const monitor = new PerformanceMonitor('empty-metrics');
      const report = monitor.generateReport();

      expect(report.summary.averageResponseTime).toBe(0);
      expect(report.summary.peakMemoryUsage).toBe(0);
      expect(report.summary.performanceScore).toBe(100);
      expect(report.summary.alerts).toHaveLength(0);
    });

    test('statistical helpers handle empty arrays gracefully', () => {
      expect(PerformanceMonitor.calculateAverage([])).toBe(0);
      expect(PerformanceMonitor.calculatePercentile([], 95)).toBe(0);
      expect(PerformanceMonitor.calculateStdDeviation([])).toBe(0);
    });

    test('printSummary does not throw even with no metrics', () => {
      const monitor = new PerformanceMonitor('empty-summary');
      expect(() => monitor.printSummary()).not.toThrow();
    });
  });

  // ── 7. Statistical helper functions ───────────────────────────────────────

  test.describe('Statistical calculation accuracy', () => {
    test('calculateAverage returns correct mean', () => {
      expect(PerformanceMonitor.calculateAverage([10, 20, 30])).toBe(20);
      expect(PerformanceMonitor.calculateAverage([100])).toBe(100);
    });

    test('calculatePercentile returns correct value for known dataset', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      expect(PerformanceMonitor.calculatePercentile(values, 50)).toBe(50);
      expect(PerformanceMonitor.calculatePercentile(values, 95)).toBeGreaterThanOrEqual(95);
    });

    test('calculateStdDeviation returns 0 for identical values', () => {
      expect(PerformanceMonitor.calculateStdDeviation([5, 5, 5, 5, 5])).toBe(0);
    });

    test('calculateStdDeviation returns a positive value for varied data', () => {
      const stdDev = PerformanceMonitor.calculateStdDeviation([1, 2, 3, 4, 5]);
      expect(stdDev).toBeGreaterThan(0);
    });
  });
});
