import json
import uuid
import random
import string

def generate_verbal_reasoning_questions(num_questions=1000):
    """
    Generate 1000 unique 11+ Verbal Reasoning questions
    """
    questions = []
    
    templates = [
        {'type': 'letter_codes', 'difficulties': [1, 2], 'generator': lambda d: generate_letter_code_question(d)},
        {'type': 'word_connections', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_word_connection_question(d)},
        {'type': 'word_analogies', 'difficulties': [2, 3], 'generator': lambda d: generate_analogy_question(d)},
        {'type': 'missing_letters', 'difficulties': [1, 2], 'generator': lambda d: generate_missing_letter_question(d)},
        {'type': 'word_in_word', 'difficulties': [1, 2], 'generator': lambda d: generate_word_in_word_question(d)},
        {'type': 'compound_words', 'difficulties': [1, 2], 'generator': lambda d: generate_compound_word_question(d)},
        {'type': 'letter_sequences', 'difficulties': [2, 3], 'generator': lambda d: generate_letter_sequence_question(d)},
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

def generate_letter_code_question(difficulty):
    """
    Generate letter coding questions
    Example: If CAT = DBU, what does DOG equal?
    """
    alphabet = string.ascii_uppercase
    
    # Generate a simple substitution (shift cipher)
    shift = random.randint(1, 5)
    
    if difficulty == 1:
        # Simple 3-letter word
        words = ['CAT', 'DOG', 'SUN', 'RUN', 'BAT', 'HAT', 'PIG', 'BOX']
        word1 = random.choice(words)
        word2 = random.choice([w for w in words if w != word1])
    else:
        # 4-letter words
        words = ['BOOK', 'TREE', 'FISH', 'BIRD', 'MOON', 'STAR']
        word1 = random.choice(words)
        word2 = random.choice([w for w in words if w != word1])
    
    # Encode word1
    encoded1 = ''.join([alphabet[(alphabet.index(c) + shift) % 26] for c in word1])
    
    # Encode word2 (this is the answer)
    encoded2 = ''.join([alphabet[(alphabet.index(c) + shift) % 26] for c in word2])
    
    # Generate distractors
    distractors = []
    for _ in range(3):
        wrong_shift = random.randint(1, 25)
        if wrong_shift != shift:
            distractor = ''.join([alphabet[(alphabet.index(c) + wrong_shift) % 26] for c in word2])
            if distractor not in distractors and distractor != encoded2:
                distractors.append(distractor)
    
    while len(distractors) < 3:
        distractor = ''.join(random.choice(alphabet) for _ in word2)
        if distractor not in distractors and distractor != encoded2:
            distractors.append(distractor)
    
    options = [encoded2] + distractors[:3]
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'If {word1} is written as {encoded1}, how would {word2} be written?',
        'options': options,
        'correct_answer': encoded2,
        'explanation': f'Each letter is shifted {shift} positions forward in the alphabet. {word2} becomes {encoded2}.'
    }

def generate_word_connection_question(difficulty):
    """
    Generate questions finding the connection between words
    """
    word_groups = {
        1: [
            (['RED', 'BLUE', 'GREEN'], 'colours'),
            (['APPLE', 'ORANGE', 'BANANA'], 'fruits'),
            (['DOG', 'CAT', 'RABBIT'], 'pets'),
            (['MONDAY', 'TUESDAY', 'FRIDAY'], 'days'),
        ],
        2: [
            (['SQUARE', 'CIRCLE', 'TRIANGLE'], 'shapes'),
            (['PIANO', 'VIOLIN', 'GUITAR'], 'instruments'),
            (['HAPPY', 'JOYFUL', 'GLAD'], 'synonyms for happy'),
            (['KNIFE', 'FORK', 'SPOON'], 'cutlery'),
        ],
        3: [
            (['MERCURY', 'VENUS', 'MARS'], 'planets'),
            (['SHAKESPEARE', 'DICKENS', 'AUSTEN'], 'authors'),
            (['OXYGEN', 'HYDROGEN', 'NITROGEN'], 'elements'),
            (['TRIANGLE', 'PENTAGON', 'HEXAGON'], 'polygons'),
        ]
    }
    
    words, connection = random.choice(word_groups[difficulty])
    odd_one_out = random.choice(words)
    
    # Generate distractor words from other groups
    all_groups = word_groups[1] + word_groups[2] + word_groups[3]
    distractors = []
    
    for group_words, _ in all_groups:
        for word in group_words:
            if word not in words and len(distractors) < 10:
                distractors.append(word)
    
    random.shuffle(distractors)
    
    # Create options: 3 from the group + 1 distractor
    options = [w for w in words if w != odd_one_out][:2] + [odd_one_out] + distractors[:1]
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'Which word does NOT belong with the others?<br>{" | ".join(options)}',
        'options': [distractors[0], words[0], words[1], words[2]],
        'correct_answer': distractors[0],
        'explanation': f'The words {", ".join(words)} are all {connection}, but {distractors[0]} is not.'
    }

def generate_analogy_question(difficulty):
    """
    Generate analogy questions: A is to B as C is to ?
    """
    analogies = {
        2: [
            ('CAT', 'MEOW', 'DOG', 'BARK'),
            ('HOT', 'COLD', 'BIG', 'SMALL'),
            ('BIRD', 'FLY', 'FISH', 'SWIM'),
            ('DAY', 'NIGHT', 'SUMMER', 'WINTER'),
            ('HAND', 'GLOVE', 'FOOT', 'SOCK'),
        ],
        3: [
            ('AUTHOR', 'BOOK', 'ARTIST', 'PAINTING'),
            ('TREE', 'FOREST', 'FISH', 'SCHOOL'),
            ('HAPPY', 'SAD', 'LIGHT', 'DARK'),
            ('DOCTOR', 'HOSPITAL', 'TEACHER', 'SCHOOL'),
            ('FLOUR', 'BREAD', 'GRAPES', 'WINE'),
        ]
    }
    
    word_a, word_b, word_c, correct = random.choice(analogies[difficulty])
    
    # Generate distractors
    all_analogies = analogies[2] + analogies[3]
    distractors = []
    
    for a, b, c, d in all_analogies:
        if d != correct and len(distractors) < 5:
            distractors.append(d)
    
    random.shuffle(distractors)
    
    options = [correct] + distractors[:3]
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'{word_a} is to {word_b} as {word_c} is to ?',
        'options': options,
        'correct_answer': correct,
        'explanation': f'{word_a} and {word_b} have the same relationship as {word_c} and {correct}.'
    }

def generate_missing_letter_question(difficulty):
    """
    Generate missing letter questions
    """
    if difficulty == 1:
        # Simple alphabetical sequences
        sequences = [
            ('A', 'B', 'C', 'D', 'E'),
            ('M', 'N', 'O', 'P', 'Q'),
            ('P', 'Q', 'R', 'S', 'T'),
        ]
        
        seq = random.choice(sequences)
        missing_idx = random.randint(1, 3)
        
        display_seq = list(seq)
        correct = display_seq[missing_idx]
        display_seq[missing_idx] = '?'
        
        # Generate distractors
        alphabet = string.ascii_uppercase
        correct_idx = alphabet.index(correct)
        distractors = [
            alphabet[correct_idx - 1] if correct_idx > 0 else 'Z',
            alphabet[correct_idx + 1] if correct_idx < 25 else 'A',
            alphabet[(correct_idx + 2) % 26]
        ]
        
        options = [correct] + [d for d in distractors if d != correct][:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Which letter completes the sequence?<br>{" ".join(display_seq)}',
            'options': options,
            'correct_answer': correct,
            'explanation': f'The sequence follows alphabetical order. The missing letter is {correct}.'
        }
    
    else:  # difficulty == 2
        # Skip patterns
        alphabet = string.ascii_uppercase
        start = random.randint(0, 15)
        skip = random.choice([2, 3])
        
        seq = [alphabet[(start + i * skip) % 26] for i in range(5)]
        missing_idx = random.randint(1, 3)
        correct = seq[missing_idx]
        
        display_seq = seq.copy()
        display_seq[missing_idx] = '?'
        
        # Generate distractors
        correct_idx = alphabet.index(correct)
        distractors = [
            alphabet[(correct_idx + 1) % 26],
            alphabet[(correct_idx - 1) % 26],
            alphabet[(correct_idx + skip + 1) % 26]
        ]
        
        options = [correct] + [d for d in distractors if d != correct][:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Which letter completes the sequence?<br>{" ".join(display_seq)}',
            'options': options,
            'correct_answer': correct,
            'explanation': f'The sequence skips {skip - 1} letter(s) each time. The missing letter is {correct}.'
        }

def generate_word_in_word_question(difficulty):
    """
    Generate questions finding a word hidden in another
    """
    words_with_hidden = {
        1: [
            ('CARPET', 'CAR'),
            ('THREAD', 'READ'),
            ('BRANCH', 'RANCH'),
            ('PLANET', 'PLAN'),
        ],
        2: [
            ('TOGETHER', 'GET'),
            ('BREAKFAST', 'FAST'),
            ('ANSWER', 'SWAN'),
            ('CARTHORSE', 'HORSE'),
        ]
    }
    
    outer_word, hidden_word = random.choice(words_with_hidden[difficulty])
    
    # Generate distractors
    all_words = ['CAT', 'DOG', 'RUN', 'SIT', 'MAP', 'PEN', 'HAT', 'BAT', 'RAT', 'MAT']
    distractors = [w for w in all_words if w.lower() not in outer_word.lower() and w != hidden_word]
    random.shuffle(distractors)
    
    options = [hidden_word] + distractors[:3]
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'Which word can be found hidden in the word {outer_word}?',
        'options': options,
        'correct_answer': hidden_word,
        'explanation': f'The word {hidden_word} is hidden within {outer_word}.'
    }

def generate_compound_word_question(difficulty):
    """
    Generate compound word questions
    """
    compounds = {
        1: [
            ('SUN', 'FLOWER', 'SUNFLOWER'),
            ('FOOT', 'BALL', 'FOOTBALL'),
            ('RAIN', 'BOW', 'RAINBOW'),
            ('GOLD', 'FISH', 'GOLDFISH'),
        ],
        2: [
            ('BUTTER', 'FLY', 'BUTTERFLY'),
            ('WATER', 'FALL', 'WATERFALL'),
            ('BASKET', 'BALL', 'BASKETBALL'),
            ('TOOTH', 'BRUSH', 'TOOTHBRUSH'),
        ]
    }
    
    word1, word2, compound = random.choice(compounds[difficulty])
    
    # Ask for the second part
    distractors = ['FLY', 'BALL', 'FISH', 'BOW', 'FALL', 'BRUSH']
    distractors = [d for d in distractors if d != word2]
    random.shuffle(distractors)
    
    options = [word2] + distractors[:3]
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'Complete the compound word: {word1}____',
        'options': options,
        'correct_answer': word2,
        'explanation': f'{word1} + {word2} = {compound}'
    }

def generate_letter_sequence_question(difficulty):
    """
    Generate letter sequence pattern questions
    """
    alphabet = string.ascii_uppercase
    
    if difficulty == 2:
        # Alternating pattern
        start1 = random.randint(0, 10)
        start2 = random.randint(12, 20)
        
        seq = []
        for i in range(4):
            seq.append(alphabet[start1 + i])
            seq.append(alphabet[start2 + i])
        
        # Remove one letter
        missing_idx = random.choice([2, 4, 6])
        correct = seq[missing_idx]
        seq[missing_idx] = '?'
        
        # Generate distractors
        correct_idx = alphabet.index(correct)
        distractors = [
            alphabet[(correct_idx + 1) % 26],
            alphabet[(correct_idx - 1) % 26],
            alphabet[(correct_idx + 2) % 26]
        ]
        
        options = [correct] + [d for d in distractors if d != correct][:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Which letter completes the pattern?<br>{" ".join(seq)}',
            'options': options,
            'correct_answer': correct,
            'explanation': f'The pattern alternates between two sequences. The missing letter is {correct}.'
        }
    
    else:  # difficulty == 3
        # +2, -1 pattern
        start = random.randint(0, 15)
        seq = [alphabet[start]]
        
        current = start
        for i in range(4):
            if i % 2 == 0:
                current = (current + 2) % 26
            else:
                current = (current - 1) % 26
            seq.append(alphabet[current])
        
        missing_idx = random.randint(1, 3)
        correct = seq[missing_idx]
        seq[missing_idx] = '?'
        
        correct_idx = alphabet.index(correct)
        distractors = [
            alphabet[(correct_idx + 1) % 26],
            alphabet[(correct_idx - 1) % 26],
            alphabet[(correct_idx + 3) % 26]
        ]
        
        options = [correct] + [d for d in distractors if d != correct][:3]
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': f'Which letter completes the pattern?<br>{" ".join(seq)}',
            'options': options,
            'correct_answer': correct,
            'explanation': f'The pattern follows +2, -1, +2, -1. The missing letter is {correct}.'
        }

if __name__ == "__main__":
    print("Generating 1000 Verbal Reasoning questions...")
    questions = generate_verbal_reasoning_questions(1000)
    
    with open('../data/questions/vr.json', 'w') as f:
        json.dump(questions, f, indent=2)
    
    print(f"Generated {len(questions)} questions successfully!")
    print(f"Sample question: {questions[0]}")
