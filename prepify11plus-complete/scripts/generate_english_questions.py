import json
import uuid
import random

def generate_english_questions(num_questions=1000):
    """
    Generate 1000 unique 11+ style English questions procedurally
    """
    questions = []
    
    templates = [
        # Synonyms
        {'type': 'synonyms', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_synonym_question(d)},
        # Antonyms
        {'type': 'antonyms', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_antonym_question(d)},
        # Spelling
        {'type': 'spelling', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_spelling_question(d)},
        # Grammar
        {'type': 'grammar', 'difficulties': [2, 3], 'generator': lambda d: generate_grammar_question(d)},
        # Comprehension
        {'type': 'comprehension', 'difficulties': [2, 3], 'generator': lambda d: generate_comprehension_question(d)},
        # Vocabulary
        {'type': 'vocabulary', 'difficulties': [1, 2, 3], 'generator': lambda d: generate_vocabulary_question(d)},
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

# Word banks for different difficulty levels
WORDS_EASY = {
    'happy': ['joyful', 'cheerful', 'glad', 'pleased'],
    'big': ['large', 'huge', 'enormous', 'giant'],
    'small': ['tiny', 'little', 'miniature', 'petite'],
    'fast': ['quick', 'rapid', 'swift', 'speedy'],
    'sad': ['unhappy', 'sorrowful', 'gloomy', 'dejected'],
    'smart': ['clever', 'intelligent', 'bright', 'brilliant'],
    'brave': ['courageous', 'fearless', 'bold', 'daring'],
    'kind': ['gentle', 'caring', 'considerate', 'thoughtful'],
}

WORDS_MEDIUM = {
    'ancient': ['old', 'antique', 'archaic', 'aged'],
    'beautiful': ['attractive', 'lovely', 'gorgeous', 'stunning'],
    'difficult': ['hard', 'challenging', 'tough', 'demanding'],
    'important': ['significant', 'crucial', 'vital', 'essential'],
    'mysterious': ['puzzling', 'enigmatic', 'cryptic', 'baffling'],
    'ordinary': ['common', 'usual', 'typical', 'normal'],
    'peaceful': ['calm', 'tranquil', 'serene', 'quiet'],
    'terrible': ['awful', 'dreadful', 'horrible', 'appalling'],
}

WORDS_HARD = {
    'abundant': ['plentiful', 'ample', 'copious', 'profuse'],
    'benevolent': ['kind', 'charitable', 'generous', 'compassionate'],
    'diligent': ['hardworking', 'industrious', 'conscientious', 'assiduous'],
    'eloquent': ['articulate', 'fluent', 'expressive', 'persuasive'],
    'frugal': ['thrifty', 'economical', 'sparing', 'prudent'],
    'genuine': ['authentic', 'real', 'sincere', 'true'],
    'hostile': ['unfriendly', 'antagonistic', 'aggressive', 'belligerent'],
    'meticulous': ['careful', 'thorough', 'precise', 'fastidious'],
}

def generate_synonym_question(difficulty):
    """Generate synonym questions"""
    if difficulty == 1:
        word, synonyms = random.choice(list(WORDS_EASY.items()))
    elif difficulty == 2:
        word, synonyms = random.choice(list(WORDS_MEDIUM.items()))
    else:
        word, synonyms = random.choice(list(WORDS_HARD.items()))
    
    correct = random.choice(synonyms)
    
    # Generate distractors from other word lists
    all_words = list(WORDS_EASY.values()) + list(WORDS_MEDIUM.values()) + list(WORDS_HARD.values())
    distractors = []
    while len(distractors) < 3:
        random_synonyms = random.choice(all_words)
        distractor = random.choice(random_synonyms)
        if distractor not in synonyms and distractor not in distractors:
            distractors.append(distractor)
    
    options = [correct] + distractors
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'Which word is closest in meaning to "{word}"?',
        'options': options,
        'correct_answer': correct,
        'explanation': f'"{correct}" is a synonym of "{word}", meaning they have similar meanings.'
    }

def generate_antonym_question(difficulty):
    """Generate antonym questions"""
    antonym_pairs = {
        1: [
            ('hot', 'cold'), ('big', 'small'), ('fast', 'slow'),
            ('happy', 'sad'), ('light', 'dark'), ('high', 'low'),
            ('good', 'bad'), ('wet', 'dry'), ('hard', 'soft'),
        ],
        2: [
            ('ancient', 'modern'), ('beautiful', 'ugly'), ('brave', 'cowardly'),
            ('difficult', 'easy'), ('generous', 'selfish'), ('loud', 'quiet'),
            ('polite', 'rude'), ('victory', 'defeat'), ('wealth', 'poverty'),
        ],
        3: [
            ('abundant', 'scarce'), ('benevolent', 'malevolent'), ('chaos', 'order'),
            ('decline', 'improve'), ('expand', 'contract'), ('genuine', 'fake'),
            ('hostile', 'friendly'), ('innocent', 'guilty'), ('optimistic', 'pessimistic'),
        ]
    }
    
    word1, word2 = random.choice(antonym_pairs[difficulty])
    
    # Generate distractors
    all_pairs = antonym_pairs[1] + antonym_pairs[2] + antonym_pairs[3]
    distractors = []
    while len(distractors) < 3:
        pair = random.choice(all_pairs)
        distractor = random.choice(pair)
        if distractor != word2 and distractor != word1 and distractor not in distractors:
            distractors.append(distractor)
    
    options = [word2] + distractors
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'Which word is the opposite in meaning to "{word1}"?',
        'options': options,
        'correct_answer': word2,
        'explanation': f'"{word2}" is an antonym of "{word1}", meaning they have opposite meanings.'
    }

def generate_spelling_question(difficulty):
    """Generate spelling questions"""
    words = {
        1: ['receive', 'separate', 'necessary', 'because', 'believe', 'friend', 'address', 'library'],
        2: ['accommodation', 'embarrass', 'occurrence', 'mediterranean', 'conscience', 'definitely', 'privilege'],
        3: ['bureaucracy', 'entrepreneur', 'conscientious', 'reconnaissance', 'pharmaceutical', 'ingenious']
    }
    
    correct_word = random.choice(words[difficulty])
    
    # Create misspellings
    misspellings = []
    
    # Common misspelling patterns
    def create_misspelling(word):
        variations = []
        # Double consonant errors
        for i in range(len(word) - 1):
            if word[i] == word[i + 1]:
                variations.append(word[:i] + word[i+1:])
        # ie/ei swaps
        variations.append(word.replace('ie', 'ei').replace('ei', 'ie'))
        # Double vowels
        for i, char in enumerate(word):
            if char in 'aeiou':
                variations.append(word[:i] + char + char + word[i+1:])
        
        return [v for v in variations if v != word and len(v) > 0]
    
    possible_misspellings = create_misspelling(correct_word)
    while len(misspellings) < 3 and possible_misspellings:
        mis = random.choice(possible_misspellings)
        if mis not in misspellings:
            misspellings.append(mis)
            possible_misspellings.remove(mis)
    
    # Fill remaining slots with random alterations
    while len(misspellings) < 3:
        idx = random.randint(0, len(correct_word) - 1)
        char = correct_word[idx]
        replacement = random.choice('aeiou' if char in 'aeiou' else 'bcdfghjklmnpqrstvwxyz')
        mis = correct_word[:idx] + replacement + correct_word[idx+1:]
        if mis not in misspellings and mis != correct_word:
            misspellings.append(mis)
    
    options = [correct_word] + misspellings[:3]
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'Which is the correct spelling?',
        'options': options,
        'correct_answer': correct_word,
        'explanation': f'The correct spelling is "{correct_word}".'
    }

def generate_grammar_question(difficulty):
    """Generate grammar questions"""
    if difficulty == 2:
        # Subject-verb agreement
        subjects = ['The dog', 'The cats', 'My friend', 'The students', 'Sarah']
        verbs_sing = ['runs', 'plays', 'walks', 'jumps', 'sings']
        verbs_plur = ['run', 'play', 'walk', 'jump', 'sing']
        
        is_plural = random.choice([True, False])
        
        if is_plural:
            subject = random.choice(['The cats', 'The students', 'My friends'])
            correct_verb = random.choice(verbs_plur)
            wrong_verb = correct_verb + 's'
        else:
            subject = random.choice(['The dog', 'My friend', 'Sarah'])
            correct_verb = random.choice(verbs_sing)
            wrong_verb = correct_verb[:-1] if correct_verb.endswith('s') else correct_verb
        
        sentence = f'{subject} {correct_verb} in the park.'
        
        return {
            'type': 'Multiple Choice',
            'question_text': 'Which sentence is grammatically correct?',
            'options': [
                sentence,
                f'{subject} {wrong_verb} in the park.',
                f'{subject} running in the park.',
                f'{subject} to run in the park.'
            ],
            'correct_answer': sentence,
            'explanation': f'The subject "{subject}" requires the verb "{correct_verb}" for proper subject-verb agreement.'
        }
    
    else:  # difficulty == 3
        # Pronoun usage
        sentences = [
            ("Between you and I, this is a secret.", "Between you and me, this is a secret."),
            ("Me and John went to the park.", "John and I went to the park."),
            ("The teacher gave the book to Sarah and I.", "The teacher gave the book to Sarah and me."),
            ("Him and his brother play football.", "He and his brother play football."),
        ]
        
        wrong, correct = random.choice(sentences)
        
        # Generate distractors
        distractors = [s[0] for s in sentences if s[1] != correct][:2]
        
        options = [correct] + distractors + [wrong]
        options = list(set(options))[:4]  # Ensure unique
        random.shuffle(options)
        
        return {
            'type': 'Multiple Choice',
            'question_text': 'Which sentence uses pronouns correctly?',
            'options': options,
            'correct_answer': correct,
            'explanation': f'The correct sentence is: "{correct}". This uses the pronoun in the correct grammatical case.'
        }

def generate_comprehension_question(difficulty):
    """Generate reading comprehension questions"""
    passages = {
        2: [
            {
                'text': 'The rainforest is home to millions of species. Trees grow tall to reach sunlight, creating a canopy above. Many animals live in the canopy, rarely touching the ground.',
                'question': 'Why do trees grow tall in the rainforest?',
                'answer': 'To reach sunlight',
                'distractors': ['To avoid animals', 'To store water', 'To make shade']
            },
            {
                'text': 'Honeybees communicate through dance. When a bee finds flowers, it returns to the hive and performs a waggle dance. The dance shows other bees the direction and distance to the flowers.',
                'question': 'How do honeybees tell others about flowers?',
                'answer': 'Through a waggle dance',
                'distractors': ['Through buzzing sounds', 'Through pheromones', 'Through wing patterns']
            }
        ],
        3: [
            {
                'text': 'Photosynthesis is the process plants use to make food. Chlorophyll in leaves absorbs sunlight, which provides energy to convert carbon dioxide and water into glucose and oxygen. This process is essential for life on Earth.',
                'question': 'What role does sunlight play in photosynthesis?',
                'answer': 'It provides energy for the process',
                'distractors': ['It creates chlorophyll', 'It produces oxygen directly', 'It waters the plant']
            },
            {
                'text': 'The ancient Egyptians built pyramids as tombs for pharaohs. These massive structures required thousands of workers and took decades to complete. The precision of their construction still amazes engineers today.',
                'question': 'Why were the pyramids built?',
                'answer': 'As tombs for pharaohs',
                'distractors': ['As temples for worship', 'As storage for grain', 'As astronomical observatories']
            }
        ]
    }
    
    passage_data = random.choice(passages[difficulty])
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'<p>{passage_data["text"]}</p><br><strong>{passage_data["question"]}</strong>',
        'options': [passage_data['answer']] + passage_data['distractors'],
        'correct_answer': passage_data['answer'],
        'explanation': f'The passage states that {passage_data["answer"].lower()}.'
    }

def generate_vocabulary_question(difficulty):
    """Generate vocabulary in context questions"""
    vocab_items = {
        1: [
            ('The puppy was very small and fragile.', 'fragile', 'easily broken or damaged'),
            ('She felt anxious before the test.', 'anxious', 'worried or nervous'),
            ('The detective examined the evidence carefully.', 'examined', 'looked at closely'),
        ],
        2: [
            ('The landscape was barren and lifeless.', 'barren', 'empty and unable to support life'),
            ('His explanation was ambiguous and unclear.', 'ambiguous', 'having more than one meaning'),
            ('The artist was renowned for her portraits.', 'renowned', 'famous and respected'),
        ],
        3: [
            ('The scientist made a hypothesis before experimenting.', 'hypothesis', 'a proposed explanation'),
            ('The building\'s architecture was magnificent.', 'magnificent', 'extremely beautiful or impressive'),
            ('She showed great resilience after the setback.', 'resilience', 'ability to recover quickly'),
        ]
    }
    
    sentence, word, definition = random.choice(vocab_items[difficulty])
    
    # Generate distractor definitions
    all_items = vocab_items[1] + vocab_items[2] + vocab_items[3]
    distractors = []
    while len(distractors) < 3:
        _, _, distractor_def = random.choice(all_items)
        if distractor_def != definition and distractor_def not in distractors:
            distractors.append(distractor_def)
    
    options = [definition] + distractors
    random.shuffle(options)
    
    return {
        'type': 'Multiple Choice',
        'question_text': f'In the sentence: "{sentence}"<br><br>What does the word "{word}" mean?',
        'options': options,
        'correct_answer': definition,
        'explanation': f'In this context, "{word}" means {definition}.'
    }

if __name__ == "__main__":
    print("Generating 1000 English questions...")
    questions = generate_english_questions(1000)
    
    with open('../data/questions/english.json', 'w') as f:
        json.dump(questions, f, indent=2)
    
    print(f"Generated {len(questions)} questions successfully!")
    print(f"Sample question: {questions[0]}")
