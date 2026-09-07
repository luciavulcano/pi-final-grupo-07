package br.com.fastdelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "produtos")
public class Produto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurante_id")
    @JsonIgnore
    private Restaurante restaurante;
    @Column(nullable = false) private String nome;
    @Column(nullable = false, length = 500) private String descricao;
    @Column(nullable = false) private Double preco;
    @Column(nullable = false) private String icone;

    public Long getId() { return id; }
    public Restaurante getRestaurante() { return restaurante; }
    public void setRestaurante(Restaurante restaurante) { this.restaurante = restaurante; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
}
