from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import uvicorn
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the models from a local folder
MODEL_DIR = "./models/edu-classifier"

if not os.path.exists(MODEL_DIR):
    print("Model not found locally. Downloading...")
    model_name = "distilbert-base-uncased-finetuned-sst-2-english"

    from transformers import AutoModelForSequenceClassification, AutoTokenizer
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)

    pipe = pipeline("text-classification", model=MODEL_DIR, tokenizer=MODEL_DIR)
    print("Success! Model saved locally")
else:
    print("Loading models from local storage...")
    pipe = pipeline("text-classification", model=MODEL_DIR, tokenizer=MODEL_DIR)


@app.get("/")
def health_check():
    return {"status": "AI Service is Online", "models": "DistilBERT (Local)"}


@app.post("/analyze")
async def analyze_student_answer(data: dict):
    student_text = data.get("text", "")
    if not student_text:
        return {"error": "No text provided"}

    # Run the AI
    prediction = pipe(student_text)
    return {"prediction": prediction}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
