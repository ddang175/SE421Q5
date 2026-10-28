const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {};
if (fs.existsSync('models.js')) vm.runInNewContext(fs.readFileSync('models.js', 'utf8'), context);
const model = context.Lab || {};

test('collision insertion compares every earlier key in the chain', () => {
  assert.equal(typeof model.hashExperiment, 'function');
  const result = model.hashExperiment(8, 'colliding');
  assert.equal(result.comparisons, 28);
  assert.deepEqual(Array.from(result.buckets, b => b.length), [8,0,0,0,0,0,0,0]);
});
test('distributed keys avoid comparisons until buckets repeat', () => {
  assert.equal(typeof model.hashExperiment, 'function');
  assert.equal(model.hashExperiment(8, 'spread').comparisons, 0);
  assert.equal(model.hashExperiment(16, 'spread').comparisons, 8);
  assert.equal(model.hashExperiment(32, 'colliding').comparisons, 496);
});
test('assignment signal counts mismatches, not matching prefix', () => {
  assert.equal(typeof model.checkPin, 'function');
  assert.equal(model.checkPin('0000', 'mismatch').signal, 3);
  assert.equal(model.checkPin('4000', 'mismatch').signal, 2);
  assert.equal(model.checkPin('4210', 'mismatch').signal, 0);
  assert.equal(model.checkPin('0000', 'mismatch').comparisons, 4);
});
test('early exit cannot distinguish full match from last-digit mismatch by work alone', () => {
  assert.equal(typeof model.checkPin, 'function');
  assert.equal(model.checkPin('0000', 'prefix').signal, 1);
  assert.equal(model.checkPin('4000', 'prefix').signal, 2);
  assert.equal(model.checkPin('4219', 'prefix').signal, 4);
  assert.equal(model.checkPin('4210', 'prefix').signal, 4);
  assert.equal(model.checkPin('4219', 'prefix').accepted, false);
  assert.equal(model.checkPin('4210', 'prefix').accepted, true);
});
test('fixed-work signal remains flat for equal-length guesses', () => {
  assert.equal(typeof model.checkPin, 'function');
  for (const guess of ['0000','4000','4200','4219','4210']) {
    assert.equal(model.checkPin(guess, 'fixed').signal, 4);
    assert.equal(model.checkPin(guess, 'fixed').comparisons, 4);
  }
});
test('candidate sweep exposes mismatch improvement and prefix ambiguity', () => {
  assert.equal(typeof model.sweep, 'function');
  const rows = model.sweep('0000', 0, 'mismatch');
  assert.equal(rows.length, 10);
  assert.equal(rows[4].guess, '4000');
  assert.equal(rows[4].signal, 2);
  assert.equal(rows[3].signal, 3);
  assert.equal(new Set(model.sweep('0000', 2, 'prefix').map(r => r.signal)).size, 1);
  assert.equal(new Set(model.sweep('0000', 0, 'fixed').map(r => r.signal)).size, 1);
});
test('invalid or out-of-bounds input is rejected before simulation', () => {
  assert.equal(typeof model.checkPin, 'function');
  for (const guess of ['', '123', '12345', '<b>!', '１２３４']) assert.throws(() => model.checkPin(guess, 'prefix'));
  for (const n of [0,33,1.5,NaN]) assert.throws(() => model.hashExperiment(n, 'spread'));
  assert.throws(() => model.hashExperiment(8, 'other'));
  assert.throws(() => model.checkPin('0000', 'other'));
  assert.throws(() => model.sweep('0000', 4, 'prefix'));
});

test('nested repetition exposes every unique grouping of a late-failing prefix', () => {
  assert.equal(typeof model.regexExperiment, 'function');
  const result = model.regexExperiment(3, true, 'nested');
  assert.equal(result.input, 'aaa!');
  assert.equal(result.accepted, false);
  assert.equal(result.possible, 4);
  assert.equal(result.attempts.length, 4);
  assert.deepEqual(Array.from(result.attempts, a => Array.from(a).join('|')), ['aaa','aa|a','a|aa','a|a|a']);
  assert.equal(model.regexExperiment(8, true, 'nested').attempts.length, 128);
});
test('matching input accepts its first grouping without exploring alternatives', () => {
  assert.equal(typeof model.regexExperiment, 'function');
  const result = model.regexExperiment(6, false, 'nested');
  assert.equal(result.possible, 32);
  assert.equal(result.attempts.length, 1);
  assert.equal(result.accepted, true);
});
test('simpler matching rule needs no alternative grouping search', () => {
  assert.equal(typeof model.regexExperiment, 'function');
  const result = model.regexExperiment(8, true, 'simple');
  assert.equal(result.possible, 1);
  assert.equal(result.attempts.length, 1);
  assert.equal(result.inspections, 9);
  assert.equal(result.accepted, false);
  assert.equal(model.regexExperiment(8, false, 'simple').accepted, true);
});
test('regex lesson enforces its small simulation bounds', () => {
  assert.equal(typeof model.regexExperiment, 'function');
  for (const n of [0,1,9,2.5,NaN]) assert.throws(() => model.regexExperiment(n, true, 'nested'));
  assert.throws(() => model.regexExperiment(3, 'yes', 'nested'));
  assert.throws(() => model.regexExperiment(3, true, 'other'));
});
