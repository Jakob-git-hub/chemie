# chemie

Chemie Hausaufgaben Helfer — AI-first Demo

Diese Web-App liest eine Aufgabenstellung als Text ein und versucht sie zuerst mit KI zu lösen. Falls kein API-Key vorhanden ist oder die Anfrage fehlschlägt, nutzt sie eine lokale Heuristik als Fallback.

Bereitstellung auf GitHub Pages

1. Die Website liegt im Verzeichnis `docs/`. GitHub Pages kann so konfiguriert werden, dass der Inhalt dieses Ordners veröffentlicht wird.
2. In den Repository-Einstellungen auf GitHub: Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages` und Ordner: `/ (root)`.
3. Änderungen ins Remote-Repository pushen.

Ich habe versucht, einen gh-pages-Branch zu erstellen und zu pushen (falls Berechtigungen vorhanden). Wenn der Push fehlschlägt, bitte lokal oder in der CI den Branch erstellen und auf das Remote pushen.

Nutzung

- Öffne index.html im Browser (oder die veröffentlichte GitHub Pages URL).
- Gib die Aufgabenstellung als Text ein.
- Trage einen OpenAI API-Key ein und lasse die KI standardmäßig aktiv.
- Klicke auf "Lösen" — die Seite zeigt einen Schritt-für-Schritt-Weg und eine Antwort an.

Hinweis: Die App ist KI-first, aber keine Garantie für mathematische oder fachliche Korrektheit. Bei komplexen Aufgaben kann der Fallback oder eine manuelle Prüfung sinnvoll sein.

KI-Modus (OpenAI)

- Die Web-App nutzt OpenAI (Chat Completions) als primären Löser.
- Die Antwort wird von der KI als JSON geliefert und anschließend im UI als Lösungsweg + Endergebnis dargestellt.
- Sicherheitshinweis: Das Eingeben des API-Keys im Browser ist unsicher. Für produktive Nutzung sollte ein eigenes Backend eingerichtet werden, das den Key sicher aufbewahrt und Anfragen vom Client weiterleitet.

Wenn du möchtest, kann ich:
- Einen Beispiel-Server (Node.js/Express) hinzufügen, der als Proxy zur OpenAI-API dient und den API-Key sicher auf dem Server hält.
- Eine GitHub Actions Workflow-Datei erstellen, die das Deployment automatisiert (benötigt GitHub Token bzw. Secrets).
