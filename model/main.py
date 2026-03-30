import datetime
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from ner_model import classify_concern, extract_mental_health_concerns, score_intensity
from polarity import get_sentiment
from pymongo import MongoClient
from timeline_analysis import TimelineSentimentAnalyzer

# Load environment variables
load_dotenv()

API_KEY = os.getenv("API_KEY")

# Initialize Flask app
app = Flask(__name__)

# Dynamic CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default for local dev
    "http://localhost:3000",  # Alternative local dev
    "http://127.0.0.1:5173",  # Alternative localhost
    "https://kalravhealth.netlify.app",  # Replace with your actual Netlify URL
]

# Add Render-specific origin if running on Render (optional, adjust as needed)
if os.getenv("RENDER"):
    ALLOWED_ORIGINS.append(
        "https://mental-health-ai-rilr.onrender.com"
    )  # Replace with your Render URL

CORS(
    app,
    origins=ALLOWED_ORIGINS,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True,
)

# Gemini API setup
chat_sessions = {}

# MongoDB Connection
ATLAS_URI = "mongodb+srv://administrator:administrator@kalravcluster1.h3fsh.mongodb.net/?retryWrites=true&w=majority&appName=KalRavCluster1"
client = MongoClient(ATLAS_URI)
db = client["mental_health_db"]
collection = db["user_inputs"]

# Initialize timeline analyzer
timeline_analyzer = TimelineSentimentAnalyzer()
INITIAL_QUESTION = "Hi! Let's begin. How are you feeling today?"

##### Response in the report page generator function

# def generate_response_based_on_sentiment(user_input, sentiment):
#     """Generate a response from Gemini based on user input and sentiment, focusing on providing help and guidance."""
#     model = genai.GenerativeModel("gemini-1.5-pro")

#     # Create a prompt for a detailed, helpful response
#     prompt = f"""
#     The user said: "{user_input}"
#     The detected sentiment is: {sentiment}

#     Please respond in three parts:
#     1. Provide a brief but warm acknowledgment of their feelings.
#     2. Offer specific, practical steps they can take to improve or maintain their emotional well-being.
#     3. Include a final encouraging statement that reassures them.

#     If the sentiment is positive, acknowledge and encourage maintaining it with good habits.
#     If the sentiment is negative, offer supportive guidance and coping strategies.
#     Keep the response under 200 words, and make it clear, actionable, and conversational.
#     """

#     try:
#         response = model.generate_content(prompt)
#         if response and response.text:
#             return response.text.strip()
#     except Exception as e:
#         print(f"Error generating response: {e}")

#     # Fallback responses
#     if sentiment.lower() == "negative":
#         return (
#             "I'm here for you. It sounds like you're going through a tough time. "
#             "Try taking deep breaths, journaling your thoughts, or reaching out to a friend or professional. "
#             "You're not alone, and things can improve with small steps."
#         )
#     elif sentiment.lower() == "positive":
#         return (
#             "That's great to hear! Keep nurturing your positivity by practicing gratitude, "
#             "engaging in activities that bring you joy, and staying connected with supportive people."
#         )
#     else:
#         return (
#             "I hear you. Consider taking some time for yourself today—whether it's a short break, "
#             "listening to your favorite music, or simply reflecting on your emotions. Self-care is important."
#         )


@app.route("/api/process_input", methods=["POST"])
def process_input():
    """Process user input, analyze sentiment and mental health concerns, store the data."""
    data = request.get_json()
    user_input = data.get("sentence", "").strip()
    user_id = data.get("userId", "anonymous")  # Get user ID if available

    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    if user_input.lower() == "exit":
        return jsonify({"message": "Exiting..."})

    if user_input.lower() == "report":
        return jsonify({"report": timeline_analyzer.generate_graph("daily")})

    # Analyze the input
    sentiment, keywords = get_sentiment(user_input)
    concerns = extract_mental_health_concerns(user_input)

    # Better error handling for concern processing
    concern_categories = {}
    concern_intensities = {}

    # Process each concern and ensure proper numeric intensity scores
    for concern in concerns:
        try:
            # Classify the concern
            category = classify_concern(concern)
            concern_categories[concern] = category

            # Score the intensity (ensure it's a float)
            intensity = score_intensity(concern)
            # Convert to float if not already
            if isinstance(intensity, (int, float)):
                concern_intensities[concern] = float(intensity)
            else:
                # Default value if conversion fails
                concern_intensities[concern] = 5.0

        except Exception as e:
            print(f"Error processing concern '{concern}': {e}")
            # Provide default values if processing fails
            if concern not in concern_categories:
                concern_categories[concern] = "general"
            if concern not in concern_intensities:
                concern_intensities[concern] = 5.0

    # Generate response based on sentiment
    # response_message = generate_response_based_on_sentiment(user_input, sentiment)

    # Format intensity scores for MongoDB storage
    formatted_intensity_scores = {}
    for concern, score in concern_intensities.items():
        formatted_intensity_scores[concern] = float(score)

    # Store input data in MongoDB
    entry = {
        "userId": user_id,
        "text": user_input,
        "sentiment": sentiment,
        "keywords": keywords if keywords else [],
        "concerns": concerns if concerns else [],
        "concern_categories": concern_categories if concern_categories else {},
        "intensity_scores": formatted_intensity_scores,  # Store as properly formatted dictionary
        "timestamp": datetime.datetime.utcnow(),
    }

    # Insert into MongoDB
    try:
        collection.insert_one(entry)
    except Exception as e:
        print(f"MongoDB insertion error: {e}")

    # Add to timeline analyzer
    timeline_analyzer.add_input(
        user_id, user_input, concerns, concern_categories, concern_intensities
    )

    # Return the processed data
    response = {
        "sentiment": sentiment,
        "keywords": keywords if keywords else [],
        "concerns": concerns if concerns else [],
        "concern_categories": concern_categories if concern_categories else {},
        "intensity_scores": concern_intensities if concern_intensities else {},
        # Add alert flag if any score is above 9
        "high_intensity_alert": any(
            score > 9 for score in concern_intensities.values()
        ),
    }

    return jsonify(response)


# Modify the get_history function in main.py to include text content
@app.route("/api/intensity-history", methods=["GET"])
def get_history():
    """Fetch historical intensity scores for plotting trend data."""
    # Get timeframe parameter, default to 'daily' if not provided
    timeframe = request.args.get("timeframe", "daily")

    # Determine the time range based on timeframe
    now = datetime.datetime.utcnow()
    if timeframe == "hourly":
        start_time = now - datetime.timedelta(hours=1)
    elif timeframe == "weekly":
        start_time = now - datetime.timedelta(weeks=1)
    elif timeframe == "monthly":
        start_time = now - datetime.timedelta(days=30)
    else:  # Default to daily
        start_time = now - datetime.timedelta(days=1)

    # Query MongoDB with the timeframe filter
    # Include text in the returned data to display message content in alerts
    history = list(
        collection.find(
            {"timestamp": {"$gte": start_time}},
            {"_id": 0, "timestamp": 1, "text": 1, "intensity_scores": 1},
        )
    )

    formatted_history = []

    for entry in history:
        timestamp_str = entry["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        intensity_scores = entry.get("intensity_scores", {})
        text = entry.get("text", "")

        # Convert intensity_scores dictionary into a list of { concern, score }
        formatted_scores = []
        for concern, score in intensity_scores.items():
            # Convert score to float if it's not already
            try:
                score_value = float(score)
            except (ValueError, TypeError):
                score_value = 0.0

            formatted_scores.append({"concern": concern, "score": score_value})

        formatted_history.append(
            {
                "timestamp": timestamp_str,
                "text": text,
                "intensity_scores": formatted_scores,
            }
        )

    if formatted_history:
        return jsonify({"history": formatted_history})
    else:
        return jsonify({"history": []})  # Return empty array instead of error


# Ensure the get_graph endpoint is working properly
@app.route("/api/get_graph", methods=["POST"])
def get_graph():
    """Generate a graph based on the selected timeframe (hourly, daily, weekly)."""
    data = request.get_json()
    timeframe = data.get("timeframe", "daily")

    graph = timeline_analyzer.generate_graph(timeframe)

    # Return the data in the format the frontend expects
    return jsonify({"data": graph}) if graph else jsonify({"data": []})


@app.route("/api/test", methods=["GET"])
def test_cors():
    """Test endpoint to verify CORS configuration."""
    return jsonify({"message": "CORS is working"})


# Main Deployment and Development server code
if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", 5000))
        print(f"Starting server on port {port}")
        if os.getenv("RENDER"):
            from gunicorn.app.wsgiapp import run

            os.environ["GUNICORN_CMD_ARGS"] = f"-b 0.0.0.0:{port} -w 4"
            run()
        else:
            app.run(host="0.0.0.0", port=port, debug=True, ssl_context=None)
    except Exception as e:
        print(f"Error starting server: {e}")
