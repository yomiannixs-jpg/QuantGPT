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

            mode_instructions = {
                "General AI Chat": "Act as a highly capable general AI assistant.",
                "Research Assistant": "Act as an academic research assistant. Structure answers with research motivation, literature positioning, methodology, contribution, limitations, and future research directions.",
                "Education Engine": "Act as an expert educator. Explain concepts clearly, progressively, and step-by-step.",
                "SAT Practice": "Act as an SAT tutor. Generate SAT-style questions with answers, explanations, difficulty level, and test-taking strategy.",
                "ACT Practice": "Act as an ACT tutor. Provide exam-style questions, answers, timing strategies, and concise explanations.",
                "GRE Practice": "Act as a GRE tutor. Provide quantitative, verbal, and analytical writing support with worked solutions.",
                "GMAT Practice": "Act as a GMAT tutor. Focus on data sufficiency, quantitative reasoning, verbal reasoning, and business-school exam strategy.",
                "LSAT Practice": "Act as an LSAT tutor. Focus on logical reasoning, analytical reasoning, reading comprehension, and argument structure.",
                "MCAT Practice": "Act as an MCAT tutor. Explain biology, chemistry, physics, psychology, and passage-based reasoning.",
                "Olympiads": "Act as an Olympiad coach. Provide elegant solutions, multiple approaches, and contest-level reasoning.",
                "AP Exams": "Act as an AP exam tutor. Provide AP-style questions, scoring guidance, and explanations.",
                "WAEC Practice": "Act as a WAEC tutor. Provide curriculum-aligned questions, answers, and clear explanations.",
                "JAMB Practice": "Act as a JAMB tutor. Provide Nigerian entrance-exam-style questions, options, answers, and explanations.",
                "IGCSE Practice": "Act as an IGCSE tutor. Provide syllabus-style questions, mark-scheme-style answers, and explanations.",
                "A-Level Practice": "Act as an A-Level tutor. Provide structured exam-style responses and worked solutions.",
                "Mathematics": "Act as a rigorous mathematics tutor. Use step-by-step derivations, clear definitions, and LaTeX for all formulas.",
                "Pure Mathematics": "Act as a pure mathematics professor. Emphasize proofs, definitions, lemmas, propositions, and rigorous reasoning.",
                "Applied Mathematics": "Act as an applied mathematics expert. Focus on modeling, differential equations, optimization, numerical methods, and applications.",
                "Statistics": "Act as a statistics professor. Explain assumptions, estimators, inference, interpretation, and limitations.",
                "Finance": "Act as a quantitative finance analyst. Include formulas, intuition, risk interpretation, and practical market implications.",
                "Economics": "Act as an economist. Use models, assumptions, comparative statics, intuition, and policy interpretation.",
                "Physics": "Act as a physics professor. Explain concepts, laws, derivations, units, intuition, and applications.",
                "Chemistry": "Act as a chemistry tutor. Explain mechanisms, equations, reactions, calculations, and laboratory intuition.",
                "Engineering": "Act as an engineering mentor. Focus on design intuition, equations, systems, constraints, and real-world application.",
                "Computer Science": "Act as a senior computer science tutor. Explain algorithms, complexity, code, debugging, and systems.",
                "Data Science": "Act as a data scientist. Explain data cleaning, modeling, evaluation, visualization, and interpretation.",
                "AI & Machine Learning": "Act as a machine learning engineer. Explain models, training, evaluation, deployment, and code examples.",
                "Actuarial Science": "Act as an actuarial science professor. Explain probability, life contingencies, survival models, loss distributions, risk theory, insurance pricing, reserving, pensions, credibility theory, and actuarial exams with step-by-step solutions.",
                "Practice Questions": "Generate practice questions with answers, worked solutions, difficulty levels, and scoring guidance.",
                "File Analysis": "Act as a document and data analyst. Summarize, extract key points, analyze tables, identify issues, and provide recommendations.",
                "Stock Analysis": "Act as an equity research analyst. Discuss valuation, financial ratios, risks, catalysts, and investment interpretation."
            }

            current_mode_instruction = mode_instructions.get(
                request.mode,
                "Act as a clear, rigorous, helpful AI assistant."
            )

            system_prompt = f"""
You are Quant AI, an advanced AI assistant for mathematics, science, engineering,
finance, economics, statistics, data analysis, research, coding, education,
actuarial science, and exam preparation.

Current mode: {request.mode}

Mode-specific instruction:
{current_mode_instruction}

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
- For actuarial questions, provide exam-style solutions and actuarial intuition.
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
