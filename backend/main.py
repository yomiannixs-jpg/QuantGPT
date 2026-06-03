from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
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

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    mode: str = "General AI Chat"
    history: list[ChatMessage] = []

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

def get_mode_instruction(mode: str):
    mode_instructions = {
        "General AI Chat": "Act as a highly capable general AI assistant.",
        "Research Assistant": "Act as an academic research assistant. Structure answers with research motivation, literature positioning, methodology, contribution, limitations, and future research directions.",
        "Education Engine": "Act as an expert educator. Explain concepts clearly, progressively, and step-by-step.",

        "Academic Writing": "Act as an academic writing assistant. Provide structured academic prose, APA/Harvard/Chicago citation guidance, literature review support, and publication-quality improvements.",

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
        "Accounting": "Act as an accounting professor and professional accountant. Explain financial accounting, management accounting, auditing, taxation, IFRS, financial statements, journal entries, consolidation, budgeting, costing, and analysis with examples and clear step-by-step explanations.",
        "CFA Exam": "Act as a CFA exam tutor. Cover CFA Level I, II, and III topics including ethics, quantitative methods, economics, financial statement analysis, corporate issuers, equity, fixed income, derivatives, alternative investments, portfolio management, wealth planning, and exam-style question practice with formulas and explanations.",
        "ICAN Exam": "Act as an ICAN exam tutor for Nigerian professional accounting exams. Explain financial accounting, management accounting, audit and assurance, taxation, public sector accounting, corporate reporting, strategic financial management, business law, ethics, and exam-style solutions aligned with ICAN-style reasoning.",

        "Actuarial Science": "Act as an actuarial science professor. Explain probability, life contingencies, survival models, loss distributions, risk theory, insurance pricing, reserving, pensions, credibility theory, and actuarial exams with step-by-step solutions.",
        "SOA Exam P": "Act as an SOA Exam P tutor. Focus on probability, distributions, expectation, variance, conditional probability, risk models, exam shortcuts, and worked solutions.",
        "SOA Exam FM": "Act as an SOA Exam FM tutor. Focus on interest theory, annuities, loans, bonds, immunization, duration, convexity, and calculator-style exam methods.",
        "IFOA CS1": "Act as an IFOA CS1 tutor. Focus on probability, statistics, regression, survival models, and actuarial exam-style solutions.",
        "IFOA CM1": "Act as an IFOA CM1 tutor. Focus on financial mathematics, life contingencies, annuities, assurances, premiums, reserves, and actuarial notation.",

        "Physics": "Act as a physics professor. Explain concepts, laws, derivations, units, intuition, and applications.",
        "Chemistry": "Act as a chemistry tutor. Explain mechanisms, equations, reactions, calculations, and laboratory intuition.",
        "Engineering": "Act as an engineering mentor. Focus on design intuition, equations, systems, constraints, and real-world application.",
        "Computer Science": "Act as a senior computer science tutor. Explain algorithms, complexity, code, debugging, and systems.",
        "Data Science": "Act as a data scientist. Explain data cleaning, modeling, evaluation, visualization, and interpretation.",
        "AI & Machine Learning": "Act as a machine learning engineer. Explain models, training, evaluation, deployment, and code examples.",
        "Practice Questions": "Generate practice questions with answers, worked solutions, difficulty levels, and scoring guidance.",
        "File Analysis": "Act as a document and data analyst. Summarize, extract key points, analyze tables, identify issues, and provide recommendations.",
        "Stock Analysis": "Act as an equity research analyst. Discuss valuation, financial ratios, risks, catalysts, and investment interpretation.",
    }

    return mode_instructions.get(mode, "Act as a clear, rigorous, helpful AI assistant.")

def build_system_prompt(mode: str):
    return f"""
You are Quant AI, an advanced AI assistant for mathematics, science, engineering,
finance, economics, accounting, statistics, data analysis, research, coding,
education, actuarial science, and exam preparation.

Current mode: {mode}

Mode-specific instruction:
{get_mode_instruction(mode)}

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
- For accounting questions, include journal entries, statements, and interpretation when relevant.
- For CFA and ICAN exam questions, provide exam-style reasoning, worked solutions, and final answers.
- For educational questions, explain concepts step-by-step.
- For actuarial questions, provide exam-style solutions and actuarial intuition.
- For exam-preparation modes, provide worked solutions and final answers.
- Use concise formatting but preserve technical rigor.
"""

@app.post("/chat")
def chat(request: ChatRequest):
    def generate():
        try:
            if client is None:
                yield demo_response(request.message, request.mode)
                return

            chat_messages = [
                {
                    "role": "system",
                    "content": build_system_prompt(request.mode),
                }
            ]

            for item in request.history[-12:]:
                if item.role in ["user", "assistant"]:
                    chat_messages.append({
                        "role": item.role,
                        "content": item.text,
                    })

            chat_messages.append({
                "role": "user",
                "content": request.message,
            })

            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=chat_messages,
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

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    mode: str = Form("File Analysis")
):
    try:
        content = await file.read()
        filename = file.filename.lower()

        text = ""
        chart_markdown = ""

        if filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")

        elif filename.endswith(".csv"):
            import pandas as pd
            import io
            import matplotlib.pyplot as plt
            import base64

            df = pd.read_csv(io.BytesIO(content))
            text = df.head(50).to_string(index=False)

            numeric_cols = df.select_dtypes(include="number").columns.tolist()

            if len(numeric_cols) >= 1:
                plt.figure(figsize=(8, 4))
                df[numeric_cols[:3]].head(50).plot()
                plt.title("Preview Chart")
                plt.tight_layout()

                buffer = io.BytesIO()
                plt.savefig(buffer, format="png")
                plt.close()
                buffer.seek(0)

                encoded = base64.b64encode(buffer.read()).decode("utf-8")
                chart_markdown = f"\n\n![Generated Chart](data:image/png;base64,{encoded})\n"

        elif filename.endswith(".xlsx"):
            import pandas as pd
            import io
            import matplotlib.pyplot as plt
            import base64

            df = pd.read_excel(io.BytesIO(content))
            text = df.head(50).to_string(index=False)

            numeric_cols = df.select_dtypes(include="number").columns.tolist()

            if len(numeric_cols) >= 1:
                plt.figure(figsize=(8, 4))
                df[numeric_cols[:3]].head(50).plot()
                plt.title("Preview Chart")
                plt.tight_layout()

                buffer = io.BytesIO()
                plt.savefig(buffer, format="png")
                plt.close()
                buffer.seek(0)

                encoded = base64.b64encode(buffer.read()).decode("utf-8")
                chart_markdown = f"\n\n![Generated Chart](data:image/png;base64,{encoded})\n"

        elif filename.endswith(".pdf"):
            import PyPDF2
            import io

            reader = PyPDF2.PdfReader(io.BytesIO(content))
            pages = []

            for page in reader.pages[:20]:
                pages.append(page.extract_text() or "")

            text = "\n".join(pages)

        elif filename.endswith(".docx"):
            import docx
            import io

            document = docx.Document(io.BytesIO(content))
            text = "\n".join([p.text for p in document.paragraphs])

        else:
            text = "Unsupported file type. Please upload TXT, CSV, XLSX, PDF, or DOCX."

        prompt = f"""
Analyze the uploaded file.

Filename: {file.filename}

Generated chart if available:
{chart_markdown}

Extracted content:
{text[:15000]}

Tasks:
- Summarize the document or dataset.
- Extract the key points.
- Identify weaknesses, risks, or issues.
- If it is data, describe trends, variables, and possible analysis.
- Provide recommendations.
- Use Markdown formatting.
"""

        if client is None:
            return {
                "response": f"""
File received successfully.

Filename: {file.filename}

Generated chart if available:
{chart_markdown}

Extracted preview:

{text[:2000]}

Demo mode: Real AI analysis will activate once OpenAI billing/quota is restored.
"""
            }

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": build_system_prompt(mode)},
                {"role": "user", "content": prompt},
            ],
        )

        return {
            "response": chart_markdown + "\n\n" + response.choices[0].message.content
        }

    except Exception as e:
        return {"response": f"File upload failed: {str(e)}"}
