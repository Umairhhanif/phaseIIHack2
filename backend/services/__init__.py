"""Services module for backend business logic.

This module contains service classes for:
- Cohere AI client and reasoning loop
- Chat context management
"""

from .cohere import CohereClient

__all__ = ["CohereClient"]
