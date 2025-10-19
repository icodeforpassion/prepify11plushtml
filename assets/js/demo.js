/* Demo logic for ElevenSpark interactive quiz and flashcards */
(function () {
  const doc = document;

  /** RNG utilities **/
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const createSeed = (seedStr) => {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h >>> 0) || 123456789;
  };

  const seededRandom = (seed, index) => mulberry32(seed + index)();

  const seededShuffle = (array, rand) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const randInt = (rand, min, max) => Math.floor(rand() * (max - min + 1)) + min;

  const formatFraction = (n, d) => `${n}/${d}`;
  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

  const randomDistinctDigits = (rand, count, min, max) => {
    const nums = new Set();
    while (nums.size < count) {
      nums.add(randInt(rand, min, max));
    }
    return [...nums];
  };

  const mixArray = (rand, arr) => seededShuffle(arr, rand);

  /** Maths question templates **/
  const mathTemplates = {
    arithmeticTwoStep(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const base = difficulty * 10;
      const a = randInt(rand, base, base + 30);
      const b = randInt(rand, 5, 20);
      const c = randInt(rand, 2, 10);
      const answer = a + b * c;
      const wrong1 = answer + randInt(rand, 1, 5);
      const wrong2 = answer - randInt(rand, 1, 6);
      const wrong3 = answer + randInt(rand, -7, 7);
      const choices = mixArray(rand, [answer, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Calculate ${a} + ${b} × ${c}. Remember BODMAS!`,
        answer: String(answer),
        choices,
        explanation: `${b} × ${c} = ${b * c}. Then ${a} + ${b * c} = ${answer}.`,
        difficulty,
      };
    },
    arithmeticDivision(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const divisor = randInt(rand, 2, difficulty + 4);
      const quotient = randInt(rand, 10, 20 + difficulty * 4);
      const remainder = randInt(rand, 0, divisor - 1);
      const dividend = divisor * quotient + remainder;
      const choices = mixArray(rand, [
        `${quotient} remainder ${remainder}`,
        `${quotient + 1} remainder ${Math.max(0, remainder - 1)}`,
        `${quotient - 1} remainder ${remainder + 1}`,
        `${quotient} remainder ${Math.max(0, remainder - 2)}`,
      ]);
      return {
        stem: `Divide ${dividend} by ${divisor}. Give your answer with the remainder.`,
        answer: choices[0],
        choices,
        explanation: `${divisor} × ${quotient} = ${divisor * quotient}. ${dividend} − ${divisor * quotient} = ${remainder}, so the answer is ${quotient} remainder ${remainder}.`,
        difficulty,
      };
    },
    fractionSimplify(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const base = randInt(rand, 2, 9 + difficulty);
      const factor = randInt(rand, 2, 5 + difficulty);
      const numerator = base * factor;
      const denominator = randInt(rand, 2, 9 + difficulty) * factor;
      const simpleGcd = gcd(numerator, denominator);
      const answer = formatFraction(numerator / simpleGcd, denominator / simpleGcd);
      const choices = mixArray(rand, [
        answer,
        formatFraction(numerator / factor, denominator),
        formatFraction(numerator, denominator / factor),
        formatFraction(numerator / simpleGcd + 1, denominator / simpleGcd),
      ]);
      return {
        stem: `Simplify the fraction ${formatFraction(numerator, denominator)}.`,
        answer,
        choices,
        explanation: `Divide top and bottom by ${simpleGcd} to get ${answer}.`,
        difficulty,
      };
    },
    fractionAdd(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const base = randInt(rand, 2, 6 + difficulty);
      const other = randInt(rand, 2, 6 + difficulty);
      const num1 = randInt(rand, 1, base - 1);
      const num2 = randInt(rand, 1, other - 1);
      const lcm = (a, b) => (a * b) / gcd(a, b);
      const common = lcm(base, other);
      const sum = num1 * (common / base) + num2 * (common / other);
      const divisor = gcd(sum, common);
      const answer = formatFraction(sum / divisor, common / divisor);
      const wrong1 = formatFraction(sum + common / base, common);
      const wrong2 = formatFraction(sum - common / other, common);
      const wrong3 = formatFraction(sum / divisor + 1, common / divisor);
      const choices = mixArray(rand, [answer, wrong1, wrong2, wrong3]);
      return {
        stem: `Add ${formatFraction(num1, base)} + ${formatFraction(num2, other)}.`,
        answer,
        choices,
        explanation: `Common denominator ${common}. New numerators ${num1 * (common / base)} + ${num2 * (common / other)} = ${sum}. Simplify to ${answer}.`,
        difficulty,
      };
    },
    percentOf(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const percentOptions = [10, 12.5, 15, 20, 25, 30, 35, 40, 45, 50];
      const percentage = percentOptions[randInt(rand, 0, percentOptions.length - 1)];
      const base = randInt(rand, 80, 200 + difficulty * 40);
      const answer = Math.round((percentage / 100) * base * 100) / 100;
      const wrong1 = Math.round((percentage / 100) * (base + randInt(rand, 5, 20)) * 100) / 100;
      const wrong2 = Math.round((percentage / 100 + 0.05) * base * 100) / 100;
      const wrong3 = Math.round((percentage / 100 - 0.05) * base * 100) / 100;
      const choices = mixArray(rand, [answer, wrong1, wrong2, wrong3]).map((val) => val.toString());
      return {
        stem: `Find ${percentage}% of £${base}. Give your answer to 2 decimal places if needed.`,
        answer: answer.toFixed(2),
        choices: choices.map((val) => Number(val).toFixed(2)),
        explanation: `${percentage}% = ${percentage}/100. Multiply: ${base} × ${percentage}/100 = £${answer.toFixed(2)}.`,
        difficulty,
      };
    },
    percentChange(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const original = randInt(rand, 40, 120 + difficulty * 40);
      const change = randInt(rand, 10, 35);
      const increase = rand() > 0.5;
      const multiplier = 1 + (increase ? change : -change) / 100;
      const newValue = Math.round(original * multiplier * 100) / 100;
      const wrong1 = Math.round(original * (1 + change / 120) * 100) / 100;
      const wrong2 = Math.round(original * (1 + change / 90) * 100) / 100;
      const wrong3 = Math.round(original * (increase ? 1 - change / 100 : 1 + change / 100) * 100) / 100;
      const choices = mixArray(rand, [newValue, wrong1, wrong2, wrong3]).map((val) => val.toFixed(2));
      return {
        stem: `${increase ? 'Increase' : 'Decrease'} £${original.toFixed(2)} by ${change}%. What is the new amount?`,
        answer: newValue.toFixed(2),
        choices,
        explanation: `${increase ? 'Increase' : 'Decrease'} means multiply by ${multiplier.toFixed(2)}. £${original.toFixed(2)} × ${multiplier.toFixed(2)} = £${newValue.toFixed(2)}.`,
        difficulty,
      };
    },
    ratioShare(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const total = randInt(rand, 60, 120 + difficulty * 40);
      const parts = randomDistinctDigits(rand, 2, 2, 6);
      const sumParts = parts[0] + parts[1];
      const share = Math.round((total / sumParts) * parts[0]);
      const wrong1 = share + randInt(rand, 2, 8);
      const wrong2 = share - randInt(rand, 1, 6);
      const wrong3 = Math.round((total / sumParts) * parts[1]);
      const choices = mixArray(rand, [share, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Share £${total} in the ratio ${parts[0]} : ${parts[1]}. How much does the first person receive?`,
        answer: String(share),
        choices,
        explanation: `Total parts ${sumParts}. Each part = £${(total / sumParts).toFixed(2)}. First person gets ${parts[0]} parts = £${share}.`,
        difficulty,
      };
    },
    ratioEquivalent(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const a = randInt(rand, 2, 6 + difficulty);
      const b = randInt(rand, 3, 8 + difficulty);
      const multiplier = randInt(rand, 2, 5);
      const target = multiplier * a;
      const choices = mixArray(rand, [
        `${target}:${multiplier * b}`,
        `${a + multiplier}:${b + multiplier}`,
        `${target}:${b}`,
        `${a}:${multiplier * b}`,
      ]);
      return {
        stem: `Complete the equivalent ratio: ${a}:${b} = ${target}: ?`,
        answer: choices[0],
        choices,
        explanation: `Multiply both parts by ${multiplier}. ${a} × ${multiplier} = ${target}. ${b} × ${multiplier} = ${multiplier * b}.`,
        difficulty,
      };
    },
    factorsLcm(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const base1 = randInt(rand, 3, 7 + difficulty);
      const base2 = randInt(rand, 3, 7 + difficulty);
      const num1 = base1 * randInt(rand, 2, 4);
      const num2 = base2 * randInt(rand, 2, 4);
      const lcm = (num1 * num2) / gcd(num1, num2);
      const wrong1 = lcm + base1;
      const wrong2 = lcm - base2;
      const wrong3 = num1 + num2;
      const choices = mixArray(rand, [lcm, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Find the lowest common multiple of ${num1} and ${num2}.`,
        answer: String(lcm),
        choices,
        explanation: `Prime factors lead to LCM = ${lcm}.`,
        difficulty,
      };
    },
    factorsHcf(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const base = randInt(rand, 3, 8 + difficulty);
      const num1 = base * randInt(rand, 2, 5);
      const num2 = base * randInt(rand, 2, 6);
      const hcf = gcd(num1, num2);
      const wrong1 = hcf + randInt(rand, 1, 4);
      const wrong2 = Math.max(1, hcf - randInt(rand, 1, 3));
      const wrong3 = base;
      const choices = mixArray(rand, [hcf, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Find the highest common factor (HCF) of ${num1} and ${num2}.`,
        answer: String(hcf),
        choices,
        explanation: `Common factors share ${base}. HCF = ${hcf}.`,
        difficulty,
      };
    },
    algebraSolve(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const coeff = randInt(rand, 2, 4 + difficulty);
      const x = randInt(rand, 3, 9 + difficulty);
      const constant = randInt(rand, 5, 30 + difficulty * 5);
      const rhs = coeff * x + constant;
      const answer = rhs - constant;
      const wrong1 = rhs + constant;
      const wrong2 = rhs - coeff;
      const wrong3 = rhs / coeff;
      const choices = mixArray(rand, [answer / coeff, wrong1 / coeff, wrong2 / coeff, wrong3]);
      return {
        stem: `Solve for x: ${coeff}x + ${constant} = ${rhs}.`,
        answer: String(answer / coeff),
        choices: choices.map((c) => Number(c).toFixed(1).replace(/\.0$/, '')),
        explanation: `Subtract ${constant}: ${coeff}x = ${rhs - constant}. Divide by ${coeff}: x = ${(rhs - constant) / coeff}.`,
        difficulty,
      };
    },
    algebraSubstitution(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const x = randInt(rand, 2, 6 + difficulty);
      const y = randInt(rand, 3, 7 + difficulty);
      const expression = `${2 + difficulty}x + ${3 + difficulty}y`;
      const answer = (2 + difficulty) * x + (3 + difficulty) * y;
      const wrong1 = (2 + difficulty) * (x + 1) + (3 + difficulty) * y;
      const wrong2 = (2 + difficulty) * x + (3 + difficulty) * (y - 1);
      const wrong3 = (2 + difficulty) * (x - 1) + (3 + difficulty) * (y + 1);
      const choices = mixArray(rand, [answer, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Given x = ${x} and y = ${y}, work out ${expression}.`,
        answer: String(answer),
        choices,
        explanation: `Substitute: ${(2 + difficulty)} × ${x} + ${(3 + difficulty)} × ${y} = ${answer}.`,
        difficulty,
      };
    },
    sequenceArithmetic(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const start = randInt(rand, 2, 12 + difficulty);
      const diff = randInt(rand, 2, 6 + difficulty);
      const term = randInt(rand, 4, 7);
      const nthTerm = start + diff * (term - 1);
      const wrong1 = nthTerm + diff;
      const wrong2 = nthTerm - diff;
      const wrong3 = nthTerm + randInt(rand, 2, 4);
      const choices = mixArray(rand, [nthTerm, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `What is the ${term}th term of the sequence starting ${start}, ${start + diff}, ${start + 2 * diff}, ...?`,
        answer: String(nthTerm),
        choices,
        explanation: `Arithmetic sequence: nth term = start + (n−1)×difference = ${nthTerm}.`,
        difficulty,
      };
    },
    sequenceMissing(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const start = randInt(rand, 2, 8 + difficulty);
      const ratio = randInt(rand, 2, 4);
      const missingIndex = randInt(rand, 2, 4);
      const seq = Array.from({ length: 5 }, (_, i) => start * ratio ** i);
      const answer = seq[missingIndex];
      const wrong1 = answer * ratio;
      const wrong2 = answer / ratio;
      const wrong3 = answer + ratio;
      const choices = mixArray(rand, [answer, wrong1, wrong2, wrong3]).map(String);
      seq[missingIndex] = '□';
      return {
        stem: `Fill the missing term: ${seq.join(', ')}.`,
        answer: String(answer),
        choices,
        explanation: `Multiply by ${ratio} each time. Missing term = ${answer}.`,
        difficulty,
      };
    },
    measuresSpeed(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const speed = randInt(rand, 30, 60 + difficulty * 10);
      const time = randInt(rand, 2, 5 + difficulty);
      const distance = speed * time;
      const wrong1 = speed + time * 2;
      const wrong2 = speed * (time - 1);
      const wrong3 = speed * (time + 1);
      const choices = mixArray(rand, [distance, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `A student cycles at ${speed} km/h for ${time} hours. How far do they travel?`,
        answer: String(distance),
        choices,
        explanation: `Distance = speed × time = ${speed} × ${time} = ${distance} km.`,
        difficulty,
      };
    },
    measuresConversion(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const litres = randInt(rand, 2, 10 + difficulty * 2);
      const ml = litres * 1000 + randInt(rand, 100, 900);
      const answer = ml / 1000;
      const wrong1 = ml * 1000;
      const wrong2 = ml / 100;
      const wrong3 = ml / 10;
      const choices = mixArray(rand, [answer, wrong1, wrong2, wrong3]).map((val) => Number(val).toFixed(2));
      return {
        stem: `Convert ${ml} ml into litres.`,
        answer: answer.toFixed(2),
        choices,
        explanation: `1 litre = 1000 ml. ${ml} ÷ 1000 = ${answer.toFixed(2)} L.`,
        difficulty,
      };
    },
    areaRectangle(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const length = randInt(rand, 6, 15 + difficulty * 3);
      const width = randInt(rand, 4, 12 + difficulty * 2);
      const area = length * width;
      const wrong1 = length + width;
      const wrong2 = length * 2 + width * 2;
      const wrong3 = length * width + randInt(rand, 5, 20);
      const choices = mixArray(rand, [area, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Find the area of a rectangle with length ${length} cm and width ${width} cm.`,
        answer: String(area),
        choices,
        explanation: `Area = length × width = ${length} × ${width} = ${area} cm².`,
        difficulty,
      };
    },
    areaTriangle(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const base = randInt(rand, 6, 18 + difficulty * 2);
      const height = randInt(rand, 4, 12 + difficulty * 2);
      const area = (base * height) / 2;
      const wrong1 = base * height;
      const wrong2 = base + height;
      const wrong3 = (base * height) / 3;
      const choices = mixArray(rand, [area, wrong1, wrong2, wrong3]).map((val) => Number(val).toFixed(1).replace(/\.0$/, ''));
      return {
        stem: `A triangle has base ${base} cm and height ${height} cm. Find its area.`,
        answer: area.toString(),
        choices,
        explanation: `Area = 1/2 × base × height = ${base} × ${height} ÷ 2 = ${area} cm².`,
        difficulty,
      };
    },
    dataMean(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const numbers = Array.from({ length: 5 + difficulty }, () => randInt(rand, 3, 12 + difficulty * 4));
      const total = numbers.reduce((a, b) => a + b, 0);
      const mean = Math.round((total / numbers.length) * 10) / 10;
      const wrong1 = mean + 1;
      const wrong2 = mean - 1;
      const wrong3 = numbers[Math.floor(rand() * numbers.length)];
      const choices = mixArray(rand, [mean, wrong1, wrong2, wrong3]).map((val) => Number(val).toFixed(1).replace(/\.0$/, ''));
      return {
        stem: `Find the mean of the numbers: ${numbers.join(', ')}.`,
        answer: mean.toString(),
        choices,
        explanation: `Add the numbers (${total}) and divide by ${numbers.length} to get ${mean}.`,
        difficulty,
      };
    },
    dataMedian(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const numbers = Array.from({ length: 5 + (difficulty % 2 === 0 ? 1 : 0) }, () => randInt(rand, 2, 20 + difficulty * 5));
      numbers.sort((a, b) => a - b);
      const mid = Math.floor(numbers.length / 2);
      const median = numbers[mid];
      const wrong1 = numbers[mid - 1] || numbers[mid];
      const wrong2 = numbers[mid + 1] || numbers[mid];
      const wrong3 = Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
      const choices = mixArray(rand, [median, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Find the median of the ordered data set: ${numbers.join(', ')}.`,
        answer: String(median),
        choices,
        explanation: `The middle value after ordering is ${median}.`,
        difficulty,
      };
    },
    numberRounding(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const number = randInt(rand, 100, 9999);
      const place = difficulty >= 4 ? 100 : 10;
      const rounded = Math.round(number / place) * place;
      const wrong1 = Math.floor(number / place) * place;
      const wrong2 = Math.ceil(number / place) * place;
      const wrong3 = rounded + place;
      const choices = mixArray(rand, [rounded, wrong1, wrong2, wrong3]).map(String);
      return {
        stem: `Round ${number} to the nearest ${place}.`,
        answer: String(rounded),
        choices,
        explanation: `Look at the ${place === 10 ? 'ones' : 'tens'} digit to round to ${place}.`,
        difficulty,
      };
    },
    decimalPlaceValue(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const number = (randInt(rand, 100, 999) / 10).toFixed(1 + (difficulty > 3 ? 1 : 0));
      const place = difficulty > 3 ? 'hundredths' : 'tenths';
      const digits = number.split('.')[1];
      const digit = digits[difficulty > 3 ? 1 : 0];
      const wrong1 = digits[(difficulty > 3 ? 0 : 1) % digits.length] || '0';
      const wrong2 = String(Number(digit) + 1);
      const wrong3 = String(Math.max(0, Number(digit) - 1));
      const choices = mixArray(rand, [digit, wrong1, wrong2, wrong3]);
      return {
        stem: `In the number ${number}, what digit is in the ${place} place?`,
        answer: digit,
        choices,
        explanation: `The digit ${digit} is in the ${place} place of ${number}.`,
        difficulty,
      };
    },
    moneyChange(seed, { difficulty }) {
      const rand = mulberry32(seed);
      const item = randInt(rand, 150, 999) / 100;
      const paid = Math.ceil(item) + randInt(rand, 1, 5);
      const change = Math.round((paid - item) * 100) / 100;
      const wrong1 = Math.round((paid - Math.ceil(item)) * 100) / 100;
      const wrong2 = Math.round((paid - item - 0.5) * 100) / 100;
      const wrong3 = Math.round((paid - item + 0.5) * 100) / 100;
      const choices = mixArray(rand, [change, wrong1, wrong2, wrong3]).map((val) => val.toFixed(2));
      return {
        stem: `A workbook costs £${item.toFixed(2)}. You pay £${paid.toFixed(2)}. How much change should you get?`,
        answer: change.toFixed(2),
        choices,
        explanation: `Change = amount paid − cost = £${paid.toFixed(2)} − £${item.toFixed(2)} = £${change.toFixed(2)}.`,
        difficulty,
      };
    },
  };

  const mathTopics = {
    'number-arithmetic': ['arithmeticTwoStep', 'arithmeticDivision', 'numberRounding'],
    fractions: ['fractionSimplify', 'fractionAdd'],
    'decimals-percentages': ['percentOf', 'percentChange', 'decimalPlaceValue'],
    'ratio-proportion': ['ratioShare', 'ratioEquivalent'],
    'factors-multiples': ['factorsLcm', 'factorsHcf'],
    algebra: ['algebraSolve', 'algebraSubstitution'],
    sequences: ['sequenceArithmetic', 'sequenceMissing'],
    measures: ['measuresSpeed', 'measuresConversion', 'moneyChange'],
    'area-perimeter': ['areaRectangle', 'areaTriangle'],
    'data-handling': ['dataMean', 'dataMedian'],
  };

  /** Vocabulary word bank (approx 120 entries) **/
  const wordBank = [
    { word: 'abundant', meaning: 'existing in large quantities', pos: 'adj', syn: ['plentiful'], ant: ['scarce'], level: 4 },
    { word: 'adventurous', meaning: 'keen to try new or exciting things', pos: 'adj', syn: ['daring'], ant: ['cautious'], level: 3 },
    { word: 'affable', meaning: 'friendly and easy to talk to', pos: 'adj', syn: ['amiable'], ant: ['rude'], level: 4 },
    { word: 'alleviate', meaning: 'to make a problem less severe', pos: 'verb', syn: ['ease'], ant: ['aggravate'], level: 5 },
    { word: 'amiable', meaning: 'pleasant and friendly', pos: 'adj', syn: ['affable'], ant: ['hostile'], level: 3 },
    { word: 'ambiguous', meaning: 'having more than one meaning', pos: 'adj', syn: ['unclear'], ant: ['obvious'], level: 5 },
    { word: 'antidote', meaning: 'medicine taken to counteract poison', pos: 'noun', syn: ['cure'], ant: ['toxin'], level: 4 },
    { word: 'apprehensive', meaning: 'anxious about the future', pos: 'adj', syn: ['nervous'], ant: ['confident'], level: 4 },
    { word: 'arduous', meaning: 'requiring great effort', pos: 'adj', syn: ['laborious'], ant: ['easy'], level: 5 },
    { word: 'audible', meaning: 'able to be heard', pos: 'adj', syn: ['hearable'], ant: ['silent'], level: 2 },
    { word: 'austere', meaning: 'strict in manner or appearance', pos: 'adj', syn: ['stern'], ant: ['lenient'], level: 5 },
    { word: 'benevolent', meaning: 'well meaning and kindly', pos: 'adj', syn: ['kind'], ant: ['malevolent'], level: 4 },
    { word: 'brisk', meaning: 'active and energetic', pos: 'adj', syn: ['quick'], ant: ['sluggish'], level: 2 },
    { word: 'candid', meaning: 'truthful and straightforward', pos: 'adj', syn: ['frank'], ant: ['guarded'], level: 4 },
    { word: 'canny', meaning: 'shrewd and careful', pos: 'adj', syn: ['astute'], ant: ['reckless'], level: 4 },
    { word: 'captive', meaning: 'kept imprisoned or confined', pos: 'adj', syn: ['imprisoned'], ant: ['free'], level: 3 },
    { word: 'cautious', meaning: 'careful to avoid danger', pos: 'adj', syn: ['wary'], ant: ['reckless'], level: 2 },
    { word: 'coerce', meaning: 'to force someone to do something', pos: 'verb', syn: ['compel'], ant: ['persuade'], level: 4 },
    { word: 'cognizant', meaning: 'aware or informed', pos: 'adj', syn: ['aware'], ant: ['ignorant'], level: 5 },
    { word: 'coincide', meaning: 'occur at or during the same time', pos: 'verb', syn: ['align'], ant: ['differ'], level: 4 },
    { word: 'commend', meaning: 'to praise formally or officially', pos: 'verb', syn: ['applaud'], ant: ['criticise'], level: 3 },
    { word: 'compatible', meaning: 'able to exist together without conflict', pos: 'adj', syn: ['well-suited'], ant: ['incompatible'], level: 3 },
    { word: 'composed', meaning: 'calm and self-controlled', pos: 'adj', syn: ['collected'], ant: ['agitated'], level: 3 },
    { word: 'comprehensive', meaning: 'including all or nearly all elements', pos: 'adj', syn: ['thorough'], ant: ['limited'], level: 5 },
    { word: 'concur', meaning: 'agree with someone', pos: 'verb', syn: ['agree'], ant: ['disagree'], level: 4 },
    { word: 'conspicuous', meaning: 'clearly visible', pos: 'adj', syn: ['noticeable'], ant: ['hidden'], level: 4 },
    { word: 'constructive', meaning: 'serving a useful purpose', pos: 'adj', syn: ['helpful'], ant: ['unhelpful'], level: 3 },
    { word: 'contented', meaning: 'happy and at ease', pos: 'adj', syn: ['satisfied'], ant: ['discontented'], level: 2 },
    { word: 'credible', meaning: 'able to be believed', pos: 'adj', syn: ['believable'], ant: ['dubious'], level: 3 },
    { word: 'cursory', meaning: 'hasty and not thorough', pos: 'adj', syn: ['superficial'], ant: ['careful'], level: 4 },
    { word: 'dainty', meaning: 'delicately small and pretty', pos: 'adj', syn: ['delicate'], ant: ['clumsy'], level: 2 },
    { word: 'dauntless', meaning: 'showing fearlessness', pos: 'adj', syn: ['brave'], ant: ['timid'], level: 4 },
    { word: 'defer', meaning: 'to put off to a later time', pos: 'verb', syn: ['postpone'], ant: ['advance'], level: 4 },
    { word: 'deft', meaning: 'neatly skilful', pos: 'adj', syn: ['nimble'], ant: ['clumsy'], level: 4 },
    { word: 'diligent', meaning: 'showing care in work', pos: 'adj', syn: ['hard-working'], ant: ['lazy'], level: 3 },
    { word: 'diminish', meaning: 'to make or become less', pos: 'verb', syn: ['decrease'], ant: ['increase'], level: 3 },
    { word: 'discreet', meaning: 'careful in speech or actions', pos: 'adj', syn: ['prudent'], ant: ['indiscreet'], level: 4 },
    { word: 'dispel', meaning: 'to drive away doubts or fears', pos: 'verb', syn: ['banish'], ant: ['gather'], level: 4 },
    { word: 'dormant', meaning: 'temporarily inactive', pos: 'adj', syn: ['inactive'], ant: ['active'], level: 4 },
    { word: 'earnest', meaning: 'showing sincere conviction', pos: 'adj', syn: ['serious'], ant: ['frivolous'], level: 3 },
    { word: 'ecstatic', meaning: 'overwhelmingly happy', pos: 'adj', syn: ['overjoyed'], ant: ['miserable'], level: 3 },
    { word: 'elaborate', meaning: 'detailed and complicated', pos: 'adj', syn: ['intricate'], ant: ['simple'], level: 4 },
    { word: 'elate', meaning: 'to make someone ecstatically happy', pos: 'verb', syn: ['delight'], ant: ['sadden'], level: 3 },
    { word: 'eloquent', meaning: 'fluent in speaking or writing', pos: 'adj', syn: ['articulate'], ant: ['inarticulate'], level: 4 },
    { word: 'emphatic', meaning: 'expressed with force', pos: 'adj', syn: ['forceful'], ant: ['hesitant'], level: 3 },
    { word: 'endure', meaning: 'suffer patiently', pos: 'verb', syn: ['tolerate'], ant: ['quit'], level: 2 },
    { word: 'enigmatic', meaning: 'mysterious', pos: 'adj', syn: ['puzzling'], ant: ['clear'], level: 4 },
    { word: 'enthral', meaning: 'capture the fascinated attention of', pos: 'verb', syn: ['captivate'], ant: ['bore'], level: 4 },
    { word: 'essential', meaning: 'absolutely necessary', pos: 'adj', syn: ['vital'], ant: ['optional'], level: 2 },
    { word: 'evaluate', meaning: 'to judge or calculate value', pos: 'verb', syn: ['assess'], ant: ['ignore'], level: 3 },
    { word: 'evoke', meaning: 'bring to mind', pos: 'verb', syn: ['summon'], ant: ['suppress'], level: 4 },
    { word: 'exasperated', meaning: 'intensely irritated', pos: 'adj', syn: ['annoyed'], ant: ['calm'], level: 4 },
    { word: 'exemplary', meaning: 'serving as a desirable model', pos: 'adj', syn: ['model'], ant: ['poor'], level: 4 },
    { word: 'exuberant', meaning: 'filled with lively energy', pos: 'adj', syn: ['joyful'], ant: ['gloomy'], level: 3 },
    { word: 'feasible', meaning: 'possible to do easily', pos: 'adj', syn: ['practical'], ant: ['impossible'], level: 3 },
    { word: 'fervent', meaning: 'having intense passion', pos: 'adj', syn: ['ardent'], ant: ['apathetic'], level: 4 },
    { word: 'flourish', meaning: 'grow or develop successfully', pos: 'verb', syn: ['thrive'], ant: ['wither'], level: 3 },
    { word: 'fortify', meaning: 'strengthen defensively', pos: 'verb', syn: ['strengthen'], ant: ['weaken'], level: 4 },
    { word: 'fragrant', meaning: 'having a pleasant smell', pos: 'adj', syn: ['aromatic'], ant: ['odorous'], level: 2 },
    { word: 'frivolous', meaning: 'not having serious purpose', pos: 'adj', syn: ['silly'], ant: ['serious'], level: 4 },
    { word: 'gallant', meaning: 'brave or heroic', pos: 'adj', syn: ['valiant'], ant: ['cowardly'], level: 3 },
    { word: 'generous', meaning: 'showing a readiness to give', pos: 'adj', syn: ['charitable'], ant: ['mean'], level: 2 },
    { word: 'glean', meaning: 'collect bit by bit', pos: 'verb', syn: ['gather'], ant: ['discard'], level: 4 },
    { word: 'glisten', meaning: 'shine with a sparkling light', pos: 'verb', syn: ['sparkle'], ant: ['dull'], level: 2 },
    { word: 'gratify', meaning: 'give pleasure or satisfaction', pos: 'verb', syn: ['please'], ant: ['disappoint'], level: 3 },
    { word: 'gregarious', meaning: 'fond of company', pos: 'adj', syn: ['sociable'], ant: ['shy'], level: 5 },
    { word: 'grueling', meaning: 'extremely tiring', pos: 'adj', syn: ['exhausting'], ant: ['restful'], level: 4 },
    { word: 'hamper', meaning: 'to hinder or impede', pos: 'verb', syn: ['obstruct'], ant: ['help'], level: 3 },
    { word: 'harmonious', meaning: 'tuneful, forming a pleasing whole', pos: 'adj', syn: ['melodious'], ant: ['discordant'], level: 3 },
    { word: 'heed', meaning: 'pay attention to', pos: 'verb', syn: ['notice'], ant: ['ignore'], level: 3 },
    { word: 'humble', meaning: 'having a modest view of one’s importance', pos: 'adj', syn: ['modest'], ant: ['proud'], level: 2 },
    { word: 'illuminate', meaning: 'light up', pos: 'verb', syn: ['brighten'], ant: ['darken'], level: 3 },
    { word: 'immense', meaning: 'extremely large', pos: 'adj', syn: ['vast'], ant: ['tiny'], level: 3 },
    { word: 'impeccable', meaning: 'in accordance with the highest standards', pos: 'adj', syn: ['perfect'], ant: ['flawed'], level: 4 },
    { word: 'imperative', meaning: 'of vital importance', pos: 'adj', syn: ['crucial'], ant: ['optional'], level: 4 },
    { word: 'improvise', meaning: 'create without preparation', pos: 'verb', syn: ['ad-lib'], ant: ['plan'], level: 3 },
    { word: 'incentive', meaning: 'thing that motivates', pos: 'noun', syn: ['motivation'], ant: ['deterrent'], level: 3 },
    { word: 'inclination', meaning: 'natural tendency to act in a particular way', pos: 'noun', syn: ['tendency'], ant: ['dislike'], level: 4 },
    { word: 'indignant', meaning: 'feeling or showing anger at unfairness', pos: 'adj', syn: ['resentful'], ant: ['pleased'], level: 4 },
    { word: 'industrious', meaning: 'diligent and hard-working', pos: 'adj', syn: ['productive'], ant: ['idle'], level: 4 },
    { word: 'inevitable', meaning: 'certain to happen', pos: 'adj', syn: ['unavoidable'], ant: ['avoidable'], level: 4 },
    { word: 'ingenious', meaning: 'clever, original and inventive', pos: 'adj', syn: ['innovative'], ant: ['unimaginative'], level: 4 },
    { word: 'inquisitive', meaning: 'curious or inquiring', pos: 'adj', syn: ['curious'], ant: ['disinterested'], level: 3 },
    { word: 'insightful', meaning: 'having deep understanding', pos: 'adj', syn: ['perceptive'], ant: ['shallow'], level: 4 },
    { word: 'intrepid', meaning: 'fearless', pos: 'adj', syn: ['bold'], ant: ['timid'], level: 4 },
    { word: 'intricate', meaning: 'very complicated or detailed', pos: 'adj', syn: ['complex'], ant: ['simple'], level: 4 },
    { word: 'intuition', meaning: 'ability to understand instinctively', pos: 'noun', syn: ['instinct'], ant: ['reason'], level: 4 },
    { word: 'jubilant', meaning: 'feeling great happiness', pos: 'adj', syn: ['joyful'], ant: ['sorrowful'], level: 3 },
    { word: 'keen', meaning: 'having eagerness or enthusiasm', pos: 'adj', syn: ['eager'], ant: ['reluctant'], level: 2 },
    { word: 'lament', meaning: 'express grief', pos: 'verb', syn: ['mourn'], ant: ['celebrate'], level: 4 },
    { word: 'lavish', meaning: 'sumptuously rich', pos: 'adj', syn: ['luxurious'], ant: ['meagre'], level: 4 },
    { word: 'lenient', meaning: 'permissive or merciful', pos: 'adj', syn: ['tolerant'], ant: ['strict'], level: 3 },
    { word: 'luminous', meaning: 'giving off light', pos: 'adj', syn: ['radiant'], ant: ['dim'], level: 3 },
    { word: 'meticulous', meaning: 'showing great attention to detail', pos: 'adj', syn: ['careful'], ant: ['careless'], level: 4 },
    { word: 'mirth', meaning: 'amusement or laughter', pos: 'noun', syn: ['glee'], ant: ['sorrow'], level: 4 },
    { word: 'mundane', meaning: 'dull and ordinary', pos: 'adj', syn: ['boring'], ant: ['exciting'], level: 4 },
    { word: 'naive', meaning: 'showing a lack of experience', pos: 'adj', syn: ['innocent'], ant: ['worldly'], level: 3 },
    { word: 'nimble', meaning: 'quick and light in movement', pos: 'adj', syn: ['agile'], ant: ['clumsy'], level: 3 },
    { word: 'notable', meaning: 'worthy of attention', pos: 'adj', syn: ['remarkable'], ant: ['insignificant'], level: 3 },
    { word: 'oblivious', meaning: 'not aware of what is happening', pos: 'adj', syn: ['unaware'], ant: ['aware'], level: 4 },
    { word: 'obsolete', meaning: 'no longer produced or used', pos: 'adj', syn: ['outdated'], ant: ['modern'], level: 4 },
    { word: 'obstinate', meaning: 'stubbornly refusing to change', pos: 'adj', syn: ['stubborn'], ant: ['flexible'], level: 4 },
    { word: 'omission', meaning: 'something left out', pos: 'noun', syn: ['exclusion'], ant: ['inclusion'], level: 3 },
    { word: 'optimistic', meaning: 'hopeful about the future', pos: 'adj', syn: ['positive'], ant: ['pessimistic'], level: 3 },
    { word: 'ornate', meaning: 'elaborately decorated', pos: 'adj', syn: ['decorative'], ant: ['plain'], level: 4 },
    { word: 'palatable', meaning: 'pleasant to taste', pos: 'adj', syn: ['tasty'], ant: ['unpalatable'], level: 3 },
    { word: 'pandemonium', meaning: 'wild and noisy disorder', pos: 'noun', syn: ['chaos'], ant: ['order'], level: 5 },
    { word: 'persevere', meaning: 'continue despite difficulty', pos: 'verb', syn: ['persist'], ant: ['give up'], level: 3 },
    { word: 'placid', meaning: 'calm and peaceful', pos: 'adj', syn: ['tranquil'], ant: ['agitated'], level: 4 },
    { word: 'plight', meaning: 'dangerous or difficult situation', pos: 'noun', syn: ['predicament'], ant: ['solution'], level: 4 },
    { word: 'ponder', meaning: 'think about carefully', pos: 'verb', syn: ['consider'], ant: ['ignore'], level: 3 },
    { word: 'precise', meaning: 'exact and accurate', pos: 'adj', syn: ['exact'], ant: ['vague'], level: 3 },
    { word: 'proficient', meaning: 'skilled at doing something', pos: 'adj', syn: ['adept'], ant: ['inept'], level: 4 },
    { word: 'prosper', meaning: 'succeed financially', pos: 'verb', syn: ['flourish'], ant: ['fail'], level: 3 },
    { word: 'prudent', meaning: 'acting with care for the future', pos: 'adj', syn: ['sensible'], ant: ['reckless'], level: 3 },
    { word: 'quaint', meaning: 'attractively unusual', pos: 'adj', syn: ['charming'], ant: ['modern'], level: 3 },
    { word: 'quell', meaning: 'put an end to', pos: 'verb', syn: ['suppress'], ant: ['encourage'], level: 4 },
    { word: 'quench', meaning: 'satisfy thirst', pos: 'verb', syn: ['satisfy'], ant: ['arouse'], level: 2 },
    { word: 'ravenous', meaning: 'extremely hungry', pos: 'adj', syn: ['starving'], ant: ['full'], level: 3 },
    { word: 'reassure', meaning: 'say or do something to remove doubts', pos: 'verb', syn: ['comfort'], ant: ['alarm'], level: 2 },
    { word: 'rebuke', meaning: 'express sharp disapproval', pos: 'verb', syn: ['reprimand'], ant: ['praise'], level: 4 },
    { word: 'reclusive', meaning: 'avoiding the company of others', pos: 'adj', syn: ['isolated'], ant: ['sociable'], level: 4 },
    { word: 'refined', meaning: 'elegant and cultured', pos: 'adj', syn: ['cultivated'], ant: ['crude'], level: 4 },
    { word: 'reluctant', meaning: 'unwilling and hesitant', pos: 'adj', syn: ['loath'], ant: ['keen'], level: 2 },
    { word: 'remorse', meaning: 'deep regret', pos: 'noun', syn: ['guilt'], ant: ['indifference'], level: 4 },
    { word: 'resilient', meaning: 'able to recover quickly', pos: 'adj', syn: ['tough'], ant: ['fragile'], level: 4 },
    { word: 'resolute', meaning: 'admirably determined', pos: 'adj', syn: ['firm'], ant: ['wavering'], level: 4 },
    { word: 'revere', meaning: 'feel deep respect', pos: 'verb', syn: ['honour'], ant: ['despise'], level: 4 },
    { word: 'robust', meaning: 'strong and healthy', pos: 'adj', syn: ['sturdy'], ant: ['weak'], level: 3 },
    { word: 'scrutinise', meaning: 'examine closely', pos: 'verb', syn: ['inspect'], ant: ['glance'], level: 4 },
    { word: 'serene', meaning: 'calm and untroubled', pos: 'adj', syn: ['peaceful'], ant: ['turbulent'], level: 3 },
    { word: 'sincere', meaning: 'genuine feelings', pos: 'adj', syn: ['honest'], ant: ['insincere'], level: 2 },
    { word: 'skeptical', meaning: 'not easily convinced', pos: 'adj', syn: ['doubtful'], ant: ['convinced'], level: 4 },
    { word: 'sluggish', meaning: 'slow-moving', pos: 'adj', syn: ['lethargic'], ant: ['lively'], level: 2 },
    { word: 'soothe', meaning: 'calm or relieve', pos: 'verb', syn: ['comfort'], ant: ['agitate'], level: 2 },
    { word: 'sporadic', meaning: 'occurring at irregular intervals', pos: 'adj', syn: ['occasional'], ant: ['frequent'], level: 4 },
    { word: 'steadfast', meaning: 'firmly loyal', pos: 'adj', syn: ['loyal'], ant: ['fickle'], level: 3 },
    { word: 'subtle', meaning: 'delicate and not obvious', pos: 'adj', syn: ['understated'], ant: ['blatant'], level: 4 },
    { word: 'succinct', meaning: 'briefly and clearly expressed', pos: 'adj', syn: ['concise'], ant: ['wordy'], level: 4 },
    { word: 'summon', meaning: 'call to appear', pos: 'verb', syn: ['call'], ant: ['dismiss'], level: 3 },
    { word: 'tenacious', meaning: 'tending to keep a firm hold', pos: 'adj', syn: ['persistent'], ant: ['weak'], level: 4 },
    { word: 'tranquil', meaning: 'free from disturbance', pos: 'adj', syn: ['calm'], ant: ['noisy'], level: 3 },
    { word: 'transform', meaning: 'make a thorough change', pos: 'verb', syn: ['convert'], ant: ['preserve'], level: 3 },
    { word: 'undaunted', meaning: 'not discouraged by difficulty', pos: 'adj', syn: ['fearless'], ant: ['afraid'], level: 4 },
    { word: 'unison', meaning: 'simultaneous performance', pos: 'noun', syn: ['harmony'], ant: ['discord'], level: 3 },
    { word: 'upright', meaning: 'strictly honourable', pos: 'adj', syn: ['honest'], ant: ['corrupt'], level: 3 },
    { word: 'venerable', meaning: 'respected due to age or wisdom', pos: 'adj', syn: ['revered'], ant: ['disreputable'], level: 5 },
    { word: 'versatile', meaning: 'able to adapt to many functions', pos: 'adj', syn: ['flexible'], ant: ['limited'], level: 3 },
    { word: 'vex', meaning: 'make someone feel annoyed', pos: 'verb', syn: ['irritate'], ant: ['please'], level: 3 },
    { word: 'vibrant', meaning: 'full of energy and life', pos: 'adj', syn: ['lively'], ant: ['dull'], level: 2 },
    { word: 'vigilant', meaning: 'keeping careful watch', pos: 'adj', syn: ['watchful'], ant: ['careless'], level: 4 },
    { word: 'vindicate', meaning: 'clear of blame', pos: 'verb', syn: ['justify'], ant: ['accuse'], level: 4 },
    { word: 'vivacious', meaning: 'attractively lively', pos: 'adj', syn: ['animated'], ant: ['dull'], level: 4 },
    { word: 'vocation', meaning: 'a person’s employment', pos: 'noun', syn: ['career'], ant: ['avocation'], level: 3 },
    { word: 'wane', meaning: 'decrease gradually', pos: 'verb', syn: ['diminish'], ant: ['wax'], level: 3 },
    { word: 'wary', meaning: 'feeling cautious', pos: 'adj', syn: ['alert'], ant: ['careless'], level: 3 },
    { word: 'whim', meaning: 'sudden wish or idea', pos: 'noun', syn: ['impulse'], ant: ['plan'], level: 3 },
    { word: 'wholesome', meaning: 'conducive to health', pos: 'adj', syn: ['healthy'], ant: ['harmful'], level: 3 },
    { word: 'zealous', meaning: 'showing great energy in pursuit of a cause', pos: 'adj', syn: ['enthusiastic'], ant: ['indifferent'], level: 4 },
    { word: 'zest', meaning: 'great enthusiasm and energy', pos: 'noun', syn: ['gusto'], ant: ['apathy'], level: 3 },
    { word: 'abdicate', meaning: 'renounce the throne', pos: 'verb', syn: ['resign'], ant: ['assume'], level: 5 },
    { word: 'abolish', meaning: 'formally put an end to', pos: 'verb', syn: ['eradicate'], ant: ['establish'], level: 4 },
    { word: 'abscond', meaning: 'leave hurriedly to avoid arrest', pos: 'verb', syn: ['flee'], ant: ['remain'], level: 5 },
    { word: 'acclaim', meaning: 'praise enthusiastically', pos: 'verb', syn: ['celebrate'], ant: ['criticise'], level: 4 },
    { word: 'adept', meaning: 'very skilled', pos: 'adj', syn: ['expert'], ant: ['inept'], level: 3 },
    { word: 'adorn', meaning: 'make more beautiful', pos: 'verb', syn: ['decorate'], ant: ['deface'], level: 3 },
    { word: 'agile', meaning: 'able to move quickly', pos: 'adj', syn: ['nimble'], ant: ['stiff'], level: 2 },
    { word: 'allude', meaning: 'refer indirectly', pos: 'verb', syn: ['hint'], ant: ['state'], level: 4 },
    { word: 'altruistic', meaning: 'showing selfless concern', pos: 'adj', syn: ['selfless'], ant: ['selfish'], level: 4 },
    { word: 'antithesis', meaning: 'the direct opposite', pos: 'noun', syn: ['contrast'], ant: ['similarity'], level: 5 },
    { word: 'ardent', meaning: 'very enthusiastic', pos: 'adj', syn: ['passionate'], ant: ['apathetic'], level: 4 },
    { word: 'astute', meaning: 'having the ability to assess situations', pos: 'adj', syn: ['shrewd'], ant: ['dull'], level: 4 },
    { word: 'boisterous', meaning: 'noisy and energetic', pos: 'adj', syn: ['rowdy'], ant: ['quiet'], level: 3 },
    { word: 'candour', meaning: 'the quality of being open and honest', pos: 'noun', syn: ['frankness'], ant: ['deceit'], level: 4 },
    { word: 'contemplate', meaning: 'look thoughtfully for a long time', pos: 'verb', syn: ['ponder'], ant: ['ignore'], level: 3 },
    { word: 'courteous', meaning: 'polite and respectful', pos: 'adj', syn: ['gracious'], ant: ['rude'], level: 2 },
    { word: 'dazzle', meaning: 'blind temporarily or impress deeply', pos: 'verb', syn: ['impress'], ant: ['bore'], level: 2 },
    { word: 'diligence', meaning: 'careful and persistent work', pos: 'noun', syn: ['industry'], ant: ['laziness'], level: 4 },
    { word: 'discern', meaning: 'recognise or find out', pos: 'verb', syn: ['detect'], ant: ['overlook'], level: 4 },
    { word: 'eloquence', meaning: 'fluent or persuasive speaking', pos: 'noun', syn: ['expression'], ant: ['inarticulacy'], level: 4 },
    { word: 'fathom', meaning: 'understand after much thought', pos: 'verb', syn: ['comprehend'], ant: ['misunderstand'], level: 4 },
    { word: 'frugal', meaning: 'sparing or economical', pos: 'adj', syn: ['thrifty'], ant: ['extravagant'], level: 4 },
    { word: 'hinder', meaning: 'create difficulties resulting in delay', pos: 'verb', syn: ['impede'], ant: ['aid'], level: 3 },
    { word: 'impede', meaning: 'delay or prevent by obstructing', pos: 'verb', syn: ['hinder'], ant: ['facilitate'], level: 4 },
    { word: 'lucid', meaning: 'expressed clearly', pos: 'adj', syn: ['clear'], ant: ['confusing'], level: 3 },
    { word: 'mediate', meaning: 'intervene between people in a dispute', pos: 'verb', syn: ['arbitrate'], ant: ['aggravate'], level: 4 },
    { word: 'ornament', meaning: 'a thing used to adorn', pos: 'noun', syn: ['decoration'], ant: ['disfigurement'], level: 2 },
    { word: 'prospect', meaning: 'the possibility of some future event', pos: 'noun', syn: ['chance'], ant: ['impossibility'], level: 3 },
    { word: 'reconcile', meaning: 'restore friendly relations', pos: 'verb', syn: ['settle'], ant: ['separate'], level: 4 },
    { word: 'renowned', meaning: 'known or talked about by many', pos: 'adj', syn: ['famous'], ant: ['obscure'], level: 3 },
    { word: 'scrupulous', meaning: 'very concerned to avoid wrongdoing', pos: 'adj', syn: ['honest'], ant: ['corrupt'], level: 4 },
    { word: 'tangible', meaning: 'perceptible by touch', pos: 'adj', syn: ['palpable'], ant: ['intangible'], level: 4 },
    { word: 'truncate', meaning: 'shorten by cutting off the top', pos: 'verb', syn: ['shorten'], ant: ['lengthen'], level: 5 },
  ];

  /** Vocabulary templates **/
  const vocabTemplates = {
    synonym(seed, { level }) {
      const rand = mulberry32(seed);
      const candidates = wordBank.filter((w) => w.syn?.length > 0 && w.level <= level + 2);
      const word = candidates[Math.floor(rand() * candidates.length)];
      const correct = word.syn[0];
      const distractors = seededShuffle(
        wordBank.filter((w) => w.pos === word.pos && w.word !== correct && w.word !== word.word),
        rand
      )
        .slice(0, 3)
        .map((w) => w.word);
      const choices = mixArray(rand, [correct, ...distractors]);
      return {
        stem: `Select the synonym of <strong>${word.word}</strong>.`,
        answer: correct,
        choices,
        explanation: `${correct} has a similar meaning to ${word.word} (${word.meaning}).`,
        difficulty: level,
      };
    },
    antonym(seed, { level }) {
      const rand = mulberry32(seed);
      const candidates = wordBank.filter((w) => w.ant?.length > 0 && w.level <= level + 2);
      const word = candidates[Math.floor(rand() * candidates.length)];
      const correct = word.ant[0];
      const distractors = seededShuffle(
        wordBank.filter((w) => w.pos === word.pos && w.word !== correct && w.word !== word.word),
        rand
      )
        .slice(0, 3)
        .map((w) => w.word);
      const choices = mixArray(rand, [correct, ...distractors]);
      return {
        stem: `Choose the antonym of <strong>${word.word}</strong>.`,
        answer: correct,
        choices,
        explanation: `${correct} is the opposite of ${word.word}.`,
        difficulty: level,
      };
    },
    cloze(seed, { level }) {
      const rand = mulberry32(seed);
      const word = wordBank[randInt(rand, 0, wordBank.length - 1)];
      const sentence = `The teacher praised Amir for his <span class="sr-only">blank</span> ____ effort on the project.`;
      const correct = word.word;
      const distractors = seededShuffle(
        wordBank.filter((w) => w.pos === word.pos && w.word !== correct),
        rand
      )
        .slice(0, 3)
        .map((w) => w.word);
      const choices = mixArray(rand, [correct, ...distractors]);
      return {
        stem: `Fill in the blank: ${sentence}`,
        answer: correct,
        choices,
        explanation: `${correct} fits the sentence meaning: ${word.meaning}.`,
        difficulty: level,
      };
    },
    homophone(seed, { level }) {
      const rand = mulberry32(seed);
      const pairs = [
        { words: ['their', 'there'], clue: 'The children forgot ____ books at home.' },
        { words: ['its', "it's"], clue: 'The owl fluffed ___ feathers before flying.' },
        { words: ['allowed', 'aloud'], clue: 'Reading ____ helps improve expression.' },
        { words: ['flour', 'flower'], clue: 'We need more ____ to bake the cake.' },
      ];
      const pair = pairs[randInt(rand, 0, pairs.length - 1)];
      const correct = pair.words[0];
      const choices = mixArray(rand, [...pair.words, 'their', "they're"]);
      return {
        stem: pair.clue,
        answer: correct,
        choices,
        explanation: `Use ${correct} in this context.`,
        difficulty: level,
      };
    },
    prefix(seed, { level }) {
      const rand = mulberry32(seed);
      const prefixes = [
        { base: 'regular', prefix: 'ir', result: 'irregular', meaning: 'not regular' },
        { base: 'possible', prefix: 'im', result: 'impossible', meaning: 'not possible' },
        { base: 'behave', prefix: 'mis', result: 'misbehave', meaning: 'behave badly' },
        { base: 'legal', prefix: 'il', result: 'illegal', meaning: 'against the law' },
      ];
      const pick = prefixes[randInt(rand, 0, prefixes.length - 1)];
      const choices = mixArray(rand, [pick.prefix, 're', 'un', 'pre']);
      return {
        stem: `Which prefix makes the word “${pick.base}” mean “${pick.meaning}”?`,
        answer: pick.prefix,
        choices,
        explanation: `${pick.prefix}${pick.base} = ${pick.result}, meaning ${pick.meaning}.`,
        difficulty: level,
      };
    },
    spelling(seed, { level }) {
      const rand = mulberry32(seed);
      const words = [
        { correct: 'accommodate', wrong: 'accomodate' },
        { correct: 'embarrass', wrong: 'embarass' },
        { correct: 'necessary', wrong: 'neccessary' },
        { correct: 'possession', wrong: 'possesion' },
      ];
      const pick = words[randInt(rand, 0, words.length - 1)];
      const choices = mixArray(rand, [pick.correct, pick.wrong, 'necesary', 'acommdate']);
      return {
        stem: 'Choose the correctly spelt word.',
        answer: pick.correct,
        choices,
        explanation: `${pick.correct} is the correct UK spelling.`,
        difficulty: level,
      };
    },
    analogy(seed, { level }) {
      const rand = mulberry32(seed);
      const pairs = [
        { base: ['pupil', 'school'], answer: 'patient', match: 'hospital' },
        { base: ['author', 'book'], answer: 'chef', match: 'meal' },
        { base: ['bee', 'hive'], answer: 'bird', match: 'nest' },
        { base: ['teacher', 'classroom'], answer: 'doctor', match: 'surgery' },
      ];
      const pick = pairs[randInt(rand, 0, pairs.length - 1)];
      const correct = pick.answer;
      const distractors = mixArray(rand, ['artist', 'driver', 'pilot']);
      const choices = mixArray(rand, [correct, ...distractors]);
      return {
        stem: `${pick.base[0]} is to ${pick.base[1]} as ____ is to ${pick.match}.`,
        answer: correct,
        choices,
        explanation: `${pick.base[0]} works in/with a ${pick.base[1]}, just as ${correct} works in/with a ${pick.match}.`,
        difficulty: level,
      };
    },
    oddOneOut(seed, { level }) {
      const rand = mulberry32(seed);
      const groups = [
        { words: ['triangle', 'square', 'circle', 'banana'], answer: 'banana' },
        { words: ['whisper', 'shout', 'yell', 'bellow'], answer: 'whisper' },
        { words: ['rapid', 'swift', 'speedy', 'sluggish'], answer: 'sluggish' },
        { words: ['glee', 'joy', 'delight', 'sorrow'], answer: 'sorrow' },
      ];
      const pick = groups[randInt(rand, 0, groups.length - 1)];
      const choices = mixArray(rand, pick.words);
      return {
        stem: 'Which word is the odd one out?',
        answer: pick.answer,
        choices,
        explanation: `${pick.answer} does not belong with the others based on meaning.`,
        difficulty: level,
      };
    },
  };

  const vocabTopics = {
    synonyms: ['synonym'],
    antonyms: ['antonym'],
    cloze: ['cloze'],
    homophones: ['homophone'],
    'prefix-suffix': ['prefix'],
    spelling: ['spelling'],
    analogies: ['analogy'],
    'odd-one-out': ['oddOneOut'],
  };

  const badgeConditions = {
    firstSet: (history) => history.totalSets >= 1,
    perfectScore: (history) => history.bestScore >= 100,
  };

  const defaultState = () => ({
    quiz: null,
    flashcards: null,
    badges: new Set(),
    history: { totalSets: 0, bestScore: 0 },
  });

  const state = defaultState();

  const shuffleTemplates = (templates, rand) => {
    const pool = templates.map((key) => ({ key, rand: rand() }));
    return pool.sort((a, b) => a.rand - b.rand).map((item) => item.key);
  };

  const buildMathQuestion = (topicKey, seed, opts) => {
    const templateKeys = mathTopics[topicKey] || Object.values(mathTopics).flat();
    const rand = mulberry32(seed);
    const templateName = shuffleTemplates(templateKeys, rand)[0];
    const template = mathTemplates[templateName];
    return template(seed, opts);
  };

  const buildVocabQuestion = (topicKey, seed, opts) => {
    const templateKeys = vocabTopics[topicKey] || Object.values(vocabTopics).flat();
    const rand = mulberry32(seed);
    const templateName = shuffleTemplates(templateKeys, rand)[0];
    const template = vocabTemplates[templateName];
    return template(seed, opts);
  };

  const generateQuizSet = ({ type, topic, difficulty, count, seed }) => {
    const rand = mulberry32(seed);
    const questions = [];
    for (let i = 0; i < count; i++) {
      const questionSeed = Math.floor(rand() * 1_000_000) + i;
      let item;
      if (type === 'maths') {
        item = buildMathQuestion(topic, questionSeed, { difficulty });
      } else {
        item = buildVocabQuestion(topic, questionSeed, { level: difficulty });
      }
      item.id = `${type}-${topic}-${i}-${questionSeed}`;
      item.index = i;
      item.type = type;
      item.difficulty = difficulty;
      questions.push(item);
    }
    return {
      type,
      topic,
      difficulty,
      seed,
      questions,
      answers: {},
      feedback: {},
      currentIndex: 0,
      completed: false,
      score: 0,
    };
  };

  const scoreQuiz = (quiz) => {
    const total = quiz.questions.length;
    let correct = 0;
    quiz.questions.forEach((question) => {
      if (quiz.answers[question.id] === question.answer) correct += 1;
    });
    const percentage = Math.round((correct / total) * 100);
    quiz.score = percentage;
    quiz.completed = true;
    return quiz;
  };

  const startQuiz = (config) => {
    state.quiz = generateQuizSet(config);
    renderQuiz();
  };

  const answerQuestion = (questionId, choice) => {
    if (!state.quiz) return;
    state.quiz.answers[questionId] = choice;
    const question = state.quiz.questions.find((q) => q.id === questionId);
    const isCorrect = choice === question.answer;
    state.quiz.feedback[questionId] = {
      isCorrect,
      selected: choice,
    };
    if (question.index < state.quiz.questions.length - 1) {
      state.quiz.currentIndex = question.index + 1;
    }
    renderQuiz();
  };

  const finishQuiz = () => {
    if (!state.quiz) return;
    scoreQuiz(state.quiz);
    state.history.totalSets += 1;
    state.history.bestScore = Math.max(state.history.bestScore, state.quiz.score);
    updateBadges();
    renderQuiz();
  };

  const resetQuiz = () => {
    state.quiz = null;
    renderQuiz();
  };

  const updateBadges = () => {
    Object.entries(badgeConditions).forEach(([badge, fn]) => {
      if (fn(state.history)) {
        state.badges.add(badge);
      }
    });
  };

  const flashcardQueue = () => {
    const rand = mulberry32(createSeed('flashcards'));
    return mixArray(rand, wordBank.filter((w) => w.level <= 5)).slice(0, 30);
  };

  const startFlashcards = () => {
    state.flashcards = {
      queue: flashcardQueue(),
      currentIndex: 0,
      flipped: false,
      streak: 0,
    };
    renderFlashcards();
  };

  const flipFlashcard = () => {
    if (!state.flashcards) return;
    state.flashcards.flipped = !state.flashcards.flipped;
    renderFlashcards();
  };

  const rateFlashcard = (rating) => {
    if (!state.flashcards) return;
    const { queue, currentIndex } = state.flashcards;
    if (rating === 'again') {
      const card = queue[currentIndex];
      queue.push(card);
    } else if (rating === 'easy') {
      state.flashcards.streak += 1;
    }
    queue.splice(currentIndex, 1);
    if (!queue.length) {
      state.flashcards.completed = true;
    } else {
      state.flashcards.currentIndex = currentIndex % queue.length;
      state.flashcards.flipped = false;
    }
    renderFlashcards();
  };

  const timer = {
    interval: null,
    startTime: null,
    duration: 0,
    element: null,
  };

  const startTimer = (seconds, element) => {
    clearInterval(timer.interval);
    timer.startTime = Date.now();
    timer.duration = seconds * 1000;
    timer.element = element;
    const tick = () => {
      const elapsed = Date.now() - timer.startTime;
      const remaining = Math.max(0, timer.duration - elapsed);
      updateTimerDisplay(remaining / 1000);
      if (remaining <= 0) {
        clearInterval(timer.interval);
        finishQuiz();
      }
    };
    timer.interval = setInterval(tick, 1000);
    tick();
  };

  const stopTimer = () => {
    clearInterval(timer.interval);
    timer.interval = null;
  };

  const updateTimerDisplay = (seconds) => {
    if (!timer.element) return;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    timer.element.textContent = `${mins}:${secs}`;
  };

  const quizContainer = doc.querySelector('[data-quiz-container]');
  const quizStartForm = doc.querySelector('[data-quiz-form]');
  const quizSummary = doc.querySelector('[data-quiz-summary]');
  const timerDisplay = doc.querySelector('[data-timer]');
  const badgeList = doc.querySelector('[data-badge-list]');
  const flashcardContainer = doc.querySelector('[data-flashcards]');
  const flashcardWord = doc.querySelector('[data-flashcard-word]');
  const flashcardMeaning = doc.querySelector('[data-flashcard-meaning]');
  const flashcardButtons = doc.querySelectorAll('[data-flashcard-action]');
  const quickPracticeContainer = doc.querySelector('[data-quick-practice-container]');

  const renderBadges = () => {
    if (!badgeList) return;
    badgeList.innerHTML = '';
    const badges = Array.from(state.badges);
    if (!badges.length) {
      const li = doc.createElement('li');
      li.textContent = 'Complete a practice set to unlock badges!';
      badgeList.appendChild(li);
      return;
    }
    badges.forEach((badge) => {
      const li = doc.createElement('li');
      li.className = 'badge';
      li.textContent = badge === 'firstSet' ? 'Completed first set' : 'Perfect 5/5';
      badgeList.appendChild(li);
    });
  };

  const renderQuestion = (question) => {
    const container = doc.createElement('div');
    container.className = 'question-card';
    const stem = doc.createElement('p');
    stem.innerHTML = question.stem;
    container.appendChild(stem);
    const options = doc.createElement('div');
    options.className = 'answer-options';
    question.choices.forEach((choice) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.textContent = choice;
      button.dataset.choice = choice;
      button.className = 'btn-option';
      button.addEventListener('click', () => answerQuestion(question.id, choice));
      const feedback = state.quiz.feedback[question.id];
      if (feedback) {
        button.disabled = true;
        if (choice === question.answer) {
          button.classList.add('correct');
        }
        if (choice === feedback.selected && !feedback.isCorrect) {
          button.classList.add('incorrect');
        }
      }
      options.appendChild(button);
    });
    container.appendChild(options);
    if (state.quiz.feedback[question.id]) {
      const feedback = doc.createElement('div');
      feedback.className = 'feedback';
      feedback.textContent = state.quiz.feedback[question.id].isCorrect
        ? 'Correct!'
        : `Not quite. ${question.explanation}`;
      const explanation = doc.createElement('p');
      explanation.textContent = question.explanation;
      container.appendChild(feedback);
      container.appendChild(explanation);
    }
    return container;
  };

  const renderQuiz = () => {
    if (!quizContainer) return;
    quizContainer.innerHTML = '';
    renderBadges();

    if (!state.quiz) {
      quizSummary?.classList.add('visually-hidden');
      return;
    }

    const { quiz } = state;
    if (!quiz.completed) {
      const question = quiz.questions[quiz.currentIndex];
      quizContainer.appendChild(renderQuestion(question));
      const progress = doc.createElement('p');
      progress.textContent = `Question ${quiz.currentIndex + 1} of ${quiz.questions.length}`;
      quizContainer.appendChild(progress);
      const actions = doc.createElement('div');
      actions.className = 'flex';
      const skip = doc.createElement('button');
      skip.className = 'btn btn-outline';
      skip.textContent = 'Skip question';
      skip.addEventListener('click', () => {
        quiz.currentIndex = (quiz.currentIndex + 1) % quiz.questions.length;
        renderQuiz();
      });
      actions.appendChild(skip);
      const finishBtn = doc.createElement('button');
      finishBtn.className = 'btn';
      finishBtn.textContent = 'Finish set';
      finishBtn.addEventListener('click', finishQuiz);
      actions.appendChild(finishBtn);
      quizContainer.appendChild(actions);
    } else {
      quizSummary?.classList.remove('visually-hidden');
      quizSummary.querySelector('[data-summary-score]').textContent = `${quiz.score}%`;
      quizSummary.querySelector('[data-summary-message]').textContent =
        quiz.score === 100
          ? 'Amazing accuracy! Keep stretching the challenge.'
          : quiz.score >= 60
          ? 'Steady progress. Revisit questions you missed and try again.'
          : 'Focus on the explanations to strengthen your foundations.';
      quizSummary.querySelector('[data-summary-topic]').textContent = quiz.topic.replace('-', ' ');
      quizSummary.querySelector('[data-summary-difficulty]').textContent = `Difficulty ${quiz.difficulty}`;
      quizSummary.querySelector('[data-summary-restart]').addEventListener('click', () => {
        resetQuiz();
      });
    }
  };

  const renderFlashcards = () => {
    if (!flashcardContainer || !state.flashcards) return;
    const card = state.flashcards.queue[state.flashcards.currentIndex];
    flashcardContainer.classList.toggle('flipped', state.flashcards.flipped);
    flashcardWord.textContent = card.word;
    flashcardMeaning.textContent = `${card.meaning} (${card.pos})`;
    const counter = doc.querySelector('[data-flashcard-counter]');
    counter.textContent = `${state.flashcards.queue.length} cards left`;
    const streak = doc.querySelector('[data-flashcard-streak]');
    streak.textContent = `Streak: ${state.flashcards.streak}`;
    if (state.flashcards.completed) {
      flashcardContainer.querySelector('.flashcard-inner').textContent = 'Great job! Deck complete.';
    }
  };

  quizStartForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quizStartForm);
    const type = formData.get('demo-type');
    const topic = formData.get('demo-topic');
    const difficulty = Number(formData.get('demo-difficulty'));
    const seed = createSeed(`${type}-${topic}-${difficulty}-${Date.now()}`);
    const config = { type, topic, difficulty, count: 5, seed };
    startQuiz(config);
    if (type === 'mini-mock') {
      const mathsCount = Math.round(config.count * 0.7);
      const vocabCount = config.count - mathsCount;
      const combined = [];
      for (let i = 0; i < mathsCount; i++) {
        combined.push(buildMathQuestion('number-arithmetic', createSeed(`mini-maths-${i}`), { difficulty }));
      }
      for (let i = 0; i < vocabCount; i++) {
        combined.push(buildVocabQuestion('synonyms', createSeed(`mini-vocab-${i}`), { level: difficulty }));
      }
      const rand = mulberry32(seed);
      state.quiz.questions = mixArray(rand, combined);
      state.quiz.questions.forEach((q, index) => (q.index = index));
      startTimer(5 * 60, timerDisplay);
    } else {
      stopTimer();
      timerDisplay.textContent = '—';
    }
    renderQuiz();
  });

  flashcardButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.flashcardAction;
      if (action === 'flip') {
        flipFlashcard();
      } else {
        rateFlashcard(action);
      }
    });
  });

  doc.querySelector('[data-start-flashcards]')?.addEventListener('click', () => {
    startFlashcards();
  });

  doc.querySelector('[data-reset-quiz]')?.addEventListener('click', () => {
    resetQuiz();
  });

  doc.querySelectorAll('[data-demo-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const topic = link.dataset.demoTopic || 'number-arithmetic';
      const type = link.dataset.demoType || 'maths';
      quizStartForm.querySelector(`[value="${type}"]`).checked = true;
      const topicSelect = quizStartForm.querySelector('[name="demo-topic"]');
      topicSelect.value = topic;
      startQuiz({ type, topic, difficulty: 2, count: 5, seed: createSeed(`quick-${type}-${topic}`) });
      quickPracticeContainer?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  if (quizStartForm && quizStartForm.dataset.autoStart === 'true') {
    const formData = new FormData(quizStartForm);
    const type = formData.get('demo-type');
    const topic = formData.get('demo-topic');
    const difficulty = Number(formData.get('demo-difficulty'));
    startQuiz({ type, topic, difficulty, count: 5, seed: createSeed('auto-start') });
  }
})();
