package br.com.fastdelivery.service;

import br.com.fastdelivery.dto.AvaliacaoRequest;
import br.com.fastdelivery.dto.PedidoRequest;
import br.com.fastdelivery.model.*;
import br.com.fastdelivery.repository.*;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final ClienteRepository clienteRepo;
    private final RestauranteRepository restauranteRepo;
    private final ProdutoRepository produtoRepo;
    private final AvaliacaoRepository avaliacaoRepo;


    public PedidoService(
            PedidoRepository pedidoRepo,
            ClienteRepository clienteRepo,
            RestauranteRepository restauranteRepo,
            ProdutoRepository produtoRepo,
            AvaliacaoRepository avaliacaoRepo) {

        this.pedidoRepo = pedidoRepo;
        this.clienteRepo = clienteRepo;
        this.restauranteRepo = restauranteRepo;
        this.produtoRepo = produtoRepo;
        this.avaliacaoRepo = avaliacaoRepo;
    }


    @Transactional
    public Pedido criar(PedidoRequest req) {

        Cliente cliente =
            clienteRepo.findById(req.clienteId())
                .orElseThrow(
                    () -> new IllegalArgumentException(
                        "Cliente não encontrado."
                    )
                );


        Restaurante restaurante =
            restauranteRepo.findById(req.restauranteId())
                .orElseThrow(
                    () -> new IllegalArgumentException(
                        "Restaurante não encontrado."
                    )
                );


        /*
         * Cria o pedido.
         */
        Pedido p = new Pedido();


        /*
         * Dados principais.
         */
        p.setCliente(cliente);

        p.setRestaurante(restaurante);

        p.setEndereco(req.endereco());

        p.setFormaPagamento(
            req.formaPagamento().toUpperCase()
        );

        p.setTrocoPara(
            req.trocoPara()
        );


        /*
         * Status inicial.
         */
        p.setStatus("RECEBIDO");

        p.setStatusPagamento(
            "AGUARDANDO_APROVACAO"
        );


        /*
         * Data de criação.
         */
        p.setCriadoEm(
            LocalDateTime.now()
        );


        /*
         * Calcula o total dos produtos.
         */
        double total = 0;


        /*
         * Adiciona os itens do pedido.
         */
        for (PedidoRequest.ItemRequest itemReq : req.itens()) {

            Produto produto =
                produtoRepo.findById(
                    itemReq.produtoId()
                ).orElseThrow(
                    () -> new IllegalArgumentException(
                        "Produto não encontrado: "
                        + itemReq.produtoId()
                    )
                );


            /*
             * Verifica se o produto pertence
             * ao restaurante selecionado.
             */
            if (
                !produto.getRestaurante()
                    .getId()
                    .equals(restaurante.getId())
            ) {

                throw new IllegalArgumentException(
                    "Produto pertence a outro restaurante."
                );
            }


            /*
             * Verifica a quantidade.
             */
            if (
                itemReq.quantidade() <= 0
            ) {

                throw new IllegalArgumentException(
                    "Quantidade inválida."
                );
            }


            /*
             * Cria o item.
             */
            PedidoItem item =
                new PedidoItem();


            item.setPedido(p);

            item.setProduto(produto);

            item.setQuantidade(
                itemReq.quantidade()
            );

            item.setPrecoUnitario(
                produto.getPreco()
            );


            /*
             * Adiciona o item ao pedido.
             */
            p.getItens().add(item);


            /*
             * Calcula o subtotal.
             */
            total +=
                produto.getPreco()
                * itemReq.quantidade();
        }


        /*
         * Define o valor total.
         */
        p.setValorTotal(total);


        /*
         * NÃO precisamos mais fazer:
         *
         * p = pedidoRepo.save(p);
         * p.setCodigo(...);
         * pedidoRepo.save(p);
         *
         * O @PrePersist da entidade Pedido
         * irá gerar o código automaticamente.
         */
        return pedidoRepo.save(p);
    }


    @Transactional
    public Pedido aprovar(Long id) {

        Pedido p = buscar(id);


        if (
            "ENTREGUE".equals(
                p.getStatus()
            )
        ) {

            return p;
        }


        p.setStatus(
            "EM_PREPARACAO"
        );


        if (
            "PIX".equals(
                p.getFormaPagamento()
            )
            ||
            "CARTAO".equals(
                p.getFormaPagamento()
            )
        ) {

            p.setStatusPagamento(
                "APROVADO"
            );

        } else {

            p.setStatusPagamento(
                "PAGAMENTO_NA_ENTREGA"
            );
        }


        p.setAprovadoEm(
            LocalDateTime.now()
        );


        return p;
    }


    @Transactional
    public Pedido avancar(Long id) {

        Pedido p = buscar(id);


        switch (p.getStatus()) {

            case "RECEBIDO":

                p.setStatus(
                    "EM_PREPARACAO"
                );

                break;


            case "EM_PREPARACAO":

                p.setStatus(
                    "SAIU_PARA_ENTREGA"
                );

                break;


            case "SAIU_PARA_ENTREGA":

                p.setStatus(
                    "ENTREGUE"
                );

                p.setEntregueEm(
                    LocalDateTime.now()
                );

                break;


            default:

                break;
        }


        return p;
    }


    public Pedido buscar(Long id) {

        return pedidoRepo.findById(id)
            .orElseThrow(
                () -> new IllegalArgumentException(
                    "Pedido não encontrado."
                )
            );
    }


    @Transactional
    public Avaliacao avaliar(
            Long pedidoId,
            AvaliacaoRequest req) {

        Pedido p =
            buscar(pedidoId);


        /*
         * Confirma que o pedido pertence
         * ao cliente informado.
         */
        if (
            !p.getCliente()
                .getId()
                .equals(req.clienteId())
        ) {

            throw new IllegalArgumentException(
                "Cliente inválido para este pedido."
            );
        }


        /*
         * Só permite avaliação
         * depois da entrega.
         */
        if (
            !"ENTREGUE".equals(
                p.getStatus()
            )
        ) {

            throw new IllegalArgumentException(
                "O pedido precisa estar entregue para ser avaliado."
            );
        }


        /*
         * Evita avaliação duplicada.
         */
        if (
            avaliacaoRepo.existsByPedidoId(
                pedidoId
            )
        ) {

            throw new IllegalArgumentException(
                "Este pedido já foi avaliado."
            );
        }


        /*
         * Cria a avaliação.
         */
        Avaliacao a =
            new Avaliacao();


        a.setPedido(p);

        a.setCliente(
            p.getCliente()
        );

        a.setNota(
            req.nota()
        );

        a.setComentario(
            req.comentario()
        );

        a.setTags(
            req.tags()
        );

        a.setCriadaEm(
            LocalDateTime.now()
        );


        return avaliacaoRepo.save(a);
    }
}