import logging
import sys

# Configure logger format
logging_format = (
    "[%(asctime)s] %(levelname)-8s %(name)s: %(message)s"
)

logging.basicConfig(
    level=logging.INFO,
    format=logging_format,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Export application logger
logger = logging.getLogger("cybersense")
logger.setLevel(logging.INFO)
