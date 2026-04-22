from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

# Load template
env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('template.html')

# Exact content from your PDF
data = {
    "title": "AI/ML Intern Role",
    "company_name": "Stackular",

    "role": "AI/ML Intern – Agentic AI (Autonomous Agents)",
    "duration": "6 Months",
    "location": "Raidurg Main Road, Hyderabad",
    "work_mode": "On-site",
    "work_hours": "11:00 AM to 8:00 PM",
    "stipend": "35,000 INR/Month.",
    "full_time": "Based on your performance, we will review your internship and extend a full-time offer. The starting salary for the full-time role will be ₹50,000 INR/Month.",

    "logo_path": "logo.svg",

    "about": (
        "At Stackular, we are more than just a team – we are a product development "
        "community driven by a shared vision. Our values shape who we are, what we do, "
        "and how we interact with our peers and our customers. We're not just seeking "
        "any regular engineer; we want individuals who identify with our core values "
        "and are passionate about software development."
    ),

    "overview": (
        "We’re looking for driven interns who want to work on cutting-edge Agentic AI systems—"
        "autonomous agents that can reason, plan, and act independently. "
        "If you’re passionate about AI beyond the basics and want hands-on exposure to real "
        "agent workflows, this role is built for you."
    ),

    "work": [
        "Designing and experimenting with autonomous AI agents",
        "Building agent workflows using LangChain, OpenAI tools, RAG pipelines, etc.",
        "Integrating APIs, vector databases, and automation tools",
        "Running experiments, tracking behavior, and refining performance",
        "Contributing to internal POCs and innovation projects"
    ],

    "requirements": [
        "Strong Python skills (or solid programming in any language)",
        "Understanding of ML fundamentals & embeddings",
        "Familiarity with LLM-based apps, LangChain, or RAG (or willingness to learn fast)",
        "Basic knowledge of GitHub, SQL, and cloud platforms"
    ],

    "good_to_have": [
        "Experience with autonomous agents (CrewAI, AutoGen, Swarm libraries)",
        "Exposure to vector databases",
        "Knowledge of reinforcement learning"
    ],

    "who_can_apply": [
        "Final-year students or recent graduates in Computer Science, Artificial Intelligence, Data Science, or related disciplines.",
        "Candidates with hands-on coursework or project experience in AI/ML, especially on Agentic AI.",
        "Individuals who are self-driven, collaborative, and passionate about applying technology to real-world impact.",
        "Those eager to build, experiment, and contribute meaningfully to a fast-moving AI environment."
    ]
}

# Render HTML
html_out = template.render(data)

# Generate PDF
HTML(string=html_out, base_url='.').write_pdf("output.pdf")

print("PDF Generated Successfully!")