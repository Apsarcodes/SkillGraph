from backend.security.pii_scrubber import PIIScrubber
from backend.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_pii_scrubbing_emails_and_phones():
    raw_text = "Contact Jane Doe at jane.doe@example.com or reach me on +1 (555) 234-5678. SSN: 123-45-6789."
    scrubbed, counts = PIIScrubber.scrub_text(raw_text)

    assert "[REDACTED_EMAIL]" in scrubbed
    assert "jane.doe@example.com" not in scrubbed
    assert "[REDACTED_PHONE]" in scrubbed
    assert "555" not in scrubbed
    assert "[REDACTED_NATIONAL_ID]" in scrubbed
    assert "123-45-6789" not in scrubbed
    assert counts["emails"] == 1
    assert counts["phones"] >= 1
    assert counts["ssn"] == 1

def test_password_hashing_and_verification():
    raw_pw = "SecureP@ssw0rd2025"
    hashed = hash_password(raw_pw)

    assert hashed != raw_pw
    assert verify_password(hashed, raw_pw) is True
    assert verify_password(hashed, "WrongPassword!") is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "usr_9981", "email": "test@skillgraph.ai"}
    token = create_access_token(payload)

    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "usr_9981"
    assert decoded["email"] == "test@skillgraph.ai"
    assert "exp" in decoded

def test_invalid_jwt_decoding():
    decoded = decode_access_token("invalid.token.signature")
    assert decoded is None
