package br.com.fastdelivery.controller;

import br.com.fastdelivery.dto.LoginRequest;
import br.com.fastdelivery.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final ClienteService service;
    public AuthController(ClienteService service) { this.service = service; }

    @PostMapping("/login")
    public Object login(@Valid @RequestBody LoginRequest request) {
        var c = service.autenticar(request.email(), request.senha());
        String token = UUID.randomUUID().toString();
        return new Object() { public final String accessToken = token; public final Long id = c.getId(); public final String nome = c.getNome(); public final String email = c.getEmail(); };
    }
}
