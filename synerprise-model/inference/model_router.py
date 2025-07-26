import re

def detect_input_type(text: str) -> str:
    """Detects whether the input is Bangla or Phonetic"""
    if re.search(r'[\u0980-\u09FF]', text):
        return "synerprise-bangla"
    return "synerprise-phonetic"
