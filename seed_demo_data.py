import asyncio
import sys
import os

# Add backend directory to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.database.session import AsyncSessionLocal, init_db
from app.database.models import Job, Candidate, Resume, ScreeningSession, ScreeningResult, Shortlist
from app.parsers.resume_parser import ResumeParser
from app.ai.matcher import HybridMatcher
from app.ai.llm_provider import LocalFallbackAIProvider

DEMO_JOBS = [
    {
        "title": "Senior Full Stack AI Engineer",
        "company": "Cognitive Cloud AI",
        "department": "AI Products",
        "description": """
We are looking for a Senior Full Stack AI Engineer to build next-generation intelligent SaaS applications.
Required Skills: Python, FastAPI, React, TypeScript, Docker, PostgreSQL, Machine Learning, PyTorch, REST API, Tailwind CSS.
Preferred Skills: Kubernetes, AWS, Redis, GraphQL, CI/CD.
Responsibilities:
- Architect and develop high-throughput AI API services using Python and FastAPI.
- Build responsive, modern web components using React and TypeScript.
- Train and deploy transformer-based embeddings and generative LLM models.
Requirements:
- 4+ years of full-stack software development experience.
- Strong background in machine learning models and cloud deployment.
        """,
        "required_skills": ["Python", "FastAPI", "React", "TypeScript", "Docker", "PostgreSQL", "Machine Learning", "PyTorch"],
        "preferred_skills": ["Kubernetes", "AWS", "Redis", "GraphQL", "CI/CD"],
        "responsibilities": ["Build high-throughput AI APIs", "Build responsive UI in React/TypeScript", "Deploy transformer models"],
        "education_requirements": ["Bachelor's or Master's in CS or AI"],
        "experience_requirements": ["4+ years software engineering"],
        "keywords": ["Python", "FastAPI", "React", "TypeScript", "Docker", "PostgreSQL", "Machine Learning", "PyTorch", "Kubernetes", "AWS"]
    },
    {
        "title": "Backend Systems Architect",
        "company": "Nexus Distributed Labs",
        "department": "Core Infrastructure",
        "description": """
Seeking a Backend Systems Architect to design distributed microservices and scalable cloud databases.
Required Skills: Python, Go, PostgreSQL, Redis, Docker, Kubernetes, AWS, Microservices, CI/CD, SQL.
Preferred Skills: Kafka, gRPC, Terraform, Linux.
Responsibilities:
- Design fault-tolerant microservices and low-latency database queries.
- Manage Docker and Kubernetes orchestration pipelines on AWS.
Requirements:
- 5+ years building distributed backend systems.
        """,
        "required_skills": ["Python", "Go", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "SQL"],
        "preferred_skills": ["Kafka", "gRPC", "Terraform", "Linux"],
        "responsibilities": ["Design distributed microservices", "Optimize database schema and caching"],
        "education_requirements": ["Bachelor's in Computer Science"],
        "experience_requirements": ["5+ years backend systems"],
        "keywords": ["Python", "Go", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "SQL"]
    },
    {
        "title": "Frontend UX Engineer",
        "company": "Vivid Design Systems",
        "department": "Web Platform",
        "description": """
Looking for a Frontend UX Engineer obsessed with UI craftsmanship and animations.
Required Skills: React, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3, Next.js, Jest, Git.
Preferred Skills: Framer Motion, Figma, WebGL, GraphQL.
Responsibilities:
- Build reusable UI design systems and animations in React/TypeScript.
Requirements:
- 3+ years frontend web engineering experience.
        """,
        "required_skills": ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Next.js"],
        "preferred_skills": ["Framer Motion", "Figma", "GraphQL"],
        "responsibilities": ["Build UI component library", "Implement smooth animations"],
        "education_requirements": ["Bachelor's degree or equivalent portfolio"],
        "experience_requirements": ["3+ years frontend engineering"],
        "keywords": ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Next.js"]
    },
    {
        "title": "Lead Data Engineer",
        "company": "DataPulse Analytics",
        "department": "Data Platform",
        "description": """
Seeking a Data Engineer to design high-scale ETL pipelines, data warehouses, and streaming analytics platforms.
Required Skills: Python, SQL, Apache Spark, Snowflake, Databricks, Apache Airflow, PostgreSQL, AWS, Docker.
Preferred Skills: dbt, Kafka, Redshift, PySpark.
Responsibilities:
- Build fault-tolerant ETL pipelines using Apache Spark and Airflow.
- Optimize Snowflake data warehouse queries and real-time streaming feeds.
Requirements:
- 4+ years building big data infrastructure.
        """,
        "required_skills": ["Python", "SQL", "Apache Spark", "Snowflake", "Databricks", "Apache Airflow", "PostgreSQL", "AWS", "Docker"],
        "preferred_skills": ["dbt", "Apache Kafka", "Redshift", "PySpark"],
        "responsibilities": ["Build ETL data pipelines", "Manage Snowflake warehouse"],
        "education_requirements": ["Bachelor's in Computer Science or Data Analytics"],
        "experience_requirements": ["4+ years data engineering"],
        "keywords": ["Python", "SQL", "Apache Spark", "Snowflake", "Databricks", "Apache Airflow", "PostgreSQL", "AWS"]
    },
    {
        "title": "DevOps & Cloud Infrastructure Lead",
        "company": "CloudArmor Infra",
        "department": "DevOps / Infrastructure",
        "description": """
Looking for a DevOps Lead to automate CI/CD, manage Kubernetes clusters, and enforce Cloud Security across multi-region deployments.
Required Skills: Kubernetes, Docker, Terraform, AWS, CI/CD, Linux, Bash, Prometheus, Grafana, Ansible.
Preferred Skills: Python, Helm, GCP, OpenShift.
Responsibilities:
- Manage Infrastructure as Code (IaC) using Terraform and Ansible on AWS.
- Maintain zero-downtime Kubernetes deployments and monitoring with Prometheus.
Requirements:
- 5+ years managing DevOps and cloud infrastructure.
        """,
        "required_skills": ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Linux", "Bash", "Prometheus", "Grafana", "Ansible"],
        "preferred_skills": ["Python", "Helm", "Google Cloud"],
        "responsibilities": ["Automate IaC with Terraform", "Manage Kubernetes clusters"],
        "education_requirements": ["Bachelor's in IT, CS or equivalent experience"],
        "experience_requirements": ["5+ years cloud infrastructure"],
        "keywords": ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Linux", "Ansible"]
    },
    {
        "title": "Cybersecurity & SOC Engineer",
        "company": "ShieldGuard Cyber Labs",
        "department": "Information Security",
        "description": """
Seeking a Cybersecurity Specialist to monitor threat vectors, conduct penetration testing, and manage SIEM security infrastructure.
Required Skills: Cybersecurity, SIEM, Penetration Testing, OWASP, Network Security, Linux, Python, Bash, SOC.
Preferred Skills: Wireshark, Metasploit, Cryptography, CISSP certification.
Responsibilities:
- Conduct vulnerability assessments and web app penetration tests following OWASP standards.
- Monitor SIEM telemetry and respond to security incidents.
Requirements:
- 3+ years cybersecurity analysis experience.
        """,
        "required_skills": ["Cybersecurity", "SIEM", "Penetration Testing", "OWASP", "Network Security", "Linux", "Python", "Bash"],
        "preferred_skills": ["Wireshark", "SOC", "Cryptography"],
        "responsibilities": ["Conduct OWASP penetration tests", "Monitor SIEM incident alerts"],
        "education_requirements": ["Bachelor's in Cybersecurity or Computer Science"],
        "experience_requirements": ["3+ years cybersecurity"],
        "keywords": ["Cybersecurity", "SIEM", "Penetration Testing", "OWASP", "Network Security", "Linux"]
    },
    {
        "title": "Senior Mobile Engineer (iOS & React Native)",
        "company": "AppForge Mobile",
        "department": "Mobile Apps",
        "description": """
Seeking a Mobile Developer to build high-performance native iOS and cross-platform mobile apps.
Required Skills: Swift, React Native, iOS, JavaScript, TypeScript, REST API, Git, Mobile App Architecture.
Preferred Skills: Flutter, Kotlin, GraphQL, Xcode.
Responsibilities:
- Build and publish cross-platform iOS and Android apps using React Native and Swift.
- Optimize app launch speeds, offline sync, and memory utilization.
Requirements:
- 4+ years of mobile application development experience.
        """,
        "required_skills": ["Swift", "React Native", "iOS", "JavaScript", "TypeScript", "REST API", "Git"],
        "preferred_skills": ["Flutter", "Kotlin", "GraphQL"],
        "responsibilities": ["Develop React Native & Swift apps", "Optimize mobile app performance"],
        "education_requirements": ["Bachelor's degree or mobile app portfolio"],
        "experience_requirements": ["4+ years mobile engineering"],
        "keywords": ["Swift", "React Native", "iOS", "JavaScript", "TypeScript"]
    },
    {
        "title": "Lead Product Manager",
        "company": "AgileVenture Products",
        "department": "Product Management",
        "description": """
Looking for a Lead Product Manager to drive product strategy, roadmap execution, user analytics, and cross-functional feature delivery.
Required Skills: Product Management, Agile, Scrum, Jira, Product Roadmap, User Research, Data Analytics, REST API.
Preferred Skills: Figma, A/B Testing, SQL, Product Strategy.
Responsibilities:
- Define product roadmaps, user stories, and acceptance criteria in Jira.
- Collaborate with engineering, UX, and executive stakeholders to ship SaaS products.
Requirements:
- 5+ years of software product management experience.
        """,
        "required_skills": ["Product Management", "Agile", "Scrum", "Jira", "Product Roadmap", "User Research"],
        "preferred_skills": ["Figma", "SQL", "Data Analytics"],
        "responsibilities": ["Lead product strategy & roadmaps", "Manage Agile Scrum sprints"],
        "education_requirements": ["Bachelor's degree (MBA preferred)"],
        "experience_requirements": ["5+ years product management"],
        "keywords": ["Product Management", "Agile", "Scrum", "Jira", "Product Roadmap"]
    },
    {
        "title": "QA Automation Engineer Lead",
        "company": "QualityFirst Systems",
        "department": "Quality Assurance",
        "description": """
Seeking a Lead QA Engineer to build automated test frameworks for REST APIs, web apps, and performance testing.
Required Skills: Cypress, Selenium, Playwright, PyTest, Python, JavaScript, CI/CD, Unit Testing, REST API, Git.
Preferred Skills: JMeter, Postman, Docker, TestNG.
Responsibilities:
- Design end-to-end web test suites using Cypress and Playwright.
- Integrate automated regression suites into GitHub Actions CI/CD pipelines.
Requirements:
- 4+ years of QA automation testing experience.
        """,
        "required_skills": ["Cypress", "Selenium", "Playwright", "PyTest", "Python", "JavaScript", "CI/CD", "Unit Testing"],
        "preferred_skills": ["JMeter", "Postman", "Docker"],
        "responsibilities": ["Build Cypress & Playwright test suites", "Integrate automated tests into CI/CD"],
        "education_requirements": ["Bachelor's in Computer Science or Software Engineering"],
        "experience_requirements": ["4+ years QA automation"],
        "keywords": ["Cypress", "Selenium", "Playwright", "PyTest", "Python", "JavaScript", "CI/CD"]
    },
    {
        "title": "Lead UI/UX Product Designer",
        "company": "PixelCraft Studios",
        "department": "Design",
        "description": """
Seeking a Senior Product Designer to create modern design systems, interactive prototypes, and user experience flows for web and mobile apps.
Required Skills: Figma, Wireframing, Prototyping, User Research, Adobe XD, HTML5, CSS3, Design Systems.
Preferred Skills: Tailwind CSS, Motion Design, Micro-interactions.
Responsibilities:
- Design wireframes, high-fidelity UI mockups, and interactive prototypes in Figma.
- Collaborate with frontend engineers to ensure design fidelity in React and Web apps.
Requirements:
- 4+ years UI/UX product design experience.
        """,
        "required_skills": ["Figma", "Wireframing", "Prototyping", "User Research", "Adobe XD", "Design Systems"],
        "preferred_skills": ["HTML5", "CSS3", "Tailwind CSS"],
        "responsibilities": ["Design UI components & Figma design systems", "Conduct user research & testing"],
        "education_requirements": ["Bachelor's in HCI, Interaction Design or Design Portfolio"],
        "experience_requirements": ["4+ years UI/UX design"],
        "keywords": ["Figma", "Wireframing", "Prototyping", "User Research", "Adobe XD"]
    }
]

DEMO_CANDIDATES = [
    {
        "name": "Sai Praneeth",
        "email": "saipraneeth@dev.io",
        "phone": "+1 555-019-2834",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/saipraneeth",
        "github": "https://github.com/saipraneeth",
        "portfolio": "https://saipraneeth.dev",
        "summary": "Full Stack AI Engineer with 5+ years experience building production LLM apps, FastAPI microservices, and React design systems.",
        "skills": ["Python", "FastAPI", "React", "TypeScript", "Docker", "PostgreSQL", "Machine Learning", "PyTorch", "AWS", "Tailwind CSS", "Redis"],
        "raw_text": """
Sai Praneeth
San Francisco, CA | saipraneeth@dev.io | linkedin.com/in/saipraneeth | github.com/saipraneeth

SUMMARY:
Senior Full Stack AI Engineer with 5+ years of experience designing scalable REST APIs, transformer models, and sleek web apps.

SKILLS:
Python, FastAPI, React, TypeScript, Docker, PostgreSQL, Machine Learning, PyTorch, AWS, Redis, Tailwind CSS, PyTest, Git.

EXPERIENCE:
Senior AI Engineer | Cognitive Cloud Labs (2022 - Present)
- Engineered scalable FastAPI backend services processing 2M+ requests daily.
- Built React & TypeScript SaaS interface with real-time vector search integration.

Software Engineer | Apex Systems (2019 - 2022)
- Built microservices in Python, PostgreSQL, and Docker.

EDUCATION:
B.S. in Computer Science | Stanford University (2019)
        """
    },
    {
        "name": "Alex Chen",
        "email": "alex.chen@cloudtech.org",
        "phone": "+1 555-014-9921",
        "location": "Seattle, WA",
        "linkedin": "https://linkedin.com/in/alexchen-dev",
        "github": "https://github.com/alexchen",
        "summary": "Backend Systems Architect specialized in Go, Python, Distributed Systems, Kubernetes, and PostgreSQL.",
        "skills": ["Python", "Go", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "SQL", "Linux", "Terraform"],
        "raw_text": """
Alex Chen
Seattle, WA | alex.chen@cloudtech.org

SUMMARY:
Backend Systems Architect with 6 years experience in distributed cloud infrastructure.

SKILLS:
Python, Go, PostgreSQL, Redis, Docker, Kubernetes, AWS, SQL, Linux, Terraform, CI/CD.

EXPERIENCE:
Staff Backend Engineer | Nexus Cloud Systems (2021 - Present)
- Managed Kubernetes clusters and PostgreSQL database scaling across 5 AWS regions.

EDUCATION:
M.S. in Computer Science | University of Washington (2018)
        """
    },
    {
        "name": "Elena Rostova",
        "email": "elena.design@frontend.io",
        "phone": "+1 555-018-4451",
        "location": "New York, NY",
        "linkedin": "https://linkedin.com/in/elenarostova",
        "github": "https://github.com/elena-ui",
        "summary": "Lead Frontend Engineer expert in React, TypeScript, Next.js, Framer Motion, and Tailwind CSS.",
        "skills": ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Next.js", "Jest", "Git"],
        "raw_text": """
Elena Rostova
New York, NY | elena.design@frontend.io

SUMMARY:
Frontend UX Engineer with 4 years building interactive web products and design systems.

SKILLS:
React, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3, Next.js, Jest, Git.

EXPERIENCE:
Senior Frontend Developer | Vivid UX Studio (2021 - Present)
- Crafted responsive UI web applications using React, TypeScript, and Tailwind.

EDUCATION:
B.A. in Interactive Media | NYU (2020)
        """
    },
    {
        "name": "David Miller",
        "email": "david.miller@data-infra.io",
        "phone": "+1 555-012-7711",
        "location": "Chicago, IL",
        "linkedin": "https://linkedin.com/in/davidmiller-data",
        "github": "https://github.com/dmiller-spark",
        "summary": "Lead Data Engineer specialized in Apache Spark, Snowflake, Databricks, Airflow, and PostgreSQL ETL pipelines.",
        "skills": ["Python", "SQL", "Apache Spark", "Snowflake", "Databricks", "Apache Airflow", "PostgreSQL", "AWS", "Docker", "dbt"],
        "raw_text": """
David Miller
Chicago, IL | david.miller@data-infra.io

SUMMARY:
Senior Data Engineer with 5+ years experience building petabyte-scale data pipelines.

SKILLS:
Python, SQL, Apache Spark, Snowflake, Databricks, Apache Airflow, PostgreSQL, AWS, Docker, dbt, ETL.

EXPERIENCE:
Lead Data Engineer | DataPulse Systems (2021 - Present)
- Engineered Spark and Airflow data pipelines streaming 50TB daily data into Snowflake data warehouse.

EDUCATION:
B.S. in Computer Science | UIUC (2018)
        """
    },
    {
        "name": "Sarah Jenkins",
        "email": "sarah.jenkins@devops.net",
        "phone": "+1 555-016-3399",
        "location": "Denver, CO",
        "linkedin": "https://linkedin.com/in/sarahjenkins-cloud",
        "github": "https://github.com/sjenkins-k8s",
        "summary": "DevOps & Cloud Architect proficient in Kubernetes, Terraform, Docker, AWS, CI/CD, and Ansible.",
        "skills": ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Linux", "Bash", "Prometheus", "Grafana", "Ansible"],
        "raw_text": """
Sarah Jenkins
Denver, CO | sarah.jenkins@devops.net

SUMMARY:
Cloud Infrastructure Lead automating multi-region Kubernetes clusters with Terraform.

SKILLS:
Kubernetes, Docker, Terraform, AWS, CI/CD, Linux, Bash, Prometheus, Grafana, Ansible.

EXPERIENCE:
DevOps Architect | CloudArmor Infrastructure (2020 - Present)
- Built automated Terraform IaC and zero-downtime Kubernetes deployment pipelines.

EDUCATION:
B.S. in Information Technology | Colorado State (2017)
        """
    },
    {
        "name": "Vikram Patel",
        "email": "vikram.sec@cyberlabs.com",
        "phone": "+1 555-015-8833",
        "location": "Boston, MA",
        "linkedin": "https://linkedin.com/in/vikrampatel-sec",
        "github": "https://github.com/vpatel-sec",
        "summary": "Cybersecurity & SOC Specialist expert in SIEM monitoring, OWASP penetration testing, and network defense.",
        "skills": ["Cybersecurity", "SIEM", "Penetration Testing", "OWASP", "Network Security", "Linux", "Python", "Bash"],
        "raw_text": """
Vikram Patel
Boston, MA | vikram.sec@cyberlabs.com

SUMMARY:
Cybersecurity Engineer with 4 years conducting OWASP vulnerability assessments and managing SOC SIEM tools.

SKILLS:
Cybersecurity, SIEM, Penetration Testing, OWASP, Network Security, Linux, Python, Bash.

EXPERIENCE:
Senior Security Analyst | ShieldGuard Security (2021 - Present)
- Performed penetration tests and threat vector remediations across enterprise SaaS platforms.

EDUCATION:
B.S. in Cybersecurity | Northeastern University (2019)
        """
    },
    {
        "name": "Jessica Taylor",
        "email": "jessica.taylor@mobiledev.app",
        "phone": "+1 555-013-6644",
        "location": "Los Angeles, CA",
        "linkedin": "https://linkedin.com/in/jessicataylor-mobile",
        "github": "https://github.com/jtaylor-swift",
        "summary": "Senior Mobile Developer expert in Swift, React Native, iOS, JavaScript, and Mobile Architecture.",
        "skills": ["Swift", "React Native", "iOS", "JavaScript", "TypeScript", "REST API", "Git", "Flutter"],
        "raw_text": """
Jessica Taylor
Los Angeles, CA | jessica.taylor@mobiledev.app

SUMMARY:
Mobile Software Engineer with 5 years building cross-platform React Native and native iOS Swift applications.

SKILLS:
Swift, React Native, iOS, JavaScript, TypeScript, REST API, Git, Flutter.

EXPERIENCE:
Lead Mobile Developer | AppForge Labs (2020 - Present)
- Architected React Native and Swift iOS app with 1M+ active downloads.

EDUCATION:
B.S. in Computer Science | UCLA (2018)
        """
    },
    {
        "name": "Robert Sterling",
        "email": "robert.sterling@productlead.io",
        "phone": "+1 555-011-5522",
        "location": "Austin, TX",
        "linkedin": "https://linkedin.com/in/robertsterling-pm",
        "summary": "Lead Product Manager specialized in Agile, Scrum, Jira, Product Roadmaps, and User Research.",
        "skills": ["Product Management", "Agile", "Scrum", "Jira", "Product Roadmap", "User Research", "Figma", "Data Analytics"],
        "raw_text": """
Robert Sterling
Austin, TX | robert.sterling@productlead.io

SUMMARY:
Lead Product Manager with 6+ years driving Agile product roadmaps and shipping SaaS feature suites.

SKILLS:
Product Management, Agile, Scrum, Jira, Product Roadmap, User Research, Figma, Data Analytics.

EXPERIENCE:
Principal Product Manager | AgileVenture Products (2019 - Present)
- Led 3 Scrum engineering squads to increase annual recurring SaaS product revenue by 40%.

EDUCATION:
MBA | UT Austin McCombs (2017)
        """
    },
    {
        "name": "Hannah Abbott",
        "email": "hannah.qa@qualitysys.org",
        "phone": "+1 555-019-9944",
        "location": "Portland, OR",
        "linkedin": "https://linkedin.com/in/hannahabbott-qa",
        "github": "https://github.com/habbott-qa",
        "summary": "QA Automation Lead expert in Cypress, Selenium, Playwright, PyTest, Python, and CI/CD testing.",
        "skills": ["Cypress", "Selenium", "Playwright", "PyTest", "Python", "JavaScript", "CI/CD", "Unit Testing"],
        "raw_text": """
Hannah Abbott
Portland, OR | hannah.qa@qualitysys.org

SUMMARY:
QA Automation Engineer with 5 years building test automation frameworks in Cypress and PyTest.

SKILLS:
Cypress, Selenium, Playwright, PyTest, Python, JavaScript, CI/CD, Unit Testing.

EXPERIENCE:
QA Automation Lead | QualityFirst Systems (2021 - Present)
- Built automated Cypress test suites reducing manual regression cycles by 85%.

EDUCATION:
B.S. in Software Engineering | Oregon State (2018)
        """
    },
    {
        "name": "Maya Lin",
        "email": "maya.lin@uxdesign.studio",
        "phone": "+1 555-017-3311",
        "location": "San Jose, CA",
        "linkedin": "https://linkedin.com/in/mayalin-ux",
        "portfolio": "https://mayalin.design",
        "summary": "Senior UI/UX Product Designer expert in Figma, Wireframing, Prototyping, User Research, and Design Systems.",
        "skills": ["Figma", "Wireframing", "Prototyping", "User Research", "Adobe XD", "Design Systems", "HTML5", "CSS3"],
        "raw_text": """
Maya Lin
San Jose, CA | maya.lin@uxdesign.studio | mayalin.design

SUMMARY:
Product Designer with 5 years creating interactive wireframes, Figma design systems, and mobile UX flows.

SKILLS:
Figma, Wireframing, Prototyping, User Research, Adobe XD, Design Systems, HTML5, CSS3.

EXPERIENCE:
Senior UI/UX Designer | PixelCraft Studios (2020 - Present)
- Designed enterprise Figma component library and interactive prototypes for SaaS apps.

EDUCATION:
B.F.A. in Design | San Jose State (2018)
        """
    }
]

async def seed_data():
    print("Initializing Database with Full Market Job Roles...")
    await init_db()
    async with AsyncSessionLocal() as db:
        # Create Jobs
        created_jobs = []
        for j_data in DEMO_JOBS:
            job = Job(**j_data)
            db.add(job)
            created_jobs.append(job)
        await db.flush()

        primary_job = created_jobs[0]

        session = ScreeningSession(job_id=primary_job.id, total_resumes=len(DEMO_CANDIDATES), avg_score=0.0)
        db.add(session)
        await db.flush()

        job_dict = {
            "title": primary_job.title,
            "company": primary_job.company,
            "description": primary_job.description,
            "required_skills": primary_job.required_skills,
            "preferred_skills": primary_job.preferred_skills,
            "responsibilities": primary_job.responsibilities,
            "keywords": primary_job.keywords
        }

        fallback_ai = LocalFallbackAIProvider()
        scores_sum = 0.0

        for idx, c_data in enumerate(DEMO_CANDIDATES):
            parsed_resume = ResumeParser.parse_resume_text(c_data["raw_text"])

            cand = Candidate(
                name=c_data["name"],
                email=c_data["email"],
                phone=c_data["phone"],
                location=c_data["location"],
                linkedin=c_data["linkedin"],
                github=c_data.get("github"),
                portfolio=c_data.get("portfolio"),
                summary=c_data["summary"]
            )
            db.add(cand)
            await db.flush()

            resume = Resume(
                candidate_id=cand.id,
                filename=f"{cand.name.lower().replace(' ', '_')}_resume.pdf",
                raw_text=c_data["raw_text"],
                parsed_json=parsed_resume.model_dump()
            )
            db.add(resume)
            await db.flush()

            if idx in [0, 1, 3]:
                sl = Shortlist(candidate_id=cand.id, job_id=primary_job.id, notes="Top candidate match during screening.")
                db.add(sl)

            breakdown, aux_data = HybridMatcher.calculate_match_score(parsed_resume, job_dict)
            ai_explanation = await fallback_ai.generate_explanation(parsed_resume, job_dict, breakdown, aux_data)

            result = ScreeningResult(
                session_id=session.id,
                candidate_id=cand.id,
                job_id=primary_job.id,
                overall_score=breakdown.overall_score,
                score_category=breakdown.score_category,
                recommendation=breakdown.recommendation,
                skill_match_score=breakdown.skill_match_score,
                semantic_fit_score=breakdown.semantic_fit_score,
                experience_score=breakdown.experience_score,
                project_score=breakdown.project_score,
                education_score=breakdown.education_score,
                certification_score=breakdown.certification_score,
                keyword_score=breakdown.keyword_score,
                matched_skills=aux_data["matched_skills"],
                missing_skills=aux_data["missing_skills"],
                additional_skills=aux_data["additional_skills"],
                strengths=ai_explanation["strengths"],
                gaps=ai_explanation["gaps"],
                explanation=ai_explanation["explanation"],
                experience_alignment=ai_explanation["experience_alignment"]
            )
            db.add(result)
            scores_sum += breakdown.overall_score

        session.avg_score = round(scores_sum / len(DEMO_CANDIDATES), 1)
        await db.commit()
        print("Successfully seeded 10 diverse market job roles and candidate profiles!")

if __name__ == "__main__":
    asyncio.run(seed_data())
