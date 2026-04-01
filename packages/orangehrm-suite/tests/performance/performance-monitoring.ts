/**
 * OrangeHRM Suite - Performance Monitoring & Reporting Utility
 * Collects performance metrics, generates reports, tracks trends, and alerts
 * on performance degradation. Used by all performance test suites.
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 's' | 'MB' | 'KB' | '%' | 'count';
  timestamp: number;
  category: MetricCategory;
}

export interface CoreWebVitals {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export interface LoadTestResult {
  concurrentUsers: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  duration: number;
}

export interface StressTestResult {
  phase: string;
  usersAtPeak: number;
  successRate: number;
  degradationPoint: number | null;
  recoveryTime: number | null;
  errorTypes: Record<string, number>;
}

export interface BenchmarkResult {
  operation: string;
  runs: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  stdDeviation: number;
  p95Time: number;
  passed: boolean;
  threshold: number;
}

export interface PerformanceReport {
  suite: string;
  startTime: number;
  endTime: number;
  duration: number;
  metrics: PerformanceMetric[];
  loadTestResults: LoadTestResult[];
  stressTestResults: StressTestResult[];
  benchmarkResults: BenchmarkResult[];
  coreWebVitals: CoreWebVitals[];
  summary: PerformanceSummary;
}

export interface PerformanceSummary {
  totalTests: number;
  passed: number;
  failed: number;
  averageResponseTime: number;
  peakMemoryUsage: number;
  performanceScore: number;
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  actual: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export type MetricCategory =
  | 'response-time'
  | 'memory'
  | 'cpu'
  | 'network'
  | 'database'
  | 'page-load'
  | 'user-experience';

export const PERFORMANCE_THRESHOLDS = {
  loginResponseTime: 3000,
  pageLoadTime: 5000,
  apiResponseTime: 2000,
  searchResponseTime: 4000,
  reportGenerationTime: 10000,
  dataExportTime: 15000,
  memoryUsageMax: 512,
  cpuUsageMax: 80,
  errorRateMax: 5,
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 800,
} as const;

export const LOAD_TEST_SCENARIOS = {
  light: { users: 10, rampUpTime: 10, duration: 30 },
  moderate: { users: 50, rampUpTime: 30, duration: 60 },
  heavy: { users: 100, rampUpTime: 60, duration: 120 },
  peak: { users: 200, rampUpTime: 120, duration: 180 },
} as const;

export type LoadScenario = keyof typeof LOAD_TEST_SCENARIOS;

/**
 * PerformanceMonitor collects and analyzes performance metrics
 * across load, stress, and benchmark test suites.
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private loadTestResults: LoadTestResult[] = [];
  private stressTestResults: StressTestResult[] = [];
  private benchmarkResults: BenchmarkResult[] = [];
  private coreWebVitals: CoreWebVitals[] = [];
  private startTime: number;
  private suite: string;

  constructor(suite: string) {
    this.suite = suite;
    this.startTime = Date.now();
  }

  // ── Metric collection ──────────────────────────────────────────────────────

  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.metrics.push({ ...metric, timestamp: Date.now() });
  }

  recordResponseTime(name: string, valueMs: number): void {
    this.recordMetric({ name, value: valueMs, unit: 'ms', category: 'response-time' });
  }

  recordMemoryUsage(name: string, valueMB: number): void {
    this.recordMetric({ name, value: valueMB, unit: 'MB', category: 'memory' });
  }

  recordLoadTestResult(result: LoadTestResult): void {
    this.loadTestResults.push(result);
  }

  recordStressTestResult(result: StressTestResult): void {
    this.stressTestResults.push(result);
  }

  recordBenchmarkResult(result: BenchmarkResult): void {
    this.benchmarkResults.push(result);
  }

  recordCoreWebVitals(vitals: CoreWebVitals): void {
    this.coreWebVitals.push(vitals);
  }

  // ── Statistical helpers ────────────────────────────────────────────────────

  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  static calculateStdDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((s, v) => s + v, 0) / values.length;
  }

  // ── Benchmark runner ───────────────────────────────────────────────────────

  static async runBenchmark(
    operation: string,
    fn: () => Promise<void>,
    runs: number = 5,
    threshold: number = PERFORMANCE_THRESHOLDS.apiResponseTime,
  ): Promise<BenchmarkResult> {
    const times: number[] = [];

    for (let i = 0; i < runs; i++) {
      const start = Date.now();
      await fn();
      times.push(Date.now() - start);
    }

    const averageTime = PerformanceMonitor.calculateAverage(times);
    const p95Time = PerformanceMonitor.calculatePercentile(times, 95);

    return {
      operation,
      runs,
      averageTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      stdDeviation: PerformanceMonitor.calculateStdDeviation(times),
      p95Time,
      passed: averageTime <= threshold,
      threshold,
    };
  }

  // ── Alert detection ────────────────────────────────────────────────────────

  detectAlerts(): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    for (const metric of this.metrics) {
      if (metric.category === 'response-time' && metric.value > PERFORMANCE_THRESHOLDS.pageLoadTime) {
        alerts.push({
          severity: metric.value > PERFORMANCE_THRESHOLDS.pageLoadTime * 2 ? 'critical' : 'high',
          metric: metric.name,
          actual: metric.value,
          threshold: PERFORMANCE_THRESHOLDS.pageLoadTime,
          message: `Response time ${metric.value}ms exceeds threshold ${PERFORMANCE_THRESHOLDS.pageLoadTime}ms`,
          timestamp: metric.timestamp,
        });
      }

      if (metric.category === 'memory' && metric.value > PERFORMANCE_THRESHOLDS.memoryUsageMax) {
        alerts.push({
          severity: metric.value > PERFORMANCE_THRESHOLDS.memoryUsageMax * 1.5 ? 'critical' : 'medium',
          metric: metric.name,
          actual: metric.value,
          threshold: PERFORMANCE_THRESHOLDS.memoryUsageMax,
          message: `Memory usage ${metric.value}MB exceeds threshold ${PERFORMANCE_THRESHOLDS.memoryUsageMax}MB`,
          timestamp: metric.timestamp,
        });
      }
    }

    for (const loadResult of this.loadTestResults) {
      if (loadResult.errorRate > PERFORMANCE_THRESHOLDS.errorRateMax) {
        alerts.push({
          severity: loadResult.errorRate > 20 ? 'critical' : 'high',
          metric: 'error-rate',
          actual: loadResult.errorRate,
          threshold: PERFORMANCE_THRESHOLDS.errorRateMax,
          message: `Error rate ${loadResult.errorRate.toFixed(1)}% exceeds threshold ${PERFORMANCE_THRESHOLDS.errorRateMax}%`,
          timestamp: Date.now(),
        });
      }
    }

    return alerts;
  }

  // ── Report generation ─────────────────────────────────────────────────────

  generateReport(): PerformanceReport {
    const endTime = Date.now();
    const alerts = this.detectAlerts();

    const responseTimes = this.metrics
      .filter((m) => m.category === 'response-time')
      .map((m) => m.value);

    const memoryMetrics = this.metrics
      .filter((m) => m.category === 'memory')
      .map((m) => m.value);

    const passedBenchmarks = this.benchmarkResults.filter((b) => b.passed).length;
    const totalBenchmarks = this.benchmarkResults.length;

    const performanceScore =
      totalBenchmarks > 0
        ? Math.round((passedBenchmarks / totalBenchmarks) * 100)
        : 100;

    const summary: PerformanceSummary = {
      totalTests: totalBenchmarks + this.loadTestResults.length + this.stressTestResults.length,
      passed: passedBenchmarks,
      failed: totalBenchmarks - passedBenchmarks,
      averageResponseTime: PerformanceMonitor.calculateAverage(responseTimes),
      peakMemoryUsage: memoryMetrics.length > 0 ? Math.max(...memoryMetrics) : 0,
      performanceScore,
      alerts,
    };

    return {
      suite: this.suite,
      startTime: this.startTime,
      endTime,
      duration: endTime - this.startTime,
      metrics: this.metrics,
      loadTestResults: this.loadTestResults,
      stressTestResults: this.stressTestResults,
      benchmarkResults: this.benchmarkResults,
      coreWebVitals: this.coreWebVitals,
      summary,
    };
  }

  // ── Dashboard helper ───────────────────────────────────────────────────────

  printSummary(): void {
    const report = this.generateReport();
    const { summary } = report;
    // eslint-disable-next-line no-console
    console.log(`\n📊 Performance Report: ${this.suite}`);
    // eslint-disable-next-line no-console
    console.log(`   Duration      : ${(report.duration / 1000).toFixed(1)}s`);
    // eslint-disable-next-line no-console
    console.log(`   Tests         : ${summary.totalTests} (✓ ${summary.passed} / ✗ ${summary.failed})`);
    // eslint-disable-next-line no-console
    console.log(`   Avg Response  : ${summary.averageResponseTime.toFixed(0)}ms`);
    // eslint-disable-next-line no-console
    console.log(`   Peak Memory   : ${summary.peakMemoryUsage.toFixed(0)}MB`);
    // eslint-disable-next-line no-console
    console.log(`   Perf Score    : ${summary.performanceScore}%`);
    if (summary.alerts.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`   ⚠ Alerts     : ${summary.alerts.length}`);
      summary.alerts.forEach((a) =>
        // eslint-disable-next-line no-console
        console.log(`     [${a.severity.toUpperCase()}] ${a.message}`),
      );
    }
  }

  // ── Trend tracking ─────────────────────────────────────────────────────────

  static compareToBaseline(
    current: BenchmarkResult,
    baseline: BenchmarkResult,
  ): { regression: boolean; percentChange: number } {
    const percentChange =
      ((current.averageTime - baseline.averageTime) / baseline.averageTime) * 100;
    return {
      regression: percentChange > 10,
      percentChange,
    };
  }
}

/**
 * Simulate concurrent operations for load and stress tests.
 * Executes `fn` `concurrentUsers` times in parallel, collects timings,
 * and returns an aggregated LoadTestResult.
 */
export async function simulateConcurrentLoad(
  concurrentUsers: number,
  fn: (userId: number) => Promise<void>,
  durationMs: number = 5000,
): Promise<LoadTestResult> {
  const responseTimes: number[] = [];
  let successful = 0;
  let failed = 0;
  const errorTypes: Record<string, number> = {};

  const startTime = Date.now();

  const tasks = Array.from({ length: concurrentUsers }, async (_, i) => {
    const start = Date.now();
    try {
      await fn(i);
      responseTimes.push(Date.now() - start);
      successful++;
    } catch (err) {
      failed++;
      const errorType = err instanceof Error ? err.constructor.name : 'UnknownError';
      errorTypes[errorType] = (errorTypes[errorType] ?? 0) + 1;
    }
  });

  await Promise.allSettled(tasks);

  const totalDuration = Math.max(Date.now() - startTime, durationMs);
  const total = successful + failed;

  return {
    concurrentUsers,
    totalRequests: total,
    successfulRequests: successful,
    failedRequests: failed,
    averageResponseTime: PerformanceMonitor.calculateAverage(responseTimes),
    minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
    maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
    p95ResponseTime: PerformanceMonitor.calculatePercentile(responseTimes, 95),
    p99ResponseTime: PerformanceMonitor.calculatePercentile(responseTimes, 99),
    requestsPerSecond: total / (totalDuration / 1000),
    errorRate: total > 0 ? (failed / total) * 100 : 0,
    duration: totalDuration,
  };
}
