"""
Vercel Serverless Function for TalentPulse Backend
This file is the entry point for Vercel's Serverless Functions.
"""

import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")

from main import app
from mangum import Mangum

# Create a Mangum handler for Vercel Serverless Functions
handler = Mangum(app)
