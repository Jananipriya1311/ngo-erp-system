import requests
import json
from datetime import datetime

API_ENDPOINT = "https://duoyij8ld5.execute-api.eu-north-1.amazonaws.com/Prod/detect"

# URLs to test (you'll test these manually in Chrome too)
test_urls = [
    # Malicious URLs (should be blocked)
    ("http://secure-verify.xyz", "phishing", "Should show block page"),
    ("http://paypal-verification.xyz", "phishing", "Should show block page"),
    ("http://appleid-verify.info", "phishing", "Should show block page"),
    ("http://amazon-security-check.com", "phishing", "Should show block page"),
    
    # Safe URLs (should NOT be blocked)
    ("https://google.com", "safe", "Should load normally"),
    ("https://github.com", "safe", "Should load normally"),
    ("https://stackoverflow.com", "safe", "Should load normally"),
    ("https://wikipedia.org", "safe", "Should load normally"),
]

results = []

print("=" * 60)
print("📊 GENERATING VALIDATION REPORT")
print("=" * 60)
print("\nTesting URLs against API...\n")

for url, expected, note in test_urls:
    try:
        response = requests.post(API_ENDPOINT, json={"url": url}, timeout=10)
        data = response.json()
        
        is_phishing = data.get('is_phishing', False)
        risk_score = data.get('risk_score', 0)
        
        detected = "phishing" if is_phishing else "safe"
        correct = (detected == expected)
        
        results.append({
            "url": url,
            "expected": expected,
            "detected": detected,
            "correct": correct,
            "risk_score": risk_score,
            "severity": data.get('severity'),
            "flags": data.get('flags', [])[:3],
            "manual_test": note
        })
        
        status = "✅" if correct else "❌"
        print(f"{status} {url}")
        print(f"   Expected: {expected} | Detected: {detected} | Risk: {risk_score}")
        print(f"   Manual: {note}")
        print()
        
    except Exception as e:
        print(f"⚠️ Error testing {url}: {e}")

# Calculate stats
phishing_total = len([r for r in results if r['expected'] == 'phishing'])
phishing_correct = len([r for r in results if r['expected'] == 'phishing' and r['correct']])
safe_total = len([r for r in results if r['expected'] == 'safe'])
safe_correct = len([r for r in results if r['expected'] == 'safe' and r['correct']])

phishing_accuracy = (phishing_correct / phishing_total * 100) if phishing_total > 0 else 0
safe_accuracy = (safe_correct / safe_total * 100) if safe_total > 0 else 0
overall_accuracy = ((phishing_correct + safe_correct) / len(results) * 100) if len(results) > 0 else 0

# Create validation report
validation_report = {
    "test_date": datetime.now().isoformat(),
    "api_endpoint": API_ENDPOINT,
    "methodology": "Manual URL testing in Chrome + API validation",
    "manual_test_instructions": [
        "1. Load the extension in Chrome",
        "2. Type each malicious URL in the address bar",
        "3. Verify block page appears with correct risk score",
        "4. Type each safe URL to verify it loads normally"
    ],
    "results": results,
    "summary": {
        "total_tested": len(results),
        "phishing_urls_tested": phishing_total,
        "safe_urls_tested": safe_total,
        "phishing_detection_accuracy": round(phishing_accuracy, 2),
        "safe_detection_accuracy": round(safe_accuracy, 2),
        "overall_accuracy": round(overall_accuracy, 2)
    },
    "targets": {
        "phishing_detection_target": "98%",
        "safe_detection_target": "92%",
        "phishing_achieved": f"{round(phishing_accuracy, 2)}%",
        "safe_achieved": f"{round(safe_accuracy, 2)}%"
    }
}

# Save report
with open("validation_report.json", "w") as f:
    json.dump(validation_report, f, indent=2)

print("=" * 60)
print("📊 VALIDATION SUMMARY")
print("=" * 60)
print(f"\nPhishing Detection: {round(phishing_accuracy, 2)}% (Target: 98%)")
print(f"Safe Site Detection: {round(safe_accuracy, 2)}% (Target: 92%)")
print(f"Overall Accuracy: {round(overall_accuracy, 2)}%")
print(f"\n✅ Manual Testing Required:")
for url, expected, note in test_urls:
    print(f"   - {url} → {note}")

print(f"\n💾 Report saved to: validation_report.json")