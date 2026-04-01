/**
 * OrangeHRM Suite - Database Performance Tests
 * Tests query execution times, bulk data operations, connection pool performance,
 * transaction performance, and index efficiency.
 *
 * Testing pyramid layer: Performance
 * All tests are offline and validate the performance monitoring data structures
 * and statistical utilities without requiring a live database connection.
 */

import { test, expect } from '@qa-framework/core';
import {
  PerformanceMonitor,
  PERFORMANCE_THRESHOLDS,
  BenchmarkResult,
} from './performance-monitoring';

test.describe('@performance Database Performance Tests', () => {
  // ── 1. Database metric recording ──────────────────────────────────────────

  test.describe('Database metric recording', () => {
    test('database category metrics can be recorded in PerformanceMonitor', () => {
      const monitor = new PerformanceMonitor('db-metrics');

      monitor.recordMetric({
        name: 'select-employees',
        value: 45,
        unit: 'ms',
        category: 'database',
      });

      const report = monitor.generateReport();
      const dbMetrics = report.metrics.filter((m) => m.category === 'database');
      expect(dbMetrics).toHaveLength(1);
      expect(dbMetrics[0].name).toBe('select-employees');
    });

    test('multiple database query metrics can be recorded', () => {
      const monitor = new PerformanceMonitor('db-multi');
      const queries = [
        'select-employees',
        'insert-employee',
        'update-employee',
        'delete-employee',
        'select-with-joins',
      ];

      queries.forEach((q, i) => {
        monitor.recordMetric({ name: q, value: 20 + i * 15, unit: 'ms', category: 'database' });
      });

      const report = monitor.generateReport();
      const dbMetrics = report.metrics.filter((m) => m.category === 'database');
      expect(dbMetrics).toHaveLength(queries.length);
    });

    test('database metric timestamps are recorded correctly', () => {
      const monitor = new PerformanceMonitor('db-timestamp');
      const before = Date.now();

      monitor.recordMetric({ name: 'query-ts', value: 30, unit: 'ms', category: 'database' });

      const after = Date.now();
      const report = monitor.generateReport();
      const metric = report.metrics[0];

      expect(metric.timestamp).toBeGreaterThanOrEqual(before);
      expect(metric.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // ── 2. Query execution time benchmarks ────────────────────────────────────

  test.describe('Monitor query execution times', () => {
    test('simple SELECT query benchmark has correct shape', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'select-employees-query',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        5,
        PERFORMANCE_THRESHOLDS.apiResponseTime,
      );

      expect(result.operation).toBe('select-employees-query');
      expect(result.runs).toBe(5);
      expect(result.averageTime).toBeGreaterThan(0);
    });

    test('complex JOIN query benchmark is distinguishable from simple query', async () => {
      const simpleQuery = await PerformanceMonitor.runBenchmark(
        'simple-select',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        3,
        2000,
      );

      const complexQuery = await PerformanceMonitor.runBenchmark(
        'complex-join',
        async () => { await new Promise<void>((r) => setTimeout(r, 25)); },
        3,
        2000,
      );

      expect(complexQuery.averageTime).toBeGreaterThan(simpleQuery.averageTime);
    });

    test('query execution time threshold matches apiResponseTime', () => {
      expect(PERFORMANCE_THRESHOLDS.apiResponseTime).toBe(2000);
    });

    test('fast query benchmark passes performance check', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'fast-indexed-query',
        async () => { await new Promise<void>((r) => setTimeout(r, 2)); },
        5,
        PERFORMANCE_THRESHOLDS.apiResponseTime,
      );

      expect(result.passed).toBe(true);
    });

    test('slow query benchmark fails performance check', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'slow-full-scan',
        async () => { await new Promise<void>((r) => setTimeout(r, 50)); },
        3,
        1,
      );

      expect(result.passed).toBe(false);
    });
  });

  // ── 3. Bulk data operations ────────────────────────────────────────────────

  test.describe('Test bulk data operations', () => {
    test('bulk insert benchmark data shape is valid', () => {
      const bulkInsertScenarios = [
        { batchSize: 10, expectedMaxTimeMs: 500 },
        { batchSize: 100, expectedMaxTimeMs: 2000 },
        { batchSize: 1000, expectedMaxTimeMs: 10000 },
      ];

      bulkInsertScenarios.forEach((scenario) => {
        expect(scenario.batchSize).toBeGreaterThan(0);
        expect(scenario.expectedMaxTimeMs).toBeGreaterThan(0);
        expect(scenario.expectedMaxTimeMs).toBeGreaterThan(
          bulkInsertScenarios[0].expectedMaxTimeMs / 2,
        );
      });
    });

    test('bulk operation time scales roughly with batch size', async () => {
      const smallBatch = await PerformanceMonitor.runBenchmark(
        'insert-10',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        3,
        5000,
      );

      const largeBatch = await PerformanceMonitor.runBenchmark(
        'insert-100',
        async () => { await new Promise<void>((r) => setTimeout(r, 50)); },
        3,
        5000,
      );

      expect(largeBatch.averageTime).toBeGreaterThan(smallBatch.averageTime);
    });

    test('bulk delete benchmark has a sensible threshold', () => {
      const bulkDeleteThreshold = PERFORMANCE_THRESHOLDS.reportGenerationTime;
      expect(bulkDeleteThreshold).toBe(10000);
    });

    test('bulk read operation benchmark can be recorded in monitor', async () => {
      const monitor = new PerformanceMonitor('bulk-read');

      const result = await PerformanceMonitor.runBenchmark(
        'bulk-read-1000-employees',
        async () => { await new Promise<void>((r) => setTimeout(r, 30)); },
        3,
        PERFORMANCE_THRESHOLDS.reportGenerationTime,
      );

      monitor.recordBenchmarkResult(result);

      const report = monitor.generateReport();
      expect(report.benchmarkResults[0].operation).toBe('bulk-read-1000-employees');
    });
  });

  // ── 4. Database connection pool performance ────────────────────────────────

  test.describe('Analyze database connection pool performance', () => {
    test('connection pool configuration shape is valid', () => {
      const poolConfig = {
        min: 2,
        max: 10,
        acquireTimeoutMs: 30000,
        idleTimeoutMs: 600000,
      };

      expect(poolConfig.min).toBeLessThanOrEqual(poolConfig.max);
      expect(poolConfig.acquireTimeoutMs).toBeGreaterThan(0);
      expect(poolConfig.idleTimeoutMs).toBeGreaterThan(poolConfig.acquireTimeoutMs);
    });

    test('connection acquisition time can be recorded as a database metric', () => {
      const monitor = new PerformanceMonitor('conn-pool');

      monitor.recordMetric({
        name: 'connection-acquire',
        value: 8,
        unit: 'ms',
        category: 'database',
      });

      const report = monitor.generateReport();
      expect(report.metrics[0].name).toBe('connection-acquire');
    });

    test('connection pool metrics for concurrent requests can be tracked', () => {
      const monitor = new PerformanceMonitor('conn-pool-concurrent');

      for (let i = 0; i < 10; i++) {
        monitor.recordMetric({
          name: `connection-acquire-user-${i}`,
          value: Math.random() * 20 + 5,
          unit: 'ms',
          category: 'database',
        });
      }

      const report = monitor.generateReport();
      const connMetrics = report.metrics.filter((m) => m.name.startsWith('connection-acquire'));
      expect(connMetrics).toHaveLength(10);
    });

    test('connection wait time alert fires when acquisition is slow', () => {
      const monitor = new PerformanceMonitor('conn-slow');

      monitor.recordResponseTime('slow-connection-acquire', PERFORMANCE_THRESHOLDS.pageLoadTime + 1000);

      const alerts = monitor.detectAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // ── 5. Transaction performance ─────────────────────────────────────────────

  test.describe('Test transaction performance', () => {
    test('transaction benchmark data shape is valid', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'begin-commit-transaction',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        3,
        PERFORMANCE_THRESHOLDS.apiResponseTime,
      );

      expect(result.operation).toBe('begin-commit-transaction');
      expect(typeof result.averageTime).toBe('number');
    });

    test('rollback transaction benchmark can be measured', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'begin-rollback-transaction',
        async () => { await new Promise<void>((r) => setTimeout(r, 8)); },
        3,
        PERFORMANCE_THRESHOLDS.apiResponseTime,
      );

      expect(result.operation).toBe('begin-rollback-transaction');
    });

    test('transaction overhead is greater than a simple query', async () => {
      const simpleQuery = await PerformanceMonitor.runBenchmark(
        'simple-query',
        async () => { await new Promise<void>((r) => setTimeout(r, 3)); },
        3,
        2000,
      );

      const transactionalQuery = await PerformanceMonitor.runBenchmark(
        'transactional-query',
        async () => { await new Promise<void>((r) => setTimeout(r, 15)); },
        3,
        2000,
      );

      expect(transactionalQuery.averageTime).toBeGreaterThan(simpleQuery.averageTime);
    });

    test('nested transaction benchmark performance data is recorded', async () => {
      const monitor = new PerformanceMonitor('nested-tx');

      const result = await PerformanceMonitor.runBenchmark(
        'nested-transaction',
        async () => { await new Promise<void>((r) => setTimeout(r, 20)); },
        3,
        PERFORMANCE_THRESHOLDS.apiResponseTime,
      );

      monitor.recordBenchmarkResult(result);

      const report = monitor.generateReport();
      expect(report.benchmarkResults[0].operation).toBe('nested-transaction');
    });
  });

  // ── 6. Index efficiency analysis ───────────────────────────────────────────

  test.describe('Monitor index efficiency', () => {
    test('indexed query benchmark has lower average time than full scan', async () => {
      const indexedQuery = await PerformanceMonitor.runBenchmark(
        'indexed-search',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        5,
        2000,
      );

      const fullScan = await PerformanceMonitor.runBenchmark(
        'full-table-scan',
        async () => { await new Promise<void>((r) => setTimeout(r, 30)); },
        5,
        2000,
      );

      expect(indexedQuery.averageTime).toBeLessThan(fullScan.averageTime);
    });

    test('index efficiency can be expressed as a percentage improvement', async () => {
      const indexedTime = 50;
      const fullScanTime = 500;
      const improvement = ((fullScanTime - indexedTime) / fullScanTime) * 100;

      expect(improvement).toBeGreaterThan(80);
    });

    test('index miss penalty data can be recorded as a metric', () => {
      const monitor = new PerformanceMonitor('index-miss');

      monitor.recordMetric({
        name: 'index-miss-penalty',
        value: 450,
        unit: 'ms',
        category: 'database',
      });

      const report = monitor.generateReport();
      const indexMetric = report.metrics.find((m) => m.name === 'index-miss-penalty');
      expect(indexMetric?.value).toBe(450);
    });

    test('compareToBaseline detects index regression', () => {
      const withIndex: BenchmarkResult = {
        operation: 'search-with-index',
        runs: 5,
        averageTime: 50,
        minTime: 40,
        maxTime: 60,
        stdDeviation: 5,
        p95Time: 58,
        passed: true,
        threshold: 2000,
      };

      const withoutIndex: BenchmarkResult = {
        ...withIndex,
        averageTime: 500,
      };

      const comparison = PerformanceMonitor.compareToBaseline(withoutIndex, withIndex);
      expect(comparison.regression).toBe(true);
      expect(comparison.percentChange).toBeGreaterThan(100);
    });
  });

  // ── 7. Database performance report summary ────────────────────────────────

  test.describe('Database performance report summary', () => {
    test('database benchmark results are included in report summary', () => {
      const monitor = new PerformanceMonitor('db-summary');

      monitor.recordBenchmarkResult({
        operation: 'db-read',
        runs: 5,
        averageTime: 80,
        minTime: 60,
        maxTime: 100,
        stdDeviation: 10,
        p95Time: 95,
        passed: true,
        threshold: 2000,
      });

      monitor.recordBenchmarkResult({
        operation: 'db-write',
        runs: 5,
        averageTime: 120,
        minTime: 100,
        maxTime: 150,
        stdDeviation: 15,
        p95Time: 145,
        passed: true,
        threshold: 2000,
      });

      const report = monitor.generateReport();
      expect(report.summary.totalTests).toBe(2);
      expect(report.summary.passed).toBe(2);
      expect(report.summary.failed).toBe(0);
      expect(report.summary.performanceScore).toBe(100);
    });

    test('failed database benchmarks lower the performance score', () => {
      const monitor = new PerformanceMonitor('db-fail-score');

      monitor.recordBenchmarkResult({
        operation: 'fast-query',
        runs: 3,
        averageTime: 50,
        minTime: 40,
        maxTime: 60,
        stdDeviation: 5,
        p95Time: 58,
        passed: true,
        threshold: 2000,
      });

      monitor.recordBenchmarkResult({
        operation: 'very-slow-query',
        runs: 3,
        averageTime: 50000,
        minTime: 45000,
        maxTime: 55000,
        stdDeviation: 3000,
        p95Time: 54000,
        passed: false,
        threshold: 2000,
      });

      const report = monitor.generateReport();
      expect(report.summary.performanceScore).toBeLessThan(100);
    });
  });
});
