package br.com.fastdelivery.controller;

import br.com.fastdelivery.dto.AvaliacaoRequest;
import br.com.fastdelivery.dto.PedidoRequest;
import br.com.fastdelivery.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PedidoController {
    private final PedidoService service;
    public PedidoController(PedidoService service) { this.service = service; }

    @PostMapping("/pedidos")
    public Object criar(@Valid @RequestBody PedidoRequest request) { return service.criar(request); }

    @GetMapping("/pedidos/{id}")
    public Object buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping("/pedidos/{id}/aprovar")
    public Object aprovar(@PathVariable Long id) { return service.aprovar(id); }

    @PostMapping("/pedidos/{id}/avancar")
    public Object avancar(@PathVariable Long id) { return service.avancar(id); }

    @PostMapping("/pedidos/{id}/avaliacao")
    public Object avaliar(@PathVariable Long id, @Valid @RequestBody AvaliacaoRequest request) { return service.avaliar(id, request); }
}
