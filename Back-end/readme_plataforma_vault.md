# Vault — Simulador de Sobrevivência Financeira

O **Vault** é uma plataforma distribuída de simulação de cenários econômicos que calcula por quanto tempo (em meses e dias) uma pessoa conseguiria manter o seu padrão de vida caso perdesse sua fonte de renda fixa.

Diferente de uma calculadora de saldo convencional, o motor do Vault cruza reservas, dívidas ativas, despesas fixas e variáveis com projeções de inflação composta e acontecimentos inesperados (emergências médicas, manutenções, reajustes), permitindo avaliar diferentes estratégias de corte de gastos (**Políticas de Consumo**).

---

## Arquitetura do Sistema

O projeto foi construído em **Java 21**, **Spring Boot 3.4** e **Maven** (estrutura multi-módulo), dividido em três microsserviços independentes que se comunicam via REST/JSON:

1. **`vault-api` (Porta `8080` — Gateway & Orquestrador):**
   - Porta de entrada pública da aplicação.
   - Gerencia o cadastro e a persistência de perfis e simulações no **MySQL**.
   - Garante **idempotência** nas simulações através do cabeçalho `Idempotency-Key`.
   - Orquestra chamadas assíncronas e paralelas (`CompletableFuture`) ao `vault-dados`, protegidas por **Timeout**, **Retry**, **Circuit Breaker** e **Fallback** (**Resilience4j**).
2. **`vault-dados` (Porta `8081` — Fornecedor de Cenários e Fixtures):**
   - Fornece projeções de inflação (`IPCA`) e listas de eventos inesperados a partir de arquivos estáticos (`fixtures/*.json`).
   - Possui um **Simulador de Instabilidade (Caos)** configurável para testar latência (*delay*) e indisponibilidade (HTTP `503`) sem precisar derrubar o serviço.
3. **`vault-simulador` (Porta `8082` — Motor Matemático e Domínio):**
   - Serviço *stateless* (sem banco de dados) responsável pelo cálculo iterativo mês a mês até o esgotamento da reserva.
   - Implementa polimorfismo através da interface `PoliticaConsumo` com três estratégias:
     - **`PADRAO`**: Mantém 100% das despesas fixas, variáveis e dívidas.
     - **`ECONOMICA`**: Mantém despesas fixas e dívidas, reduzindo 50% das despesas variáveis.
     - **`EMERGENCIA`**: Reduz 15% das despesas fixas, corta 85% das despesas variáveis e mantém as dívidas ativas.

---

## Pré-requisitos

- **Java JDK 21** (ou superior)
- **Maven 3.9+**
- **MySQL 8.0+** rodando localmente na porta `3306`

---

## Como Executar o Projeto

### 1. Configurar o Banco de Dados (MySQL)
Certifique-se de que o servidor MySQL está ativo. O banco `vault_db` será criado automaticamente na inicialização do `vault-api`. Caso o seu usuário `root` local possua senha, defina as variáveis de ambiente ou ajuste o arquivo `vault-api/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/vault_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:}
```

### 2. Compilar o Projeto Multi-Módulo
Na pasta raiz (`vault/`), execute:

```bash
mvn clean install
```

### 3. Iniciar os Três Microsserviços
Abra três terminais distintos (ou utilize a aba *Services* do IntelliJ IDEA) e inicie cada módulo:

```bash
# Terminal 1 - Fornecedor de Dados (Porta 8081)
mvn -pl vault-dados spring-boot:run

# Terminal 2 - Motor Matemático (Porta 8082)
mvn -pl vault-simulador spring-boot:run

# Terminal 3 - Gateway e Orquestrador (Porta 8080)
mvn -pl vault-api spring-boot:run
```

### 4. Verificar Saúde dos Serviços (`Health Check`)
Confirme se todos os serviços estão ativos:
- `GET http://localhost:8080/health` (`vault-api`)
- `GET http://localhost:8081/health` (`vault-dados`)
- `GET http://localhost:8082/health` (`vault-simulador`)

---

## Documentação de Endpoints e Payloads de Teste

### Endpoints Públicos (`vault-api` — `http://localhost:8080`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/perfis` | Cadastra um novo perfil financeiro com reservas, despesas e dívidas. |
| `GET` | `/perfis/{id}` | Consulta os dados cadastrais e financeiros de um perfil pelo ID. |
| `POST` | `/perfis/{id}/simulacoes` | Executa uma nova simulação de sobrevivência (exige header `Idempotency-Key`). |
| `GET` | `/simulacoes/{id}` | Retorna o relatório completo da simulação, evolução mês a mês e tempo de execução. |

---

#### 1. Criar Perfil Financeiro
* **Método:** `POST`
* **URL:** `http://localhost:8080/perfis`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
```json
{
  "nome": "Mariana Costa",
  "rendaMensal": 7500.00,
  "reservaTotal": 28000.00,
  "despesasFixas": 3200.00,
  "despesasVariaveis": 1600.00,
  "dividas": [
    {
      "descricao": "Financiamento Veículo",
      "valorParcela": 850.00,
      "parcelasRestantes": 6
    },
    {
      "descricao": "Empréstimo Consignado",
      "valorParcela": 400.00,
      "parcelasRestantes": 3
    }
  ]
}
```

---

#### 2. Consultar Perfil Cadastrado
* **Método:** `GET`
* **URL:** `http://localhost:8080/perfis/1`

---

#### 3. Executar Simulação de Sobrevivência
* **Método:** `POST`
* **URL:** `http://localhost:8080/perfis/1/simulacoes`
* **Headers:**
  - `Content-Type: application/json`
  - `Idempotency-Key: sim-mariana-001` *(Obrigatório — envie um valor único por simulação)*
* **Body (JSON) — Cenário Econômico com Imprevistos:**
```json
{
  "tipoPolitica": "ECONOMICA",
  "incluirEventosInesperados": true
}
```
* **Body (JSON) — Cenário de Emergência sem Imprevistos:**
```json
{
  "tipoPolitica": "EMERGENCIA",
  "incluirEventosInesperados": false
}
```

> **Teste de Idempotência:** Reenvie a mesma requisição `POST` mantendo o cabeçalho `Idempotency-Key: sim-mariana-001`. O sistema retornará status `200 OK` com o cabeçalho `X-Idempotency-Hit: true` e o mesmo `simulacaoId`, sem duplicar o cálculo.

---

#### 4. Consultar Relatório da Simulação
* **Método:** `GET`
* **URL:** `http://localhost:8080/simulacoes/1`

---

### Endpoints Internos (Comunicação entre Microsserviços)

Estes endpoints são consumidos internamente pelo `vault-api`, mas também podem ser acionados diretamente para depuração e testes de caos:

| Serviço | Método | Rota | Descrição |
| :--- | :--- | :--- | :--- |
| `vault-dados` (`8081`) | `GET` | `/inflacao` | Retorna a projeção de inflação (`inflacao.json`). Aceita `?delayMs=3000` ou `?falhar=true`. |
| `vault-dados` (`8081`) | `GET` | `/eventos` | Retorna os eventos inesperados (`eventos.json`). Aceita `?delayMs=3000` ou `?falhar=true`. |
| `vault-simulador` (`8082`) | `POST` | `/calcular` | Recebe perfil, política, inflação e eventos e devolve a projeção mês a mês. |

#### Exemplo de Payload Direto para o Motor (`POST http://localhost:8082/calcular`)
```json
{
  "perfil": {
    "id": 1,
    "nome": "Teste Direto Motor",
    "rendaMensal": 5000.00,
    "reservaTotal": 15000.00,
    "despesasFixas": 2200.00,
    "despesasVariaveis": 1000.00,
    "dividas": [
      {
        "descricao": "Cartão Parcelado",
        "valorParcela": 300.00,
        "parcelasRestantes": 4
      }
    ]
  },
  "tipoPolitica": "PADRAO",
  "inflacao": {
    "fonte": "IPCA_TESTE",
    "taxaMensalMedia": 0.0045,
    "projecaoMensal": [0.0042, 0.0046, 0.0051],
    "fallbackAplicado": false
  },
  "eventos": [
    {
      "mesOcorrencia": 2,
      "descricao": "Conserto urgente",
      "impactoFinanceiro": 1200.00
    }
  ]
}
```

---

## Testando a Resiliência (Queda do `vault-dados`)

Para validar o comportamento de **Retry**, **Circuit Breaker** e **Fallback**:

1. Pare o serviço `vault-dados` (porta `8081`) mantendo o `vault-api` e o `vault-simulador` ativos.
2. Execute uma nova simulação em `POST http://localhost:8080/perfis/1/simulacoes` com uma nova chave (ex: `Idempotency-Key: teste-queda-01`).
3. O `vault-api` tentará reconectar automaticamente, abrirá o disjuntor e concluirá a simulação utilizando a taxa de inflação padrão (`0.0040`), sinalizando `"houveTimeoutDados": true` no JSON de resposta.