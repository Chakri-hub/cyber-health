"""
Test script for Gmail SMTP connection.
Run this file directly with Python to test your Gmail configuration.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import traceback

# Gmail SMTP settings
GMAIL_USER = 'chakri.cdac@gmail.com'  # Change to your Gmail
GMAIL_PASSWORD = 'zkwh fpxd vbpp rgmi'  # Your app password with spaces
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587

def test_gmail_connection(recipient_email=None):
    """Test the Gmail SMTP connection directly."""
    # Use provided recipient or default to sender for testing
    sender = GMAIL_USER
    recipient = recipient_email or sender
    
    print("\n")
    print("=" * 60)
    print(f"GMAIL SMTP TEST CONFIGURATION:")
    print(f"SMTP_SERVER: {SMTP_SERVER}")
    print(f"SMTP_PORT: {SMTP_PORT}")
    print(f"GMAIL_USER: {GMAIL_USER}")
    print(f"SENDER: {sender}")
    print(f"RECIPIENT: {recipient}")
    print("=" * 60)
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Gmail SMTP Test'
    msg['From'] = sender
    msg['To'] = recipient
    
    # Plain text and HTML parts
    text = "This is a test email from the Cyber Health OTP system"
    html = """
    <html>
    <head></head>
    <body>
        <h2 style="color: #4169e1;">Gmail SMTP Test Successful!</h2>
        <p>This is a test email to verify that the Gmail SMTP connection is working properly.</p>
        <p>If you received this email, your email configuration is correct.</p>
        <hr>
        <p><em>Cyber Health System</em></p>
    </body>
    </html>
    """
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    try:
        # Connect to SMTP server
        print("\nAttempting to connect to Gmail SMTP server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1)  # Show SMTP communication for debugging
        
        # Identify ourselves to the server
        print("\nSending EHLO...")
        server.ehlo()
        
        # Start TLS for Gmail
        print("\nStarting TLS...")
        server.starttls()
        server.ehlo()  # Need to re-identify after TLS
        
        # Login to Gmail
        print("\nAttempting to login with provided credentials...")
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        
        # Send email
        print("\nSending email...")
        server.sendmail(sender, [recipient], msg.as_string())
        
        # Close connection
        server.quit()
        print("\nEmail sent successfully!")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"\nSMTP Error: {str(e)}")
        traceback.print_exc()
        print("=" * 60)
        return False

if __name__ == "__main__":
    # If provided on command line, use that email as recipient
    recipient = sys.argv[1] if len(sys.argv) > 1 else GMAIL_USER
    
    print(f"Testing Gmail connection to send email to: {recipient}")
    success = test_gmail_connection(recipient)
    
    if success:
        print("Gmail SMTP test completed successfully!")
        print("Check your email inbox for the test message.")
    else:
        print("Gmail SMTP test failed!")
        print("Review the error messages above for troubleshooting.") 