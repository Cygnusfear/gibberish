const genish = require('genish.js');
const g = genish;

// based on http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/
const polyBlep = function (__frequency, argumentProps) {
  'use jsdsp';

  if (argumentProps === undefined) argumentProps = { type: 'saw' };

  const mem = g.history(0);
  const type = argumentProps.type;
  const frequency = __frequency === undefined ? 220 : __frequency;
  const dt = genish.div(frequency, g.gen.samplerate);

  const t = g.accum(dt, 0, { min: 0 });
  let osc;

  // triangle waves are integrated square waves, so the below case accomodates both types
  if (type === 'triangle' || type === 'square') {
    // lt NOT gt to get correct phase
    osc = genish.sub(genish.mul(2, g.lt(t, .5)), 1);
  } else {
    osc = genish.sub(genish.mul(2, t), 1);
  }
  const case1 = g.lt(t, dt);
  const case2 = g.gt(t, genish.sub(1, dt));
  const adjustedT = g.switch(case1, genish.div(t, dt), g.switch(case2, genish.div(genish.sub(t, 1), dt), t));

  // if/elseif/else with nested ternary operators
  const blep = g.switch(case1, genish.sub(genish.sub(genish.add(adjustedT, adjustedT), genish.mul(adjustedT, adjustedT)), 1), g.switch(case2, genish.add(genish.add(genish.add(genish.mul(adjustedT, adjustedT), adjustedT), adjustedT), 1),
  // final else case is 0
  0));

  // triangle waves are integrated square waves, so the below case accomodates both types
  if (type !== 'saw') {
    osc = genish.add(osc, blep);
    const t_2 = g.memo(g.mod(genish.add(t, .5), 1));
    const case1_2 = g.lt(t_2, dt);
    const case2_2 = g.gt(t_2, genish.sub(1, dt));
    const adjustedT_2 = g.switch(case1_2, genish.div(t_2, dt), g.switch(case2_2, genish.div(genish.sub(t_2, 1), dt), t_2));

    const blep2 = g.switch(case1_2, genish.sub(genish.sub(genish.add(adjustedT_2, adjustedT_2), genish.mul(adjustedT_2, adjustedT_2)), 1), g.switch(case2_2, genish.add(genish.add(genish.add(genish.mul(adjustedT_2, adjustedT_2), adjustedT_2), adjustedT_2), 1), 0));
    osc = genish.sub(osc, blep2);

    // leaky integrator to create triangle from square wave
    if (type === 'triangle') {
      osc = genish.add(genish.mul(dt, osc), genish.mul(genish.sub(1, dt), mem.out));
      mem.in(osc);
    }
  } else {
    osc = genish.sub(osc, blep);
  }

  return osc;
};

module.exports = polyBlep;