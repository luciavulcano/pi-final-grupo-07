package br.com.fastdelivery.model;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurantes")
public class Restaurante {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String nome;
    @Column(nullable = false) private String categoria;
    @Column(nullable = false) private Double avaliacao;
    @Column(nullable = false) private Integer tempoMin;
    @Column(nullable = false) private Integer tempoMax;
    @Column(nullable = false) private Boolean entregaGratis;
    @Column(nullable = false) private String icone;

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public Double getAvaliacao() { return avaliacao; }
    public void setAvaliacao(Double avaliacao) { this.avaliacao = avaliacao; }
    public Integer getTempoMin() { return tempoMin; }
    public void setTempoMin(Integer tempoMin) { this.tempoMin = tempoMin; }
    public Integer getTempoMax() { return tempoMax; }
    public void setTempoMax(Integer tempoMax) { this.tempoMax = tempoMax; }
    public Boolean getEntregaGratis() { return entregaGratis; }
    public void setEntregaGratis(Boolean entregaGratis) { this.entregaGratis = entregaGratis; }
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
}
