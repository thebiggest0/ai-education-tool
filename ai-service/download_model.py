from sentence_transformers import SentenceTransformer
import os

# Define where you want to save it
model_path = "./models/similarity-model"

# Download and save
print("Downloading all-MiniLM-L6-v2...")
model = SentenceTransformer('all-MiniLM-L6-v2')
model.save(model_path)
print(f"Model successfully saved to {model_path}")