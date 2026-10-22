from backend.ml.classifier import ml_service

def test_ml_train_and_evaluate_metrics():
    metrics = ml_service.train_and_evaluate()

    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1Score" in metrics
    assert "confusionMatrix" in metrics

    # Verify realistic non-fabricated metric ranges
    assert 0.65 <= metrics["accuracy"] <= 1.0
    assert 0.65 <= metrics["f1Score"] <= 1.0

    cm = metrics["confusionMatrix"]
    assert cm["labels"] == ["Negative Feedback", "Neutral Query", "Positive Feedback"]
    assert len(cm["matrix"]) == 3
    assert len(cm["matrix"][0]) == 3

def test_sentiment_prediction():
    pos_res = ml_service.predict_sentiment("The generated roadmap was extremely helpful and accurate")
    assert pos_res["sentiment"] in ["positive", "neutral"]

    neg_res = ml_service.predict_sentiment("The assessment was completely confusing, frustrating, and failed")
    assert neg_res["sentiment"] in ["negative", "neutral"]
