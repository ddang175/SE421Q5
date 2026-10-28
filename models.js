'use strict';

// This public toy value is part of the lesson, not a credential.
globalThis.Lab = (() => {
  const PIN = '4210';
  const modes = ['mismatch', 'prefix', 'fixed'];

  function hashExperiment(count, pattern) {
    if (!Number.isInteger(count) || count < 1 || count > 32 || !['spread', 'colliding'].includes(pattern)) {
      throw new Error('Use 1 to 32 keys and a supported distribution.');
    }
    const buckets = Array.from({ length: 8 }, () => []);
    let comparisons = 0;
    const steps = [];
    for (let i = 0; i < count; i++) {
      const key = pattern === 'colliding' ? i * 8 : i;
      const bucket = key % 8;
      const cost = buckets[bucket].length;
      // Distinct keys: checking for an existing key visits the entire chain.
      comparisons += cost;
      buckets[bucket].push(key);
      steps.push({ key, bucket, cost, total: comparisons });
    }
    return { buckets, comparisons, steps };
  }

  function checkPin(guess, mode) {
    if (typeof guess !== 'string' || !/^[0-9]{4}$/.test(guess)) {
      throw new Error('Enter exactly four digits, from 0 to 9.');
    }
    if (!modes.includes(mode)) throw new Error('Choose a supported checker.');
    const trace = [];
    let mismatches = 0;
    for (let i = 0; i < PIN.length; i++) {
      const equal = guess[i] === PIN[i];
      trace.push({ position: i, digit: guess[i], equal });
      if (!equal) mismatches++;
      if (!equal && mode === 'prefix') break;
    }
    const comparisons = trace.length;
    return {
      guess, trace, comparisons, accepted: guess === PIN,
      signal: mode === 'mismatch' ? mismatches : comparisons
    };
  }

  function sweep(guess, position, mode) {
    checkPin(guess, mode);
    if (!Number.isInteger(position) || position < 0 || position > 3) throw new Error('Choose position 1 to 4.');
    return Array.from({ length: 10 }, (_, digit) => {
      const candidate = guess.slice(0, position) + digit + guess.slice(position + 1);
      return { digit, ...checkPin(candidate, mode) };
    });
  }
  function regexExperiment(length, lateFailure, rule) {
    if (!Number.isInteger(length) || length < 2 || length > 8 || typeof lateFailure !== 'boolean' || !['nested', 'simple'].includes(rule)) {
      throw new Error('Use 2 to 8 letters, a boolean suffix choice, and a supported rule.');
    }
    const prefix = 'a'.repeat(length);
    const input = prefix + (lateFailure ? '!' : '');
    const attempts = [];
    // Enumerate complete, nonempty groupings, not actual engine instructions.
    function group(remaining, parts) {
      if (remaining === 0) { attempts.push(parts); return; }
      for (let size = remaining; size >= 1; size--) group(remaining - size, [...parts, 'a'.repeat(size)]);
    }
    if (rule === 'nested' && lateFailure) group(length, []);
    else attempts.push([prefix]);
    return {
      input, attempts, accepted: !lateFailure,
      possible: rule === 'nested' ? 2 ** (length - 1) : 1,
      inspections: rule === 'simple' ? input.length : null
    };
  }
  return { hashExperiment, checkPin, sweep, regexExperiment };
})();
