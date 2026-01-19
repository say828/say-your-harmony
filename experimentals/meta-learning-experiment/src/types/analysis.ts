/**
 * Analysis Types
 *
 * Defines the structure for statistical analysis and results.
 */

/**
 * Complete analysis results for an experiment
 */
export interface AnalysisResult {
  /** Experiment analyzed */
  experimentId: string;

  /** Analysis timestamp */
  analyzedAt: string;

  /** Summary statistics */
  summary: AnalysisSummary;

  /** Scenario comparisons */
  comparisons: ScenarioComparison[];

  /** Statistical tests */
  statisticalTests: StatisticalTest[];

  /** Extracted patterns */
  patterns: ExtractedPattern[];

  /** Conclusions */
  conclusions: Conclusion[];

  /** Recommendations */
  recommendations: Recommendation[];
}

/**
 * Summary of analysis results
 */
export interface AnalysisSummary {
  /** Total runs analyzed */
  totalRuns: number;

  /** Successful runs */
  successfulRuns: number;

  /** Average efficiency improvement (%) */
  avgEfficiencyImprovement: number;

  /** Average quality maintenance (%) */
  avgQualityMaintenance: number;

  /** Success criteria met */
  successCriteriaMet: boolean;

  /** Key findings (bullet points) */
  keyFindings: string[];
}

/**
 * Comparison between two scenarios
 */
export interface ScenarioComparison {
  /** Baseline scenario ID */
  baselineScenarioId: string;

  /** Comparison scenario ID */
  comparisonScenarioId: string;

  /** Comparison type */
  comparisonType: 'repetition' | 'transfer';

  /** Metric comparisons */
  metricComparisons: MetricComparison[];

  /** Overall improvement percentage */
  overallImprovement: number;

  /** Statistically significant */
  isSignificant: boolean;
}

/**
 * Comparison of a single metric between scenarios
 */
export interface MetricComparison {
  /** Metric name */
  metric: string;

  /** Baseline value */
  baselineValue: number;

  /** Comparison value */
  comparisonValue: number;

  /** Absolute change */
  absoluteChange: number;

  /** Percentage change */
  percentageChange: number;

  /** Direction (positive = improvement for efficiency metrics) */
  direction: 'improved' | 'degraded' | 'unchanged';

  /** Effect size (Cohen's d) */
  effectSize: number;
}

/**
 * Statistical test result
 */
export interface StatisticalTest {
  /** Test name */
  testName: string;

  /** Test type */
  testType: StatisticalTestType;

  /** Metric being tested */
  metric: string;

  /** Groups being compared */
  groups: [string, string];

  /** Test statistic */
  testStatistic: number;

  /** P-value */
  pValue: number;

  /** Significant at alpha=0.05 */
  significant: boolean;

  /** Effect size */
  effectSize: number;

  /** Effect size interpretation */
  effectInterpretation: EffectSizeInterpretation;

  /** Confidence interval (95%) */
  confidenceInterval: [number, number];

  /** Sample sizes */
  sampleSizes: [number, number];
}

/**
 * Supported statistical test types
 */
export type StatisticalTestType =
  | 'paired-t-test'
  | 'independent-t-test'
  | 'wilcoxon'
  | 'mann-whitney'
  | 'chi-square'
  | 'anova';

/**
 * Effect size interpretation categories
 */
export type EffectSizeInterpretation = 'negligible' | 'small' | 'medium' | 'large';

/**
 * Pattern extracted from experiment results
 */
export interface ExtractedPattern {
  /** Pattern ID */
  patternId: string;

  /** Pattern name */
  name: string;

  /** Pattern category */
  category: PatternCategory;

  /** Description */
  description: string;

  /** Frequency observed */
  frequency: number;

  /** Scenarios where observed */
  observedIn: string[];

  /** Impact on metrics */
  impact: PatternImpact;

  /** Whether pattern transfers across domains */
  transferable: boolean;
}

/**
 * Pattern categories
 */
export type PatternCategory = 'efficiency' | 'quality' | 'learning' | 'failure';

/**
 * Impact of a pattern on metrics
 */
export interface PatternImpact {
  /** Affected metric */
  metric: string;

  /** Average impact */
  averageImpact: number;

  /** Impact direction */
  direction: 'positive' | 'negative' | 'neutral';

  /** Confidence score */
  confidence: number;
}

/**
 * Conclusion from analysis
 */
export interface Conclusion {
  /** Conclusion ID */
  id: string;

  /** Conclusion type */
  type: ConclusionType;

  /** Statement */
  statement: string;

  /** Supporting evidence */
  evidence: string[];

  /** Confidence level */
  confidence: ConfidenceLevel;
}

/**
 * Types of conclusions
 */
export type ConclusionType =
  | 'hypothesis_support'
  | 'hypothesis_reject'
  | 'observation'
  | 'limitation';

/**
 * Confidence levels
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Recommendation from analysis
 */
export interface Recommendation {
  /** Recommendation ID */
  id: string;

  /** Priority level */
  priority: 'P0' | 'P1' | 'P2' | 'P3';

  /** Category */
  category: RecommendationCategory;

  /** Recommendation text */
  recommendation: string;

  /** Rationale */
  rationale: string;

  /** Expected impact */
  expectedImpact: string;
}

/**
 * Recommendation categories
 */
export type RecommendationCategory =
  | 'methodology'
  | 'metrics'
  | 'tasks'
  | 'analysis'
  | 'framework';

/**
 * Hypothesis test result
 */
export interface HypothesisTestResult {
  /** Hypothesis statement */
  hypothesis: string;

  /** Test outcome */
  outcome: 'supported' | 'rejected' | 'inconclusive';

  /** Evidence strength */
  evidenceStrength: 'strong' | 'moderate' | 'weak';

  /** Supporting data points */
  supportingData: SupportingDataPoint[];

  /** Caveats */
  caveats: string[];
}

/**
 * Data point supporting a hypothesis
 */
export interface SupportingDataPoint {
  /** Metric name */
  metric: string;

  /** Value */
  value: number;

  /** Context */
  context: string;

  /** Statistical significance */
  significant: boolean;
}

/**
 * Learning curve data point
 */
export interface LearningCurvePoint {
  /** Task sequence number */
  taskNumber: number;

  /** Task ID */
  taskId: string;

  /** Efficiency metric value */
  efficiency: number;

  /** Quality metric value */
  quality: number;

  /** Cumulative patterns available */
  patternsAvailable: number;

  /** Improvement from baseline (%) */
  improvementFromBaseline: number;
}

/**
 * Complete learning curve analysis
 */
export interface LearningCurveAnalysis {
  /** Data points */
  dataPoints: LearningCurvePoint[];

  /** Trend analysis */
  trend: TrendAnalysis;

  /** Projected asymptote */
  projectedAsymptote: number;

  /** Confidence in projection */
  projectionConfidence: number;
}

/**
 * Trend analysis for learning curve
 */
export interface TrendAnalysis {
  /** Trend direction */
  direction: 'improving' | 'plateauing' | 'declining';

  /** Rate of change */
  rateOfChange: number;

  /** R-squared for trend line */
  rSquared: number;

  /** Inflection point (if any) */
  inflectionPoint?: number;
}
