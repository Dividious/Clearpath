// ─── Number formatting ───────────────────────────────────────────────────────

export const fmt$ = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export const fmt$K = (n) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt$(n);
};

export const fmtPct = (n, decimals = 1) => `${(n * 100).toFixed(decimals)}%`;

// ─── Normal distribution (Box-Muller) ────────────────────────────────────────

export function randomNormal(mean, stdDev) {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + stdDev * z;
}

// ─── Accumulation (nest egg building) ────────────────────────────────────────

/**
 * Returns year-by-year breakdown of portfolio growth.
 * Stacked bar components: principal, contributions, interest.
 */
export function calculateAccumulation(startAmount, annualContrib, returnRate, years) {
  const r = returnRate / 100;

  const labels = [];
  const principal = [];
  const contributions = [];
  const interest = [];

  let balance = startAmount;
  let cumContrib = 0;

  // Year 0 baseline
  labels.push('Now');
  principal.push(startAmount);
  contributions.push(0);
  interest.push(0);

  for (let y = 1; y <= years; y++) {
    const interestEarned = balance * r;
    balance = balance + interestEarned + annualContrib;
    cumContrib += annualContrib;

    const interestTotal = balance - startAmount - cumContrib;

    labels.push(`Yr ${y}`);
    principal.push(startAmount);
    contributions.push(cumContrib);
    interest.push(Math.max(0, interestTotal));
  }

  const finalBalance = balance;
  const totalContributed = startAmount + cumContrib;
  const totalInterest = finalBalance - totalContributed;

  return {
    finalBalance,
    totalContributed,
    totalInterest: Math.max(0, totalInterest),
    chartData: { labels, principal, contributions, interest },
  };
}

// ─── Drawdown (retirement spending) ──────────────────────────────────────────

/**
 * Simulates portfolio drawdown year by year.
 * Both spending and SS income inflate at inflationRate.
 */
export function calculateDrawdown(
  nestEgg,
  annualSpending,
  ssIncome,
  returnRate,
  inflationRate,
  retirementAge,
  maxAge = 100
) {
  const r = returnRate / 100;
  const inf = inflationRate / 100;

  const ages = [retirementAge];
  const balances = [nestEgg];
  const netDraws = [0];

  let balance = nestEgg;
  let spending = annualSpending;
  let ss = ssIncome;
  let depletionAge = null;

  for (let age = retirementAge + 1; age <= maxAge; age++) {
    spending *= 1 + inf;
    ss *= 1 + inf;

    const netDraw = Math.max(0, spending - ss);
    balance = balance * (1 + r) - netDraw;

    if (balance <= 0 && !depletionAge) {
      depletionAge = age;
    }

    ages.push(age);
    balances.push(Math.max(0, balance));
    netDraws.push(netDraw);
  }

  const year1NetDraw = Math.max(0, annualSpending - ssIncome);
  const yearsLasted = depletionAge
    ? depletionAge - retirementAge
    : maxAge - retirementAge;

  return {
    depletionAge,
    yearsLasted,
    year1NetDraw,
    ageFundsRunOut: depletionAge || `${maxAge}+`,
    chartData: { ages, balances, netDraws },
  };
}

// ─── Healthcare-adjusted drawdown ────────────────────────────────────────────

export function calculateHealthcareDrawdown(
  nestEgg,
  baseSpending,        // total non-HC spending
  hcSpending,          // healthcare spending at retirement
  ssIncome,
  returnRate,
  inflationRate,
  hcInflationRate,
  retirementAge,
  maxAge = 100
) {
  const r = returnRate / 100;
  const inf = inflationRate / 100;
  const hcInf = hcInflationRate / 100;

  const ages = [retirementAge];
  const otherSpends = [baseSpending];
  const hcSpends = [hcSpending];
  const netDraws = [0];
  const balances = [nestEgg];

  let balance = nestEgg;
  let other = baseSpending;
  let hc = hcSpending;
  let ss = ssIncome;
  let depletionAge = null;

  for (let age = retirementAge + 1; age <= maxAge; age++) {
    other *= 1 + inf;
    hc *= 1 + hcInf;
    ss *= 1 + inf;

    const totalSpending = other + hc;
    const netDraw = Math.max(0, totalSpending - ss);
    balance = balance * (1 + r) - netDraw;

    if (balance <= 0 && !depletionAge) {
      depletionAge = age;
    }

    ages.push(age);
    otherSpends.push(other);
    hcSpends.push(hc);
    netDraws.push(netDraw);
    balances.push(Math.max(0, balance));
  }

  return {
    depletionAge,
    chartData: { ages, otherSpends, hcSpends, netDraws, balances },
  };
}

// ─── Social Security Breakeven ────────────────────────────────────────────────

/**
 * Monthly benefit at FRA (full retirement age = 67).
 * Factors: 62 → 70%, 67 → 100%, 70 → 124%.
 */
export function calculateSSBreakeven(monthlyBenefitFRA) {
  const annual62 = monthlyBenefitFRA * 12 * 0.70;
  const annual67 = monthlyBenefitFRA * 12 * 1.00;
  const annual70 = monthlyBenefitFRA * 12 * 1.24;

  const startAge = 60;
  const endAge = 92;
  const ages = [];
  const cum62 = [];
  const cum67 = [];
  const cum70 = [];

  for (let age = startAge; age <= endAge; age++) {
    ages.push(age);
    cum62.push(age >= 62 ? (age - 62) * annual62 : 0);
    cum67.push(age >= 67 ? (age - 67) * annual67 : 0);
    cum70.push(age >= 70 ? (age - 70) * annual70 : 0);
  }

  // Find crossover ages
  let cross6267 = null;
  let cross6770 = null;
  let cross6270 = null;

  for (let i = 1; i < ages.length; i++) {
    if (!cross6267 && cum62[i - 1] >= cum67[i - 1] === false && cum62[i] >= cum67[i]) {
      cross6267 = ages[i];
    }
    if (!cross6267 && cum67[i - 1] <= cum62[i - 1] && cum67[i] >= cum62[i] && ages[i] > 67) {
      cross6267 = ages[i];
    }
    if (!cross6770 && cum67[i - 1] <= cum70[i - 1] && cum67[i] >= cum70[i] && ages[i] > 70) {
      cross6770 = ages[i];
    }
    if (!cross6270 && cum62[i - 1] <= cum70[i - 1] && cum62[i] >= cum70[i] && ages[i] > 70) {
      cross6270 = ages[i];
    }
  }

  // Analytical crossovers
  // 62 vs 67: (age-62)*annual62 = (age-67)*annual67
  const xover6267 = Math.round(
    (62 * annual62 - 67 * annual67) / (annual62 - annual67)
  );
  const xover6770 = Math.round(
    (67 * annual67 - 70 * annual70) / (annual67 - annual70)
  );

  return {
    ages,
    cum62,
    cum67,
    cum70,
    monthlyBenefits: {
      age62: (monthlyBenefitFRA * 0.70).toFixed(0),
      age67: monthlyBenefitFRA.toFixed(0),
      age70: (monthlyBenefitFRA * 1.24).toFixed(0),
    },
    crossovers: {
      '62vs67': xover6267,
      '67vs70': xover6770,
    },
  };
}

// ─── Monte Carlo Simulation ───────────────────────────────────────────────────

export function runMonteCarlo(
  nestEgg,
  annualSpending,
  ssIncome,
  returnRate,
  inflationRate,
  retirementAge,
  numSimulations = 1000,
  targetAge = 90
) {
  const meanReturn = returnRate / 100;
  const inf = inflationRate / 100;
  const stdDev = 0.12; // ~12% historical vol for retirement portfolio
  const maxAge = 100;
  const years = maxAge - retirementAge;

  const allTrajectories = [];
  const depletionAges = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    let balance = nestEgg;
    let spending = annualSpending;
    let ss = ssIncome;
    let depletionAge = null;
    const traj = [nestEgg];

    for (let y = 1; y <= years; y++) {
      const annualReturn = randomNormal(meanReturn, stdDev);
      spending *= 1 + inf;
      ss *= 1 + inf;
      const netDraw = Math.max(0, spending - ss);
      balance = balance * (1 + annualReturn) - netDraw;

      if (balance <= 0 && !depletionAge) {
        depletionAge = retirementAge + y;
        balance = 0;
      }
      traj.push(Math.max(0, balance));
    }

    allTrajectories.push(traj);
    depletionAges.push(depletionAge || maxAge + 1);
  }

  // Compute percentiles at each year
  const percentiles = { p10: [], p25: [], p50: [], p75: [], p90: [] };
  const pcts = [0.10, 0.25, 0.50, 0.75, 0.90];
  const keys = ['p10', 'p25', 'p50', 'p75', 'p90'];

  for (let y = 0; y <= years; y++) {
    const vals = allTrajectories.map((t) => t[y]).sort((a, b) => a - b);
    const n = vals.length;
    keys.forEach((k, i) => {
      const idx = Math.min(Math.floor(n * pcts[i]), n - 1);
      percentiles[k].push(vals[idx]);
    });
  }

  const survived = depletionAges.filter((a) => a > targetAge).length;
  const survivalRate = ((survived / numSimulations) * 100).toFixed(1);

  // Depletion histogram (by decade buckets)
  const histogram = {};
  for (let a = retirementAge; a <= maxAge + 10; a += 5) {
    histogram[a] = 0;
  }
  depletionAges.forEach((a) => {
    const bucket = Math.floor(Math.min(a, maxAge + 5) / 5) * 5;
    if (histogram[bucket] !== undefined) {
      histogram[bucket]++;
    } else {
      histogram[maxAge + 5] = (histogram[maxAge + 5] || 0) + 1;
    }
  });

  const ages = Array.from({ length: years + 1 }, (_, i) => retirementAge + i);

  return {
    percentiles,
    ages,
    depletionAges,
    survivalRate: parseFloat(survivalRate),
    survived,
    numSimulations,
    histogram,
  };
}

// ─── Tax Treatment Comparison ─────────────────────────────────────────────────

export function calculateTaxComparison(
  annualContrib,
  years,
  returnRate,
  currentTaxRate,    // 0–37 (as number)
  retirementTaxRate  // 0–37 (as number)
) {
  const r = returnRate / 100;
  const currTax = currentTaxRate / 100;
  const retTax = retirementTaxRate / 100;
  const ltcgRate = retirementTaxRate <= 15 ? 0 : retirementTaxRate <= 37 ? 0.15 : 0.20;

  // Future value of annuity: FV = PMT * ((1+r)^n - 1) / r
  function fvAnnuity(pmt, rate, n) {
    if (rate === 0) return pmt * n;
    return pmt * ((Math.pow(1 + rate, n) - 1) / rate);
  }

  // Traditional (pre-tax)
  // Full contribution goes in; taxed at retirement
  const tradBalance = fvAnnuity(annualContrib, r, years);
  const tradAfterTax = tradBalance * (1 - retTax);
  const tradTaxSavingsNow = annualContrib * currTax * years; // rough total savings

  // Roth (post-tax)
  // After-tax contribution = annualContrib * (1 - currTax)
  const rothContrib = annualContrib * (1 - currTax);
  const rothBalance = fvAnnuity(rothContrib, r, years);
  const rothAfterTax = rothBalance; // no tax on withdrawal

  // Taxable brokerage
  // After-tax contribution; dividend drag reduces effective return by ~0.5%
  const taxableContrib = annualContrib * (1 - currTax);
  const taxableDragRate = r - 0.005; // simplified dividend/interest tax drag
  const taxableBalance = fvAnnuity(taxableContrib, Math.max(taxableDragRate, 0), years);
  // Capital gains: only gains are taxed
  const taxablePrincipal = taxableContrib * years;
  const taxableGains = Math.max(0, taxableBalance - taxablePrincipal);
  const taxableAfterTax = taxablePrincipal + taxableGains * (1 - ltcgRate);

  return {
    traditional: {
      balance: tradBalance,
      afterTax: tradAfterTax,
      taxSavingsNow: tradTaxSavingsNow,
    },
    roth: {
      balance: rothBalance,
      afterTax: rothAfterTax,
      taxSavingsNow: 0,
    },
    taxable: {
      balance: taxableBalance,
      afterTax: taxableAfterTax,
      taxSavingsNow: 0,
      ltcgRate: ltcgRate * 100,
    },
  };
}

// ─── Drawdown status color ────────────────────────────────────────────────────

export function getDrawdownStatus(depletionAge, retirementAge) {
  if (!depletionAge) return { color: 'green', label: 'Strong outlook', desc: 'Portfolio sustains through age 100+' };
  const yearsLasted = depletionAge - retirementAge;
  if (yearsLasted >= 30) return { color: 'green', label: 'Good outlook', desc: `Funds last ${yearsLasted} years` };
  if (yearsLasted >= 20) return { color: 'yellow', label: 'Moderate outlook', desc: `Funds run out at age ${depletionAge}` };
  return { color: 'red', label: 'At-risk outlook', desc: `Funds run out at age ${depletionAge}` };
}
