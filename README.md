# CumpreAI OS — Versão V2 (Consolidada)

> **Diretório Unificado de Desenvolvimento V2**  
> **Localização:** `C:\Users\HP\.gemini\antigravity\scratch\cumpreai_simulatorV2`

---

## 📂 Estrutura do Projeto V2

```text
cumpreai_simulatorV2/
├── backend/                  # Código-fonte TypeScript das Firebase Cloud Functions & regras
│   ├── src/                  # Controllers, modelos e serviços (Commitment, Evidence, Ledger, etc.)
│   ├── lib/                  # Executáveis JavaScript compilados (tsc)
│   ├── test_baseline.js      # Script de teste de integração do banco de dados
│   ├── package.json          # Dependências do backend
│   └── tsconfig.json         # Configurações do compilador TypeScript
│
└── frontend/                 # Interface Web Visual & Simulador do Aplicativo Móvel
    ├── index.html            # Painel do Desenvolvedor com Monitor de Eventos e 15 Builds
    ├── presentation.html     # Tela de Apresentação Limpa para o Cliente (com Zoom Interativo)
    ├── app.js                # Lógica do simulador em tempo real e chaveador de builds
    └── style.css             # Estilo visual moderno com Dark Mode e suporte responsivo
```

---

## 🎯 Roteiro de Desenvolvimento da Versão V2 (Roadmap)

### Fase 1: Backend & Cloud Functions (Consolidação)
- [x] Compilação do TypeScript `01_backend` -> `lib/`
- [ ] Exportação das 9 Cloud Functions pendentes em `backend/src/index.ts`:
  - `createMember`
  - `createJourney`
  - `validateEvidence`
  - `issueRecognition`
  - `updateDashboard`
  - `generateOpportunity`
  - `writeLedgerEvent`
  - `switchContext`
  - `sendCommunication`

### Fase 2: Motor de IA / Oráculo de Evidências
- [ ] Integração com **Google Gemini API** para análise automática de fotos, comprovantes e links submetidos pelos membros antes da concessão de recompensas em `A$`.

### Fase 3: Autenticação Real & Proteção
- [ ] Conectar **Firebase Auth** (tokens JWT) e regras estritas do Firestore.

### Fase 4: Frontend & Mobile Nativo
- [ ] Refinar o simulador web em `frontend/` e compilar protótipo nativo em **Flutter**.

---

## 🚀 Como Executar

### 1. Compilar o Backend TypeScript
```powershell
cd backend
powershell -ExecutionPolicy Bypass -Command "npm run build"
```

### 2. Executar a Aplicação Web Simulada
```powershell
cd frontend
python -m http.server 8082
```
Acesse no navegador:
- **Modo Apresentação Cliente**: [http://localhost:8082/presentation.html](http://localhost:8082/presentation.html)
- **Painel de Engenharia**: [http://localhost:8082/index.html](http://localhost:8082/index.html)
