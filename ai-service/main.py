from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

# Point to the LOCAL FOLDER you just created
MODEL_PATH = "./models/similarity-model"
model = SentenceTransformer(MODEL_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For testing
    allow_methods=["*"],
    allow_headers=["*"],
)


class CompareRequest(BaseModel):
    student_answer: str
    correct_answer: str


@app.post("/analyze")
async def analyze(data: CompareRequest):
    # The AI turns text into math vectors
    embeddings = model.encode([data.student_answer, data.correct_answer])

    # It calculates the "Cosine Similarity" (0.0 to 1.0)
    score = util.cos_sim(embeddings[0], embeddings[1]).item()

    # Feedback Logic
    if score > 0.8:
        msg = "Correct! Great job."
    elif score > 0.5:
        msg = "Close, but you missed some key technical terms."
    else:
        msg = "Incorrect. Please review the lecture notes."

    return {"score": round(score, 4), "feedback": msg}