#!/usr/bin/env python3
"""
Smart Email Sender that validates email addresses before sending.
If the primary email is invalid, it immediately sends to alternative addresses.
"""

import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
from email_validator import EmailValidator

class SmartEmailSender:
    def __init__(self, smtp_config: Dict):
        """
        Initialize with SMTP configuration.
        
        smtp_config should include:
        - host: SMTP server hostname
        - port: SMTP server port
        - username: SMTP username
        - password: SMTP password
        - use_tls: Whether to use TLS
        """
        self.smtp_config = smtp_config
        self.validator = EmailValidator()
        
    def send_email_with_fallback(
        self, 
        primary_email: str, 
        fallback_emails: List[str], 
        subject: str, 
        body: str, 
        from_email: str,
        body_type: str = "plain"
    ) -> Dict:
        """
        Send email with validation and fallback logic.
        
        Returns status information about what happened.
        """
        result = {
            'sent_to': None,
            'attempted_emails': [],
            'validation_results': [],
            'send_successful': False,
            'message': ''
        }
        
        # List of emails to try, starting with primary
        email_list = [primary_email] + fallback_emails
        
        for email in email_list:
            # Validate email quickly
            validation = self.validator.validate_email(email)
            result['validation_results'].append(validation)
            result['attempted_emails'].append(email)
            
            print(f"Validating {email}...")
            
            if validation['is_valid']:
                print(f"✅ {email} is valid, attempting to send...")
                
                # Try to send the email
                send_result = self._send_email(
                    email, subject, body, from_email, body_type
                )
                
                if send_result['success']:
                    result['sent_to'] = email
                    result['send_successful'] = True
                    result['message'] = f"Email sent successfully to {email}"
                    print(f"✅ Email sent successfully to {email}")
                    break
                else:
                    print(f"❌ Failed to send to {email}: {send_result['error']}")
            else:
                print(f"❌ {email} is invalid: {validation['reason']}")
                # For invalid emails, don't even attempt to send - move to next immediately
                
        if not result['send_successful']:
            result['message'] = "Failed to send email to any of the provided addresses"
            
        return result
    
    def _send_email(
        self, 
        to_email: str, 
        subject: str, 
        body: str, 
        from_email: str,
        body_type: str = "plain"
    ) -> Dict:
        """Send email via SMTP. Returns success status and any error."""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            msg.attach(MIMEText(body, body_type))
            
            # Send email
            with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
                if self.smtp_config.get('use_tls', False):
                    server.starttls()
                
                if self.smtp_config.get('username') and self.smtp_config.get('password'):
                    server.login(self.smtp_config['username'], self.smtp_config['password'])
                
                server.send_message(msg)
                
            return {'success': True, 'error': None}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

def main():
    """Example usage of the SmartEmailSender."""
    
    # Example SMTP configuration (you'll need to update these)
    smtp_config = {
        'host': 'smtp.gmail.com',
        'port': 587,
        'username': 'your-email@gmail.com',
        'password': 'your-app-password',
        'use_tls': True
    }
    
    # Initialize sender
    sender = SmartEmailSender(smtp_config)
    
    # Example: trying to send to invalid email with fallbacks
    primary_email = "mike.chen@aicompany.com"  # This will be detected as invalid
    fallback_emails = [
        "mike.chen@theaicompany.com",  # Alternative domain
        "mike@aicompany.net",          # Different format
        "mchen@gmail.com"               # Generic fallback
    ]
    
    subject = "Important Message"
    body = "This is a test email sent with validation fallback."
    from_email = "sender@example.com"
    
    print("Smart Email Sender Demo")
    print("=" * 50)
    print(f"Primary email: {primary_email}")
    print(f"Fallback emails: {fallback_emails}")
    print("\n--- Starting Email Send Process ---\n")
    
    # Send email with fallback
    result = sender.send_email_with_fallback(
        primary_email=primary_email,
        fallback_emails=fallback_emails,
        subject=subject,
        body=body,
        from_email=from_email
    )
    
    print("\n--- Results ---")
    print(f"Sent to: {result['sent_to']}")
    print(f"Success: {result['send_successful']}")
    print(f"Message: {result['message']}")
    
    print("\n--- Validation Details ---")
    for i, validation in enumerate(result['validation_results']):
        email = result['attempted_emails'][i]
        status = "✅ VALID" if validation['is_valid'] else "❌ INVALID"
        print(f"{status} {email}: {validation['reason']}")

if __name__ == "__main__":
    main()
