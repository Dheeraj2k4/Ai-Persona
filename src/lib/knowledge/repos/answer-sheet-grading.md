# Automated Answer Sheet Grading System

**Repository:** https://github.com/Dheeraj2k4/Automated_Answer_Sheet_Grading_System
**Primary Languages:** HTML (50%), Python (32%), CSS (18%)
**Year:** 2025

## Purpose
AI-powered evaluation system for handwritten student answer sheets. Extracts text via OCR, evaluates answers using multiple scoring methods (statistical + ML + LLM), and generates personalized feedback. Claims 89% grading accuracy.

## Tech Stack
- **Backend:** Python + Flask
- **OCR:** Google Vision API (for handwriting recognition)
- **LLM:** Mistral 7B via Ollama (local, free semantic evaluation)
- **NLP:** NLTK, Sklearn, Transformers
- **Frontend:** Bootstrap + HTML/CSS
- **Database:** MySQL

## Architecture
Multi-stage evaluation pipeline:
1. **OCR Stage:** Google Cloud Vision API extracts text from handwritten answer images
2. **Preprocessing:** Tokenization, lemmatization, stop word removal via NLTK
3. **Scoring Pipeline:**
   - Exact match scoring
   - Token overlap analysis
   - TF-IDF cosine similarity
   - Sentiment analysis
   - Semantic scoring via Mistral 7B (Ollama)
   - Naive Bayes classification
4. **Weighted Composite:** All scores combined into final grade
5. **Feedback Generation:** LLM generates actionable per-answer feedback

## Design Tradeoffs
- **Ollama (local LLM) over cloud APIs:** Zero cost for semantic evaluation. Tradeoff: requires local GPU or slower CPU inference.
- **Multiple scoring methods:** Combines statistical (TF-IDF, token overlap) + ML (Naive Bayes) + LLM (Mistral). More robust than single-method scoring. Tradeoff: more complex pipeline, harder to debug.
- **Google Cloud Vision for OCR:** Best accuracy on handwriting. Tradeoff: has API costs (could use Tesseract for free but lower accuracy on handwriting).
- **Flask over FastAPI:** Simpler for this use case. Tradeoff: synchronous, no built-in async support.

## What I'd Do Differently
- Add batch processing for entire class submissions
- Implement a teacher feedback loop to improve scoring weights
- Use a fine-tuned model specifically for answer evaluation
- Add support for diagram/equation recognition
- Build a proper dashboard for teachers to review and override grades
- Containerize with Docker for easier deployment

## Key Achievements
- 89% accuracy on grading evaluations
- End-to-end pipeline from handwritten image to scored + feedback
- Multi-page document support
- Actionable per-answer feedback generation
