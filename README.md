<<<<<<< HEAD
# MacroVest

Aplicação web demonstrativa de um motor inteligente de gestão e execução simulada de investimentos. O MacroVest cruza um perfil financeiro fictício com indicadores macroeconômicos simulados para apresentar estratégias, demonstrar a distribuição de aportes e permitir acompanhar o processamento de cada simulação.

> **Aviso:** este projeto é exclusivamente um front-end de estudo. Não realiza investimentos, não envia ordens, não se conecta a bancos ou corretoras e não fornece aconselhamento financeiro. Todos os indicadores, valores, perfis e resultados iniciais são fictícios.

## Tecnologias

- **React + TypeScript:** interface componentizada e tipagem estática.
- **Vite:** ambiente de desenvolvimento e build.
- **Tailwind CSS:** configuração de utilitários e base de estilo.
- **shadcn/ui (padrão de componentes):** configuração e convenções para componentes acessíveis e reutilizáveis; os componentes do projeto são mantidos no próprio código.
- **Radix UI:** primitivas acessíveis para diálogos.
- **Lucide React:** ícones.
- **Recharts:** gráficos de patrimônio, aportes, indicadores e alocação.
- **React Router DOM:** navegação entre páginas.
- **React Hook Form + Zod:** formulário e validação do perfil financeiro.
- **TanStack Query:** camada de consulta simulada.
- **date-fns:** formatação de datas.
- **Sonner:** notificações toast.
- **clsx + tailwind-merge:** composição de classes.

## Requisitos

- Node.js 20.19+ ou 22.12+.
- npm 10 ou compatível.

## Instalação e execução

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente `http://localhost:5173`.

## Build de produção

```bash
npm run typecheck
npm run build
npm run preview
```

## Funcionalidades implementadas

| Área | Recursos |
|---|---|
| Dashboard | Patrimônio simulado, aportes, disponibilidade, rentabilidade, evolução, alocação, fontes macro e últimas execuções. |
| Perfil financeiro | Formulário em quatro etapas, objetivos múltiplos, três perfis de risco, revisão, validação e edição. |
| Análise macroeconômica | Selic, IPCA e Ibovespa simulados, variação, mini-históricos, panorama explicativo e saúde das fontes. |
| Estratégias | Estratégia sugerida pelo perfil, justificativas, alocação percentual e comparação conservadora, moderada e arrojada. |
| Simulação de aportes | Valor, prévia da distribuição, cenários de falha, etapas de processamento, estados de sucesso/ressalva/falha e comprovante. |
| Histórico | Pesquisa, filtros por status e período, ordenação, paginação, detalhes e exportação CSV. |
| Relatórios | Evolução de aportes, distribuição, indicadores, resumo de execuções e impressão/PDF pelo navegador. |
| Configurações | Tema escuro/claro, acessibilidade, preferências de notificação e restauração dos dados iniciais. |
| Complementos | Onboarding, central de notificações, busca rápida com `Ctrl + K`, estados vazios e feedback toast. |

## Temas e preferências

O tema escuro é o padrão. O usuário pode alternar para o tema claro pelo cabeçalho ou pelas configurações. A escolha é persistida em `localStorage`. Opções de alto contraste, texto ampliado, redução de movimento e preferências de notificação também ficam disponíveis em Configurações e são persistidas localmente.

## Dados mockados e persistência

Os dados de demonstração iniciais estão em `src/data.ts`. A camada `src/services/mock/` simula latência, consultas, gravação de perfil e processamento de aportes. O armazenamento local está isolado em `src/services/storage.ts` e mantém perfil, identificador da proposta, execuções, notificações, onboarding e tema no navegador. As telas chamam a fachada `src/services/index.ts`, sem importar diretamente os repositórios mockados.

A opção **Restaurar dados iniciais** retorna perfil, histórico e notificações aos valores iniciais. A preferência de tema é preservada.

### Cenários de falha

Na tela **Execuções**, o seletor de cenário permite demonstrar:

- Falha na consulta da Selic.
- Timeout na consulta do IPCA.
- Instabilidade de uma fonte externa, concluindo com ressalva quando possível.
- Erro durante o processamento.

Uma falha é registrada como falha e não é apresentada como execução bem-sucedida.

## Estrutura de diretórios

```text
src/
├── components/
│   ├── charts/       # Gráficos Recharts
│   ├── layout/       # Sidebar, cabeçalho, busca e notificações
│   └── ui/           # Botões, cartões, status e diálogos
├── contexts/         # Estado global e preferências
├── pages/            # Páginas e fluxos da aplicação
├── schemas/          # Schemas Zod
├── config/           # Configurações de ambiente (modo e URL da API)
├── services/
│   ├── api/          # Cliente HTTP, contratos e repositórios REST
│   ├── mock/         # Implementações simuladas dos repositórios
│   ├── index.ts      # Fachada que seleciona mock ou HTTP
│   └── storage.ts    # Persistência local
├── types/            # Contratos TypeScript
├── utils/            # Formatação e composição de classes
├── App.tsx
├── data.ts           # Dados iniciais demonstrativos
├── index.css
└── main.tsx
```

## Pontos de conexão com o back-end

A versão completa já possui uma camada de integração. As páginas não fazem chamadas `fetch` diretamente: elas usam funções da fachada `src/services/index.ts`, que seleciona os repositórios demonstrativos ou os repositórios HTTP conforme a variável de ambiente.

### 1. Escolher entre modo demonstrativo e modo API

Na raiz do projeto, copie `.env.example` para `.env` e configure:

```env
# Mantém o comportamento atual, sem servidor
VITE_API_MODE=mock

# Para usar o back-end, altere para http
# VITE_API_MODE=http

# URL base fornecida pelo projeto de back-end
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT_MS=15000
```

Depois de alterar o `.env`, reinicie o Vite. O modo padrão é `mock`. Para mudar para HTTP, use `VITE_API_MODE=http` e informe a URL real em `VITE_API_BASE_URL`. O endereço acima é apenas um exemplo: substitua-o pelo endereço e pelo prefixo de rota usados pelo servidor.

A tela **Configurações** mostra o modo selecionado, a URL base e as rotas previstas. A indicação de modo API significa que o front-end está configurado para tentar usar o servidor, não que uma conexão real já foi validada.

### 2. Arquivos criados para a integração

| Arquivo | Responsabilidade |
|---|---|
| `src/config/environment.ts` | Lê modo, URL base e timeout das variáveis Vite. |
| `src/services/api/apiClient.ts` | Centraliza `fetch`, JSON, timeout e erros HTTP/rede. |
| `src/services/api/contracts.ts` | Define os contratos dos repositórios e os DTOs enviados/recebidos. |
| `src/services/api/httpRepositories.ts` | Implementa as chamadas REST de propostas e execuções. |
| `src/services/mock/mockRepositories.ts` | Mantém a implementação local usada na demonstração. |
| `src/services/index.ts` | Fachada única consumida pelas páginas e seletor de implementação. |
| `src/types/index.ts` | Tipos de domínio compartilhados pela aplicação. |

### 3. Rotas preparadas

| Método | Rota | Implementação no front-end |
|---|---|---|
| `POST` | `/propostas` | Envia o perfil financeiro e espera o identificador da proposta. |
| `GET` | `/propostas/{id}` | Busca uma proposta pelo identificador. O método já está disponível no repositório. |
| `POST` | `/propostas/{id}/execucoes` | Envia os dados do aporte e espera o resultado da execução. |
| `GET` | `/execucoes/{id}` | Busca os detalhes de uma execução. O método já está disponível no repositório. |

O identificador retornado por `POST /propostas` e o modo em que ele foi criado são persistidos localmente e reutilizados na rota de execução. Isso evita reutilizar acidentalmente um ID do modo mock depois de mudar para o modo HTTP. Se ainda não houver identificador salvo, o fluxo de aporte cria a proposta antes de solicitar a execução.

### 4. Formatos de comunicação previstos

Os formatos abaixo são o contrato inicial adotado pelo front-end. A equipe responsável pelo back-end deve confirmar ou ajustar os nomes dos campos antes da integração definitiva. Se a API utilizar outros nomes, a adaptação deve ser feita nos métodos de `httpRepositories.ts`, sem espalhar conversões pelas páginas.

**POST `/propostas`**

Corpo enviado: objeto `FinancialProfile`, com os campos `name`, `monthlyIncome`, `monthlyExpenses`, `availableIncome`, `monthlyInvestment`, `goals`, `customGoal`, `risk` e `updatedAt`.

Resposta esperada:

```json
{
  "id": "PROP-001",
  "profile": {
    "name": "Mariana Costa",
    "monthlyIncome": 12500,
    "monthlyExpenses": 7200,
    "availableIncome": 5300,
    "monthlyInvestment": 2500,
    "goals": ["Construção de patrimônio", "Reserva de emergência"],
    "customGoal": "",
    "risk": "Moderado",
    "updatedAt": "2026-11-22T12:00:00.000Z"
  }
}
```

**POST `/propostas/{id}/execucoes`**

Corpo enviado:

```json
{
  "amount": 2500,
  "strategyId": "moderada",
  "strategyName": "Equilíbrio Dinâmico",
  "riskProfile": "Moderado",
  "allocation": [
    { "label": "Pós-fixado", "percentage": 35 },
    { "label": "Inflação", "percentage": 25 },
    { "label": "Pré-fixado", "percentage": 15 },
    { "label": "Renda variável", "percentage": 25 }
  ]
}
```

A resposta deve seguir o tipo `ExecutionRecord`, incluindo `id`, `date`, `amount`, `strategy`, `risk`, `status`, `durationMs`, `allocation`, `macroSnapshot`, `rationale` e `issues`. Os status aceitos atualmente são `Concluído`, `Concluído com ressalvas` e `Falha`.

**GET `/propostas/{id}`** deve retornar o objeto de proposta `{ "id": "...", "profile": { ... } }`.

**GET `/execucoes/{id}`** deve retornar um `ExecutionRecord` no mesmo formato da resposta de criação.

As respostas podem ser JSON direto ou vir embrulhadas em `{ "data": ... }`. O cliente reconhece os dois formatos.

### 5. Comportamento no modo HTTP

- O cadastro do perfil envia os dados para `POST /propostas`. Na tela de perfil, o botão **Atualizar do servidor** consulta `GET /propostas/{id}` quando existe uma proposta vinculada ao modo HTTP.
- O identificador retornado é guardado no estado persistido da aplicação.
- A simulação de aporte envia a solicitação para `POST /propostas/{id}/execucoes`.
- O comprovante é montado com a resposta validada do servidor. Ao abrir um registro no histórico, `GET /execucoes/{id}` atualiza os detalhes exibidos.
- Timeout, erro HTTP, falha de rede ou resposta fora do contrato são exibidos como erro de comunicação. O front-end não cria um comprovante de sucesso quando não recebeu um resultado válido.
- Os cenários artificiais de falha ficam disponíveis somente no modo demonstrativo.

### 6. O que continua simulado

O escopo inicial definiu contratos para propostas e execuções, mas não definiu uma rota de listagem de execuções nem rotas para indicadores macroeconômicos, séries históricas, carteira ou relatórios. Por isso, a tabela do histórico continua sendo composta pelo cache local; os detalhes de cada item podem ser atualizados por `GET /execucoes/{id}`. Os indicadores, a carteira e os relatórios continuam utilizando dados fictícios locais, mesmo quando `VITE_API_MODE=http`. Quando o back-end disponibilizar esses recursos, podem ser adicionados novos repositórios à camada `services/api/` e suas implementações mockadas correspondentes.

### 7. Próximos passos para a integração definitiva

1. Confirmar com o back-end os nomes, formatos e validações dos campos dos DTOs acima.
2. Definir política de autenticação e renovação de token, caso exista.
3. Configurar CORS no servidor para aceitar a origem do front-end.
4. Atualizar a URL em `.env` e selecionar `VITE_API_MODE=http`.
5. Testar sucesso, validação, `404`, `4xx`, `5xx`, timeout e indisponibilidade do servidor.
6. Acrescentar endpoints e repositórios para macroeconomia e relatórios quando os contratos estiverem disponíveis.

**Importante:** esta preparação não cria nem substitui o back-end. O servidor precisa implementar as rotas e respeitar os contratos acordados. Não há autenticação, banco de dados, corretora ou movimentação financeira real nesta versão.

## Observações

- O perfil, o identificador da proposta, o modo em que a proposta foi criada e o histórico em cache são persistidos no `localStorage` do navegador atual. Em modo HTTP, os detalhes de uma execução são atualizados por `GET /execucoes/{id}` quando o usuário abre o registro.
- A exportação CSV é feita localmente pelo navegador.
- A opção de impressão/PDF utiliza a função de impressão do navegador. Selecione **Salvar como PDF** na janela de impressão.
- A demonstração não deve ser usada para decisões ou operações financeiras reais.
=======
# MacroVest
>>>>>>> 3d84ae9e10622933be4b0d10ab47f37849340914
