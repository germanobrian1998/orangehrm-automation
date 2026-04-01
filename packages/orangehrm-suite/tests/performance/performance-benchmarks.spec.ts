/**
 * OrangeHRM Suite - Performance Benchmarking
 * Benchmarks login response time, employee search, report generation,
 * data export performance, and tracks metrics over time.
 *
 * Testing pyramid layer: Performance
 * All tests are offline and validate the benchmark runner and comparison utilities.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { PimPage } from '../../src/pages/pim.page';
import { ReportingPage, REPORT_TYPES } from '../../src/pages/reporting.page';
import {
  PerformanceMonitor,
  PERFORMANCE_THRESHOLDS,
  BenchmarkResult,
} from './performance-monitoring';

test.describe('@performance Performance Benchmarking Suite', () => {
  // ── 1. Benchmark runner ────────────────────────────────────────────────────

  test.describe('Benchmark runner (PerformanceMonitor.runBenchmark)', () => {
    test('runBenchmark is a static method on PerformanceMonitor', () => {
      expect(typeof PerformanceMonitor.runBenchmark).toBe('function');
    });

    test('runBenchmark returns a BenchmarkResult with correct shape', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'noop-operation',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        3,
        PERFORMANCE_THRESHOLDS.apiResponseTime,
      );

      expect(typeof result.operation).toBe('string');
      expect(typeof result.runs).toBe('number');
      expect(typeof result.averageTime).toBe('number');
      expect(typeof result.minTime).toBe('number');
      expect(typeof result.maxTime).toBe('number');
      expect(typeof result.stdDeviation).toBe('number');
      expect(typeof result.p95Time).toBe('number');
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.threshold).toBe('number');
    });

    test('runBenchmark runs the correct number of iterations', async () => {
      let runCount = 0;
      await PerformanceMonitor.runBenchmark(
        'count-runs',
        async () => {
          runCount++;
          await new Promise<void>((r) => setTimeout(r, 1));
        },
        5,
        1000,
      );
      expect(runCount).toBe(5);
    });

    test('runBenchmark marks result as passed when below threshold', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'fast-op',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        3,
        10000,
      );
      expect(result.passed).toBe(true);
    });

    test('runBenchmark marks result as failed when above threshold', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'slow-op',
        async () => { await new Promise<void>((r) => setTimeout(r, 50)); },
        3,
        1,
      );
      expect(result.passed).toBe(false);
    });

    test('min time is <= average time in benchmark results', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'min-avg-check',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        5,
        5000,
      );
      expect(result.minTime).toBeLessThanOrEqual(result.averageTime);
    });

    test('max time is >= average time in benchmark results', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'max-avg-check',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        5,
        5000,
      );
      expect(result.maxTime).toBeGreaterThanOrEqual(result.averageTime);
    });

    test('p95 time is >= average time in benchmark results', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'p95-avg-check',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        10,
        5000,
      );
      expect(result.p95Time).toBeGreaterThanOrEqual(result.averageTime);
    });
  });

  // ── 2. Login response time benchmark ──────────────────────────────────────

  test.describe('Benchmark login response time', () => {
    test('LoginPage is importable for login benchmark', () => {
      expect(LoginPage).toBeDefined();
    });

    test('login response time threshold is defined', () => {
      expect(PERFORMANCE_THRESHOLDS.loginResponseTime).toBe(3000);
    });

    test('login benchmark result can be stored in monitor', async () => {
      const monitor = new PerformanceMonitor('login-benchmark');

      const result = await PerformanceMonitor.runBenchmark(
        'login-simulation',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        3,
        PERFORMANCE_THRESHOLDS.loginResponseTime,
      );

      monitor.recordBenchmarkResult(result);

      const report = monitor.generateReport();
      expect(report.benchmarkResults).toHaveLength(1);
      expect(report.benchmarkResults[0].operation).toBe('login-simulation');
    });

    test('login benchmark tracks operation name correctly', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'login-response-time',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        3,
        PERFORMANCE_THRESHOLDS.loginResponseTime,
      );
      expect(result.operation).toBe('login-response-time');
    });

    test('multiple login benchmark runs use specified iteration count', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'login-iterations',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        7,
        PERFORMANCE_THRESHOLDS.loginResponseTime,
      );
      expect(result.runs).toBe(7);
    });
  });

  // ── 3. Employee search benchmark ──────────────────────────────────────────

  test.describe('Benchmark employee search performance', () => {
    test('PimPage is importable for employee search benchmark', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(pimPage).toBeInstanceOf(PimPage);
    });

    test('search response time threshold is defined', () => {
      expect(PERFORMANCE_THRESHOLDS.searchResponseTime).toBe(4000);
    });

    test('employee search benchmark has correct threshold applied', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'employee-search',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        3,
        PERFORMANCE_THRESHOLDS.searchResponseTime,
      );

      expect(result.threshold).toBe(PERFORMANCE_THRESHOLDS.searchResponseTime);
    });

    test('search benchmark deviation is calculated correctly for uniform times', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'uniform-search',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        5,
        5000,
      );

      expect(result.stdDeviation).toBeGreaterThanOrEqual(0);
    });
  });

  // ── 4. Report generation benchmark ────────────────────────────────────────

  test.describe('Benchmark report generation time', () => {
    test('ReportingPage is importable for report benchmark', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(reportingPage).toBeInstanceOf(ReportingPage);
    });

    test('report generation threshold is defined', () => {
      expect(PERFORMANCE_THRESHOLDS.reportGenerationTime).toBe(10000);
    });

    test('all REPORT_TYPES can be referenced in benchmark scenarios', () => {
      expect(Array.isArray(REPORT_TYPES)).toBe(true);
      REPORT_TYPES.forEach((rt) => {
        expect(typeof rt).toBe('string');
        expect(rt.length).toBeGreaterThan(0);
      });
    });

    test('report generation benchmark records correct operation name', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'employee-report-generation',
        async () => { await new Promise<void>((r) => setTimeout(r, 15)); },
        3,
        PERFORMANCE_THRESHOLDS.reportGenerationTime,
      );

      expect(result.operation).toBe('employee-report-generation');
      expect(result.threshold).toBe(PERFORMANCE_THRESHOLDS.reportGenerationTime);
    });
  });

  // ── 5. Data export benchmark ───────────────────────────────────────────────

  test.describe('Benchmark data export performance', () => {
    test('data export threshold is defined', () => {
      expect(PERFORMANCE_THRESHOLDS.dataExportTime).toBe(15000);
    });

    test('PDF export benchmark can be recorded', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'export-pdf',
        async () => { await new Promise<void>((r) => setTimeout(r, 20)); },
        3,
        PERFORMANCE_THRESHOLDS.dataExportTime,
      );

      expect(result.passed).toBe(true);
      expect(result.averageTime).toBeGreaterThan(0);
    });

    test('Excel export benchmark can be recorded', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'export-excel',
        async () => { await new Promise<void>((r) => setTimeout(r, 20)); },
        3,
        PERFORMANCE_THRESHOLDS.dataExportTime,
      );

      expect(result.operation).toBe('export-excel');
    });

    test('CSV export benchmark can be recorded', async () => {
      const result = await PerformanceMonitor.runBenchmark(
        'export-csv',
        async () => { await new Promise<void>((r) => setTimeout(r, 10)); },
        3,
        PERFORMANCE_THRESHOLDS.dataExportTime,
      );

      expect(result.operation).toBe('export-csv');
    });

    test('CSV is generally faster than PDF export', async () => {
      const csvResult = await PerformanceMonitor.runBenchmark(
        'csv-speed',
        async () => { await new Promise<void>((r) => setTimeout(r, 5)); },
        3,
        PERFORMANCE_THRESHOLDS.dataExportTime,
      );

      const pdfResult = await PerformanceMonitor.runBenchmark(
        'pdf-speed',
        async () => { await new Promise<void>((r) => setTimeout(r, 20)); },
        3,
        PERFORMANCE_THRESHOLDS.dataExportTime,
      );

      expect(csvResult.averageTime).toBeLessThan(pdfResult.averageTime);
    });
  });

  // ── 6. Performance score calculation ──────────────────────────────────────

  test.describe('Performance score calculation', () => {
    test('performance score is 100% when all benchmarks pass', () => {
      const monitor = new PerformanceMonitor('all-pass');

      const passingResult: BenchmarkResult = {
        operation: 'op',
        runs: 3,
        averageTime: 100,
        minTime: 80,
        maxTime: 120,
        stdDeviation: 10,
        p95Time: 115,
        passed: true,
        threshold: 1000,
      };

      monitor.recordBenchmarkResult(passingResult);
      monitor.recordBenchmarkResult({ ...passingResult, operation: 'op2' });

      const report = monitor.generateReport();
      expect(report.summary.performanceScore).toBe(100);
    });

    test('performance score is 0% when all benchmarks fail', () => {
      const monitor = new PerformanceMonitor('all-fail');

      const failingResult: BenchmarkResult = {
        operation: 'slow-op',
        runs: 3,
        averageTime: 10000,
        minTime: 9000,
        maxTime: 11000,
        stdDeviation: 500,
        p95Time: 10800,
        passed: false,
        threshold: 100,
      };

      monitor.recordBenchmarkResult(failingResult);

      const report = monitor.generateReport();
      expect(report.summary.performanceScore).toBe(0);
    });

    test('performance score is 50% when half of benchmarks pass', () => {
      const monitor = new PerformanceMonitor('half-pass');

      monitor.recordBenchmarkResult({
        operation: 'fast-op',
        runs: 3,
        averageTime: 100,
        minTime: 80,
        maxTime: 120,
        stdDeviation: 10,
        p95Time: 115,
        passed: true,
        threshold: 1000,
      });

      monitor.recordBenchmarkResult({
        operation: 'slow-op',
        runs: 3,
        averageTime: 10000,
        minTime: 9000,
        maxTime: 11000,
        stdDeviation: 500,
        p95Time: 10800,
        passed: false,
        threshold: 100,
      });

      const report = monitor.generateReport();
      expect(report.summary.performanceScore).toBe(50);
    });
  });

  // ── 7. Performance trend tracking ─────────────────────────────────────────

  test.describe('Track performance metrics over time', () => {
    test('compareToBaseline is a static method on PerformanceMonitor', () => {
      expect(typeof PerformanceMonitor.compareToBaseline).toBe('function');
    });

    test('compareToBaseline detects regression when current is significantly slower', () => {
      const baseline: BenchmarkResult = {
        operation: 'login',
        runs: 5,
        averageTime: 500,
        minTime: 400,
        maxTime: 600,
        stdDeviation: 50,
        p95Time: 580,
        passed: true,
        threshold: 3000,
      };

      const current: BenchmarkResult = {
        ...baseline,
        averageTime: 650,
      };

      const comparison = PerformanceMonitor.compareToBaseline(current, baseline);
      expect(comparison.regression).toBe(true);
      expect(comparison.percentChange).toBeGreaterThan(10);
    });

    test('compareToBaseline reports no regression within 10% tolerance', () => {
      const baseline: BenchmarkResult = {
        operation: 'search',
        runs: 5,
        averageTime: 1000,
        minTime: 900,
        maxTime: 1100,
        stdDeviation: 50,
        p95Time: 1080,
        passed: true,
        threshold: 4000,
      };

      const current: BenchmarkResult = {
        ...baseline,
        averageTime: 1050,
      };

      const comparison = PerformanceMonitor.compareToBaseline(current, baseline);
      expect(comparison.regression).toBe(false);
      expect(comparison.percentChange).toBeLessThanOrEqual(10);
    });

    test('compareToBaseline calculates percent change correctly', () => {
      const baseline: BenchmarkResult = {
        operation: 'export',
        runs: 5,
        averageTime: 1000,
        minTime: 900,
        maxTime: 1100,
        stdDeviation: 50,
        p95Time: 1080,
        passed: true,
        threshold: 15000,
      };

      const current: BenchmarkResult = { ...baseline, averageTime: 1200 };

      const comparison = PerformanceMonitor.compareToBaseline(current, baseline);
      expect(comparison.percentChange).toBeCloseTo(20, 0);
    });

    test('performance improvement shows negative percent change', () => {
      const baseline: BenchmarkResult = {
        operation: 'generate-report',
        runs: 5,
        averageTime: 2000,
        minTime: 1800,
        maxTime: 2200,
        stdDeviation: 100,
        p95Time: 2150,
        passed: true,
        threshold: 10000,
      };

      const current: BenchmarkResult = { ...baseline, averageTime: 1500 };

      const comparison = PerformanceMonitor.compareToBaseline(current, baseline);
      expect(comparison.percentChange).toBeLessThan(0);
      expect(comparison.regression).toBe(false);
    });
  });
});
