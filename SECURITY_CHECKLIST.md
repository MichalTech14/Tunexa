# 🔒 Bezpečnostný Checklist pre Tunexa

## ✅ Pred Deploymentom

### 1. Repozitár
- [ ] SECURITY.md súbor vytvorený
- [ ] .gitignore správne nastavený (žiadne .env, credentials)
- [ ] Žiadne hardcodované heslá v kóde
- [ ] Žiadne API keys v kóde
- [ ] Branch protection nastavený na GitHub

### 2. Dependabot (GitHub)
- [ ] Zapnúť Dependabot alerts
- [ ] Zapnúť Dependabot security updates
- [ ] Zapnúť Dependabot version updates

### 3. GitHub Security Features
- [ ] Enable Secret Scanning
- [ ] Enable Security Advisories
- [ ] Enable Vulnerability Reporting
- [ ] Configure Branch Protection Rules
- [ ] Require pull request reviews
- [ ] Require status checks to pass

### 4. Code Security
- [ ] TypeScript strict mode enabled ✅
- [ ] No eval() or Function() constructor
- [ ] Input validation všade
- [ ] SQL injection prevention (TypeORM) ✅
- [ ] XSS protection
- [ ] CSRF protection

### 5. Environment Variables
- [ ] .env súbor nie je v gite ✅
- [ ] .env.example vytvorený ✅
- [ ] Všetky secrets v environment variables
- [ ] Production secrets iné než development

### 6. Database
- [ ] Strong passwords
- [ ] SSL/TLS connections
- [ ] Regular backups
- [ ] Access control (least privilege)
- [ ] Query parameterization ✅

### 7. API Security
- [ ] HTTPS only (production)
- [ ] CORS správne nastavený ✅
- [ ] Helmet.js pre HTTP headers ✅
- [ ] Rate limiting
- [ ] Authentication middleware
- [ ] Input validation ✅

### 8. Authentication
- [ ] JWT secret strong a unikátny
- [ ] Password hashing (bcrypt) ✅
- [ ] Session management
- [ ] Token expiration
- [ ] Refresh token rotation

### 9. Monitoring & Logging
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Access logs
- [ ] Security event logging
- [ ] Monitoring dashboard

### 10. NPM Security
- [ ] Run `npm audit` ✅
- [ ] Fix vulnerabilities
- [ ] Update dependencies regularly
- [ ] Use package-lock.json ✅

---

## 🛡️ GitHub Repository Settings

### Security Tab
1. Choď na: https://github.com/MichalTech14/Tunexa/settings/security_analysis
2. Zapni:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Grouped security updates
   - ✅ Secret scanning
   - ✅ Code scanning (CodeQL)

### Branch Protection
1. Choď na: Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Zapni:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators

### Secrets Management
1. Choď na: Settings → Secrets and variables → Actions
2. Pridaj secrets:
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `REDIS_PASSWORD`
   - `SPOTIFY_CLIENT_SECRET`
   - `OEM_API_KEY`

---

## 🚀 Production Deployment Checklist

### Environment
- [ ] NODE_ENV=production
- [ ] Secure .env file
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled

### Server
- [ ] Reverse proxy (nginx) configured
- [ ] SSL certificate installed
- [ ] Auto-restart on crash (PM2, systemd)
- [ ] Log rotation configured
- [ ] Backup strategy implemented

### Monitoring
- [ ] Uptime monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Security monitoring
- [ ] Alerts configured

---

## 📋 Pravidelná Údržba

### Týždenne
- [ ] Skontroluj Dependabot alerts
- [ ] Review security logs
- [ ] Check for outdated dependencies

### Mesačne
- [ ] Run full security audit
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Test backup restoration

### Kvartálne
- [ ] Security penetration testing
- [ ] Code security review
- [ ] Update security policies
- [ ] Disaster recovery drill

---

## 🔧 Užitočné Príkazy

```bash
# Security audit
npm audit
npm audit fix
npm audit fix --force

# Check dependencies
npm outdated
npm update

# TypeScript compile check
npm run build

# Test security
npm test

# Production build
npm run build
NODE_ENV=production npm start
```

---

## 📞 V Prípade Security Incident

1. **Identifikuj** problém
2. **Izoluj** postihnuté systémy
3. **Notifikuj** tím a užívateľov
4. **Oprav** zraniteľnosť
5. **Dokumentuj** incident
6. **Analyzuj** príčinu
7. **Implementuj** preventívne opatrenia

---

**Vytvorené:** October 20, 2025  
**Autor:** MichalTech14  
**Posledná aktualizácia:** October 20, 2025
