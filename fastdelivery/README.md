# FastDelivery — Projeto Acadêmico Completo

Projeto de faculdade com frontend HTML/CSS/JavaScript + backend Java Spring Boot + banco H2.

## Objetivo

Implementar de forma simples o fluxo:

Cadastro → Login → Busca de restaurante → Seleção de produtos → Pagamento → Aprovação simulada → Acompanhamento → Avaliação.

A solução foi mantida propositalmente simples para fins acadêmicos. Não usa gateway de pagamento real, JWT, microserviços ou serviços externos.

## Tecnologias

- Java 17+
- Spring Boot 3.5.6
- Spring Web
- Spring Data JPA
- H2 Database
- Maven
- HTML, CSS e JavaScript

## Como executar

### Opção 1 — IDE

Abra o projeto como projeto Maven e execute:

`br.com.fastdelivery.FastDeliveryApplication`

### Opção 2 — Maven

Na pasta do projeto:

```text
mvn spring-boot:run
```

Depois acesse:

http://localhost:8080/

O banco H2 será criado automaticamente em `./data/fastdelivery`.

Console H2:

http://localhost:8080/h2-console

JDBC URL:

`jdbc:h2:file:./data/fastdelivery`

Usuário: `sa`

Senha: em branco.

## Usuário para demonstração

E-mail: `demo@fastdelivery.com`

Senha: `123456`

Também é possível criar novos usuários pela tela de cadastro.

## Simulação do pagamento e aprovação

O sistema aceita:

- CARTAO — pagamento simulado como aprovado.
- PIX — pagamento simulado como aprovado.
- DINHEIRO — registrado como pagamento na entrega.

Ao confirmar um pedido, o backend cria o pedido como `RECEBIDO` e a aplicação chama `/api/pedidos/{id}/aprovar` para representar a aprovação simulada.

Na tela de acompanhamento existe o botão de simulação da próxima etapa:

`RECEBIDO → EM_PREPARACAO → SAIU_PARA_ENTREGA → ENTREGUE`

Quando o pedido estiver `ENTREGUE`, a tela libera a avaliação.

## Principais endpoints

```text
POST /api/clientes
POST /api/auth/login
GET  /api/restaurantes
GET  /api/restaurantes/{id}/produtos
POST /api/pedidos
GET  /api/pedidos/{id}
POST /api/pedidos/{id}/aprovar
POST /api/pedidos/{id}/avancar
POST /api/pedidos/{id}/avaliacao
```

## Observação acadêmica

As credenciais e o processamento de pagamento são apenas para simulação. Em um sistema real seria necessário aplicar autenticação segura, autorização, criptografia/armazenamento adequado de senhas, integração com gateway de pagamento e outras medidas de segurança.
