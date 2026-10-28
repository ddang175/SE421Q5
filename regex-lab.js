'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let experiment;
  let tried = 0;

  function draw() {
    const done = tried === experiment.attempts.length;
    const simple = $('regex-rule').value === 'simple';
    $('regex-tried').textContent = tried;
    $('regex-possible').textContent = experiment.possible;
    $('regex-verdict').textContent = !done ? '?' : experiment.accepted ? 'Yes' : 'No';
    $('regex-groups').replaceChildren();
    if (!tried) {
      const preview = document.createElement('span');
      preview.textContent = 'Choose “Try next grouping” to begin.';
      $('regex-groups').append(preview);
    } else {
      for (const part of experiment.attempts[tried - 1]) {
        const group = document.createElement('span');
        group.className = 'regex-group';
        group.textContent = `[${part}]`;
        $('regex-groups').append(group);
      }
      if (!experiment.accepted) {
        const suffix = document.createElement('span');
        suffix.className = 'regex-bad';
        suffix.textContent = '!';
        suffix.setAttribute('aria-label', 'Exclamation mark cannot match');
        $('regex-groups').append(suffix);
      }
    }
    $('regex-status').textContent = !tried
      ? 'No candidate tried yet. Predict the number of possibilities, then start the search.'
      : simple
        ? `A direct scan inspects ${experiment.inspections} characters once each. ${experiment.accepted ? 'Every character fits.' : 'The final ! fails the rule.'} No alternative grouping search is needed.`
        : experiment.accepted
          ? `Accepted on the first complete grouping. The other ${experiment.possible - 1} possibilities need not be explored.`
          : done
            ? `Rejected after all ${experiment.possible} complete groupings. Every grouping leaves the ! unmatched.`
            : `Grouping ${tried} cannot absorb the final !. The model will try another grouping of the same letters.`;
    $('regex-step').disabled = done;
    $('regex-finish').disabled = done;
    $('regex-history').replaceChildren();
    $('regex-history').start = Math.max(1, tried - 7);
    for (const parts of experiment.attempts.slice(Math.max(0, tried - 8), tried)) {
      const item = document.createElement('li');
      item.textContent = parts.map(part => `[${part}]`).join(' ') + (experiment.accepted ? ' → matches' : ' ! → fails');
      $('regex-history').append(item);
    }
  }
  function reset() {
    const length = Number($('regex-length').value);
    const rule = $('regex-rule').value;
    experiment = Lab.regexExperiment(length, $('regex-failure').checked, rule);
    tried = 0;
    $('regex-length-label').textContent = length;
    $('regex-input').textContent = experiment.input;
    $('regex-pattern').textContent = rule === 'nested' ? '^(a+)+$' : '^a+$';
    draw();
  }
  $('regex-length').addEventListener('input', reset);
  $('regex-failure').addEventListener('change', reset);
  $('regex-rule').addEventListener('change', reset);
  $('regex-reset').addEventListener('click', reset);
  $('regex-step').addEventListener('click', () => { tried = Math.min(tried + 1, experiment.attempts.length); draw(); });
  $('regex-finish').addEventListener('click', () => { tried = experiment.attempts.length; draw(); });
  $('regex-prediction').addEventListener('change', () => { $('prediction-feedback').textContent = ''; });
  $('check-prediction').addEventListener('click', () => {
    const value = $('regex-prediction').value;
    $('prediction-feedback').textContent = !value
      ? 'Choose a count first.'
      : value === '8'
        ? 'Correct. Four letters have three gaps. Split or join at each gap: 2 × 2 × 2 = 8 complete groupings.'
        : 'There are 8 complete groupings. Four letters leave three gaps, each with two choices: split or join. Try stepping through the search.';
  });
  reset();
})();
