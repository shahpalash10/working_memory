/* ============================================================
   Scoring Engine — Compute all cognitive metrics
   ============================================================ */

/**
 * Calculate Cowan's K for VWM tasks
 * K = N × (H - F)
 * H = hit rate (proportion of "different" trials correctly called "different")
 * F = false alarm rate (proportion of "same" trials incorrectly called "different")
 *
 * @param {Object[]} trials - Filtered trials for a specific task type
 * @returns {Object} Scoring results
 */
export function computeVWMScores(trials) {
  if (!trials || trials.length === 0) {
    return { kScores: {}, maxK: 0, accuracy: 0, meanRT: 0, maxSetSize: 0 };
  }

  // Group by set size
  const bySetSize = {};
  trials.forEach(t => {
    if (!bySetSize[t.setSize]) {
      bySetSize[t.setSize] = [];
    }
    bySetSize[t.setSize].push(t);
  });

  const kScores = {};
  const accuracyBySetSize = {};
  const rtBySetSize = {};
  let maxK = 0;
  let maxSetSize = 0;

  for (const [size, sizeTrials] of Object.entries(bySetSize)) {
    const n = parseInt(size);
    if (n > maxSetSize) maxSetSize = n;

    // Separate same and different trials
    const sameTrials = sizeTrials.filter(t => !t.isChange);
    const diffTrials = sizeTrials.filter(t => t.isChange);

    // Hit rate: proportion of "different" trials correctly identified
    const hits = diffTrials.filter(t => t.isCorrect).length;
    const hitRate = diffTrials.length > 0 ? hits / diffTrials.length : 0;

    // False alarm rate: proportion of "same" trials incorrectly called "different"
    const falseAlarms = sameTrials.filter(t => !t.isCorrect).length;
    const falseAlarmRate = sameTrials.length > 0 ? falseAlarms / sameTrials.length : 0;

    // Cowan's K
    const k = Math.max(0, n * (hitRate - falseAlarmRate));
    kScores[n] = {
      k: k,
      hitRate,
      falseAlarmRate,
      trials: sizeTrials.length,
    };

    if (k > maxK) maxK = k;

    // Accuracy
    const correct = sizeTrials.filter(t => t.isCorrect).length;
    accuracyBySetSize[n] = sizeTrials.length > 0 ? correct / sizeTrials.length : 0;

    // Mean RT (only correct trials)
    const correctTrials = sizeTrials.filter(t => t.isCorrect);
    rtBySetSize[n] = correctTrials.length > 0
      ? correctTrials.reduce((sum, t) => sum + t.reactionTimeMs, 0) / correctTrials.length
      : 0;
  }

  // Overall accuracy
  const totalCorrect = trials.filter(t => t.isCorrect).length;
  const accuracy = trials.length > 0 ? totalCorrect / trials.length : 0;

  // Overall mean RT (correct trials only)
  const correctTrials = trials.filter(t => t.isCorrect);
  const meanRT = correctTrials.length > 0
    ? correctTrials.reduce((sum, t) => sum + t.reactionTimeMs, 0) / correctTrials.length
    : 0;

  return {
    kScores,
    maxK,
    accuracy,
    meanRT,
    maxSetSize,
    accuracyBySetSize,
    rtBySetSize,
    totalTrials: trials.length,
  };
}

/**
 * Calculate ANT scores
 * Alerting = RT(no cue) - RT(double cue)
 * Orienting = RT(center cue) - RT(spatial cue)
 * Executive = RT(incongruent) - RT(congruent)
 *
 * @param {Object[]} trials - ANT trial data
 * @returns {Object} ANT scoring results
 */
export function computeANTScores(trials) {
  if (!trials || trials.length === 0) {
    return {
      alerting: 0, orienting: 0, executive: 0,
      accuracy: 0, meanRT: 0, rtByCue: {}, rtByFlanker: {},
    };
  }

  // Only use correct, non-timed-out trials for RT analysis
  const validTrials = trials.filter(t => t.isCorrect && !t.timedOut);

  // Mean RT by cue type
  const rtByCue = {};
  for (const cueType of ['none', 'center', 'double', 'spatial']) {
    const cueTrials = validTrials.filter(t => t.cueType === cueType);
    rtByCue[cueType] = cueTrials.length > 0
      ? cueTrials.reduce((sum, t) => sum + t.reactionTimeMs, 0) / cueTrials.length
      : 0;
  }

  // Mean RT by flanker type
  const rtByFlanker = {};
  for (const flankerType of ['congruent', 'incongruent', 'neutral']) {
    const flankerTrials = validTrials.filter(t => t.flankerType === flankerType);
    rtByFlanker[flankerType] = flankerTrials.length > 0
      ? flankerTrials.reduce((sum, t) => sum + t.reactionTimeMs, 0) / flankerTrials.length
      : 0;
  }

  // Compute network scores
  const alerting = rtByCue.none - rtByCue.double;
  const orienting = rtByCue.center - rtByCue.spatial;
  const executive = rtByFlanker.incongruent - rtByFlanker.congruent;

  // Overall accuracy
  const totalCorrect = trials.filter(t => t.isCorrect).length;
  const accuracy = trials.length > 0 ? totalCorrect / trials.length : 0;

  // Overall mean RT
  const meanRT = validTrials.length > 0
    ? validTrials.reduce((sum, t) => sum + t.reactionTimeMs, 0) / validTrials.length
    : 0;

  return {
    alerting,
    orienting,
    executive,
    accuracy,
    meanRT,
    rtByCue,
    rtByFlanker,
    totalTrials: trials.length,
    validTrials: validTrials.length,
  };
}

/**
 * Normalize a value to 0-100 scale using population benchmarks
 * @param {number} value - Raw value
 * @param {number} min - Population minimum (maps to 0)
 * @param {number} max - Population maximum (maps to 100)
 * @param {boolean} invert - If true, lower values are better (e.g., RT)
 * @returns {number} 0-100 normalized score
 */
function normalize(value, min, max, invert = false) {
  const clamped = Math.max(min, Math.min(max, value));
  let normalized = ((clamped - min) / (max - min)) * 100;
  if (invert) normalized = 100 - normalized;
  return Math.round(normalized * 10) / 10;
}

/**
 * Population benchmarks from cognitive science literature
 * These are approximate ranges for healthy adults
 */
const BENCHMARKS = {
  kPure: { min: 0, max: 6 },         // K score typically 1-5
  kDistractor: { min: 0, max: 5 },    // Usually slightly lower
  maxSetSize: { min: 1, max: 8 },     // Max tested
  meanRT: { min: 200, max: 1500 },    // ms
  alerting: { min: -20, max: 100 },   // ms (typically 20-60ms)
  orienting: { min: -20, max: 80 },   // ms (typically 20-50ms)
  executive: { min: -20, max: 200 },  // ms (typically 60-120ms)
};

/**
 * Compute composite score from all task metrics
 * @param {Object} vwmPure - VWM pure scores
 * @param {Object} vwmDistractor - VWM distractor scores
 * @param {Object} ant - ANT scores
 * @returns {Object} Composite scoring
 */
export function computeCompositeScore(vwmPure, vwmDistractor, ant) {
  const scores = {
    kPure: normalize(vwmPure.maxK, BENCHMARKS.kPure.min, BENCHMARKS.kPure.max),
    kDistractor: normalize(vwmDistractor.maxK, BENCHMARKS.kDistractor.min, BENCHMARKS.kDistractor.max),
    maxSetSize: normalize(
      Math.max(vwmPure.maxSetSize, vwmDistractor.maxSetSize),
      BENCHMARKS.maxSetSize.min,
      BENCHMARKS.maxSetSize.max
    ),
    rtEfficiency: normalize(
      (vwmPure.meanRT + vwmDistractor.meanRT) / 2,
      BENCHMARKS.meanRT.min,
      BENCHMARKS.meanRT.max,
      true // lower RT = better
    ),
    alerting: normalize(ant.alerting, BENCHMARKS.alerting.min, BENCHMARKS.alerting.max),
    orienting: normalize(ant.orienting, BENCHMARKS.orienting.min, BENCHMARKS.orienting.max),
    executive: normalize(ant.executive, BENCHMARKS.executive.min, BENCHMARKS.executive.max),
  };

  // Weighted composite
  const composite = (
    scores.kPure * 0.30 +
    scores.kDistractor * 0.20 +
    scores.maxSetSize * 0.15 +
    scores.rtEfficiency * 0.10 +
    scores.alerting * 0.10 +
    scores.orienting * 0.08 +
    scores.executive * 0.07
  );

  return {
    componentScores: scores,
    compositeScore: Math.round(composite * 10) / 10,
  };
}

/**
 * Assign tier based on composite score
 * Uses fixed percentile bins (since we may not have enough candidates for actual percentiles)
 * @param {number} compositeScore (0-100)
 * @returns {string} Tier label
 */
export function assignTier(compositeScore) {
  if (compositeScore >= 85) return 'S+';
  if (compositeScore >= 72) return 'S';
  if (compositeScore >= 58) return 'A';
  if (compositeScore >= 40) return 'B';
  if (compositeScore >= 25) return 'C';
  return 'D';
}

/**
 * Full scoring pipeline
 * @param {Object[]} allTrials - All trial data
 * @returns {Object} Complete scoring results
 */
export function computeFullScores(allTrials) {
  const pureTrials = allTrials.filter(t => t.taskType === 'vwm-pure');
  const distTrials = allTrials.filter(t => t.taskType === 'vwm-distractor');
  const antTrials = allTrials.filter(t => t.taskType === 'ant');

  const vwmPure = computeVWMScores(pureTrials);
  const vwmDistractor = computeVWMScores(distTrials);
  const ant = computeANTScores(antTrials);

  const { componentScores, compositeScore } = computeCompositeScore(vwmPure, vwmDistractor, ant);
  const tier = assignTier(compositeScore);

  return {
    vwmPure,
    vwmDistractor,
    ant,
    componentScores,
    compositeScore,
    tier,
    // Flattened for easy table display
    kPure: vwmPure.maxK,
    kDistractor: vwmDistractor.maxK,
    maxSetSize: Math.max(vwmPure.maxSetSize || 0, vwmDistractor.maxSetSize || 0),
    meanRT: ((vwmPure.meanRT || 0) + (vwmDistractor.meanRT || 0)) / 2,
    accuracyPure: vwmPure.accuracy,
    accuracyDistractor: vwmDistractor.accuracy,
    alerting: ant.alerting,
    orienting: ant.orienting,
    executive: ant.executive,
    antAccuracy: ant.accuracy,
    antMeanRT: ant.meanRT,
  };
}
