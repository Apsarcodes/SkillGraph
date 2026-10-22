import re
from typing import Tuple, List, Dict

# Robust regex patterns for common PII
EMAIL_REGEX = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
)

# Phone numbers (US/Intl formats like (555) 123-4567, +1-555-555-5555, 555.555.5555, 9876543210)
PHONE_REGEX = re.compile(
    r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'
)

# Social security numbers or national tax IDs (e.g. 000-00-0000)
SSN_REGEX = re.compile(
    r'\b\d{3}-\d{2}-\d{4}\b'
)

# Common street address indicators
ADDRESS_REGEX = re.compile(
    r'\b\d{1,5}\s+([A-Za-z0-9\.\s]+)\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way)\b',
    re.IGNORECASE
)

class PIIScrubber:
    @staticmethod
    def scrub_text(text: str) -> Tuple[str, Dict[str, int]]:
        """
        Redacts personal identifiable information from text while tracking redacted metrics.
        Returns (scrubbed_text, redaction_counts)
        """
        if not text:
            return "", {"emails": 0, "phones": 0, "ssn": 0, "addresses": 0}

        counts = {
            "emails": 0,
            "phones": 0,
            "ssn": 0,
            "addresses": 0
        }

        # 1. Redact Emails
        emails_found = EMAIL_REGEX.findall(text)
        counts["emails"] = len(emails_found)
        scrubbed = EMAIL_REGEX.sub("[REDACTED_EMAIL]", text)

        # 2. Redact SSN
        ssn_found = SSN_REGEX.findall(scrubbed)
        counts["ssn"] = len(ssn_found)
        scrubbed = SSN_REGEX.sub("[REDACTED_NATIONAL_ID]", scrubbed)

        # 3. Redact Phones
        phones_found = PHONE_REGEX.findall(scrubbed)
        counts["phones"] = len(phones_found)
        scrubbed = PHONE_REGEX.sub("[REDACTED_PHONE]", scrubbed)

        # 4. Redact Addresses
        addr_found = ADDRESS_REGEX.findall(scrubbed)
        counts["addresses"] = len(addr_found)
        scrubbed = ADDRESS_REGEX.sub("[REDACTED_ADDRESS]", scrubbed)

        return scrubbed, counts
