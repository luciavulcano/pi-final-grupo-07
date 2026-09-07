package br.com.fastdelivery.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    private Restaurante restaurante;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String endereco;

    @Column(nullable = false)
    private String formaPagamento;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String statusPagamento;

    @Column(nullable = false)
    private Double valorTotal;

    private Double trocoPara;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    private LocalDateTime aprovadoEm;

    private LocalDateTime entregueEm;

    @OneToMany(
    	    mappedBy = "pedido",
    	    cascade = CascadeType.ALL,
    	    orphanRemoval = true,
    	    fetch = FetchType.EAGER
    	)
    private List<PedidoItem> itens = new ArrayList<>();


    /**
     * Executado automaticamente antes do INSERT.
     */
    @PrePersist
    public void prePersist() {

        /*
         * Gera o código automaticamente caso ainda não exista.
         */
        if (codigo == null || codigo.isBlank()) {

            codigo = gerarCodigo();

        }

        /*
         * Define a data de criação caso ainda não exista.
         */
        if (criadoEm == null) {

            criadoEm = LocalDateTime.now();

        }

        /*
         * Define o status inicial.
         */
        if (status == null || status.isBlank()) {

            status = "RECEBIDO";

        }

        /*
         * Define o status inicial do pagamento.
         */
        if (statusPagamento == null || statusPagamento.isBlank()) {

            statusPagamento = "AGUARDANDO_APROVACAO";

        }

        /*
         * Garante que o valor nunca fique nulo.
         */
        if (valorTotal == null) {

            valorTotal = 0.0;

        }
    }


    /**
     * Gera um código único para o pedido.
     *
     * Exemplo:
     *
     * FD-20260905-A7F3B
     */
    private String gerarCodigo() {

        String data =
            java.time.LocalDate
                .now()
                .toString()
                .replace("-", "");

        String aleatorio =
            UUID.randomUUID()
                .toString()
                .substring(0, 5)
                .toUpperCase();

        return "FD-" + data + "-" + aleatorio;
    }


    public Long getId() {
        return id;
    }


    public Cliente getCliente() {
        return cliente;
    }


    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }


    public Restaurante getRestaurante() {
        return restaurante;
    }


    public void setRestaurante(Restaurante restaurante) {
        this.restaurante = restaurante;
    }


    public String getCodigo() {
        return codigo;
    }


    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }


    public String getEndereco() {
        return endereco;
    }


    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }


    public String getFormaPagamento() {
        return formaPagamento;
    }


    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }


    public String getStatusPagamento() {
        return statusPagamento;
    }


    public void setStatusPagamento(String statusPagamento) {
        this.statusPagamento = statusPagamento;
    }


    public Double getValorTotal() {
        return valorTotal;
    }


    public void setValorTotal(Double valorTotal) {
        this.valorTotal = valorTotal;
    }


    public Double getTrocoPara() {
        return trocoPara;
    }


    public void setTrocoPara(Double trocoPara) {
        this.trocoPara = trocoPara;
    }


    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }


    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }


    public LocalDateTime getAprovadoEm() {
        return aprovadoEm;
    }


    public void setAprovadoEm(LocalDateTime aprovadoEm) {
        this.aprovadoEm = aprovadoEm;
    }


    public LocalDateTime getEntregueEm() {
        return entregueEm;
    }


    public void setEntregueEm(LocalDateTime entregueEm) {
        this.entregueEm = entregueEm;
    }


    public List<PedidoItem> getItens() {
        return itens;
    }
    
    
    public void setItens(List<PedidoItem> itens) {
        this.itens = itens;
    }


    public void adicionarItem(PedidoItem item) {

        itens.add(item);

        item.setPedido(this);
    }
}