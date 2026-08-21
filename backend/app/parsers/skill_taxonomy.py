import re
from typing import Dict, List, Set

# Comprehensive Skill Alias Map across major market roles
SKILL_ALIASES: Dict[str, str] = {
    # Programming Languages
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "py3": "Python",
    "java": "Java",
    "cpp": "C++",
    "c++": "C++",
    "c#": "C#",
    "csharp": "C#",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "scala": "Scala",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "ruby": "Ruby",
    "php": "PHP",
    "r": "R",
    "dart": "Dart",
    "bash": "Bash",
    "shell": "Shell",

    # Web & Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "next": "Next.js",
    "nextjs": "Next.js",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sass": "SASS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "redux": "Redux",
    "webgl": "WebGL",

    # Backend & API
    "node": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "graphql": "GraphQL",
    "rest": "REST API",
    "restful": "REST API",
    "rest api": "REST API",
    "grpc": "gRPC",
    "microservices": "Microservices",

    # Databases & Storage
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "cassandra": "Cassandra",
    "sqlite": "SQLite",
    "dynamodb": "DynamoDB",
    "elasticsearch": "Elasticsearch",
    "snowflake": "Snowflake",
    "databricks": "Databricks",

    # Data Engineering & Big Data
    "spark": "Apache Spark",
    "pyspark": "PySpark",
    "hadoop": "Hadoop",
    "airflow": "Apache Airflow",
    "kafka": "Apache Kafka",
    "dbt": "dbt",
    "etl": "ETL",
    "data warehousing": "Data Warehousing",

    # Machine Learning & AI
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "nlp": "Natural Language Processing",
    "cv": "Computer Vision",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "sklearn": "Scikit-Learn",
    "scikit-learn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "opencv": "OpenCV",
    "bert": "BERT",
    "llm": "LLM",
    "generative ai": "Generative AI",

    # DevOps, Cloud & Infra
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud",
    "azure": "Azure",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "jenkins": "Jenkins",
    "ci/cd": "CI/CD",
    "linux": "Linux",
    "prometheus": "Prometheus",
    "grafana": "Grafana",

    # Mobile Development
    "react native": "React Native",
    "flutter": "Flutter",
    "android": "Android",
    "ios": "iOS",

    # QA & Testing
    "cypress": "Cypress",
    "selenium": "Selenium",
    "playwright": "Playwright",
    "jest": "Jest",
    "pytest": "PyTest",
    "unit testing": "Unit Testing",

    # UI/UX & Design
    "figma": "Figma",
    "adobe xd": "Adobe XD",
    "wireframing": "Wireframing",
    "prototyping": "Prototyping",
    "user research": "User Research",

    # Cybersecurity
    "siem": "SIEM",
    "penetration testing": "Penetration Testing",
    "owasp": "OWASP",
    "network security": "Network Security",
    "soc": "SOC",

    # Management & Agile
    "jira": "Jira",
    "agile": "Agile",
    "scrum": "Scrum",
    "product management": "Product Management",
    "roadmap": "Product Roadmap"
}


def normalize_skill(raw_skill: str) -> str:
    cleaned = raw_skill.strip().strip(",.-/()").lower()
    if cleaned in SKILL_ALIASES:
        return SKILL_ALIASES[cleaned]
    for key, val in SKILL_ALIASES.items():
        if len(key) > 2 and key == cleaned:
            return val
    return raw_skill.strip().title()


def extract_skills_from_text(text: str) -> List[str]:
    found_skills = set()
    text_lower = text.lower()

    for alias, canonical in SKILL_ALIASES.items():
        if len(alias) <= 3:
            pattern = rf"\b{re.escape(alias)}\b"
        else:
            pattern = rf"\b{re.escape(alias)}\b"

        if re.search(pattern, text_lower):
            found_skills.add(canonical)

    return sorted(list(found_skills))
