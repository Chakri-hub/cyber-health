## Security Features

### Rate Limiting

The application implements progressive rate limiting for authentication-related operations:

- Registration requests: Limited to 5 attempts within 5 minutes per email
- Login OTP requests: Limited to 5 attempts within 5 minutes per email
- OTP verification: Limited to 3 attempts within 3 minutes per email
- OTP resend: Limited to 3 attempts within 5 minutes per email

The rate limiting mechanism features exponential backoff, meaning that persistent violators will face increasingly longer cooldown periods.

### Account Lockout

To prevent brute force attacks, accounts are automatically locked after multiple failed login attempts:

- Accounts are locked after 5 consecutive failed OTP verification attempts
- Lockout duration is 30 minutes by default
- Lockout information is displayed to the user with a countdown timer
- Failed attempts counter resets upon successful login

### Security Alert Emails

The system detects suspicious login activities and sends security alert emails:

- Brute force detection: Alerts are sent when multiple rapid login attempts are detected in succession
- Multiple failed attempts: Alerts are sent after 3 failed login attempts
- Both the user and admin receive detailed alert emails with incident information
- Alerts include the IP address, user agent, and timestamp of the suspicious activity
- Alert emails have a cooldown period to prevent email flooding

### Email OTP Authentication

The application uses email-based OTP authentication instead of traditional password-based authentication:

- 6-digit numeric OTPs are generated for both registration and login
- OTPs expire after 10 minutes
- OTP resend functionality is available after a 2-minute cooldown period
- Secure email delivery using direct SMTP integration with proper error handling 