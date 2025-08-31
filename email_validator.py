#!/usr/bin/env python3
"""
Email validator that checks DNS MX records to quickly identify invalid email domains.
This helps avoid waiting for delivery timeouts on domains that don't accept email.
"""

import dns.resolver
import re
import socket
from typing import Tuple, Optional

class EmailValidator:
    def __init__(self):
        self.dns_timeout = 5  # seconds
    
    def is_valid_email_format(self, email: str) -> bool:
        """Check if email has valid format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def check_mx_record(self, domain: str) -> Tuple[bool, str]:
        """
        Check if domain has valid MX records.
        Returns (is_valid, reason)
        """
        try:
            # Create resolver with timeout
            resolver = dns.resolver.Resolver()
            resolver.timeout = self.dns_timeout
            resolver.lifetime = self.dns_timeout
            
            # Try to get MX records
            mx_records = resolver.resolve(domain, 'MX')
            
            # Check for Null MX (RFC 7505)
            for mx in mx_records:
                if mx.preference == 0 and str(mx.exchange) == '.':
                    return False, "Domain has Null MX record (explicitly rejects email)"
            
            # If we have MX records and none are null MX, domain accepts email
            return True, f"Valid MX records found ({len(mx_records)} records)"
            
        except dns.resolver.NXDOMAIN:
            return False, "Domain does not exist"
        except dns.resolver.NoAnswer:
            # No MX record, try A record as fallback
            try:
                resolver.resolve(domain, 'A')
                return True, "No MX record but A record exists (fallback mail server)"
            except:
                return False, "No MX or A records found"
        except dns.resolver.Timeout:
            return False, "DNS query timeout"
        except Exception as e:
            return False, f"DNS error: {str(e)}"
    
    def validate_email(self, email: str) -> dict:
        """
        Comprehensive email validation.
        Returns dict with validation results.
        """
        result = {
            'email': email,
            'is_valid': False,
            'format_valid': False,
            'domain_valid': False,
            'reason': ''
        }
        
        # Check format first
        if not self.is_valid_email_format(email):
            result['reason'] = "Invalid email format"
            return result
        
        result['format_valid'] = True
        domain = email.split('@')[1]
        
        # Check MX records
        domain_valid, reason = self.check_mx_record(domain)
        result['domain_valid'] = domain_valid
        result['reason'] = reason
        result['is_valid'] = result['format_valid'] and result['domain_valid']
        
        return result

def main():
    validator = EmailValidator()
    
    # Test cases
    test_emails = [
        "mike.chen@aicompany.com",
        "user@gmail.com",
        "test@nonexistentdomain12345.com",
        "invalid-email",
        "user@example.com"
    ]
    
    print("Email Validation Results:")
    print("=" * 60)
    
    for email in test_emails:
        result = validator.validate_email(email)
        status = "✅ VALID" if result['is_valid'] else "❌ INVALID"
        print(f"{status} {email}")
        print(f"  Format: {'✅' if result['format_valid'] else '❌'}")
        print(f"  Domain: {'✅' if result['domain_valid'] else '❌'}")
        print(f"  Reason: {result['reason']}")
        print()

if __name__ == "__main__":
    main()
