import spacy

MODEL_PATH = "mental_health_ner" 
nlp = spacy.load(MODEL_PATH)

MENTAL_HEALTH_CATEGORIES = {
    "Anxiety": {
        "keywords": [
            "anxious", "panic", "worried", "overthinking", "nervous", "uneasy", "tense", 
            "restless", "calm", "relaxed", "dread", "apprehensive", "jittery", "paranoid", 
            "on edge", "fearful", "hesitant"
        ],
        "intensity": {
            "suicide": 10, "panic": 9, "anxious": 8, "nervous": 7, "worried": 6, "overthinking": 7, 
            "uneasy": 5, "tense": 5, "restless": 5, "dread": 8, "apprehensive": 6, "jittery": 7, 
            "paranoid": 9, "on edge": 8, "fearful": 7, "hesitant": 4, "calm": 2, "relaxed": 1
        }
    },
    "Depression": {
        "keywords": [
            "sad", "hopeless", "worthless", "unmotivated", "empty", "down", "gloomy", 
            "lonely", "content", "hopeful", "miserable", "melancholy", "drained", 
            "isolated", "despair", "numb", "apathetic"
        ],
        "intensity": {
            "hopeless": 10, "depressed": 9, "worthless": 9, "sad": 7, "unmotivated": 6, 
            "empty": 8, "down": 5, "gloomy": 4, "lonely": 5, "miserable": 8, "melancholy": 7, 
            "drained": 7, "isolated": 9, "despair": 10, "numb": 9, "apathetic": 6, 
            "content": 2, "hopeful": 1, "happy": 1,
        }
    },
    "Stress": {
        "keywords": [
            "stressed", "pressure", "overwhelmed", "burnout", "tension", "frustrated", 
            "exhausted", "agitated", "focused", "motivated", "irritable", "snappy", 
            "drained", "worked up", "short-tempered"
        ],
        "intensity": {
            "burnout": 10, "overwhelmed": 9, "stressed": 8, "pressure": 7, "tension": 6, 
            "frustrated": 5, "exhausted": 4, "agitated": 3, "irritable": 6, "snappy": 6, 
            "drained": 7, "worked up": 6, "short-tempered": 5, "focused": 2, "motivated": 1, 
            "sleepy": 2
        }
    },
    "Insomnia": {
        "keywords": [
            "can't sleep", "insomnia", "restless", "sleep-deprived", "awake", "nightmare", 
            "tossing", "turning", "well-rested", "refreshed", "wide awake", "sleepless", 
            "lethargic", "overtired", "exhausted", "night terrors"
        ],
        "intensity": {
            "insomnia": 10, "sleep-deprived": 9, "restless": 8, "can't sleep": 7, "awake": 6, 
            "nightmare": 5, "night terrors": 9, "tossing": 4, "turning": 3, "wide awake": 6, 
            "sleepless": 8, "lethargic": 5, "overtired": 6, "exhausted": 7, 
            "well-rested": 2, "refreshed": 1
        }
    },
    "Eating Disorder": {
        "keywords": [
            "not eating", "overeating", "binge eating", "starving", "food issue", 
            "skipping meals", "losing appetite", "craving food", "healthy eating", 
            "balanced diet", "purging", "underweight", "overweight", "dieting", "body image"
        ],
        "intensity": {
            "binge eating": 10, "starving": 9, "overeating": 8, "food issue": 7, 
            "not eating": 6, "skipping meals": 5, "losing appetite": 4, "purging": 9, 
            "underweight": 7, "overweight": 7, "dieting": 5, "body image": 6, 
            "craving food": 3, "healthy eating": 2, "balanced diet": 1
        }
    },
    "PTSD": {
        "keywords": [
            "flashback", "trauma", "nightmare", "panic attack", "startled", "hypervigilant", 
            "numb", "intrusive thoughts", "detached", "triggers", "shaking", "paranoia", 
            "dissociation", "fear", "jumpy"
        ],
        "intensity": {
            "flashback": 10, "trauma": 9, "nightmare": 8, "panic attack": 9, "startled": 7, 
            "hypervigilant": 8, "numb": 6, "intrusive thoughts": 9, "detached": 7, 
            "triggers": 9, "shaking": 7, "paranoia": 9, "dissociation": 10, "fear": 7, 
            "jumpy": 6
        }
    },
    "OCD": {
        "keywords": [
            "compulsive", "obsessive", "intrusive thoughts", "rituals", "checking", 
            "repeating", "cleaning", "contamination fear", "perfectionism", "fixation", 
            "uncontrollable urges"
        ],
        "intensity": {
            "compulsive": 9, "obsessive": 9, "intrusive thoughts": 10, "rituals": 8, 
            "checking": 6, "repeating": 7, "cleaning": 6, "contamination fear": 8, 
            "perfectionism": 5, "fixation": 7, "uncontrollable urges": 9
        }
    },
    "Social Anxiety": {
        "keywords": [
            "fear of judgment", "self-conscious", "social withdrawal", "nervous in crowds", 
            "avoidant", "blushing", "shaky voice", "afraid of talking", "overanalyzing", 
            "avoiding eye contact"
        ],
        "intensity": {
            "fear of judgment": 9, "self-conscious": 8, "social withdrawal": 9, 
            "nervous in crowds": 7, "avoidant": 8, "blushing": 6, "shaky voice": 5, 
            "afraid of talking": 7, "overanalyzing": 6, "avoiding eye contact": 5
        }
    }
}


def extract_mental_health_concerns(text):
    doc = nlp(text)
    concerns = [ent.text for ent in doc.ents if ent.label_ == "MENTAL_HEALTH_CONCERN"]
    return concerns

def classify_concern(concern_text):
    for category, data in MENTAL_HEALTH_CATEGORIES.items():
        if any(keyword in concern_text.lower() for keyword in data["keywords"]):
            return category
    return "Other"  

def score_intensity(concern_text):
    intensity_score = 0
    for category, data in MENTAL_HEALTH_CATEGORIES.items():
        for keyword, score in data["intensity"].items():
            if keyword in concern_text.lower():
                intensity_score = max(intensity_score, score)
    return intensity_score if intensity_score > 0 else 1  
