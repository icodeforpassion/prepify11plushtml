import json
import uuid
import random

def generate_maths_questions(num_questions=1000):
    """
    Generate 1000 unique 11+ style maths questions procedurally
    """
    questions = []
    
    # Question templates with varying difficulty
    templates = [
        # Percentages (Difficulty 1-3)
        {
            'type': 'percentage',
            'difficulties': [1, 2, 3],
            'generator': lambda d: generate_percentage_question(d)
        },
        # Fractions (Difficulty 1-3)
        {
            'type': 'fractions',
            'difficulties': [1, 2, 3],
            'generator': lambda d: generate_fraction_question(d)
        },
        # Word Problems (Difficulty 2-3)
        {
            'type': 'word_problems',
            'difficulties': [2, 3],
            'generator': lambda d: generate_word_problem(d)
        },
        # Algebra (Difficulty 2-3)
        {
            'type': 'algebra',
            'difficulties': [2, 3],
            'generator': lambda d: generate_algebra_question(d)
        },
        # Geometry (Difficulty 1-3)
        {
            'type': 'geometry',
            'difficulties': [1, 2, 3],
            'generator': lambda d: generate_geometry_question(d)
        },
        # Number Sequences (Difficulty 1-2)
        {
            'type': 'sequences',
            'difficulties': [1, 2],
            'generator': lambda d: generate_sequence_question(d)
        },
        # Time and Money (Difficulty 1-2)
        {
            'type': 'time_money',
            'difficulties': [1, 2],
            'generator': lambda d: generate_time_money_question(d)
        },
    ]
    
    question_id = 0
    while len(questions) < num_questions:
        template = random.choice(templates)
        difficulty = random.choice(template['difficulties'])
        
        try:
            question_data = template['generator'](difficulty)
            question_data['id'] = str(uuid.uuid4())
            question_data['difficulty'] = difficulty
            questions.append(question_data)
            question_id += 1
        except Exception as e:
            print(f"Error generating question: {e}")
            continue
    
    return questions

def generate_percentage_question(difficulty):
    """Generate percentage questions"""
    if difficulty == 1:
        # Simple: What is X% of Y?
        percent = random.choice([10, 20, 25, 50, 75])
        number = random.randint(20, 200)
        answer = (percent / 100) * number
        
        options = [answer]
        while len(options) < 4:
            distractor = answer + random.choice([-10, -5, 5, 10, answer * 0.1, answer * -0.1])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'What is {percent}% of {number}?',
            'options': [str(round(o, 2)) for o in options],
            'correct_answer': str(round(answer, 2)),
            'explanation': f'{percent}% of {number} = ({percent}/100) × {number} = {round(answer, 2)}'
        }
    
    elif difficulty == 2:
        # Medium: X is Y% of what number?
        percent = random.randint(15, 85)
        result = random.randint(30, 150)
        original = (result / percent) * 100
        
        options = [original]
        while len(options) < 4:
            distractor = original + random.choice([-20, -10, 10, 20])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'{result} is {percent}% of what number?',
            'options': [str(round(o, 2)) for o in options],
            'correct_answer': str(round(original, 2)),
            'explanation': f'If {result} is {percent}%, then 100% = {result} ÷ {percent} × 100 = {round(original, 2)}'
        }
    
    else:  # difficulty == 3
        # Hard: Percentage increase/decrease
        original = random.randint(100, 500)
        increase = random.randint(10, 40)
        new_value = original * (1 + increase/100)
        
        options = [new_value]
        while len(options) < 4:
            distractor = new_value + random.choice([-30, -15, 15, 30])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'A shop increases its prices by {increase}%. If an item originally cost £{original}, what is the new price?',
            'options': [f'£{round(o, 2)}' for o in options],
            'correct_answer': f'£{round(new_value, 2)}',
            'explanation': f'New price = £{original} × (1 + {increase}/100) = £{original} × {1 + increase/100} = £{round(new_value, 2)}'
        }

def generate_fraction_question(difficulty):
    """Generate fraction questions"""
    if difficulty == 1:
        # Simple addition/subtraction with same denominator
        denom = random.choice([4, 5, 8, 10])
        num1 = random.randint(1, denom - 1)
        num2 = random.randint(1, denom - num1)
        
        answer_num = num1 + num2
        answer_denom = denom
        
        # Simplify if possible
        from math import gcd
        g = gcd(answer_num, answer_denom)
        answer_num //= g
        answer_denom //= g
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Calculate: {num1}/{denom} + {num2}/{denom}',
            'options': [
                f'{answer_num}/{answer_denom}',
                f'{num1 + num2}/{denom * 2}',
                f'{num1 + num2}/{denom}',
                f'{answer_num + 1}/{answer_denom}'
            ],
            'correct_answer': f'{answer_num}/{answer_denom}',
            'explanation': f'{num1}/{denom} + {num2}/{denom} = {num1 + num2}/{denom} = {answer_num}/{answer_denom}'
        }
    
    elif difficulty == 2:
        # Medium: Fraction of a number
        denom = random.choice([3, 4, 5, 6, 8])
        num = random.randint(1, denom - 1)
        total = random.choice([i for i in range(20, 200, denom)])
        
        answer = (num * total) // denom
        
        options = [answer]
        while len(options) < 4:
            distractor = answer + random.choice([-10, -5, 5, 10])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'What is {num}/{denom} of {total}?',
            'options': [str(o) for o in options],
            'correct_answer': str(answer),
            'explanation': f'{num}/{denom} of {total} = ({num} × {total}) ÷ {denom} = {answer}'
        }
    
    else:  # difficulty == 3
        # Hard: Fraction multiplication/division
        num1, denom1 = random.randint(2, 7), random.randint(3, 9)
        num2, denom2 = random.randint(2, 7), random.randint(3, 9)
        
        answer_num = num1 * num2
        answer_denom = denom1 * denom2
        
        from math import gcd
        g = gcd(answer_num, answer_denom)
        answer_num //= g
        answer_denom //= g
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Calculate: {num1}/{denom1} × {num2}/{denom2}',
            'options': [
                f'{answer_num}/{answer_denom}',
                f'{num1 * num2}/{denom1 + denom2}',
                f'{num1 + num2}/{denom1 * denom2}',
                f'{answer_num + 1}/{answer_denom}'
            ],
            'correct_answer': f'{answer_num}/{answer_denom}',
            'explanation': f'{num1}/{denom1} × {num2}/{denom2} = {num1 * num2}/{denom1 * denom2} = {answer_num}/{answer_denom}'
        }

def generate_word_problem(difficulty):
    """Generate word problems"""
    scenarios = [
        {
            'context': 'shopping',
            'items': ['apples', 'oranges', 'bananas', 'pears'],
            'action': 'bought'
        },
        {
            'context': 'journey',
            'items': ['miles', 'kilometers', 'meters'],
            'action': 'traveled'
        },
        {
            'context': 'reading',
            'items': ['pages', 'chapters', 'books'],
            'action': 'read'
        }
    ]
    
    scenario = random.choice(scenarios)
    
    if difficulty == 2:
        # Two-step problem
        qty1 = random.randint(5, 20)
        price1 = random.randint(2, 8)
        qty2 = random.randint(3, 15)
        price2 = random.randint(3, 9)
        
        total = qty1 * price1 + qty2 * price2
        
        options = [total]
        while len(options) < 4:
            distractor = total + random.choice([-15, -8, 8, 15])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Sarah bought {qty1} apples at £{price1} each and {qty2} oranges at £{price2} each. How much did she spend in total?',
            'options': [f'£{o}' for o in options],
            'correct_answer': f'£{total}',
            'explanation': f'Cost of apples: {qty1} × £{price1} = £{qty1 * price1}. Cost of oranges: {qty2} × £{price2} = £{qty2 * price2}. Total: £{qty1 * price1} + £{qty2 * price2} = £{total}'
        }
    
    else:  # difficulty == 3
        # Three-step with sharing/division
        total_items = random.randint(60, 120)
        num_people = random.choice([3, 4, 5, 6])
        per_person = total_items // num_people
        
        options = [per_person]
        while len(options) < 4:
            distractor = per_person + random.choice([-5, -2, 2, 5])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'A teacher has {total_items} pencils to share equally among {num_people} students. How many pencils does each student get?',
            'options': [str(o) for o in options],
            'correct_answer': str(per_person),
            'explanation': f'Each student gets {total_items} ÷ {num_people} = {per_person} pencils'
        }

def generate_algebra_question(difficulty):
    """Generate algebra questions"""
    if difficulty == 2:
        # Simple linear equations: x + a = b
        a = random.randint(5, 30)
        b = random.randint(a + 5, 60)
        x = b - a
        
        options = [x]
        while len(options) < 4:
            distractor = x + random.choice([-10, -5, 5, 10])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Solve for x: x + {a} = {b}',
            'options': [str(o) for o in options],
            'correct_answer': str(x),
            'explanation': f'x = {b} - {a} = {x}'
        }
    
    else:  # difficulty == 3
        # ax = b type equations
        a = random.randint(2, 9)
        x = random.randint(4, 20)
        b = a * x
        
        options = [x]
        while len(options) < 4:
            distractor = x + random.choice([-5, -2, 2, 5])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Solve for x: {a}x = {b}',
            'options': [str(o) for o in options],
            'correct_answer': str(x),
            'explanation': f'x = {b} ÷ {a} = {x}'
        }

def generate_geometry_question(difficulty):
    """Generate geometry questions"""
    if difficulty == 1:
        # Perimeter of rectangle
        length = random.randint(5, 20)
        width = random.randint(3, 15)
        perimeter = 2 * (length + width)
        
        options = [perimeter]
        while len(options) < 4:
            distractor = perimeter + random.choice([-8, -4, 4, 8])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'What is the perimeter of a rectangle with length {length}cm and width {width}cm?',
            'options': [f'{o}cm' for o in options],
            'correct_answer': f'{perimeter}cm',
            'explanation': f'Perimeter = 2 × (length + width) = 2 × ({length} + {width}) = {perimeter}cm'
        }
    
    elif difficulty == 2:
        # Area of rectangle or triangle
        if random.choice([True, False]):
            # Rectangle
            length = random.randint(6, 25)
            width = random.randint(4, 20)
            area = length * width
            
            return {
                'type': 'Multiple Choice',
                'question_text': f'What is the area of a rectangle with length {length}cm and width {width}cm?',
                'options': [f'{area}cm²', f'{area - 10}cm²', f'{area + 15}cm²', f'{2 * (length + width)}cm²'],
                'correct_answer': f'{area}cm²',
                'explanation': f'Area = length × width = {length} × {width} = {area}cm²'
            }
        else:
            # Triangle
            base = random.randint(8, 24)
            height = random.randint(6, 20)
            area = (base * height) // 2
            
            return {
                'type': 'Multiple Choice',
                'question_text': f'What is the area of a triangle with base {base}cm and height {height}cm?',
                'options': [f'{area}cm²', f'{base * height}cm²', f'{area - 10}cm²', f'{area + 10}cm²'],
                'correct_answer': f'{area}cm²',
                'explanation': f'Area = (base × height) ÷ 2 = ({base} × {height}) ÷ 2 = {area}cm²'
            }
    
    else:  # difficulty == 3
        # Circle circumference or area
        radius = random.randint(4, 15)
        circumference = round(2 * 3.14159 * radius, 2)
        
        options = [circumference]
        while len(options) < 4:
            distractor = round(circumference + random.choice([-5, -2, 2, 5]), 2)
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'What is the circumference of a circle with radius {radius}cm? (Use π = 3.14)',
            'options': [f'{o}cm' for o in options],
            'correct_answer': f'{circumference}cm',
            'explanation': f'Circumference = 2πr = 2 × 3.14 × {radius} = {circumference}cm'
        }

def generate_sequence_question(difficulty):
    """Generate number sequence questions"""
    if difficulty == 1:
        # Simple arithmetic sequences
        start = random.randint(2, 20)
        diff = random.choice([2, 3, 4, 5, 10])
        sequence = [start + i * diff for i in range(5)]
        next_num = start + 5 * diff
        
        options = [next_num]
        while len(options) < 4:
            distractor = next_num + random.choice([-diff * 2, -diff, diff, diff * 2])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'What is the next number in the sequence? {", ".join(map(str, sequence))}',
            'options': [str(o) for o in options],
            'correct_answer': str(next_num),
            'explanation': f'The sequence increases by {diff} each time. Next number: {sequence[-1]} + {diff} = {next_num}'
        }
    
    else:  # difficulty == 2
        # Geometric sequences or more complex patterns
        start = random.randint(2, 10)
        ratio = random.choice([2, 3])
        sequence = [start * (ratio ** i) for i in range(4)]
        next_num = start * (ratio ** 4)
        
        options = [next_num]
        while len(options) < 4:
            distractor = next_num + random.choice([-20, -10, 10, 20])
            if distractor > 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'What is the next number in the sequence? {", ".join(map(str, sequence))}',
            'options': [str(o) for o in options],
            'correct_answer': str(next_num),
            'explanation': f'Each number is multiplied by {ratio}. Next number: {sequence[-1]} × {ratio} = {next_num}'
        }

def generate_time_money_question(difficulty):
    """Generate time and money questions"""
    if difficulty == 1:
        # Simple time addition
        hours = random.randint(1, 8)
        minutes = random.choice([15, 30, 45])
        start_hour = random.randint(8, 14)
        start_min = random.choice([0, 15, 30, 45])
        
        end_hour = start_hour + hours
        end_min = start_min + minutes
        if end_min >= 60:
            end_hour += 1
            end_min -= 60
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'If a movie starts at {start_hour:02d}:{start_min:02d} and lasts {hours} hours and {minutes} minutes, what time does it end?',
            'options': [
                f'{end_hour:02d}:{end_min:02d}',
                f'{end_hour - 1:02d}:{end_min:02d}',
                f'{end_hour:02d}:{(end_min + 15) % 60:02d}',
                f'{end_hour + 1:02d}:{end_min:02d}'
            ],
            'correct_answer': f'{end_hour:02d}:{end_min:02d}',
            'explanation': f'Start: {start_hour:02d}:{start_min:02d} + {hours}h {minutes}m = {end_hour:02d}:{end_min:02d}'
        }
    
    else:  # difficulty == 2
        # Money change calculation
        item_price = round(random.uniform(2.50, 15.99), 2)
        paid = random.choice([5, 10, 20])
        change = round(paid - item_price, 2)
        
        options = [change]
        while len(options) < 4:
            distractor = round(change + random.choice([-1.5, -0.5, 0.5, 1.5]), 2)
            if distractor >= 0 and distractor not in options:
                options.append(distractor)
        
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'An item costs £{item_price:.2f}. If you pay with a £{paid} note, how much change do you get?',
            'options': [f'£{o:.2f}' for o in options],
            'correct_answer': f'£{change:.2f}',
            'explanation': f'Change = £{paid} - £{item_price:.2f} = £{change:.2f}'
        }

if __name__ == "__main__":
    print("Generating 1000 maths questions...")
    questions = generate_maths_questions(1000)
    
    with open('../data/questions/maths.json', 'w') as f:
        json.dump(questions, f, indent=2)
    
    print(f"Generated {len(questions)} questions successfully!")
    print(f"Sample question: {questions[0]}")
