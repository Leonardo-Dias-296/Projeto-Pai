# AutoControl — Sistema de Gestão de Oficina

Monorepo com backend, web e mobile num único projeto.

```
autocontrol/
├── .vscode/                  ← Configurações do VS Code (já prontas)
├── packages/
│   └── shared/               ← Tipos TypeScript compartilhados
└── apps/
    ├── backend/              ← API Node.js + Express
    │   ├── prisma/           ← Schema do banco PostgreSQL
    │   ├── src/
    │   │   ├── index.ts
    │   │   └── routes/
    │   │       ├── placa.ts          ← OCR + consulta veicular
    │   │       ├── ordemServico.ts   ← CRUD de OS + disparo WhatsApp
    │   │       ├── cliente.ts
    │   │       └── veiculo.ts
    │   └── .env.example      ← Copie para .env e preencha as chaves
    │
    ├── mobile/               ← App React Native (Expo)
    │   ├── App.tsx
    │   └── src/screens/
    │       ├── PistasScreen.tsx        ← Veículos na pista
    │       ├── ScanPlacaScreen.tsx     ← Câmera + OCR
    │       ├── CheckInScreen.tsx       ← KM, combustível, relato
    │       ├── DefeitosScreen.tsx      ← Checklist de defeitos
    │       ├── AcompanhamentoScreen.tsx← Avançar status dos itens
    │       └── FinalizarScreen.tsx     ← Encerrar + notificar WhatsApp
    │
    └── web/
        └── financeiro.html   ← Painel do financeiro (abre direto no browser)
```

---

## 1. Abrir no VS Code

```bash
# Clone ou extraia a pasta e abra
code autocontrol
```

Instale as extensões recomendadas quando o VS Code perguntar
(ou abra a paleta: `Ctrl+Shift+P` → "Show Recommended Extensions").

---

## 2. Rodar o backend

```bash
cd apps/backend

# Instalar dependências
npm install

# Criar o .env com suas chaves
cp .env.example .env
# Edite o .env e preencha as chaves

# Rodar em modo desenvolvimento (reinicia ao salvar)
npm run dev
```

O servidor sobe em **http://localhost:3001**

### Chaves necessárias no .env

| Variável | Onde obter |
|----------|-----------|
| `GOOGLE_VISION_KEY` | console.cloud.google.com → APIs → Cloud Vision |
| `APIBRASIL_TOKEN` | apibrasil.com.br (consulta de placa) |
| `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` | developers.facebook.com → WhatsApp |

> **Sem as chaves**, o sistema roda normalmente com dados mock — bom para desenvolvimento.

---

## 3. Rodar o app mobile

```bash
cd apps/mobile

# Instalar dependências
npm install

# Ajuste o IP do backend (sua máquina na rede local)
# Edite: src/config.ts → troque 192.168.0.100 pelo IP da sua máquina

# Rodar
npm start
# Abrirá o Expo — escaneie o QR com o celular (app Expo Go)
# ou pressione 'a' para Android emulador / 'i' para iOS
```

---

## 4. Abrir o painel web

Abra direto no navegador — sem precisar instalar nada:

```
apps/web/financeiro.html
```

Ou com servidor local:
```bash
cd apps/web
npm install
npm run dev
# Acesse http://localhost:3000/financeiro.html
```

---

## 5. Banco de dados real (quando estiver pronto para produção)

Atualmente o backend usa arrays em memória (dados somem ao reiniciar).
Para persistir com PostgreSQL:

```bash
cd apps/backend

# Instalar Prisma
npm install @prisma/client prisma

# Adicionar no .env:
# DATABASE_URL=postgresql://usuario:senha@localhost:5432/autocontrol

# Criar as tabelas
npx prisma migrate dev --name init

# Gerar o cliente
npx prisma generate
```

Depois substitua os arrays mock por chamadas `prisma.ordemServico.findMany()` etc.

---

## Fluxo de uso

```
[Celular — Mecânico/Chefe]
  1. Abre PistasScreen → vê veículos em atendimento
  2. Toca + → ScanPlacaScreen → tira foto da placa
  3. Sistema lê a placa e busca dados do veículo
  4. CheckInScreen → registra KM e combustível
  5. DefeitosScreen → marca o que o cliente relatou
  6. AcompanhamentoScreen → avança status de cada reparo
  7. FinalizarScreen → conclui OS e envia WhatsApp ao cliente

[Computador — Financeiro]
  → Abre financeiro.html
  → Vê todas as OS com status de pagamento
  → Marca como pago / parcelado
  → Exporta CSV do mês
```

---

## Próximos passos sugeridos

- [ ] Migrar para banco PostgreSQL (Prisma pronto em `apps/backend/prisma/`)
- [ ] Adicionar autenticação JWT (papel: mecânico / chefe / financeiro / admin)
- [ ] Upload de fotos do check-in (Supabase Storage ou AWS S3)
- [ ] Aprovar template de WhatsApp na Meta Business
- [ ] Deploy: backend no Railway, web no Vercel, mobile via Expo EAS Build
