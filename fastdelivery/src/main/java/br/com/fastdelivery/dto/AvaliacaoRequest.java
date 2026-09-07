package br.com.fastdelivery.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
public record AvaliacaoRequest(@NotNull Long clienteId, @NotNull @Min(1) @Max(5) Integer nota, String comentario, String tags) {}
