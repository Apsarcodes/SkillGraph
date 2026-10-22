from backend.rag.vector_store import rag_store

def test_rag_vector_search():
    query = "How does HNSW indexing work in vector databases?"
    citations = rag_store.search(query, top_k=2)

    assert len(citations) > 0
    top_citation = citations[0]
    assert "relevanceScore" in top_citation
    assert top_citation["relevanceScore"] > 0
    assert "chapter" in top_citation
    assert "source" in top_citation
    assert "HNSW" in top_citation["excerpt"] or "vector" in top_citation["excerpt"].lower()

def test_rag_grounded_response_generation():
    query = "Explain Kubernetes pod orchestration and Ingress routing"
    result = rag_store.generate_grounded_response(query)

    assert "text" in result
    assert "citations" in result
    assert len(result["citations"]) > 0
    assert "Kubernetes" in result["text"] or "Pods" in result["text"]
