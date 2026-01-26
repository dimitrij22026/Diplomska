import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from jose import jwt

from app.core.config import settings


def create_verification_token(email: str) -> str:
    """Create a JWT token for email verification."""
    expire = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    to_encode = {"sub": email, "exp": expire, "type": "email_verification"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_email_token(token: str) -> str | None:
    """Verify an email token and return the email address if valid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=[settings.ALGORITHM])
        if payload.get("type") != "email_verification":
            return None
        return payload.get("sub")
    except Exception:
        return None


def send_verification_email(to_email: str, token: str) -> bool:
    """Send a verification email. Returns True if successful."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        # Email not configured, skip sending
        print(
            f"[Email] SMTP not configured. Verification token for {to_email}: {token}")
        return True

    verification_url = f"{settings.FRONTEND_URL}/auth/verify?token={token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Потврдете ја вашата FinMate сметка"
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email

    text_content = f"""
Добредојдовте во FinMate!

Ве молиме потврдете ја вашата email адреса со кликнување на следниот линк:
{verification_url}

Овој линк е валиден {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} часа.

Ако не сте ја креирале оваа сметка, можете да ја игнорирате оваа порака.

Со почит,
Тимот на FinMate
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #050915; color: #f6f7fb; padding: 40px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #0a0e1f; border-radius: 16px; padding: 32px; }}
        h1 {{ color: #ffb677; margin-bottom: 24px; }}
        .button {{ display: inline-block; background: #ffb677; color: #050915; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 24px 0; }}
        .footer {{ margin-top: 32px; font-size: 14px; color: #9ca0b5; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Добредојдовте во FinMate!</h1>
        <p>Ви благодариме што се регистриравте. Ве молиме потврдете ја вашата email адреса за да започнете со користење на апликацијата.</p>
        <a href="{verification_url}" class="button">Потврди Email</a>
        <p class="footer">
            Овој линк е валиден {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} часа.<br><br>
            Ако не сте ја креирале оваа сметка, можете да ја игнорирате оваа порака.
        </p>
    </div>
</body>
</html>
"""

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL,
                            to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[Email] Failed to send verification email: {e}")
        return False
