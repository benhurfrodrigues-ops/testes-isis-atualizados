const express = require("express")

const app = express()

app.use(express.json())

// ============================================================
// Dados em memória
// ============================================================

let entregas = []
let pedidos = []
let proximoIdPedido = 1

// Estado inicial. Também é usado pelos testes (beforeEach) para
// garantir que cada cenário rode em um "ambiente limpo".
function resetarDados() {
    entregas = [
        {
            id: 1,
            motorista: "Carlos",
            status: "PENDENTE"
        }
    ]

    pedidos = [
        {
            id: 1,
            cliente: "TechCorp",
            peso: 15.5,
            destino: "São Paulo",
            status: "PENDENTE"
        },
        {
            id: 2,
            cliente: "LogiTech Corp",
            peso: 8,
            destino: "Curitiba - PR",
            status: "PENDENTE"
        }
    ]

    proximoIdPedido = 3
}

resetarDados()

// ============================================================
// ENTREGAS  /api/v1/entregas
// ============================================================

app.get("/api/v1/entregas", (request, response) => {
    response.json(entregas)
})

app.get("/api/v1/entregas/:id", (request, response) => {
    const id = Number(request.params.id)

    const entrega = entregas.find((entrega) => entrega.id === id)

    if (!entrega) {
        return response.status(404).json({
            erro: "Entrega não encontrada"
        })
    }

    response.json(entrega)
})

app.patch("/api/v1/entregas/:id/status", (request, response) => {
    const id = Number(request.params.id)
    const { statusCodigo, observacao } = request.body || {}

    const entrega = entregas.find((entrega) => entrega.id === id)

    if (!entrega) {
        return response.status(404).json({
            erro: "Entrega não encontrada"
        })
    }

    if (!statusCodigo) {
        return response.status(400).json({
            erro: "statusCodigo é obrigatório"
        })
    }

    entrega.status = statusCodigo
    entrega.observacao = observacao

    response.json(entrega)
})

// ============================================================
// PEDIDOS  /api/v1/pedidos
// ============================================================

app.get("/api/v1/pedidos", (request, response) => {
    response.json(pedidos)
})

app.get("/api/v1/pedidos/:id", (request, response) => {
    const id = Number(request.params.id)

    const pedido = pedidos.find((pedido) => pedido.id === id)

    if (!pedido) {
        return response.status(404).json({
            erro: "Pedido não encontrado"
        })
    }

    response.json(pedido)
})

app.post("/api/v1/pedidos", (request, response) => {
    const { cliente, peso, destino } = request.body || {}

    // Corpo vazio / campos obrigatórios ausentes
    if (!cliente || peso === undefined || !destino) {
        return response.status(400).json({
            erro: "cliente, peso e destino são obrigatórios"
        })
    }

    // Regra de negócio: peso precisa ser um número maior que zero
    if (typeof peso !== "number" || Number.isNaN(peso) || peso <= 0) {
        return response.status(400).json({
            erro: "peso deve ser um número maior que zero"
        })
    }

    const novoPedido = {
        id: proximoIdPedido++,
        cliente,
        peso,
        destino,
        status: "PENDENTE"
    }

    pedidos.push(novoPedido)

    response.status(201).json(novoPedido)
})

app.put("/api/v1/pedidos/:id", (request, response) => {
    const id = Number(request.params.id)
    const { status } = request.body || {}

    const pedido = pedidos.find((pedido) => pedido.id === id)

    if (!pedido) {
        return response.status(404).json({
            erro: "Pedido não encontrado"
        })
    }

    if (!status) {
        return response.status(400).json({
            erro: "status é obrigatório"
        })
    }

    pedido.status = status

    response.json(pedido)
})

app.delete("/api/v1/pedidos/:id", (request, response) => {
    const id = Number(request.params.id)

    const indice = pedidos.findIndex((pedido) => pedido.id === id)

    if (indice === -1) {
        return response.status(404).json({
            erro: "Pedido não encontrado"
        })
    }

    pedidos.splice(indice, 1)

    response.status(204).send()
})

// ============================================================

// Só sobe o servidor quando executado direto (node server.js).
// Nos testes, o Supertest usa o app sem abrir a porta 3000.
if (require.main === module) {
    app.listen(3000, () => {
        console.log("API rodando em http://localhost:3000")
    })
}

module.exports = app
module.exports.resetarDados = resetarDados
