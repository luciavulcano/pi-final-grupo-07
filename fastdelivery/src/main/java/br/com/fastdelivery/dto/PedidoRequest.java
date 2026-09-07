package br.com.fastdelivery.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record PedidoRequest(@NotNull Long clienteId, @NotNull Long restauranteId, @NotBlank String endereco, @NotBlank String formaPagamento, Double trocoPara, @NotEmpty List<@Valid ItemRequest> itens) {
    public record ItemRequest(@NotNull Long produtoId, @NotNull Integer quantidade) {}
}
