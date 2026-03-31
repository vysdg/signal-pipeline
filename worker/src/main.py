import os
from dotenv import load_dotenv
load_dotenv()

from src.services.consumer import start_consumer

if __name__ == "__main__":
    start_consumer()
