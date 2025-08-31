#!/usr/bin/env python3
"""
Command-line email validation tool.
Quickly validates email addresses and shows which ones are immediately rejectable.
"""

import sys
import argparse
from email_validator import EmailValidator

def main():
    parser = argparse.ArgumentParser(
        description="Validate email addresses to identify those that can't receive email"
    )
    parser.add_argument(
        'emails',
        nargs='+',
        help='Email addresses to validate'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=5,
        help='DNS query timeout in seconds (default: 5)'
    )
    parser.add_argument(
        '--detailed',
        action='store_true',
        help='Show detailed validation information'
    )
    
    args = parser.parse_args()
    
    # Initialize validator
    validator = EmailValidator()
    validator.dns_timeout = args.timeout
    
    print(f"Email Validation Tool - Checking {len(args.emails)} email(s)")
    print("=" * 60)
    
    valid_emails = []
    invalid_emails = []
    
    for email in args.emails:
        result = validator.validate_email(email)
        
        if result['is_valid']:
            valid_emails.append(email)
            status = "✅ VALID"
            color = "\\033[92m"  # Green
        else:
            invalid_emails.append(email)
            status = "❌ INVALID"
            color = "\\033[91m"  # Red
        
        reset_color = "\\033[0m"
        
        if args.detailed:
            print(f"{color}{status}{reset_color} {email}")
            print(f"    Format: {'✅' if result['format_valid'] else '❌'}")
            print(f"    Domain: {'✅' if result['domain_valid'] else '❌'}")
            print(f"    Reason: {result['reason']}")
            print()
        else:
            print(f"{color}{status}{reset_color} {email}: {result['reason']}")
    
    # Summary
    print("\\n" + "=" * 60)
    print(f"Summary: {len(valid_emails)} valid, {len(invalid_emails)} invalid")
    
    if valid_emails:
        print(f"\\n✅ Can receive email ({len(valid_emails)}):")
        for email in valid_emails:
            print(f"   {email}")
    
    if invalid_emails:
        print(f"\\n❌ Cannot receive email - skip these ({len(invalid_emails)}):")
        for email in invalid_emails:
            print(f"   {email}")
    
    # Exit code: 0 if all valid, 1 if any invalid
    sys.exit(0 if not invalid_emails else 1)

if __name__ == "__main__":
    main()
