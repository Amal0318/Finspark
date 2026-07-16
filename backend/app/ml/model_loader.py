import os
import joblib
from typing import Any, Optional
from app.utils.logger import logger

class ModelLoader:
    """
    Handles saving and loading serialized scikit-learn model artifacts.
    """
    MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
    _loaded_models = {}

    @classmethod
    def init_models(cls):
        """Loads models into memory on application startup."""
        logger.info("Initializing and caching ML models in memory...")
        cls._loaded_models["isolation_forest"] = cls.load_model("isolation_forest.pkl")
        cls._loaded_models["random_forest"] = cls.load_model("random_forest.pkl")
        
    @classmethod
    def get_model(cls, name: str) -> Optional[Any]:
        """Retrieves a cached model."""
        return cls._loaded_models.get(name)

    @classmethod
    def save_model(cls, model: Any, filename: str) -> str:
        """Serializes and saves a model artifact to the designated location."""
        filepath = os.path.join(cls.MODELS_DIR, filename)
        logger.info(f"Saving model to: {filepath}")
        try:
            joblib.dump(model, filepath)
            logger.info("Model saved successfully.")
            return filepath
        except Exception as e:
            logger.error(f"Error saving model to {filepath}: {e}")
            raise e

    @classmethod
    def load_model(cls, filename: str) -> Optional[Any]:
        """Loads and deserializes a model artifact from disk."""
        filepath = os.path.join(cls.MODELS_DIR, filename)
        logger.info(f"Loading model from: {filepath}")
        if not os.path.exists(filepath):
            logger.warning(f"Model file not found at: {filepath}")
            return None
        try:
            model = joblib.load(filepath)
            logger.info("Model loaded successfully.")
            return model
        except Exception as e:
            logger.error(f"Error loading model from {filepath}: {e}")
            return None
