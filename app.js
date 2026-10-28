'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const descriptions = {
    mismatch: 'All four digits are compared. The reported mismatch count (or a delay based on it) reveals how many positions agree. A smaller signal is better for the guess, even without a correct prefix.',
    prefix: 'Comparison stops at the first mismatch. The signal is comparisons performed, a proxy for timing. A correct earlier prefix can let the checker reach a later position. Later digits are hidden until that prefix is correct.',
    fixed: 'All four digits are compared and the mismatch count is not reported. The modeled work signal is always four. Accepted or Rejected remains visible, as it must in authentication.'
  };
  const snippets = {
    mismatch: 'mismatches = 0\nfor each of the 4 positions:\n  if guess[i] != pin[i]: mismatches += 1\nreport mismatches  // information leak',
    prefix: 'for each of the 4 positions:\n  compare guess[i] with pin[i]\n  if different: return rejected\nreturn accepted  // work depends on prefix',
    fixed: 'difference = 0\nfor each of the 4 positions:\n  difference |= guess[i] XOR pin[i]\nreturn difference == 0\n// Conceptual model, not secure JS authentication'
  };
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function drawHash() {
    const count = Number($('key-count').value);
    const pattern = $('distribution').value;
    const result = Lab.hashExperiment(count, pattern);
    $('count-label').textContent = count;
    $('buckets').replaceChildren();
    result.buckets.forEach((keys, i) => {
      const row = element('div', `bucket${keys.length > 4 ? ' hot' : ''}`);
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', `Bucket ${i}: ${keys.length ? `keys ${keys.join(', ')}` : 'empty'}`);
      row.append(element('span', 'bucket-label', `Bucket ${i}`));
      const chain = element('div', 'chain');
      if (!keys.length) chain.append(element('span', 'empty', 'empty'));
      keys.forEach(key => chain.append(element('span', 'key', key)));
      row.append(chain);
      $('buckets').append(row);
    });
    $('hash-cost').textContent = result.comparisons;
    $('chain-length').textContent = Math.max(...result.buckets.map(b => b.length));
    const other = pattern === 'spread' ? 'colliding' : 'spread';
    $('alternative-cost').textContent = Lab.hashExperiment(count, other).comparisons;
    $('alternative-label').textContent = other === 'spread' ? 'if keys were spread' : 'if all keys collide';
    $('hash-explanation').textContent = pattern === 'colliding'
      ? `These ${count} distinct keys all land in bucket 0. Each insertion checks a longer chain. The last insertion alone needs ${count - 1} comparisons; the whole batch needs ${result.comparisons}.`
      : `These ${count} distinct keys are spread evenly across eight buckets. The batch needs ${result.comparisons} comparisons. Empty-bucket insertions need no equality comparisons, but hashing and insertion still require work.`;
    drawChart(count);
  }
  function drawChart(selected) {
    const ns = 'http://www.w3.org/2000/svg';
    const svgNode = (tag, attrs, text) => {
      const node = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const svg = svgNode('svg', {viewBox: '0 0 460 250', role: 'img', 'aria-labelledby': 'chart-title chart-desc'});
    svg.append(svgNode('title', {id: 'chart-title'}, 'Insertion comparisons for 1 to 32 keys'));
    svg.append(svgNode('desc', {id: 'chart-desc'}, 'All-collision cost rises to 496 comparisons at 32 keys. Evenly spread keys in eight fixed buckets need 48. The selected input size is marked with dots.'));
    const x = n => 45 + (n - 1) / 31 * 395;
    const y = cost => 210 - cost / 500 * 180;
    for (const cost of [0, 100, 200, 300, 400, 500]) {
      svg.append(svgNode('line', {x1:45,x2:440,y1:y(cost),y2:y(cost),stroke:'#e0e4d9'}));
      svg.append(svgNode('text', {x:35,y:y(cost)+4,'text-anchor':'end'}, cost));
    }
    for (const n of [1,8,16,24,32]) svg.append(svgNode('text', {x:x(n), y:230,'text-anchor':'middle'}, n));
    svg.append(svgNode('text',{x:240,y:247,'text-anchor':'middle'},'Number of keys (n)'));
    for (const [pattern, color] of [['colliding','#a44527'],['spread','#21654d']]) {
      const points = Array.from({length:32}, (_,i) => `${x(i+1)},${y(Lab.hashExperiment(i+1,pattern).comparisons)}`).join(' ');
      svg.append(svgNode('polyline',{points,fill:'none',stroke:color,'stroke-width':3}));
      svg.append(svgNode('circle',{cx:x(selected),cy:y(Lab.hashExperiment(selected,pattern).comparisons),r:5,fill:color,stroke:'#fffef9','stroke-width':2}));
    }
    $('cost-chart').replaceChildren(svg);
  }
  function readGuess() {
    try {
      const result = Lab.checkPin($('guess').value, $('checker').value);
      $('pin-error').textContent = '';
      $('guess').removeAttribute('aria-invalid');
      return result;
    } catch (error) {
      $('pin-error').textContent = error.message;
      $('guess').setAttribute('aria-invalid', 'true');
      return null;
    }
  }
  function clearSweep() {
    $('sweep-results').hidden = true;
    $('sweep-results').replaceChildren();
    $('sweep-empty').hidden = false;
    $('sweep-summary').textContent = '';
  }
  function clearObservation() {
    $('signal').textContent = '—';
    $('auth-result').textContent = 'Not checked';
    $('auth-result').className = 'result-badge';
    $('trace').replaceChildren();
  }
  function showPin() {
    const mode = $('checker').value;
    $('signal-kind').textContent = mode === 'mismatch' ? 'Mismatch signal' : 'Modeled work signal';
    $('signal-unit').textContent = mode === 'mismatch' ? 'mismatching positions' : 'comparisons (not milliseconds)';
    $('mode-explanation').textContent = descriptions[mode];
    $('pin-code').textContent = snippets[mode];
    const result = readGuess();
    if (!result) { clearObservation(); return; }
    $('signal').textContent = result.signal;
    $('auth-result').textContent = result.accepted ? 'Accepted' : 'Rejected';
    $('auth-result').className = `result-badge${result.accepted ? ' accepted' : ''}`;
    $('trace').replaceChildren();
    for (let i = 0; i < 4; i++) {
      const step = result.trace[i];
      const cell = element('div', `trace-cell ${!step ? 'skipped' : step.equal ? 'match' : 'miss'}`);
      cell.append(element('span', '', `Position ${i+1}`),element('strong', '', result.guess[i]),element('span', '', !step ? 'Not visited' : step.equal ? 'Match' : 'Mismatch'));
      $('trace').append(cell);
    }
  }
  function runSweep() {
    clearSweep();
    if (!readGuess()) { showPin(); return; }
    showPin();
    const mode = $('checker').value;
    const position = Number($('position').value);
    const rows = Lab.sweep($('guess').value, position, mode);
    $('sweep-empty').hidden = true;
    $('sweep-results').hidden = false;
    for (const row of rows) {
      const button = element('button', `candidate${row.accepted ? ' success' : ''}`);
      button.type = 'button';
      button.setAttribute('aria-label', `Use guess ${row.guess}, signal ${row.signal}, ${row.accepted ? 'accepted' : 'rejected'}`);
      const track = element('span', 'bar-track');
      const fill = element('span', 'bar-fill');
      fill.style.height = `${row.signal / 4 * 100}%`;
      track.append(fill);
      track.setAttribute('aria-hidden', 'true');
      button.append(element('small','',`Signal ${row.signal}`), track, element('strong','',row.guess), element('small','',row.accepted ? 'Accepted' : 'Rejected'));
      button.addEventListener('click', () => {
        $('guess').value = row.guess;
        clearSweep();
        showPin();
        $('guess').focus();
      });
      $('sweep-results').append(button);
    }
    const signals = rows.map(row => row.signal);
    let text;
    if (mode === 'mismatch') text = 'The unique smallest mismatch count identifies the correct digit at this position. Keep it, then probe another position.';
    else if (mode === 'fixed') text = 'The work signal is flat for every candidate. It gives no ranking. A successful guess is still reported as Accepted.';
    else if (new Set(signals).size === 1) text = position === 3 && rows.some(row => row.accepted)
      ? 'All candidates take four comparisons. Only the Accepted result distinguishes the correct final digit.'
      : 'The signal is flat. An earlier mismatch stops the checker before it can reveal this position. Correct the prefix first.';
    else text = 'The candidate with more comparisons lets the checker reach farther. Keep that digit and move right. The last position needs the acceptance result to break the timing tie.';
    $('sweep-summary').textContent = `Position ${position+1}: ${text}`;
  }
  $('key-count').addEventListener('input', drawHash);
  $('distribution').addEventListener('change', drawHash);
  $('compare-inputs').addEventListener('click', () => {
    $('distribution').value = $('distribution').value === 'spread' ? 'colliding' : 'spread';
    drawHash();
  });
  $('pin-form').addEventListener('submit', event => {event.preventDefault();clearSweep();showPin();});
  $('checker').addEventListener('change', () => {clearSweep();showPin();});
  $('guess').addEventListener('input', () => {clearSweep();clearObservation();$('pin-error').textContent='';$('guess').removeAttribute('aria-invalid');});
  $('position').addEventListener('change', clearSweep);
  $('show-pin').addEventListener('change', () => {$('public-pin').hidden = !$('show-pin').checked;});
  $('run-sweep').addEventListener('click', runSweep);
  drawHash();
  showPin();
})();
