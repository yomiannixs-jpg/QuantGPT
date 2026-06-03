from fastapi.responses import StreamingResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

app = FastAPI(title="Quant AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    mode: str = "General AI Chat"

def demo_response(message: str, mode: str):
    return f"""
Quant AI Demo Response

Mode: {mode}

Your message:
{message}

The frontend is successfully connected to the backend.

Real OpenAI responses will activate once your API billing/quota is restored.
"""

@app.get("/")
def home():
    return {"status": "Quant AI backend is running"}

@app.post("/chat")
def chat(request: ChatRequest):
    def generate():
        try:
            if client is None:
                yield demo_response(request.message, request.mode)
                return

            system_prompt = f"""
You are Quant AI, an advanced AI assistant for mathematics, science, engineering,
finance, economics, statistics, data analysis, research, coding, and education.

Current mode: {request.mode}

Support SAT, ACT, GRE, GMAT, LSAT, MCAT, Olympiads, AP Exams, WAEC, JAMB,
IGCSE, A-Level, mathematics, finance, economics, statistics, physics,
chemistry, engineering, computer science, data science, research, file analysis,
and stock analysis.

Formatting Rules:
- Use Markdown headings and subheadings.
- Use bullet points when appropriate.
- Use numbered steps for explanations.
- Use Markdown tables when presenting comparisons.
- Use LaTeX for all mathematical expressions.
- Use $...$ for inline formulas.
- Use $$...$$ for display equations.
- Never use raw \\( \\) or \\[ \\] delimiters.
- For programming examples, always use fenced code blocks with language tags.
- For research questions, answer like a professional research assistant.
- For finance questions, provide practical interpretation in addition to formulas.
- For educational questions, explain concepts step-by-step.
- For exam-preparation modes, provide worked solutions and final answers.
- Use concise formatting but preserve technical rigor.
"""

            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message},
                ],
                stream=True,
            )

            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta

        except Exception as e:
            yield demo_response(request.message, request.mode)
            yield f"\n\nBackend note: OpenAI call failed for now: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")
