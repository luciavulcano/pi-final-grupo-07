package br.com.fastdelivery.controller;

import br.com.fastdelivery.repository.ProdutoRepository;
import br.com.fastdelivery.repository.RestauranteRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurantes")
public class RestauranteController {
    private final RestauranteRepository restauranteRepo;
    private final ProdutoRepository produtoRepo;
    public RestauranteController(RestauranteRepository restauranteRepo, ProdutoRepository produtoRepo) { this.restauranteRepo = restauranteRepo; this.produtoRepo = produtoRepo; }

    @GetMapping
    public Object listar(@RequestParam(required=false) String busca, @RequestParam(required=false) String categoria) {
        String b = busca == null ? "" : busca.trim();
        String c = categoria == null ? "" : categoria.trim();
        return restauranteRepo.findAll().stream()
            .filter(r -> b.isBlank() || r.getNome().toLowerCase().contains(b.toLowerCase()) || r.getCategoria().toLowerCase().contains(b.toLowerCase()))
            .filter(r -> c.isBlank() || r.getCategoria().equalsIgnoreCase(c))
            .toList();
    }

    @GetMapping("/{id}/produtos")
    public Object produtos(@PathVariable Long id) { return produtoRepo.findByRestauranteId(id); }
}
