import json
import uuid
import random

def generate_nvr_questions(num_questions=1000):
    """
    Generate 1000 unique 11+ Non-Verbal Reasoning questions
    Using text/symbol representations
    """
    questions = []
    
    templates = [
        {'type': 'shape_sequences', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_shape_sequence(d)},
        {'type': 'shape_rotation', 'difficulties': [2, 3], 'generator': lambda d: generate_rotation_question(d)},
        {'type': 'shape_reflection', 'difficulties': [2, 3], 'generator': lambda d: generate_reflection_question(d)},
        {'type': 'pattern_completion', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_pattern_completion(d)},
        {'type': 'odd_one_out', 'difficulties': [1, 2], 'generator': lambda d: generate_odd_one_out(d)},
        {'type': 'analogies', 'difficulties': [2, 3], 'generator': lambda d: generate_visual_analogy(d)},
    ]
    
    while len(questions) < num_questions:
        template = random.choice(templates)
        difficulty = random.choice(template['difficulties'])
        
        try:
            question_data = template['generator'](difficulty)
            question_data['id'] = str(uuid.uuid4())
            question_data['difficulty'] = difficulty
            questions.append(question_data)
        except Exception as e:
            print(f"Error generating question: {e}")
            continue
    
    return questions

# Shape representations using Unicode and symbols
SHAPES = {
    'circle': '●',
    'square': '■',
    'triangle': '▲',
    'diamond': '◆',
    'star': '★',
    'pentagon': '⬠',
    'hexagon': '⬡',
}

COLORS = ['red', 'blue', 'green', 'yellow', 'black', 'white']
SIZES = ['small', 'medium', 'large']
ROTATIONS = [0, 90, 180, 270]

def generate_shape_sequence(difficulty):
    """
    Generate shape sequence questions
    """
    if difficulty == 1:
        # Simple repeating pattern: ●■●■●?
        shapes = [random.choice(list(SHAPES.values())) for _ in range(2)]
        pattern = (shapes * 3)[:5]  # Repeat pattern
        next_shape = shapes[0]  # The pattern continues
        
        pattern_str = ' '.join(pattern) + ' ?'
        
        # Generate distractors
        all_shapes = list(SHAPES.values())
        distractors = [s for s in all_shapes if s != next_shape]
        random.shuffle(distractors)
        
        options = [next_shape] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">What shape comes next in the sequence?<br><br>{pattern_str}</div>',
            'options': [f'<span style="font-size: 24px;">{o}</span>' for o in options],
            'correct_answer': f'<span style="font-size: 24px;">{next_shape}</span>',
            'explanation': f'The pattern repeats: {" ".join(shapes)}. The next shape is {next_shape}.'
        }
    
    elif difficulty == 2:
        # Growing/shrinking pattern or alternating 3 shapes
        shapes = random.sample(list(SHAPES.values()), 3)
        pattern = (shapes * 2)[:5]
        next_shape = shapes[2]
        
        pattern_str = ' '.join(pattern) + ' ?'
        
        all_shapes = list(SHAPES.values())
        distractors = [s for s in all_shapes if s != next_shape]
        random.shuffle(distractors)
        
        options = [next_shape] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">What shape comes next in the sequence?<br><br>{pattern_str}</div>',
            'options': [f'<span style="font-size: 24px;">{o}</span>' for o in options],
            'correct_answer': f'<span style="font-size: 24px;">{next_shape}</span>',
            'explanation': f'The pattern repeats: {" ".join(shapes)}. The next shape is {next_shape}.'
        }
    
    else:  # difficulty == 3
        # Complex pattern with 2 alternating sequences
        seq1 = random.sample(list(SHAPES.values()), 2)
        seq2 = random.sample([s for s in SHAPES.values() if s not in seq1], 2)
        
        pattern = []
        for i in range(4):
            pattern.append(seq1[i % len(seq1)])
            pattern.append(seq2[i % len(seq2)])
        
        # Next should be seq1[0]
        next_shape = seq1[0]
        
        pattern_str = ' '.join(pattern) + ' ?'
        
        all_shapes = list(SHAPES.values())
        distractors = [s for s in all_shapes if s != next_shape]
        random.shuffle(distractors)
        
        options = [next_shape] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">What shape comes next in the sequence?<br><br>{pattern_str}</div>',
            'options': [f'<span style="font-size: 24px;">{o}</span>' for o in options],
            'correct_answer': f'<span style="font-size: 24px;">{next_shape}</span>',
            'explanation': f'Two sequences alternate. The next shape is {next_shape}.'
        }

def generate_rotation_question(difficulty):
    """
    Generate rotation questions (text-based descriptions)
    """
    rotations = ['not rotated', 'rotated 90° clockwise', 'rotated 180°', 'rotated 90° counter-clockwise']
    
    if difficulty == 2:
        shape = random.choice(list(SHAPES.keys()))
        start_rotation = random.choice(rotations)
        
        # Simple 90-degree rotation
        result = 'rotated 90° clockwise'
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'A {shape} is {start_rotation}. If we rotate it 90° clockwise, what is the result?',
            'options': rotations,
            'correct_answer': result,
            'explanation': f'Rotating the {shape} 90° clockwise from {start_rotation} results in: {result}.'
        }
    
    else:  # difficulty == 3
        shape = random.choice(list(SHAPES.keys()))
        # Compound rotations
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'A triangle (▲) points upward. After rotating 180°, which direction does it point?',
            'options': ['Upward', 'Downward', 'Left', 'Right'],
            'correct_answer': 'Downward',
            'explanation': 'A 180° rotation flips the triangle upside down, so it points downward (▼).'
        }

def generate_reflection_question(difficulty):
    """
    Generate reflection/symmetry questions
    """
    if difficulty == 2:
        # Simple reflection
        patterns = [
            ('AB', 'BA'),
            ('●■', '■●'),
            ('▲●', '●▲'),
        ]
        
        original, reflected = random.choice(patterns)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">What is the reflection of this pattern?<br><br>{original}</div>',
            'options': [
                f'<span style="font-size: 24px;">{reflected}</span>',
                f'<span style="font-size: 24px;">{original}</span>',
                f'<span style="font-size: 24px;">{original[::-1][::-1]}</span>',
                f'<span style="font-size: 24px;">{"".join(random.sample(original, len(original)))}</span>'
            ],
            'correct_answer': f'<span style="font-size: 24px;">{reflected}</span>',
            'explanation': f'The reflection of {original} is {reflected} (reversed horizontally).'
        }
    
    else:  # difficulty == 3
        # Symmetry detection
        symmetric = random.choice([True, False])
        
        if symmetric:
            patterns = ['●■●', '▲●▲', '■●■']
            pattern = random.choice(patterns)
            answer = 'Yes'
        else:
            patterns = ['●■▲', '▲●■', '■▲●']
            pattern = random.choice(patterns)
            answer = 'No'
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">Is this pattern symmetrical?<br><br>{pattern}</div>',
            'options': ['Yes', 'No'],
            'correct_answer': answer,
            'explanation': f'The pattern {pattern} is {"" if symmetric else "not "}symmetrical.'
        }

def generate_pattern_completion(difficulty):
    """
    Generate pattern completion questions using a grid
    """
    if difficulty == 1:
        # 2x2 grid pattern
        shapes = random.sample(list(SHAPES.values()), 3)
        
        # Pattern: same shape in opposite corners
        grid = [
            [shapes[0], shapes[1]],
            [shapes[1], '?']
        ]
        
        correct = shapes[0]
        
        grid_str = '<br>'.join([' '.join(row) for row in grid])
        
        all_shapes = list(SHAPES.values())
        distractors = [s for s in all_shapes if s != correct]
        random.shuffle(distractors)
        
        options = [correct] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">Complete the pattern:<br><br>{grid_str}</div>',
            'options': [f'<span style="font-size: 24px;">{o}</span>' for o in options],
            'correct_answer': f'<span style="font-size: 24px;">{correct}</span>',
            'explanation': f'The pattern shows {shapes[0]} in opposite corners. The missing shape is {correct}.'
        }
    
    elif difficulty == 2:
        # 3x3 grid with row pattern
        shapes = random.sample(list(SHAPES.values()), 3)
        
        grid = [
            shapes,
            shapes,
            [shapes[0], shapes[1], '?']
        ]
        
        correct = shapes[2]
        
        grid_str = '<br>'.join([' '.join(row) for row in grid])
        
        all_shapes = list(SHAPES.values())
        distractors = [s for s in all_shapes if s != correct]
        random.shuffle(distractors)
        
        options = [correct] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">Complete the pattern:<br><br>{grid_str}</div>',
            'options': [f'<span style="font-size: 24px;">{o}</span>' for o in options],
            'correct_answer': f'<span style="font-size: 24px;">{correct}</span>',
            'explanation': f'Each row repeats the pattern {" ".join(shapes)}. The missing shape is {correct}.'
        }
    
    else:  # difficulty == 3
        # Complex 3x3 with diagonal or column pattern
        shapes = random.sample(list(SHAPES.values()), 4)
        
        grid = [
            [shapes[0], shapes[1], shapes[2]],
            [shapes[1], shapes[2], shapes[3]],
            [shapes[2], shapes[3], '?']
        ]
        
        correct = shapes[0]
        
        grid_str = '<br>'.join([' '.join(row) for row in grid])
        
        all_shapes = list(SHAPES.values())
        distractors = [s for s in all_shapes if s != correct]
        random.shuffle(distractors)
        
        options = [correct] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">Complete the pattern:<br><br>{grid_str}</div>',
            'options': [f'<span style="font-size: 24px;">{o}</span>' for o in options],
            'correct_answer': f'<span style="font-size: 24px;">{correct}</span>',
            'explanation': f'The pattern shifts diagonally. The missing shape is {correct}.'
        }

def generate_odd_one_out(difficulty):
    """
    Generate odd-one-out questions
    """
    if difficulty == 1:
        # Same shape, one different
        main_shape = random.choice(list(SHAPES.values()))
        odd_shape = random.choice([s for s in SHAPES.values() if s != main_shape])
        
        shapes = [main_shape] * 3 + [odd_shape]
        random.shuffle(shapes)
        
        correct_idx = shapes.index(odd_shape)
        
        shapes_str = ' | '.join(f'{i+1}. {s}' for i, s in enumerate(shapes))
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 24px;">Which shape is the odd one out?<br><br>{shapes_str}</div>',
            'options': ['1', '2', '3', '4'],
            'correct_answer': str(correct_idx + 1),
            'explanation': f'Shape {correct_idx + 1} is different from the others.'
        }
    
    else:  # difficulty == 2
        # Pattern-based odd one out
        # 3 shapes follow a size pattern, 1 doesn't
        
        return {
            'type': 'Multiple Choice',
            'question_text': '<div style="font-size: 24px;">Which group is the odd one out?<br><br>1. ●●● | 2. ■■■ | 3. ▲▲ | 4. ◆◆◆</div>',
            'options': ['1', '2', '3', '4'],
            'correct_answer': '3',
            'explanation': 'Groups 1, 2, and 4 have three shapes each. Group 3 has only two shapes.'
        }

def generate_visual_analogy(difficulty):
    """
    Generate visual analogy questions: A is to B as C is to ?
    """
    if difficulty == 2:
        # Simple transformation: size or rotation
        transformations = [
            ('Small ●', 'Large ●', 'Small ■', 'Large ■'),
            ('● (up)', '● (down)', '▲ (up)', '▲ (down)'),
            ('Single ●', 'Double ●●', 'Single ■', 'Double ■■'),
        ]
        
        a, b, c, correct = random.choice(transformations)
        
        # Generate distractors
        distractors = ['Large ▲', 'Small ●', 'Double ▲▲']
        distractors = [d for d in distractors if d != correct]
        random.shuffle(distractors)
        
        options = [correct] + distractors[:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'<div style="font-size: 20px;">{a} is to {b}<br>as<br>{c} is to ?</div>',
            'options': options,
            'correct_answer': correct,
            'explanation': f'The same transformation that changes {a} to {b} changes {c} to {correct}.'
        }
    
    else:  # difficulty == 3
        # Complex transformation: shape + rotation
        
        return {
            'type': 'Multiple Choice',
            'question_text': '<div style="font-size: 20px;">● (inside ■) is to ■ (inside ●)<br>as<br>▲ (inside ◆) is to ?</div>',
            'options': ['◆ (inside ▲)', '▲ (inside ■)', '■ (inside ▲)', '● (inside ◆)'],
            'correct_answer': '◆ (inside ▲)',
            'explanation': 'The shapes swap positions: inner becomes outer and vice versa.'
        }

if __name__ == "__main__":
    print("Generating 1000 Non-Verbal Reasoning questions...")
    questions = generate_nvr_questions(1000)
    
    with open('../data/questions/nvr.json', 'w') as f:
        json.dump(questions, f, indent=2)
    
    print(f"Generated {len(questions)} questions successfully!")
    print(f"Sample question: {questions[0]}")
