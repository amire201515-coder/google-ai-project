import urllib.request
import re

url = "https://novininsurance.com/%D9%85%D8%B1%D8%A7%D8%AC%D8%B9-%D8%AF%D8%B1%D9%85%D8%A7%D9%86%DB%8C-%D8%B7%D8%B1%D9%81-%D9%82%D8%B1%D8%A7%D8%B1%D8%AF%D8%A7%D8%AF"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        content = resp.read().decode('utf-8', 'ignore')
        matches = re.findall(r'zes_medical_center[^\'"]*', content)
        print("Matches:", matches)
        # Search for any .csv
        all_csv = re.findall(r'[\w\-/\.]+\.csv', content)
        print("All CSVs:", all_csv)
except Exception as e:
    print("Error:", e)
