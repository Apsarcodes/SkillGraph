import re
import io
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Dict, Tuple, Optional
from pypdf import PdfReader
from backend.security.pii_scrubber import PIIScrubber

# Standardized Skill Taxonomy
TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "languages": {
        "Python": ["python", "python3", "py"],
        "TypeScript": ["typescript", "ts"],
        "JavaScript": ["javascript", "js", "ecmascript"],
        "Go": ["golang", "go language", r"\bgo\b"],
        "Rust": ["rust", "rustlang"],
        "Java": [r"\bjava\b", "core java", "j2ee"],
        "C++": ["c++", "cpp"],
        "C#": ["c#", "csharp", r"\.net\b"],
        "SQL": ["sql", "tsql", "plsql", "postgres sql"],
        "HTML/CSS": ["html", "css", "html5", "css3", "sass", "scss", "tailwind"],
        "Ruby": ["ruby", "ruby on rails"],
        "PHP": ["php"],
        "Kotlin": ["kotlin"],
        "Swift": ["swift"],
        "Scala": ["scala"],
        "Shell": ["bash", "shell scripting", "zsh", "sh"],
    },
    "frameworks": {
        "React": ["react", "react.js", "reactjs"],
        "FastAPI": ["fastapi", "fast-api"],
        "Node.js": ["node.js", "nodejs", r"\bnode\b"],
        "Express": ["express.js", "expressjs", r"\bexpress\b"],
        "Next.js": ["next.js", "nextjs"],
        "Django": ["django", "django rest framework", "drf"],
        "Flask": ["flask"],
        "Spring Boot": ["spring boot", "spring framework", "spring"],
        "PyTorch": ["pytorch", "torch"],
        "TensorFlow": ["tensorflow", "tf", "keras"],
        "Scikit-learn": ["scikit-learn", "sklearn"],
        "Vue.js": ["vue", "vue.js", "vuejs"],
        "Angular": ["angular", "angularjs"],
        "GraphQL": ["graphql", "apollo"],
    },
    "databases": {
        "PostgreSQL": ["postgresql", "postgres", "psql"],
        "MongoDB": ["mongodb", "mongo"],
        "Redis": ["redis", "redis cache"],
        "SQLite": ["sqlite", "sqlite3"],
        "MySQL": ["mysql"],
        "Supabase": ["supabase"],
        "Cassandra": ["cassandra"],
        "Elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
        "Vector Databases": ["vector databases", "vector database", "vector db", "chromadb", "qdrant", "faiss", "pinecone", "weaviate", "milvus"],
        "DynamoDB": ["dynamodb", "dynamo"],
    },
    "cloud": {
        "Docker": ["docker", "dockerfile", "containerization", "containers"],
        "Kubernetes": ["kubernetes", "k8s"],
        "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda", "rds"],
        "GCP": ["gcp", "google cloud", "google cloud platform"],
        "Azure": ["azure", "microsoft azure"],
        "CI/CD": ["ci/cd", "ci-cd", "github actions", "gitlab ci", "jenkins", "circleci"],
        "Terraform": ["terraform", "iac", "infrastructure as code"],
        "Linux": ["linux", "ubuntu", "debian", "redhat", "centos", "unix"],
    },
    "tools": {
        "Git": ["git", "github", "gitlab"],
        "REST APIs": ["rest api", "restful", "rest apis", "restful apis", "openapi", "swagger"],
        "RAG": ["rag", "retrieval augmented generation", "retrieval-augmented generation"],
        "System Design": ["system design", "distributed systems", "microservices", "scalable architecture"],
        "Unit Testing": ["unit testing", "pytest", "jest", "mocking", "tdd"],
        "Kafka": ["kafka", "apache kafka"],
        "RabbitMQ": ["rabbitmq", "message queue", "pub/sub"],
    }
}

class SkillExtractor:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extracts plain text from PDF bytes."""
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        return "\n".join(pages_text)

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        """Extracts text from docx bytes using standard zipfile XML parsing."""
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx_zip:
                xml_content = docx_zip.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                texts = []
                for p in tree.iterfind('.//w:p', namespaces):
                    p_texts = [node.text for node in p.iterfind('.//w:t', namespaces) if node.text]
                    if p_texts:
                        texts.append("".join(p_texts))
                return "\n".join(texts)
        except Exception as e:
            # Fallback to direct string extraction
            try:
                import docx
                doc = docx.Document(io.BytesIO(file_bytes))
                return "\n".join([p.text for p in doc.paragraphs if p.text])
            except Exception:
                raise ValueError(f"Unable to parse DOCX document: {str(e)}")

    @classmethod
    def extract_skills_with_evidence(cls, text: str) -> List[Dict]:
        """
        Parses text, matches taxonomy patterns with word boundaries,
        and retrieves traceable evidence sentences.
        """
        if not text:
            return []

        # Split text into sentences for evidence extraction
        sentences = re.split(r'(?<=[.!?\n])\s+', text)
        clean_sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

        extracted = []
        seen_skills = set()

        for category, skill_map in TAXONOMY.items():
            for canonical_name, patterns in skill_map.items():
                if canonical_name in seen_skills:
                    continue

                for pattern in patterns:
                    # Construct regex safely: if already has regex anchors, use directly; otherwise word boundary
                    if pattern.startswith(r"\b") or pattern.endswith(r"\b") or "+" in pattern or "#" in pattern:
                        if "+" in pattern or "#" in pattern or "." in pattern:
                            escaped = re.escape(pattern)
                            regex = rf"(?i)(?:^|[\s,;()\/:])({escaped})(?:$|[\s,;()\/:])"
                        else:
                            regex = rf"(?i){pattern}"
                    else:
                        escaped = re.escape(pattern)
                        regex = rf"(?i)\b{escaped}\b"

                    match = re.search(regex, text)
                    if match:
                        # Find evidence sentence
                        evidence = ""
                        for sent in clean_sentences:
                            if re.search(regex, sent):
                                evidence = sent[:200]
                                break
                        if not evidence:
                            evidence = f"Identified '{canonical_name}' in technical profile."

                        extracted.append({
                            "name": canonical_name,
                            "category": category,
                            "confidence": 0.95,
                            "evidence": evidence
                        })
                        seen_skills.add(canonical_name)
                        break

        return extracted
