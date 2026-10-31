"""Fail on known notification-secret leaks and unfinished public connection settings."""
import re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
issues=[]
for path in [root/'app.js',root/'order-config.js',root/'index.html',root/'README.md']:
    s=path.read_text(encoding='utf-8')
    if re.search(r'(?i)\bNTFY_TOPIC\s*=\s*[\'\"][^\'\"]+|https?://ntfy\.sh/[^\s\)\]\"\'<>`]+|\btk_[A-Za-z0-9]{20,}|\bgh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY-----',s):
        issues.append(path.name+': possible notification destination or credential; value suppressed')
config=(root/'order-config.js').read_text(encoding='utf-8')
if not re.search(r'endpoint\s*:\s*[\'\"]https://[^\'\"]+/order[\'\"]',config):issues.append('order-config.js: HTTPS order endpoint is not configured')
if not re.search(r'turnstileSiteKey\s*:\s*[\'\"][^\'\"]+[\'\"]',config):issues.append('order-config.js: public bot-check key is not configured')
if issues:
    print('\n'.join(issues));sys.exit(1)
print('Public source checks passed; provider secrets are not expected in this repository.')
