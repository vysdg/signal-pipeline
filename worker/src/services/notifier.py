import os
import json
import requests

SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "")


def notify_hot_lead(
    contact_name: str,
    contact_company: str,
    score: int,
    pain_point: str,
    niche: str = "",
) -> None:
    if not SLACK_WEBHOOK_URL:
        return

    company_part = f" — {contact_company}" if contact_company else ""
    niche_part   = f"\n*Nicho:* {niche}" if niche else ""
    pain_part    = f"\n*Dor:* {pain_point}" if pain_point else ""

    payload = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"🔥 *Lead Quente — Score {score}/100*\n"
                        f"*{contact_name}*{company_part}"
                        f"{niche_part}"
                        f"{pain_part}"
                    ),
                },
            }
        ]
    }
    try:
        resp = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
        if resp.status_code != 200:
            print(f"[notifier] Slack retornou {resp.status_code}: {resp.text}", flush=True)
    except Exception as exc:
        print(f"[notifier] erro ao enviar alerta Slack: {exc}", flush=True)
