import numpy as np
import os

# Path to the cache file
cache_path = os.path.join(os.path.dirname(__file__), 'celebrity_embeddings_cache.npy')

if os.path.exists(cache_path):
    # Load the cache file
    celebrity_embeddings_cache = np.load(cache_path, allow_pickle=True).item()
    
    # Print basic information about the cache
    print(f"Cache file loaded successfully!")
    print(f"Number of celebrities: {len(celebrity_embeddings_cache)}")
    
    # Print the first few keys (celebrity names)
    print("Sample celebrity names:")
    for i, name in enumerate(celebrity_embeddings_cache.keys()):
        print(f"  {i+1}. {name}")
        if i >= 4:  # Show only the first 5 names
            break
else:
    print("Cache file not found!")