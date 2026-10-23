const request = require('supertest')
const app = require('../server') // Importa a aplicação Express da LogiTech

describe('Suíte de Testes da API - LogiTech Express', () => {

    // ============================================
    // CICLO DE VIDA: garante testes independentes
    // ============================================
    // Princípio da Automação: um teste nunca deve depender do resultado
    // de outro. Antes de CADA teste, a API volta ao estado inicial
    // (ex.: o DELETE do pedido 1 não pode quebrar o GET do pedido 1).
    beforeEach(() => {
        app.resetarDados()
    })

    // ============================================
    // ROTA: GET /api/v1/pedidos (Listagem)
    // ============================================
    describe('GET /api/v1/pedidos', () => {

        it('Deve retornar status 200 e uma lista (Array) de pedidos', async () => {
            const response = await request(app).get('/api/v1/pedidos')

            expect(response.statusCode).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)
            expect(response.body[0]).toHaveProperty('id')
            expect(response.body[0]).toHaveProperty('status', 'PENDENTE')
        })
    })

    // ============================================
    // ROTA: GET /api/v1/pedidos/:id
    // ============================================
    describe('GET /api/v1/pedidos/:id', () => {

        // [ Checklist ] Caso de Sucesso (200 OK)
        it('Deve retornar status 200 e os dados do pedido quando o ID existir', async () => {
            const idExistente = 1

            const response = await request(app)
                .get(`/api/v1/pedidos/${idExistente}`)
                .expect('Content-Type', /json/)

            // Asserções
            expect(response.statusCode).toBe(200)
            expect(response.body).toHaveProperty('id', idExistente)
            expect(response.body).toHaveProperty('cliente')
            expect(response.body).toHaveProperty('destino')
        })

        // [ Checklist ] Caso de Falha / Rota Inexistente (404 Not Found)
        it('Deve retornar status 404 e mensagem de erro quando o ID não existir', async () => {
            const idInexistente = 9999

            const response = await request(app)
                .get(`/api/v1/pedidos/${idInexistente}`)

            // Asserções
            expect(response.statusCode).toBe(404)
            expect(response.body).toHaveProperty('erro')
            expect(response.body.erro).toMatch(/não encontrado/i)
        })
    })

    // ============================================
    // ROTA: DELETE /api/v1/pedidos/:id
    // ============================================
    describe('DELETE /api/v1/pedidos/:id', () => {

        // [ Checklist ] Caso de Remoção (200 OK ou 204 No Content)
        it('Deve remover um pedido existente e retornar status 200 ou 204', async () => {
            const idParaDeletar = 1

            const response = await request(app)
                .delete(`/api/v1/pedidos/${idParaDeletar}`)

            // Valida aceitação de 200 (OK) ou 204 (No Content)
            expect([200, 204]).toContain(response.statusCode)

            // Verificação adicional: confirma que o pedido realmente sumiu (retorna 404)
            const buscaAposDeletar = await request(app)
                .get(`/api/v1/pedidos/${idParaDeletar}`)

            expect(buscaAposDeletar.statusCode).toBe(404)
        })

        it('Deve retornar status 404 ao tentar remover um pedido inexistente', async () => {
            const response = await request(app).delete('/api/v1/pedidos/9999')

            expect(response.statusCode).toBe(404)
            expect(response.body).toHaveProperty('erro')
        })
    })

    // ============================================
    // ROTA: POST /api/v1/pedidos (Regras de Negócio)
    // ============================================
    describe('POST /api/v1/pedidos - Validações de Negócio', () => {

        // Cenário de criação com sucesso (mutação)
        it('Deve criar um novo pedido com sucesso (201)', async () => {
            const novoPedido = { cliente: 'TechCorp', peso: 15.5, destino: 'São Paulo' }

            const response = await request(app)
                .post('/api/v1/pedidos')
                .send(novoPedido)

            expect(response.statusCode).toBe(201)
            expect(response.body).toHaveProperty('id')
            expect(response.body.cliente).toBe('TechCorp')
            expect(response.body.peso).toBe(15.5)
            expect(response.body.destino).toBe('São Paulo')

            // Efeito colateral: o pedido criado deve poder ser consultado
            const busca = await request(app).get(`/api/v1/pedidos/${response.body.id}`)
            expect(busca.statusCode).toBe(200)
            expect(busca.body).toEqual(response.body)
        })

        // Barreira de segurança: corpo vazio
        it('Deve rejeitar pedido sem dados com status 400', async () => {
            const response = await request(app)
                .post('/api/v1/pedidos')
                .send({}) // Corpo vazio

            expect(response.statusCode).toBe(400)
            expect(response.body).toHaveProperty('erro')
        })

        // [ Checklist ] Validação de Peso Inválido (400 Bad Request)
        it('Deve recusar a criação (400) quando o peso for negativo', async () => {
            const pedidoInvalido = {
                cliente: 'LogiTech Corp',
                peso: -5.0, // Peso inválido
                destino: 'São Paulo - SP'
            }

            const response = await request(app)
                .post('/api/v1/pedidos')
                .send(pedidoInvalido)

            // Asserções
            expect(response.statusCode).toBe(400)
            expect(response.body).toHaveProperty('erro')
            expect(response.body.erro).toMatch(/peso/i)
        })

        it('Deve recusar a criação (400) quando o peso for igual a zero', async () => {
            const response = await request(app)
                .post('/api/v1/pedidos')
                .send({ cliente: 'LogiTech Corp', peso: 0, destino: 'SP' })

            expect(response.statusCode).toBe(400)
            expect(response.body).toHaveProperty('erro')
            expect(response.body.erro).toMatch(/peso/i)
        })
    })

    // ============================================
    // ROTA: PUT /api/v1/pedidos/:id (Mutação de estado)
    // ============================================
    describe('PUT /api/v1/pedidos/:id', () => {

        it('Deve atualizar status para EM_TRANSITO (200)', async () => {
            const response = await request(app)
                .put('/api/v1/pedidos/1')
                .send({ status: 'EM_TRANSITO' })

            expect(response.statusCode).toBe(200)
            expect(response.body).toHaveProperty('id', 1)
            expect(response.body.status).toBe('EM_TRANSITO')
        })

        it('Deve retornar status 404 ao atualizar um pedido inexistente', async () => {
            const response = await request(app)
                .put('/api/v1/pedidos/9999')
                .send({ status: 'EM_TRANSITO' })

            expect(response.statusCode).toBe(404)
            expect(response.body).toHaveProperty('erro')
        })
    })

    // ============================================
    // ROTAS DE ENTREGAS (já cobertas manualmente no Postman)
    // ============================================
    describe('Entregas - /api/v1/entregas', () => {

        it('GET /api/v1/entregas - Deve retornar status 200 e uma lista', async () => {
            const response = await request(app).get('/api/v1/entregas')

            expect(response.statusCode).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        it('GET /api/v1/entregas/:id - Deve retornar 404 quando o ID não existir', async () => {
            const response = await request(app).get('/api/v1/entregas/999')

            expect(response.statusCode).toBe(404)
            expect(response.body.erro).toMatch(/não encontrada/i)
        })

        it('PATCH /api/v1/entregas/:id/status - Deve atualizar o status (200)', async () => {
            const response = await request(app)
                .patch('/api/v1/entregas/1/status')
                .send({ statusCodigo: 'EM_ROTA', observacao: 'Saindo do CD' })

            expect(response.statusCode).toBe(200)
            expect(response.body.status).toBe('EM_ROTA')
            expect(response.body.observacao).toBe('Saindo do CD')
        })

        it('PATCH /api/v1/entregas/:id/status - Deve retornar 400 sem statusCodigo', async () => {
            const response = await request(app)
                .patch('/api/v1/entregas/1/status')
                .send({})

            expect(response.statusCode).toBe(400)
            expect(response.body).toHaveProperty('erro')
        })

        it('PATCH /api/v1/entregas/:id/status - Deve retornar 404 para entrega inexistente', async () => {
            const response = await request(app)
                .patch('/api/v1/entregas/999/status')
                .send({ statusCodigo: 'EM_ROTA' })

            expect(response.statusCode).toBe(404)
        })
    })
})
