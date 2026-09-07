package br.com.fastdelivery.controller;

import br.com.fastdelivery.dto.CadastroRequest;
import br.com.fastdelivery.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteService service;
    public ClienteController(ClienteService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Object cadastrar(@Valid @RequestBody CadastroRequest request) {
        var c = service.cadastrar(request);
        return new Object() { public final Long id = c.getId(); public final String nome = c.getNome(); public final String email = c.getEmail(); };
    }
}
