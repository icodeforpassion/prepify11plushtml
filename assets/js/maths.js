(function () {
  const doc = document;

  const init = () => {
    const grid = doc.querySelector('[data-maths-grid]');
    const questionText = doc.querySelector('[data-question-text]');
    const optionList = doc.querySelector('[data-option-list]');
    const feedback = doc.querySelector('[data-feedback]');
    const nextButton = doc.querySelector('[data-next-question]');
    const activeCategoryLabel = doc.querySelector('[data-active-category]');
    const answeredCount = doc.querySelector('[data-answered-count]');
    const correctCount = doc.querySelector('[data-correct-count]');
    const accuracyLabel = doc.querySelector('[data-accuracy]');
    const progressFill = doc.querySelector('[data-progress-fill]');
    const resetButton = doc.querySelector('[data-reset-mission]');
    const engine = doc.getElementById('maths-engine');

    if (!grid || !questionText || !optionList || !nextButton) {
      return;
    }

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = (array) => array[rand(0, array.length - 1)];

  const buildOptions = (correct, generator) => {
    const options = new Set([correct]);
    while (options.size < 4) {
      const value = generator();
      if (value !== correct) options.add(value);
    }
    return shuffleArray([...options]);
  };

  const shuffleArray = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  const categories = [
    {
      id: 'arithmetic',
      title: 'Arithmetic Basics',
      description: 'Multi-step addition, subtraction, multiplication, and division missions with worded prompts.',
      generators: [
        () => {
          const a = rand(24, 96);
          const b = rand(12, 58);
          const question = `Layla adds ${a} stickers to her album and then finds ${b} more in her desk. How many stickers does she have altogether now?`;
          const answer = a + b;
          const options = buildOptions(answer, () => answer + rand(-15, 15));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Add the two amounts: ${a} + ${b} = ${answer} stickers.`,
          };
        },
        () => {
          let total = rand(60, 140);
          let used = rand(15, 55);
          if (used > total) [total, used] = [used, total];
          const question = `A school library owns ${total} story books. They lend out ${used} books for the weekend. How many remain on the shelves?`;
          const answer = total - used;
          const options = buildOptions(answer, () => answer + rand(-18, 18));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Subtract the borrowed books: ${total} - ${used} = ${answer}.`,
          };
        },
        () => {
          const groups = rand(3, 9);
          const each = rand(4, 12);
          const question = `An exercise class has ${groups} equal groups with ${each} pupils in each warm-up circle. How many pupils take part altogether?`;
          const answer = groups * each;
          const options = buildOptions(answer, () => answer + rand(-24, 24));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Multiply the number of groups by pupils in each: ${groups} × ${each} = ${answer}.`,
          };
        },
      ],
    },
    {
      id: 'bodmas',
      title: 'Operations & BODMAS',
      description: 'Tackle order-of-operations puzzles with nested brackets and combined operations.',
      generators: [
        () => {
          const a = rand(3, 8);
          const b = rand(4, 9);
          const c = rand(2, 7);
          const expression = `${a} × (${b} + ${c}) - ${c}`;
          const answer = a * (b + c) - c;
          const options = buildOptions(answer, () => answer + rand(-14, 14));
          return {
            question: `Work out ${expression}. Remember to follow the BODMAS order carefully.`,
            options,
            answer: String(answer),
            explanation: `First add the bracket (${b} + ${c} = ${b + c}), multiply by ${a} to get ${a * (b + c)}, then subtract ${c}.`,
          };
        },
        () => {
          const a = rand(12, 30);
          const b = rand(2, 6);
          const c = rand(2, 9);
          const d = rand(2, 8);
          const expression = `${a} ÷ ${b} + ${c} × ${d}`;
          const answer = Math.floor(a / b) + c * d;
          const options = buildOptions(answer, () => answer + rand(-12, 12));
          return {
            question: `Evaluate ${expression}. Which operations must be done first?`,
            options,
            answer: String(answer),
            explanation: `Division and multiplication go before addition: (${a} ÷ ${b} = ${Math.floor(a / b)}), (${c} × ${d} = ${c * d}), then add to get ${answer}.`,
          };
        },
        () => {
          const a = rand(2, 9);
          const b = rand(2, 5);
          const c = rand(3, 11);
          const d = rand(2, 8);
          const expression = `${a} + [${b} × (${c} - ${d})]`;
          const answer = a + b * (c - d);
          const options = buildOptions(answer, () => answer + rand(-10, 10));
          return {
            question: `Calculate ${expression}.`,
            options,
            answer: String(answer),
            explanation: `Inner bracket first (${c} - ${d} = ${c - d}), multiply by ${b} to get ${b * (c - d)}, then add ${a}.`,
          };
        },
      ],
    },
    {
      id: 'fractions',
      title: 'Fractions',
      description: 'Add, subtract, compare, and find fractions of amounts with full working hints.',
      generators: [
        () => {
          const denominator = choice([4, 5, 6, 8, 10, 12]);
          const numerator1 = rand(1, denominator - 1);
          const numerator2 = rand(1, denominator - 1);
          const sum = numerator1 + numerator2;
          const question = `Add the fractions ${numerator1}/${denominator} and ${numerator2}/${denominator}. Give your answer as a simplified fraction if possible.`;
          const answer = `${sum}/${denominator}`;
          const options = buildOptions(answer, () => `${sum + rand(-3, 3)}/${denominator}`);
          return {
            question,
            options,
            answer,
            explanation: `Denominators match, so add the numerators: ${numerator1} + ${numerator2} = ${sum}.`,
          };
        },
        () => {
          const whole = rand(12, 36);
          const denominator = choice([3, 4, 5, 6, 8]);
          const numerator = rand(1, denominator - 1);
          const question = `What is ${numerator}/${denominator} of ${whole}? Think about dividing the total into ${denominator} equal parts first.`;
          const answer = (whole * numerator) / denominator;
          const options = buildOptions(answer, () => answer + rand(-6, 6));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Divide ${whole} by ${denominator} then multiply by ${numerator}: (${whole} ÷ ${denominator}) × ${numerator} = ${answer}.`,
          };
        },
        () => {
          const denominator = choice([6, 8, 10, 12]);
          const numerator1 = rand(1, denominator - 1);
          const numerator2 = rand(1, numerator1 - 1);
          const question = `Subtract ${numerator2}/${denominator} from ${numerator1}/${denominator}.`;
          const answer = `${numerator1 - numerator2}/${denominator}`;
          const options = buildOptions(answer, () => `${Math.max(0, numerator1 - numerator2 + rand(-3, 3))}/${denominator}`);
          return {
            question,
            options,
            answer,
            explanation: `Keep the denominator and subtract the numerators: ${numerator1} - ${numerator2} = ${numerator1 - numerator2}.`,
          };
        },
      ],
    },
    {
      id: 'decimals',
      title: 'Decimals',
      description: 'Combine decimal numbers in real-life contexts with one- and two-step reasoning.',
      generators: [
        () => {
          const a = (rand(120, 480) / 10).toFixed(1);
          const b = (rand(40, 200) / 10).toFixed(1);
          const question = `A jogger runs ${a} km in the morning and ${b} km in the evening. What total distance do they cover?`;
          const answer = (parseFloat(a) + parseFloat(b)).toFixed(1);
          const options = buildOptions(answer, () => (parseFloat(answer) + rand(-9, 9) / 10).toFixed(1));
          return {
            question,
            options,
            answer,
            explanation: `Add the distances: ${a} + ${b} = ${answer} km.`,
          };
        },
        () => {
          const price = (rand(150, 450) / 10).toFixed(2);
          const discount = (rand(30, 120) / 10).toFixed(2);
          const question = `A science kit costs £${price}. It is reduced by £${discount} in a sale. What is the new price?`;
          const answer = (parseFloat(price) - parseFloat(discount)).toFixed(2);
          const options = buildOptions(answer, () => (parseFloat(answer) + rand(-15, 15) / 100).toFixed(2));
          return {
            question,
            options,
            answer,
            explanation: `Subtract the discount: £${price} - £${discount} = £${answer}.`,
          };
        },
        () => {
          const unit = (rand(10, 35) / 10).toFixed(1);
          const quantity = rand(3, 9);
          const question = `A recipe needs ${quantity} cups of juice, each measuring ${unit} litres. How many litres are used altogether?`;
          const answer = (quantity * parseFloat(unit)).toFixed(1);
          const options = buildOptions(answer, () => (parseFloat(answer) + rand(-8, 8) / 10).toFixed(1));
          return {
            question,
            options,
            answer,
            explanation: `Multiply the number of cups by the measure of each cup: ${quantity} × ${unit} = ${answer} litres.`,
          };
        },
      ],
    },
    {
      id: 'percentages',
      title: 'Percentages',
      description: 'Find percentages, percentage increases, and decreases from real scenarios.',
      generators: [
        () => {
          const base = rand(40, 320);
          const percent = choice([10, 12, 15, 20, 25, 30, 35, 40, 50]);
          const question = `What is ${percent}% of ${base}? Explain the percentage operation you use.`;
          const answer = Math.round((base * percent) / 100);
          const options = buildOptions(answer, () => answer + rand(-18, 18));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `${percent}% is ${percent}/100 of ${base}. Multiply ${base} by ${percent} and divide by 100 to reach ${answer}.`,
          };
        },
        () => {
          const price = rand(45, 180);
          const percent = choice([5, 10, 15, 20, 25]);
          const increase = Math.round((price * percent) / 100);
          const question = `A board game costing £${price} increases in price by ${percent}%. What is the new price?`;
          const answer = price + increase;
          const options = buildOptions(answer, () => answer + rand(-20, 20));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Find ${percent}% of £${price} (= £${increase}) then add it to get £${answer}.`,
          };
        },
        () => {
          const population = rand(120, 480);
          const percent = choice([10, 15, 25, 30]);
          const decrease = Math.round((population * percent) / 100);
          const question = `A club loses ${percent}% of its ${population} members over winter. How many members remain?`;
          const answer = population - decrease;
          const options = buildOptions(answer, () => answer + rand(-20, 20));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Calculate ${percent}% of ${population} (= ${decrease}) and subtract from the original: ${population} - ${decrease} = ${answer}.`,
          };
        },
      ],
    },
    {
      id: 'ratio',
      title: 'Ratio & Proportion',
      description: 'Share amounts and compare values using simplified ratios.',
      generators: [
        () => {
          const base = rand(2, 9);
          const ratioA = base * rand(2, 5);
          const ratioB = base * rand(2, 6);
          const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
          const factor = gcd(ratioA, ratioB);
          const answer = `${ratioA / factor}:${ratioB / factor}`;
          const options = buildOptions(answer, () => `${Math.max(1, ratioA / factor + rand(-2, 2))}:${Math.max(1, ratioB / factor + rand(-2, 2))}`);
          return {
            question: `Simplify the ratio ${ratioA}:${ratioB}.`,
            options,
            answer,
            explanation: `Divide both parts by ${factor} to get ${answer}.`,
          };
        },
        () => {
          const share = rand(24, 72);
          const parts = [rand(1, 4), rand(1, 4), rand(1, 4)];
          const totalParts = parts.reduce((sum, value) => sum + value, 0);
          const chosen = choice(parts);
          const answer = Math.round((share / totalParts) * chosen);
          const question = `Three friends share £${share} in the ratio ${parts.join(':')}. How much money does the friend with ${chosen} parts receive?`;
          const options = buildOptions(answer, () => answer + rand(-10, 10));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `One part is £${(share / totalParts).toFixed(2)}. Multiply by ${chosen} parts for £${answer}.`,
          };
        },
        () => {
          const recipeFor = choice([2, 4, 5]);
          const flour = recipeFor * rand(80, 140);
          const serves = rand(6, 12);
          const question = `A recipe for ${recipeFor} people uses ${flour} g of flour. How much flour is needed for ${serves} people if the recipe scales proportionally?`;
          const answer = Math.round((flour / recipeFor) * serves);
          const options = buildOptions(answer, () => answer + rand(-30, 30));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Find the flour for one person (${flour} ÷ ${recipeFor}) then multiply by ${serves}.`,
          };
        },
      ],
    },
    {
      id: 'factors',
      title: 'Factors & Multiples',
      description: 'Dig into highest common factors, lowest common multiples, and divisibility.',
      generators: [
        () => {
          const a = rand(6, 18);
          const b = rand(6, 18);
          const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
          const hcf = gcd(a, b);
          const options = buildOptions(hcf, () => hcf + rand(-6, 6));
          return {
            question: `Find the highest common factor of ${a} and ${b}.`,
            options,
            answer: String(hcf),
            explanation: `List the factors or use Euclid's algorithm to discover ${hcf}.`,
          };
        },
        () => {
          const a = rand(4, 12);
          const b = rand(4, 10);
          const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
          const lcm = (x, y) => (x * y) / gcd(x, y);
          const answer = lcm(a, b);
          const options = buildOptions(answer, () => answer + rand(-12, 12));
          return {
            question: `What is the lowest common multiple of ${a} and ${b}?`,
            options,
            answer: String(answer),
            explanation: `Multiply ${a} and ${b} then divide by their HCF to find ${answer}.`,
          };
        },
        () => {
          const base = rand(30, 80);
          const multiple = choice([2, 3, 4, 5]);
          const question = `Is ${base * multiple} a multiple of ${base}? Choose the best explanation.`;
          const answer = 'Yes';
          const options = shuffleArray(['Yes', 'No', `${base * multiple - 1}`, `${base * multiple + 1}`]);
          return {
            question,
            options,
            answer,
            explanation: `${base * multiple} is ${multiple} × ${base}, so it is a multiple of ${base}.`,
          };
        },
      ],
    },
    {
      id: 'negative',
      title: 'Negative Numbers',
      description: 'Calculate with directed numbers on number lines and in real contexts.',
      generators: [
        () => {
          const a = rand(-12, 12);
          const b = rand(-9, 9);
          const question = `Temperature changes by ${b >= 0 ? '+' : ''}${b}°C from an initial ${a}°C. What is the final temperature?`;
          const answer = a + b;
          const options = buildOptions(answer, () => answer + rand(-6, 6));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Add the change to the starting temperature: ${a} + (${b}) = ${answer}.`,
          };
        },
        () => {
          const depth = rand(2, 9);
          const rise = rand(1, 6);
          const question = `A submarine is ${-depth * 10} m below sea level. It rises ${rise * 10} m. Where is it now (positive for above sea level)?`;
          const answer = -depth * 10 + rise * 10;
          const options = buildOptions(answer, () => answer + rand(-40, 40));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Combine signed distances: ${-depth * 10} + ${rise * 10} = ${answer} m.`,
          };
        },
        () => {
          const a = rand(-10, 10);
          const b = rand(-8, 8);
          const question = `Evaluate ${a} × ${b}.`;
          const answer = a * b;
          const options = buildOptions(answer, () => answer + rand(-20, 20));
          return {
            question,
            options,
            answer: String(answer),
            explanation: `Multiplying signed numbers: same signs give positive, different signs give negative.`,
          };
        },
      ],
    },
    {
      id: 'algebra',
      title: 'Algebra Basics',
      description: 'Solve equations, balance scales, and substitute values into expressions.',
      generators: [
        () => {
          const x = rand(2, 12);
          const a = rand(2, 9);
          const b = rand(1, 10);
          const result = a * x + b;
          const options = buildOptions(x, () => x + rand(-4, 4));
          return {
            question: `Solve for x: ${a}x + ${b} = ${result}.`,
            options: options.map(String),
            answer: String(x),
            explanation: `Subtract ${b} then divide by ${a}: (${result} - ${b}) ÷ ${a} = ${x}.`,
          };
        },
        () => {
          const value = rand(2, 9);
          const multiplier = rand(2, 6);
          const expression = `${value}² + ${multiplier} × ${value}`;
          const squared = value * value;
          const answer = squared + multiplier * value;
          const options = buildOptions(answer, () => answer + rand(-12, 12));
          return {
            question: `Evaluate the expression ${expression}.`,
            options,
            answer: String(answer),
            explanation: `${value}² = ${squared} and ${multiplier} × ${value} = ${multiplier * value}. Add to get ${answer}.`,
          };
        },
        () => {
          const answer = rand(2, 12);
          const xCoeff = rand(2, 6);
          const constant = rand(2, 12);
          const result = xCoeff * answer + constant;
          const options = buildOptions(answer, () => answer + rand(-5, 5));
          return {
            question: `If ${xCoeff}x + ${constant} = ${result}, what is x?`,
            options: options.map(String),
            answer: String(answer),
            explanation: `Subtract ${constant} then divide by ${xCoeff}.`,
          };
        },
      ],
    },
    {
      id: 'sequences',
      title: 'Sequences & Patterns',
      description: 'Identify rules, extend patterns, and find missing positions in sequences.',
      generators: [
        () => {
          const start = rand(2, 20);
          const step = rand(2, 8);
          const position = rand(4, 7);
          const sequence = Array.from({ length: position }, (_, i) => start + step * i);
          const answer = sequence[position - 1] + step;
          const options = buildOptions(answer, () => answer + rand(-step, step));
          return {
            question: `Sequence: ${sequence.join(', ')} … What is the next number?`,
            options,
            answer: String(answer),
            explanation: `Add ${step} each time: last term ${sequence[position - 1]} + ${step} = ${answer}.`,
          };
        },
        () => {
          const step = rand(3, 9);
          const missingIndex = rand(3, 6);
          const start = rand(2, 10);
          const sequence = Array.from({ length: 6 }, (_, i) => start + step * i);
          const answer = sequence[missingIndex - 1];
          sequence[missingIndex - 1] = '□';
          const options = buildOptions(answer, () => answer + rand(-step, step));
          return {
            question: `Fill in the missing term: ${sequence.join(', ')}.`,
            options,
            answer: String(answer),
            explanation: `The step is ${step}, so count on from ${start} to find the missing value ${answer}.`,
          };
        },
        () => {
          const step = rand(2, 7);
          const term = rand(5, 9);
          const start = rand(1, 9);
          const answer = start + step * (term - 1);
          const options = buildOptions(answer, () => answer + rand(-step, step));
          return {
            question: `A sequence starts at ${start} and increases by ${step} each time. What is the ${term}th term?`,
            options,
            answer: String(answer),
            explanation: `Use nth term formula: ${start} + (${term} - 1) × ${step} = ${answer}.`,
          };
        },
      ],
    },
    {
      id: 'word-problems',
      title: 'Word Problems',
      description: 'Apply multi-step arithmetic to everyday contexts such as shopping and travel.',
      generators: [
        () => {
          const price = rand(2, 9);
          const items = rand(3, 8);
          const total = price * items;
          const options = buildOptions(total, () => total + rand(-6, 6));
          return {
            question: `${items} comic books cost £${price} each. How much do they cost altogether?`,
            options,
            answer: String(total),
            explanation: `${items} × £${price} = £${total}.`,
          };
        },
        () => {
          const adults = rand(2, 4);
          const children = rand(1, 4);
          const adultPrice = rand(6, 12);
          const childPrice = rand(3, 8);
          const answer = adults * adultPrice + children * childPrice;
          const options = buildOptions(answer, () => answer + rand(-12, 12));
          return {
            question: `Tickets cost £${adultPrice} for adults and £${childPrice} for children. A family of ${adults} adults and ${children} children visits a museum. What is the total cost?`,
            options,
            answer: String(answer),
            explanation: `Multiply each ticket type then add: (${adults} × £${adultPrice}) + (${children} × £${childPrice}) = £${answer}.`,
          };
        },
        () => {
          const starting = rand(20, 60);
          const first = rand(5, 18);
          const second = rand(3, 12);
          const answer = starting - first - second;
          const options = buildOptions(answer, () => answer + rand(-10, 10));
          return {
            question: `A charity stall raises £${starting} in the morning, spends £${first} on supplies, then raises another £${second}. How much money do they have left?`,
            options,
            answer: String(answer),
            explanation: `Start with £${starting}, subtract £${first}, then subtract £${second}.`,
          };
        },
      ],
    },
    {
      id: 'time',
      title: 'Time & Timetables',
      description: 'Convert between units, compare times, and read timetables.',
      generators: [
        () => {
          const hours = rand(1, 3);
          const minutes = rand(10, 50);
          const total = hours * 60 + minutes;
          const options = buildOptions(total, () => total + rand(-30, 30));
          return {
            question: `How many minutes are there in ${hours} hour(s) ${minutes} minutes?`,
            options,
            answer: String(total),
            explanation: `${hours} × 60 = ${hours * 60}; add ${minutes} to get ${total} minutes.`,
          };
        },
        () => {
          const startHour = rand(7, 14);
          const duration = rand(35, 130);
          const startMinutes = choice([0, 15, 30, 45]);
          const totalMinutes = startHour * 60 + startMinutes + duration;
          const endHour = Math.floor(totalMinutes / 60);
          const endMinutes = totalMinutes % 60;
          const answer = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
          const options = buildOptions(answer, () => {
            const offset = rand(-20, 20);
            const altTotal = totalMinutes + offset;
            const normalised = ((altTotal % (24 * 60)) + 24 * 60) % (24 * 60);
            const altHour = Math.floor(normalised / 60);
            const altMinute = normalised % 60;
            return `${String(altHour).padStart(2, '0')}:${String(altMinute).padStart(2, '0')}`;
          });
          return {
            question: `A bus leaves at ${String(startHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')} and travels for ${duration} minutes. What time does it arrive?`,
            options,
            answer,
            explanation: `Add the duration to the start time to reach ${answer}.`,
          };
        },
        () => {
          const bedtime = rand(19, 21);
          const wake = rand(6, 8);
          const hoursSlept = (24 - bedtime) + wake;
          const answer = `${hoursSlept} hours`;
          const options = shuffleArray([answer, `${hoursSlept - 1} hours`, `${hoursSlept + 1} hours`, `${hoursSlept + 2} hours`]);
          return {
            question: `Priya goes to bed at ${bedtime}:00 and wakes up at ${wake}:00 the next morning. How long does she sleep?`,
            options,
            answer,
            explanation: `Count the hours from ${bedtime}:00 to midnight (${24 - bedtime} hours) and add ${wake} more for ${hoursSlept} hours total.`,
          };
        },
      ],
    },
    {
      id: 'measures',
      title: 'Measures & Units',
      description: 'Convert between length, mass, and capacity with practical examples.',
      generators: [
        () => {
          const centimetres = rand(150, 950);
          const metres = (centimetres / 100).toFixed(2);
          const options = buildOptions(metres, () => (centimetres / 100 + rand(-30, 30) / 100).toFixed(2));
          return {
            question: `Convert ${centimetres} cm into metres.`,
            options,
            answer: metres,
            explanation: `Divide by 100 to convert cm to m: ${centimetres} ÷ 100 = ${metres} m.`,
          };
        },
        () => {
          const kilograms = rand(3, 15);
          const grams = kilograms * 1000;
          const options = buildOptions(grams, () => grams + rand(-400, 400));
          return {
            question: `How many grams are equivalent to ${kilograms} kg?`,
            options,
            answer: String(grams),
            explanation: `Multiply by 1000: ${kilograms} × 1000 = ${grams} g.`,
          };
        },
        () => {
          const litres = rand(5, 20);
          const millilitres = litres * 1000;
          const poured = rand(500, 1500);
          const remaining = millilitres - poured;
          const options = buildOptions(remaining, () => remaining + rand(-400, 400));
          return {
            question: `A container holds ${litres} litres of juice (${millilitres} ml). After pouring out ${poured} ml, how much remains?`,
            options,
            answer: String(remaining),
            explanation: `Subtract the poured amount from the total in millilitres: ${millilitres} - ${poured} = ${remaining} ml.`,
          };
        },
      ],
    },
    {
      id: 'perimeter-area',
      title: 'Perimeter & Area',
      description: 'Calculate areas and perimeters of rectangles, squares, and compound shapes.',
      generators: [
        () => {
          const length = rand(5, 20);
          const width = rand(3, 12);
          const area = length * width;
          const options = buildOptions(area, () => area + rand(-15, 15));
          return {
            question: `A rectangle measures ${length} cm by ${width} cm. What is its area?`,
            options,
            answer: String(area),
            explanation: `Multiply length by width: ${length} × ${width} = ${area} cm².`,
          };
        },
        () => {
          const side = rand(6, 18);
          const perimeter = side * 4;
          const options = buildOptions(perimeter, () => perimeter + rand(-12, 12));
          return {
            question: `A square has sides of ${side} cm. What is its perimeter?`,
            options,
            answer: String(perimeter),
            explanation: `Perimeter of a square is four equal sides: ${side} × 4 = ${perimeter} cm.`,
          };
        },
        () => {
          const rect1 = { length: rand(6, 14), width: rand(3, 8) };
          const rect2 = { length: rand(3, 8), width: rand(3, 8) };
          const area = rect1.length * rect1.width + rect2.length * rect2.width;
          const options = buildOptions(area, () => area + rand(-20, 20));
          return {
            question: `A composite shape is made from a ${rect1.length} cm by ${rect1.width} cm rectangle attached to a ${rect2.length} cm by ${rect2.width} cm rectangle. What is the total area?`,
            options,
            answer: String(area),
            explanation: `Find each area (${rect1.length} × ${rect1.width} and ${rect2.length} × ${rect2.width}) then add them for ${area} cm².`,
          };
        },
      ],
    },
    {
      id: 'triangles',
      title: 'Triangles',
      description: 'Use the angle sum rule and classify triangle types from side and angle clues.',
      generators: [
        () => {
          const angleA = rand(30, 90);
          const angleB = rand(20, 100 - angleA);
          const angleC = 180 - angleA - angleB;
          const options = buildOptions(angleC, () => angleC + rand(-15, 15));
          return {
            question: `A triangle has angles ${angleA}° and ${angleB}°. What is the third angle?`,
            options,
            answer: String(angleC),
            explanation: `Angles in a triangle sum to 180°, so subtract the known angles to find ${angleC}°.`,
          };
        },
        () => {
          const sides = shuffleArray([rand(4, 12), rand(4, 12), rand(4, 12)]);
          const [a, b, c] = sides;
          let type = 'scalene';
          if (a === b || b === c || a === c) type = 'isosceles';
          if (a === b && b === c) type = 'equilateral';
          const options = shuffleArray(['equilateral', 'isosceles', 'scalene', 'right-angled']);
          return {
            question: `A triangle has side lengths ${a} cm, ${b} cm, and ${c} cm. Which type of triangle is it?`,
            options,
            answer: type,
            explanation: `Compare the side lengths: ${type === 'equilateral' ? 'all three match' : type === 'isosceles' ? 'two sides are equal' : 'all sides are different'}.`,
          };
        },
        () => {
          const base = rand(6, 14);
          const height = rand(4, 12);
          const area = (base * height) / 2;
          const options = buildOptions(area, () => area + rand(-12, 12));
          return {
            question: `Find the area of a triangle with base ${base} cm and perpendicular height ${height} cm.`,
            options,
            answer: String(area),
            explanation: `Area of a triangle is ½ × base × height = ½ × ${base} × ${height} = ${area} cm².`,
          };
        },
      ],
    },
    {
      id: 'angles',
      title: 'Angles (Lines & Polygons)',
      description: 'Calculate missing angles on lines, around points, and inside polygons.',
      generators: [
        () => {
          const straight = 180;
          const known = rand(40, 140);
          const answer = straight - known;
          const options = buildOptions(answer, () => answer + rand(-20, 20));
          return {
            question: `On a straight line, one angle measures ${known}°. What is the other angle?`,
            options,
            answer: String(answer),
            explanation: `Angles on a straight line total 180°.`,
          };
        },
        () => {
          const around = 360;
          const angles = [rand(60, 150), rand(40, 130), rand(30, 100)];
          const sum = angles.reduce((acc, value) => acc + value, 0);
          const answer = around - sum;
          const options = buildOptions(answer, () => answer + rand(-25, 25));
          return {
            question: `Three angles around a point measure ${angles.join('°, ')}°. What is the size of the missing fourth angle?`,
            options,
            answer: String(answer),
            explanation: `Angles around a point add to 360°, so subtract the known angles from 360°.`,
          };
        },
        () => {
          const sides = rand(5, 9);
          const total = (sides - 2) * 180;
          const answer = total / sides;
          const options = buildOptions(answer, () => answer + rand(-15, 15));
          return {
            question: `What is the interior angle of a regular ${sides}-sided polygon?`,
            options,
            answer: String(answer),
            explanation: `Interior angle = [(n - 2) × 180°] ÷ n.`,
          };
        },
      ],
    },
    {
      id: 'coordinates',
      title: 'Coordinates & Graphs',
      description: 'Translate points, interpret coordinate moves, and describe positions.',
      generators: [
        () => {
          const x = rand(-5, 5);
          const y = rand(-5, 5);
          const moveX = rand(-3, 3);
          const moveY = rand(-3, 3);
          const newX = x + moveX;
          const newY = y + moveY;
          const answer = `(${newX}, ${newY})`;
          const options = buildOptions(answer, () => `(${newX + rand(-2, 2)}, ${newY + rand(-2, 2)})`);
          return {
            question: `Starting at (${x}, ${y}), move ${moveX >= 0 ? '+' : ''}${moveX} on x and ${moveY >= 0 ? '+' : ''}${moveY} on y. Where do you land?`,
            options,
            answer,
            explanation: `Add the horizontal and vertical changes to get the new coordinates.`,
          };
        },
        () => {
          const point = [choice(['A', 'B', 'C', 'D']), rand(-4, 4), rand(-4, 4)];
          const answer = point[1] >= 0 && point[2] >= 0 ? 'Quadrant I' : point[1] < 0 && point[2] >= 0 ? 'Quadrant II' : point[1] < 0 && point[2] < 0 ? 'Quadrant III' : 'Quadrant IV';
          const options = shuffleArray(['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV']);
          return {
            question: `Point ${point[0]} has coordinates (${point[1]}, ${point[2]}). Which quadrant is it in?`,
            options,
            answer,
            explanation: `Check the signs of x and y to determine the quadrant.`,
          };
        },
        () => {
          const from = [rand(-4, 4), rand(-4, 4)];
          const to = [rand(-4, 4), rand(-4, 4)];
          const moveX = to[0] - from[0];
          const moveY = to[1] - from[1];
          const answer = `${moveX >= 0 ? '+' : ''}${moveX} on x, ${moveY >= 0 ? '+' : ''}${moveY} on y`;
          const options = shuffleArray([
            answer,
            `${moveX >= 0 ? '+' : ''}${moveX + rand(-2, 2)} on x, ${moveY >= 0 ? '+' : ''}${moveY} on y`,
            `${moveX >= 0 ? '+' : ''}${moveX} on x, ${moveY >= 0 ? '+' : ''}${moveY + rand(-2, 2)} on y`,
            `${moveX >= 0 ? '+' : ''}${moveX + rand(-2, 2)} on x, ${moveY >= 0 ? '+' : ''}${moveY + rand(-2, 2)} on y`,
          ]);
          return {
            question: `Describe the translation from (${from[0]}, ${from[1]}) to (${to[0]}, ${to[1]}).`,
            options,
            answer,
            explanation: `Subtract coordinates to find the movement in x and y.`,
          };
        },
      ],
    },
    {
      id: 'data',
      title: 'Data Handling',
      description: 'Interpret tables, calculate averages, and compare data sets.',
      generators: [
        () => {
          const numbers = [rand(5, 15), rand(6, 18), rand(4, 14), rand(5, 16)];
          const sum = numbers.reduce((total, value) => total + value, 0);
          const mean = Math.round((sum / numbers.length) * 10) / 10;
          const options = buildOptions(mean, () => Math.round((mean + rand(-5, 5) / 10) * 10) / 10);
          return {
            question: `The scores ${numbers.join(', ')} were recorded. What is the mean score?`,
            options: options.map((value) => value.toString()),
            answer: mean.toString(),
            explanation: `Add the scores (${sum}) then divide by ${numbers.length}.`,
          };
        },
        () => {
          const values = Array.from({ length: 5 }, () => rand(2, 12));
          const sorted = [...values].sort((a, b) => a - b);
          const median = sorted[2];
          const options = buildOptions(median, () => median + rand(-3, 3));
          return {
            question: `Five pupils scored ${values.join(', ')} in a quiz. What is the median score?`,
            options: options.map(String),
            answer: String(median),
            explanation: `Order the scores ${sorted.join(', ')} and select the middle value ${median}.`,
          };
        },
        () => {
          const values = Array.from({ length: 4 }, () => rand(6, 16));
          const range = Math.max(...values) - Math.min(...values);
          const options = buildOptions(range, () => range + rand(-5, 5));
          return {
            question: `The weekly pocket money amounts are ${values.join('p, ')}p. What is the range?`,
            options: options.map(String),
            answer: String(range),
            explanation: `Range = highest value - lowest value.`,
          };
        },
      ],
    },
    {
      id: 'symmetry',
      title: 'Symmetry & Transformations',
      description: 'Explore lines of symmetry, reflections, and rotational symmetry.',
      generators: [
        () => {
          const shapes = [
            { name: 'square', lines: 4 },
            { name: 'rectangle', lines: 2 },
            { name: 'equilateral triangle', lines: 3 },
            { name: 'regular hexagon', lines: 6 },
          ];
          const shape = choice(shapes);
          const options = buildOptions(String(shape.lines), () => String(shape.lines + rand(-2, 2)));
          return {
            question: `How many lines of symmetry does a ${shape.name} have?`,
            options,
            answer: String(shape.lines),
            explanation: `Recall the symmetry facts for the ${shape.name}.`,
          };
        },
        () => {
          const shape = choice([
            { name: 'regular pentagon', order: 5 },
            { name: 'square', order: 4 },
            { name: 'equilateral triangle', order: 3 },
          ]);
          const options = buildOptions(String(shape.order), () => String(shape.order + rand(-2, 2)));
          return {
            question: `What is the order of rotational symmetry of a ${shape.name}?`,
            options,
            answer: String(shape.order),
            explanation: `Regular ${shape.name}s have rotational symmetry matching the number of sides.`,
          };
        },
        () => {
          const axis = choice(['x-axis', 'y-axis']);
          const point = [rand(-5, 5), rand(-5, 5)];
          const reflected = axis === 'x-axis' ? [point[0], -point[1]] : [-point[0], point[1]];
          const answer = `(${reflected[0]}, ${reflected[1]})`;
          const options = buildOptions(answer, () => `(${reflected[0] + rand(-2, 2)}, ${reflected[1] + rand(-2, 2)})`);
          return {
            question: `Reflect the point (${point[0]}, ${point[1]}) in the ${axis}. What are the coordinates of the image?`,
            options,
            answer,
            explanation: `Flip the appropriate coordinate when reflecting in the ${axis}.`,
          };
        },
      ],
    },
    {
      id: 'speed',
      title: 'Speed • Distance • Time',
      description: 'Use the speed-distance-time triangle to solve journeys and timings.',
      generators: [
        () => {
          const speed = rand(20, 60);
          const time = rand(2, 6);
          const distance = speed * time;
          const options = buildOptions(distance, () => distance + rand(-40, 40));
          return {
            question: `A train travels at ${speed} km/h for ${time} hours. How far does it go?`,
            options,
            answer: String(distance),
            explanation: `Distance = speed × time = ${speed} × ${time} = ${distance} km.`,
          };
        },
        () => {
          const distance = rand(80, 240);
          const time = rand(2, 5);
          const speed = Math.round(distance / time);
          const options = buildOptions(speed, () => speed + rand(-15, 15));
          return {
            question: `A cyclist covers ${distance} km in ${time} hours. What is the average speed?`,
            options,
            answer: String(speed),
            explanation: `Speed = distance ÷ time = ${distance} ÷ ${time}.`,
          };
        },
        () => {
          const speed = rand(30, 70);
          const distance = rand(90, 280);
          const time = (distance / speed).toFixed(1);
          const options = buildOptions(time, () => (parseFloat(time) + rand(-3, 3) / 10).toFixed(1));
          return {
            question: `A car travels ${distance} km at a constant speed of ${speed} km/h. How long does the journey take?`,
            options,
            answer: String(time),
            explanation: `Time = distance ÷ speed = ${distance} ÷ ${speed} = ${time} hours.`,
          };
        },
      ],
    },
  ];

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    const state = {
      category: null,
      currentQuestion: null,
      answered: 0,
      correct: 0,
      streak: 0,
    };

    const renderCategoryCards = () => {
      categories.forEach((category) => {
        const card = doc.createElement('article');
        card.className = 'category-card';
        card.innerHTML = `
        <h3>${category.title}</h3>
        <p>${category.description}</p>
        <footer>
          <button class="btn" type="button" data-category="${category.id}">Start mission</button>
        </footer>
      `;
        grid.appendChild(card);
      });
    };

    const updateScoreboard = () => {
      answeredCount.textContent = state.answered;
      correctCount.textContent = state.correct;
      const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
      accuracyLabel.textContent = `${accuracy}%`;
      progressFill.style.width = `${accuracy}%`;
      progressFill.parentElement?.setAttribute('aria-valuenow', String(accuracy));
    };

    const showQuestion = (question) => {
      questionText.textContent = question.question;
      optionList.innerHTML = '';
      question.options.forEach((option) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = 'option-btn';
        button.textContent = option;
        button.dataset.optionValue = option;
        optionList.appendChild(button);
      });
      nextButton.disabled = true;
      feedback.textContent = '';
      feedback.className = 'maths-feedback';
      const firstOption = optionList.querySelector('button');
      firstOption?.focus();
    };

    const generateNewQuestion = (scrollIntoView = false) => {
      if (!state.category) return;
      const generator = choice(state.category.generators);
      state.currentQuestion = generator();
      showQuestion(state.currentQuestion);
      if (scrollIntoView) {
        engine?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const startMission = (categoryId) => {
      const category = categoryMap.get(categoryId);
      if (!category) return;
      state.category = category;
      state.answered = 0;
      state.correct = 0;
      state.streak = 0;
      activeCategoryLabel.textContent = `${category.title} mission`;
      window.PrepifyFX?.play('start');
      generateNewQuestion(true);
      updateScoreboard();
    };

    const handleAnswer = (selected) => {
      if (!state.currentQuestion) return;
      const buttons = optionList.querySelectorAll('button');
      buttons.forEach((button) => {
        button.disabled = true;
        if (button.dataset.optionValue === state.currentQuestion.answer) {
          button.classList.add('correct');
        }
      });

      state.answered += 1;
      if (selected === state.currentQuestion.answer) {
        state.correct += 1;
        state.streak += 1;
        feedback.textContent = state.currentQuestion.explanation || 'Correct!';
        feedback.className = 'maths-feedback ok';
        window.PrepifyFX?.play('success');
      } else {
        state.streak = 0;
        feedback.textContent = `Not quite. ${state.currentQuestion.explanation || ''}`.trim();
        feedback.className = 'maths-feedback no';
        window.PrepifyFX?.play('error');
        buttons.forEach((button) => {
          if (button.dataset.optionValue === selected) {
            button.classList.add('incorrect');
          }
        });
      }

      if (state.correct === state.answered && state.answered > 0) {
        window.PrepifyFX?.celebrate();
      }

      updateScoreboard();
      nextButton.disabled = false;
      nextButton.focus();
    };

    const handleOptionClick = (event) => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      handleAnswer(button.dataset.optionValue);
    };

    const resetMission = () => {
      state.category = null;
      state.currentQuestion = null;
      state.answered = 0;
      state.correct = 0;
      state.streak = 0;
      activeCategoryLabel.textContent = 'Pick a category to begin.';
      questionText.textContent = 'Choose a mission to generate your first question.';
      optionList.innerHTML = '';
      feedback.textContent = '';
      feedback.className = 'maths-feedback';
      nextButton.disabled = true;
      updateScoreboard();
      grid.querySelector('button[data-category]')?.focus();
    };

    renderCategoryCards();
    updateScoreboard();

    grid.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      startMission(button.dataset.category);
    });

    optionList.addEventListener('click', handleOptionClick);
    nextButton.addEventListener('click', () => generateNewQuestion());
    resetButton?.addEventListener('click', resetMission);
  };

  doc.addEventListener('DOMContentLoaded', init);
})();
