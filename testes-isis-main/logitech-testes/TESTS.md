# Testes da API LogiTech Express

## 1. Testes Automatizados (Jest + Supertest)

**Arquivo:** `tests/app.test.js` — **Comando:** `npm test`

**Resultado:** 16 testes, 16 PASS, 0 FAIL.

### Estratégia de cobertura

* **Caminho feliz:** consulta, criação, atualização e remoção com dados válidos.
* **Falhas esperadas (404):** consulta, remoção e atualização de IDs inexistentes.
* **Barreiras de validação (400):** corpo vazio e peso negativo ou zero no `POST`.
* **Mutações:** `POST`, `PUT` e `DELETE` validam o corpo retornado e o efeito colateral
  (um `GET` posterior confirma que o dado mudou ou sumiu), não apenas o status code.
* **Independência:** o hook `beforeEach` chama `app.resetarDados()` antes de cada teste,
  garantindo testes determinísticos, que passam em qualquer ordem.

### Pedidos — `/api/v1/pedidos`

| # | Método e rota | Cenário | Esperado |
| --- | --- | --- | --- |
| 1 | GET `/pedidos` | Lista de pedidos | 200, Array não vazio, itens com `id` e `status` |
| 2 | GET `/pedidos/1` | ID existente (caminho feliz) | 200, JSON, `id = 1`, `cliente`, `destino` |
| 3 | GET `/pedidos/9999` | ID inexistente | 404, `erro` ~ "não encontrado" |
| 4 | DELETE `/pedidos/1` | Remoção de pedido existente | 204 (ou 200); GET seguinte retorna 404 |
| 5 | DELETE `/pedidos/9999` | Remoção de ID inexistente | 404, `erro` |
| 6 | POST `/pedidos` | Pedido válido | 201, `id` gerado, dados iguais aos enviados; GET confirma |
| 7 | POST `/pedidos` | Corpo vazio `{}` | 400, `erro` |
| 8 | POST `/pedidos` | `peso: -5.0` | 400, `erro` ~ "peso" |
| 9 | POST `/pedidos` | `peso: 0` | 400, `erro` ~ "peso" |
| 10 | PUT `/pedidos/1` | Status para `EM_TRANSITO` | 200, `status = EM_TRANSITO` |
| 11 | PUT `/pedidos/9999` | Atualização de ID inexistente | 404, `erro` |

### Entregas — `/api/v1/entregas`

| # | Método e rota | Cenário | Esperado |
| --- | --- | --- | --- |
| 12 | GET `/entregas` | Lista de entregas | 200, Array |
| 13 | GET `/entregas/999` | ID inexistente | 404, `erro` ~ "não encontrada" |
| 14 | PATCH `/entregas/1/status` | `statusCodigo` e `observacao` válidos | 200, status e observação atualizados |
| 15 | PATCH `/entregas/1/status` | Sem `statusCodigo` | 400, `erro` |
| 16 | PATCH `/entregas/999/status` | Entrega inexistente | 404 |

---

## 2. Testes Manuais (Postman) — histórico da aula anterior

### Ambiente

* API: http://localhost:3000
* Ferramenta: Postman
* Método de teste: testes manuais

### Testes realizados

#### Teste 1 — Listar entregas

**Método:** GET

**Endpoint:**
`/api/v1/entregas`

**Resultado esperado:** 200 OK

**Resultado obtido:** 200 OK

**Status:** PASSED

---

#### Teste 2 — Buscar entrega por ID

**Método:** GET

**Endpoint:**
`/api/v1/entregas/1`

**Resultado esperado:** 200 OK

**Resultado obtido:** 200 OK

**Status:** PASSED

---

#### Teste 3 — Buscar entrega inexistente

**Método:** GET

**Endpoint:**
`/api/v1/entregas/999`

**Resultado esperado:** 404 Not Found

**Resultado obtido:** 404 Not Found

**Status:** PASSED

---

#### Teste 4 — Atualizar status da entrega

**Método:** PATCH

**Endpoint:**
`/api/v1/entregas/1/status`

**Body:**

```json
{
    "statusCodigo": "EM_ROTA",
    "observacao": "Saindo do CD"
}
```

**Resultado esperado:** 200 OK

**Resultado obtido:** 200 OK

**Status:** PASSED

---

#### Teste 5 — Status não informado

**Método:** PATCH

**Endpoint:**
`/api/v1/entregas/1/status`

**Resultado esperado:** 400 Bad Request

**Resultado obtido:** 400 Bad Request

**Status:** PASSED

---

#### Teste 6 — Atualizar entrega inexistente

**Método:** PATCH

**Endpoint:**
`/api/v1/entregas/999/status`

**Resultado esperado:** 404 Not Found

**Resultado obtido:** 404 Not Found

**Status:** PASSED

### Resumo

Total de testes: 6

PASSED: 6

FAILED: 0
