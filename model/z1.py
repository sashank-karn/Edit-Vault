import os
import sys
import json
import cv2
import numpy as np
from PIL import Image
import pandas as pd
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration, CLIPProcessor, CLIPModel
from sklearn.metrics.pairwise import cosine_similarity
import gc
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import time
import threading
from queue import Queue
from functools import lru_cache
import concurrent.futures

nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# Initialize lemmatizer and stopwords
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# Set up device with optimized settings
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if device.type == 'cuda':
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.deterministic = False
    torch.backends.cudnn.enabled = True

# Load models with optimizations
print("Loading BLIP model...", file=sys.stderr)
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device).eval()

print("Loading CLIP model...", file=sys.stderr)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")

# Use half precision for CLIP if on CUDA
if device.type == 'cuda':
    clip_model = clip_model.half()
clip_model = clip_model.to(device).eval()

# Load data files
script_dir = os.path.dirname(__file__)
celebrity_df = pd.read_csv(os.path.join(script_dir, 'celebrities.csv'))
prototxt_path = os.path.join(script_dir, 'deploy.prototxt')
model_path = os.path.join(script_dir, 'res10_300x300_ssd_iter_140000.caffemodel')
face_net = cv2.dnn.readNetFromCaffe(prototxt_path, model_path)

# Global cache for celebrity embeddings
celebrity_embeddings_cache = {}

def clear_memory():
    """Efficiently clear GPU memory"""
    gc.collect()
    if device.type == 'cuda':
        torch.cuda.empty_cache()
        torch.cuda.synchronize()

def precompute_celebrity_embeddings():
    global celebrity_embeddings_cache
    cache_path = os.path.join(os.path.dirname(__file__), 'celebrity_embeddings_cache.npy')
    
    if os.path.exists(cache_path):
        print("Loading precomputed celebrity embeddings...", file=sys.stderr)
        celebrity_embeddings_cache = np.load(cache_path, allow_pickle=True).item()
        return

    print("Precomputing all celebrity embeddings...", file=sys.stderr)
    start_time = time.time()
    
    # Increase batch size for faster processing
    batch_size = 64 if device.type == 'cuda' else 32
    names = celebrity_df['DisplayName'].tolist()
    embeddings = {}

    for i in range(0, len(names), batch_size):
        batch_names = names[i:i+batch_size]
        batch_prompts = [f"photo of {name}" for name in batch_names]
        
        text_inputs = clip_processor(text=batch_prompts, return_tensors="pt", padding=True).to(device)
        
        with torch.no_grad():
            with torch.autocast(device_type=device.type, enabled=device.type=='cuda'):
                text_features = clip_model.get_text_features(**text_inputs)
                text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
                
                # Process batch at once for better efficiency
                for idx, name in enumerate(batch_names):
                    embeddings[name] = text_features[idx:idx+1].detach().cpu().numpy()
        
        # Clean up to prevent memory leaks
        del text_inputs, text_features
        if device.type == 'cuda':
            torch.cuda.empty_cache()

    np.save(cache_path, embeddings)
    celebrity_embeddings_cache = embeddings
    print(f"Precomputed {len(embeddings)} celebrity embeddings in {time.time() - start_time:.2f} seconds", file=sys.stderr)

# Precompute or load celebrity embeddings at startup
precompute_celebrity_embeddings()

@torch.no_grad()
def detect_face(image):
    """Detect if there's a face in the image with optimized processing"""
    # Resize image once to save computation
    if image.shape[0] > 300 or image.shape[1] > 300:
        resized = cv2.resize(image, (300, 300))
    else:
        resized = image
        
    blob = cv2.dnn.blobFromImage(resized, 1.0, (300, 300), (104.0, 177.0, 123.0))
    face_net.setInput(blob)
    detections = face_net.forward()
    
    # Use vectorized operation for faster detection
    confidence_threshold = 0.6
    detection_confidences = detections[0, 0, :, 2]
    return np.any(detection_confidences > confidence_threshold)

@torch.no_grad()
@lru_cache(maxsize=128)  # Cache results for repeated images
def generate_caption(image_path):
    """Generate caption for an image using BLIP with caching"""
    image = Image.open(image_path).convert("RGB").resize((224, 224))
    inputs = blip_processor(images=image, return_tensors="pt").to(device)
    
    with torch.autocast(device_type=device.type, enabled=device.type=='cuda'):
        out = blip_model.generate(**inputs, max_length=50)
    
    caption = blip_processor.decode(out[0], skip_special_tokens=True)
    
    # Clean up to prevent memory leaks
    del inputs, out
    return caption

@torch.no_grad()
def detect_celebrity_with_clip(image_path, celebrity_df):
    """Detect celebrity in image using CLIP with optimized similarity calculation"""
    # Load and preprocess image efficiently
    image = Image.open(image_path).convert("RGB").resize((224, 224))
    inputs = clip_processor(images=image, return_tensors="pt").to(device)
    
    # Get image features with optimized inference
    with torch.autocast(device_type=device.type, enabled=device.type=='cuda'):
        image_features = clip_model.get_image_features(**inputs)
    
    # Normalize features
    image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
    image_features_cpu = image_features.detach().cpu().numpy()
    
    # Use vectorized operations for faster similarity calculation
    names = celebrity_df['DisplayName'].tolist()
    all_embeddings = np.vstack([celebrity_embeddings_cache[name] for name in names])
    
    # Compute similarities in one vectorized operation
    similarities = cosine_similarity(image_features_cpu, all_embeddings).flatten()
    
    # Find the best match
    best_idx = np.argmax(similarities)
    highest_similarity = similarities[best_idx]
    best_match = names[best_idx] if highest_similarity > 0.3 else "No celebrity recognized"
    
    # Clean up memory
    del inputs, image_features
    
    return best_match

def normalize_tags(tags):
    """Normalize tags: Lowercase, remove stopwords, and apply lemmatization"""
    # Process all tags in one go for better efficiency
    normalized_tags = []
    for tag in tags:
        tag = tag.lower()
        if tag not in stop_words:
            normalized_tags.append(lemmatizer.lemmatize(tag))
    return normalized_tags

def extract_tags_from_caption(caption):
    """Extract and normalize tags from a caption"""
    words = caption.split()
    tags = normalize_tags(words)
    return tags

def process_image(image_input):
    """Process a single image to get caption, tags, and celebrity"""
    if isinstance(image_input, str):
        image = cv2.imread(image_input)
        pil_path = image_input
    else:
        pil_path = 'temp.jpg'
        cv2.imwrite(pil_path, image_input)
        image = image_input

    celebrity_name = "No celebrity recognized"
    if detect_face(image):
        celebrity_name = detect_celebrity_with_clip(pil_path, celebrity_df)
    
    caption = generate_caption(pil_path)
    tags = extract_tags_from_caption(caption)

    # Only delete if it's a temporary image
    if not isinstance(image_input, str) and os.path.exists(pil_path):
        os.remove(pil_path)
    
    return caption, tags, celebrity_name

@lru_cache(maxsize=1024)
def simplify_caption(caption):
    """Simplify caption for comparison with caching for repeated captions"""
    words = caption.lower().split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return ' '.join(words)

class VideoFrameReader:
    """Threaded video frame reader with improved performance"""
    def __init__(self, video_path, frame_skip=15, queue_size=128):
        self.cap = cv2.VideoCapture(video_path)
        self.frame_skip = frame_skip
        self.queue = Queue(maxsize=queue_size)
        self.stopped = False
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
    def start(self):
        threading.Thread(target=self.update, daemon=True).start()
        return self
        
    def update(self):
        current_frame = 0
        while not self.stopped:
            if self.queue.full():
                time.sleep(0.01)  # Reduced sleep time for better responsiveness
                continue
                
            ret, frame = self.cap.read()
            if not ret:
                self.stopped = True
                break
                
            if current_frame % self.frame_skip == 0:
                # Resize frame to save memory if it's large
                if frame.shape[0] > 720 or frame.shape[1] > 1280:
                    frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
                self.queue.put(frame)
                
            current_frame += 1
            
            if current_frame >= self.total_frames:
                self.stopped = True
                
    def read(self):
        return self.queue.get()
        
    def more(self):
        return not self.stopped or not self.queue.empty()
        
    def stop(self):
        self.stopped = True
        self.cap.release()

def process_batch(batch_frames):
    """Process a batch of frames in parallel"""
    return [process_image(frame) for frame in batch_frames]

def process_video(video_path, frame_skip=15):
    """Process video to extract captions, tags, and celebrities with parallel processing"""
    video_reader = VideoFrameReader(video_path, frame_skip=frame_skip).start()
    all_captions, all_tags, celebrity_names = [], [], []
    simplified_to_original = {}

    # Determine optimal batch size based on available resources
    batch_size = 16 if device.type == 'cuda' else 8
    max_workers = min(os.cpu_count(), 4)  # Limit max workers to prevent memory issues
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        while video_reader.more():
            batch_frames = []
            while len(batch_frames) < batch_size and video_reader.more():
                batch_frames.append(video_reader.read())
            
            if not batch_frames:
                break
                
            # Process batch in parallel
            future = executor.submit(process_batch, batch_frames)
            results = future.result()
            
            for caption, tags, celebrity in results:
                all_captions.append(caption)
                all_tags.extend(tags)
                if celebrity != "No celebrity recognized":
                    celebrity_names.append(celebrity)
                simplified = simplify_caption(caption)
                if simplified not in simplified_to_original:
                    simplified_to_original[simplified] = caption

    video_reader.stop()

    # Aggregate results efficiently
    simplified_counts = Counter([simplify_caption(c) for c in all_captions])
    most_common_simplified = simplified_counts.most_common(2)
    top_captions = [simplified_to_original[s] for s, _ in most_common_simplified] if most_common_simplified else ["No captions"]
    
    # Use Counter for efficient tag counting
    tag_counts = Counter(all_tags)
    top_tags = [tag for tag, count in tag_counts.most_common(10)]
    
    # Find most common celebrity
    most_common_celebrity = Counter(celebrity_names).most_common(1)
    top_celebrity = most_common_celebrity[0][0] if most_common_celebrity else "No celebrity recognized"

    clear_memory()
    return top_captions, top_tags, top_celebrity

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        return

    file_path = sys.argv[1]

    # Process the file (image or video)
    try:
        if file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            caption, tags, celebrity_name = process_image(file_path)
            result = {
                "caption": caption,
                "tags": tags,
                "celebrity": celebrity_name
            }
        elif file_path.lower().endswith(('.mp4', '.avi', '.mkv')):
            captions, tags, celebrity_name = process_video(file_path)
            result = {
                "captions": captions,
                "tags": tags,
                "celebrity": celebrity_name
            }
        else:
            result = {"error": "Unsupported file type"}

        print(json.dumps(result))  # Output the result as JSON
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
