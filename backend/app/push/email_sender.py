import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

from app.core.config import get_settings

settings = get_settings()


class EmailSender:
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        use_tls: bool = True,
    ):
        self.host = host or settings.SMTP_HOST
        self.port = port or settings.SMTP_PORT
        self.user = user or settings.SMTP_USER
        self.password = password or settings.SMTP_PASSWORD
        self.use_tls = use_tls

    def _create_connection(self):
        server = smtplib.SMTP(self.host, self.port)
        if self.use_tls:
            server.starttls()
        if self.user and self.password:
            server.login(self.user, self.password)
        return server

    def send_text(
        self,
        to_addrs: List[str],
        subject: str,
        body: str,
        from_addr: Optional[str] = None,
    ) -> dict:
        if not self.host or not self.user:
            return {"status": "skipped", "reason": "SMTP not configured"}

        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = from_addr or self.user
        msg["To"] = ", ".join(to_addrs)

        try:
            with self._create_connection() as server:
                server.sendmail(msg["From"], to_addrs, msg.as_string())
            return {"status": "success", "to": to_addrs}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def send_html(
        self,
        to_addrs: List[str],
        subject: str,
        html_body: str,
        from_addr: Optional[str] = None,
    ) -> dict:
        if not self.host or not self.user:
            return {"status": "skipped", "reason": "SMTP not configured"}

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_addr or self.user
        msg["To"] = ", ".join(to_addrs)

        msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            with self._create_connection() as server:
                server.sendmail(msg["From"], to_addrs, msg.as_string())
            return {"status": "success", "to": to_addrs}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def send_markdown_as_html(
        self,
        to_addrs: List[str],
        subject: str,
        markdown_text: str,
        from_addr: Optional[str] = None,
    ) -> dict:
        try:
            import markdown
            html_body = markdown.markdown(markdown_text, extensions=["tables", "fenced_code"])
        except ImportError:
            html_body = f"<pre>{markdown_text}</pre>"

        return self.send_html(to_addrs, subject, html_body, from_addr)
