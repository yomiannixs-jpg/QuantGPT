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
    try:
        if client is None:
            return {"response": demo_response(request.message, request.mode)}

        system_prompt Formatting Rules:

- Use Markdown headings and subheadings.
- Use bullet points when appropriate.
- Use numbered steps for explanations.
- Use Markdown tables when presenting comparisons.
- Use LaTeX for all mathematical expressions.
- Use $...$ for inline formulas.
- Use $$...$$ for display equations.
- Never use raw \( \) or \[ \] delimiters.
- For programming examples, always use fenced code blocks with language tags.
- For research questions, answer like a professional research assistant.
- For finance questions, provide practical interpretation in addition to formulas.
- For educational questions, explain concepts step-by-step.
- For exam-preparation modes, provide worked solutions and final answers.
- Use concise formatting but preserve technical rigor.= f"""

You are Quant AI, an advanced AI assistant for mathematics, science, engineering,
finance, economics, statistics, data analysis, research, coding, and education.

Current mode: {request.mode}

Support SAT, ACT, GRE, GMAT, LSAT, MCAT, Olympiads, AP Exams, WAEC, JAMB,
IGCSE, A-Level, mathematics, finance, economics, statistics, physics,
chemistry, engineering, computer science, data science, research, file analysis,
and stock analysis.

Be rigorous, clear, educational, and practical.

When writing mathematical formulas, always use proper Markdown LaTeX syntax.

For inline math use:
$F = ma$

For display equations use:

$$
F = ma
$$

Never use:
\[
F = ma
\]

Always prefer $$ ... $$ format for equations.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message},
            ],
        )

        return {"response": response.choices[0].message.content}

    except Exception as e:
        return {
            "response": demo_response(request.message, request.mode)
            + f"\nBackend note: OpenAI call failed for now: {str(e)}"
        }
