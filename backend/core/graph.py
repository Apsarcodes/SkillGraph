from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict, deque

# Baseline Prerequisite Ontology
PREREQUISITES_MAP: Dict[str, List[str]] = {
    # Languages
    "TypeScript": ["JavaScript"],
    "C++": ["C"],
    "Rust": ["C++"],
    # Frameworks
    "React": ["JavaScript", "HTML/CSS"],
    "FastAPI": ["Python", "REST APIs"],
    "Node.js": ["JavaScript"],
    "Express": ["Node.js"],
    "Next.js": ["React", "TypeScript"],
    "Django": ["Python", "SQL"],
    "PyTorch": ["Python", "Linear Algebra"],
    "TensorFlow": ["Python"],
    "Scikit-learn": ["Python"],
    # Databases
    "PostgreSQL": ["SQL"],
    "Vector Databases": ["PostgreSQL"],
    # Cloud & DevOps
    "Docker": ["Linux"],
    "Kubernetes": ["Docker", "Linux"],
    "Terraform": ["AWS"],
    "CI/CD": ["Git"],
    # Tools & Advanced
    "RAG": ["Vector Databases", "Python"],
    "System Design": ["REST APIs", "PostgreSQL", "Docker"],
}

# Skill Metadata
SKILL_METADATA: Dict[str, Dict] = {
    "Vector Databases": {
        "category": "databases",
        "difficulty": "intermediate",
        "estimatedHours": 15,
        "description": "Understand high-dimensional vector representations, HNSW indexing, cosine similarity, and vector DB drivers.",
        "resources": [
            {"title": "Hugging Face Vector Embeddings Guide", "url": "https://huggingface.co/blog/getting-started-with-embeddings", "type": "guide"},
            {"title": "FAISS Similarity Search Documentation", "url": "https://github.com/facebookresearch/faiss", "type": "docs"}
        ]
    },
    "RAG": {
        "category": "tools",
        "difficulty": "advanced",
        "estimatedHours": 30,
        "description": "Architect end-to-end Retrieval-Augmented Generation systems with chunking, dense vector retrieval, and citation attribution.",
        "resources": [
            {"title": "Anthropic RAG Best Practices", "url": "https://docs.anthropic.com/en/docs/rag", "type": "article"},
            {"title": "LangChain Retrieval Conceptual Guide", "url": "https://python.langchain.com/docs/concepts/#retrieval", "type": "docs"}
        ]
    },
    "Kubernetes": {
        "category": "cloud",
        "difficulty": "advanced",
        "estimatedHours": 25,
        "description": "Orchestrate containerized services with Pods, Deployments, Services, Ingress, and ConfigMaps.",
        "resources": [
            {"title": "Kubernetes Official Documentation", "url": "https://kubernetes.io/docs/concepts/", "type": "docs"}
        ]
    },
    "PyTorch": {
        "category": "frameworks",
        "difficulty": "advanced",
        "estimatedHours": 35,
        "description": "Deep learning tensor operations, automatic differentiation, neural network architecture, and inference optimization.",
        "resources": [
            {"title": "PyTorch Deep Learning with PyTorch: A 60 Minute Blitz", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "type": "tutorial"}
        ]
    },
    "Docker": {
        "category": "cloud",
        "difficulty": "intermediate",
        "estimatedHours": 15,
        "description": "Container creation, Dockerfiles, volume mounts, and network bridges.",
        "resources": [
            {"title": "Docker Getting Started Guide", "url": "https://docs.docker.com/get-started/", "type": "docs"}
        ]
    },
    "FastAPI": {
        "category": "frameworks",
        "difficulty": "intermediate",
        "estimatedHours": 15,
        "description": "High-performance Python web APIs with Pydantic validation, dependency injection, and automatic OpenAPI generation.",
        "resources": [
            {"title": "FastAPI Official Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "tutorial"}
        ]
    },
    "React": {
        "category": "frameworks",
        "difficulty": "intermediate",
        "estimatedHours": 20,
        "description": "Component hierarchies, hooks, state management, and virtual DOM rendering.",
        "resources": [
            {"title": "React Official Documentation", "url": "https://react.dev/learn", "type": "docs"}
        ]
    },
}

class GraphEngine:
    @staticmethod
    def build_skill_graph(
        user_skills: Set[str],
        target_skills: Set[str],
        custom_prerequisites: Optional[Dict[str, List[str]]] = None
    ) -> Tuple[List[Dict], List[Dict]]:
        """
        Generates nodes and edges for visualization and gap analysis.
        Each node has status: 'acquired', 'target', or 'missing'.
        """
        prereqs = custom_prerequisites or PREREQUISITES_MAP
        all_skills = set(user_skills).union(target_skills)

        # Include direct prerequisites in graph nodes
        for skill in list(all_skills):
            for p in prereqs.get(skill, []):
                all_skills.add(p)

        nodes = []
        for skill in all_skills:
            if skill in user_skills:
                status = "acquired"
            elif skill in target_skills:
                status = "missing"
            else:
                status = "foundation"

            meta = SKILL_METADATA.get(skill, {})
            nodes.append({
                "id": skill.lower().replace(" ", "_"),
                "label": skill,
                "category": meta.get("category", "tools"),
                "status": status,
                "difficulty": meta.get("difficulty", "intermediate"),
                "estimatedHours": meta.get("estimatedHours", 15)
            })

        edges = []
        edge_idx = 1
        for skill in all_skills:
            for p in prereqs.get(skill, []):
                if p in all_skills:
                    edges.append({
                        "id": f"e{edge_idx}",
                        "source": p.lower().replace(" ", "_"),
                        "target": skill.lower().replace(" ", "_"),
                        "label": "prerequisite",
                        "isPrerequisite": True
                    })
                    edge_idx += 1

        return nodes, edges

    @classmethod
    def topological_sort_roadmap(
        cls,
        missing_skills: List[str],
        user_skills: Set[str],
        custom_prerequisites: Optional[Dict[str, List[str]]] = None
    ) -> Tuple[List[Dict], List[str]]:
        """
        Sorts missing skills topologically based on prerequisite dependencies.
        Robustly detects and resolves circular dependencies without crashing.
        Returns (ordered_tasks, resolved_cycles).
        """
        prereqs = custom_prerequisites or PREREQUISITES_MAP
        skill_set = set(missing_skills)

        # Build adjacency graph: prerequisite -> dependent
        adj: Dict[str, List[str]] = defaultdict(list)
        in_degree: Dict[str, int] = {s: 0 for s in skill_set}

        resolved_cycles = []

        # Populate dependencies only between missing skills
        for skill in skill_set:
            dependencies = prereqs.get(skill, [])
            for dep in dependencies:
                # If dependency is already acquired by user, don't block
                if dep in user_skills:
                    continue
                # If dependency is also a missing target skill, enforce ordering
                if dep in skill_set:
                    adj[dep].append(skill)
                    in_degree[skill] += 1

        # Kahn's algorithm with cycle detection
        queue = deque([s for s in skill_set if in_degree[s] == 0])
        ordered = []

        while queue:
            curr = queue.popleft()
            ordered.append(curr)

            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Check for cycles
        if len(ordered) < len(skill_set):
            unresolved = [s for s in skill_set if s not in ordered]
            # Break cycle gracefully by picking remaining nodes with lowest remaining in-degree
            unresolved_sorted = sorted(unresolved, key=lambda s: in_degree[s])
            for s in unresolved_sorted:
                resolved_cycles.append(f"Pruned cyclic prerequisite blocking '{s}'")
                ordered.append(s)

        # Construct roadmap tasks
        tasks = []
        for idx, skill in enumerate(ordered, 1):
            meta = SKILL_METADATA.get(skill, {
                "category": "tools",
                "difficulty": "intermediate",
                "estimatedHours": 20,
                "description": f"Master {skill} principles and integration practices.",
                "resources": []
            })
            tasks.append({
                "id": f"task_{skill.lower().replace(' ', '_')}_{idx}",
                "skill": skill,
                "category": meta.get("category", "tools"),
                "order": idx,
                "title": f"Master {skill}",
                "description": meta.get("description", ""),
                "estimatedHours": meta.get("estimatedHours", 20),
                "prerequisites": [p for p in prereqs.get(skill, []) if p in skill_set or p in user_skills],
                "resources": meta.get("resources", []),
                "isCompleted": False
            })

        return tasks, resolved_cycles
