# LogiTech Express — API de Pedidos e Entregas + Testes Automatizados

## Descrição do Projeto

API REST da **LogiTech Express** para gerenciamento de **pedidos** e **entregas**,
construída para a disciplina de **Testes de Back-End** (Aula 05). O foco do projeto
é a **suíte de testes de integração automatizados**, que protege a API contra regressões.

### Tecnologias utilizadas

| Tecnologia | Uso |
| --- | --- |
| Node.js | Ambiente de execução |
| Express 5 | Servidor HTTP e rotas |
| Jest | Framework de testes (`describe`, `it`, `expect`, hooks) |
| Supertest | Dispara requisições HTTP contra o Express sem subir porta de rede |

### Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/v1/pedidos` | Lista todos os pedidos |
| GET | `/api/v1/pedidos/:id` | Busca um pedido por ID (404 se não existir) |
| POST | `/api/v1/pedidos` | Cria pedido (400 se faltar dado ou se `peso <= 0`) |
| PUT | `/api/v1/pedidos/:id` | Atualiza o `status` do pedido |
| DELETE | `/api/v1/pedidos/:id` | Remove o pedido (204; 404 se não existir) |
| GET | `/api/v1/entregas` | Lista as entregas |
| GET | `/api/v1/entregas/:id` | Busca uma entrega por ID |
| PATCH | `/api/v1/entregas/:id/status` | Atualiza o status da entrega |

## Instruções de Execução

Pré-requisito: [Node.js](https://nodejs.org/) instalado.

```bash
# 1. Entrar na pasta do projeto
cd logitech-testes

# 2. Instalar as dependências
npm install

# 3. Rodar os testes automatizados
npm test

# (opcional) Subir a API em http://localhost:3000
npm start
```

Resultado esperado de `npm test`: **PASS** em verde, com todos os 16 cenários aprovados.

## Estrutura do Projeto

```
logitech-testes/
├── server.js          # Aplicação Express (exporta o app para os testes)
├── tests/
│   └── app.test.js    # Suíte de testes de integração (Jest + Supertest)
├── package.json
├── README.md          # Este arquivo
└── TESTS.md           # Detalhamento dos cenários de teste
```

## Cobertura de Testes

Os testes são de **integração**: o Supertest dispara a requisição HTTP, que passa
pelo Express e pelas regras de negócio, e as asserções validam status code e corpo
da resposta. Um hook `beforeEach` restaura os dados antes de **cada** teste, então
nenhum cenário depende do resultado de outro.

| Grupo | Cenário | Status esperado |
| --- | --- | --- |
| GET `/pedidos` | Lista é um Array não vazio | 200 |
| GET `/pedidos/:id` | **Caminho feliz** — ID existente com `id`, `cliente`, `destino` | 200 |
| GET `/pedidos/:id` | **Falha** — ID inexistente com `erro` ("não encontrado") | 404 |
| DELETE `/pedidos/:id` | **Remoção** — pedido existente; GET seguinte confirma o 404 | 204 |
| DELETE `/pedidos/:id` | ID inexistente | 404 |
| POST `/pedidos` | **Mutação** — cria pedido e devolve `id` | 201 |
| POST `/pedidos` | Corpo vazio `{}` | 400 |
| POST `/pedidos` | **Regra de negócio** — peso negativo (`-5.0`) | 400 |
| POST `/pedidos` | **Regra de negócio** — peso igual a zero | 400 |
| PUT `/pedidos/:id` | **Mutação** — status vira `EM_TRANSITO` | 200 |
| PUT `/pedidos/:id` | ID inexistente | 404 |
| Entregas | Listagem, busca inexistente, PATCH de status (sucesso, sem `statusCodigo`, ID inexistente) | 200 / 404 / 400 |

Asserções usadas: `.toBe()` (status e valores primitivos), `.toEqual()` (objetos JSON),
`.toHaveProperty()` (campos da resposta), `.toMatch()` (mensagens de erro) e
`.toContain()` (aceitar 200 ou 204).

Mais detalhes em [TESTS.md](./TESTS.md).
