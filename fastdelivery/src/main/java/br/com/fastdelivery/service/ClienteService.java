package br.com.fastdelivery.service;

import br.com.fastdelivery.dto.CadastroRequest;
import br.com.fastdelivery.model.Cliente;
import br.com.fastdelivery.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
public class ClienteService {
    private final ClienteRepository repository;
    public ClienteService(ClienteRepository repository) { this.repository = repository; }

    public Cliente cadastrar(CadastroRequest req) {
        if (repository.findByEmailIgnoreCase(req.email()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        Cliente c = new Cliente();
        c.setNome(req.nome());
        c.setTelefone(req.telefone());
        c.setEmail(req.email().trim().toLowerCase());
        c.setSenha(hash(req.senha()));
        return repository.save(c);
    }

    public Cliente autenticar(String email, String senha) {
        Cliente c = repository.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos."));
        if (!c.getSenha().equals(hash(senha))) throw new IllegalArgumentException("E-mail ou senha inválidos.");
        return c;
    }

    private String hash(String valor) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new IllegalStateException("Não foi possível processar a senha.", e); }
    }
}
