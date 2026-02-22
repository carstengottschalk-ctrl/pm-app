# E-Mail-Bestätigung deaktivieren und Testbenutzer neu erstellen

## Übersicht
Diese Anleitung führt Sie durch das Deaktivieren der E-Mail-Bestätigung in Supabase und das Neuerstellen des Testbenutzers, damit Sie sich ohne Bestätigung einloggen können.

## Schritt-für-Schritt Anleitung

### 🔧 Schritt 1: Zum Supabase Dashboard gehen
1. Öffnen Sie [Supabase Dashboard](https://app.supabase.com) in Ihrem Browser
2. Melden Sie sich mit Ihrem Supabase-Konto an
3. Wählen Sie das Projekt: **bmxtixowqhojvtmftjti** (pm-app)

### 📧 Schritt 2: E-Mail-Bestätigung deaktivieren
1. Klicken Sie im linken Menü auf **Authentication**
2. Klicken Sie auf den Tab **Settings**
3. Scrollen Sie zum Abschnitt **Email Auth**
4. Suchen Sie die Option **Confirm email**
5. Schalten Sie den Toggle auf **OFF** (deaktiviert)
6. Änderungen werden automatisch gespeichert

**Direkter Link**: https://app.supabase.com/project/bmxtixowqhojvtmftjti/auth/settings

### 🗑️ Schritt 3: Alten Testbenutzer löschen (optional)
Da der bestehende Benutzer (`mustermann@test.de`) noch nicht bestätigt ist, müssen wir ihn löschen und neu erstellen:

1. Bleiben Sie im **Authentication** Bereich
2. Wechseln Sie zum Tab **Users**
3. Suchen Sie nach `mustermann@test.de`
4. Klicken Sie auf den Benutzer, um die Details zu öffnen
5. Klicken Sie auf **Delete user** und bestätigen Sie

### 👤 Schritt 4: Neuen Testbenutzer erstellen
1. Klicken Sie im **Users** Tab auf **Add User**
2. Füllen Sie das Formular aus:
   - **Email**: mustermann@test.de
   - **Password**: 12345678
   - **Confirm email**: NICHT anhaken (da deaktiviert)
3. Klicken Sie auf **Create User**

### 🔐 Schritt 5: Login testen
Nachdem der Benutzer erstellt wurde:

1. Öffnen Sie Ihr Terminal
2. Navigieren Sie zum Projekt:
   ```bash
   cd /home/carsten/Dokumente/projekte/pm-app
   ```
3. Führen Sie den Login-Test aus:
   ```bash
   node test-login.js
   ```

**Erwartetes Ergebnis**:
```
✅ Login successful!
User ID: [neue-user-id]
Email: mustermann@test.de
Email confirmed: Yes (or not required)
```

### 🚀 Schritt 6: Entwicklungsserver neu starten
1. Stoppen Sie den aktuellen Dev-Server (Strg+C)
2. Starten Sie ihn neu:
   ```bash
   npm run dev
   ```

### 🌐 Schritt 7: Im Browser einloggen
1. Öffnen Sie [http://localhost:3000/login](http://localhost:3000/login)
2. Login mit:
   - Email: mustermann@test.de
   - Password: 12345678
3. Sie sollten nun eingeloggt sein und Projekte erstellen können

## Alternative: Service Role Key verwenden (für zukünftige Automatisierung)
Falls Sie in Zukunft Testbenutzer automatisch erstellen möchten:

1. Gehen Sie zu **Settings** → **API**
2. Kopieren Sie den **service_role** Key
3. Fügen Sie ihn in `.env.local` ein:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-copied-key-here
   ```
4. Dann können Sie Skripte wie `create-test-user.js` verwenden

## Fehlerbehebung

### "Email not confirmed" erscheint trotzdem
- Stellen Sie sicher, dass Sie **Confirm email** wirklich deaktiviert haben
- Prüfen Sie, dass Sie den **neuen** Benutzer erstellt haben (nicht den alten)
- Warten Sie 1-2 Minuten, bis die Einstellungen wirksam werden

### "Invalid login credentials"
- Überprüfen Sie das Passwort: **12345678**
- Stellen Sie sicher, dass der Benutzer existiert (Authentication → Users)

### "Authentication required" beim Projekt erstellen
- Stellen Sie sicher, dass Sie im Browser eingeloggt sind
- Überprüfen Sie, ob `NEXT_PUBLIC_FORCE_MOCK_AUTH=false` in `.env.local`
- Starten Sie den Dev-Server neu

## Wichtige Links
- **Supabase Dashboard**: https://app.supabase.com
- **Authentication Settings**: https://app.supabase.com/project/bmxtixowqhojvtmftjti/auth/settings
- **Users Management**: https://app.supabase.com/project/bmxtixowqhojvtmftjti/auth/users
- **Lokale App**: http://localhost:3000

## Unterstützung benötigt?
Wenn Sie bei einem Schritt Hilfe benötigen, sagen Sie mir Bescheid. Ich kann Sie durch jeden einzelnen Schritt führen.