package br.com.fastdelivery.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
public record CadastroRequest(@NotBlank String nome, @NotBlank String telefone, @Email @NotBlank String email, @NotBlank String senha) {}
