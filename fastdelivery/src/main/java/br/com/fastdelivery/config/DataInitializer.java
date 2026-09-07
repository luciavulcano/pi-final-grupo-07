package br.com.fastdelivery.config;

import br.com.fastdelivery.model.Produto;
import br.com.fastdelivery.model.Restaurante;
import br.com.fastdelivery.repository.ProdutoRepository;
import br.com.fastdelivery.repository.RestauranteRepository;
import br.com.fastdelivery.repository.ClienteRepository;
import br.com.fastdelivery.model.Cliente;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner init(RestauranteRepository restauranteRepo, ProdutoRepository produtoRepo, ClienteRepository clienteRepo) {
        return args -> {
            if (restauranteRepo.count() == 0) {
            criarRestaurante(restauranteRepo, produtoRepo, "Jazz Burguer", "Hambúrguer", 4.5, 25, 35, true, "🍔", new String[][]{
                {"Classic Bacon", "Pão brioche, burger artesanal, queijo e bacon crocante.", "29.90", "🍔"},
                {"Cheddar Especial", "Blend artesanal, cheddar cremoso e molho da casa.", "31.90", "🍔"},
                {"Batata Crocante", "Porção individual com páprica e molho especial.", "14.90", "🍟"},
                {"Refrigerante Lata", "Escolha seu sabor favorito.", "6.00", "🥤"}});
            criarRestaurante(restauranteRepo, produtoRepo, "Pizzaria Itália", "Pizza", 5.0, 30, 45, true, "🍕", new String[][]{
                {"Calabresa", "Pizza tradicional de calabresa e cebola.", "39.90", "🍕"},
                {"Marguerita", "Molho, queijo, tomate e manjericão.", "42.90", "🍕"}});
            criarRestaurante(restauranteRepo, produtoRepo, "Sushi House", "Japonesa", 3.0, 35, 50, false, "🍣", new String[][]{
                {"Combo Sushi", "Seleção de peças variadas.", "49.90", "🍣"},
                {"Temaki Salmão", "Salmão fresco com arroz e cebolinha.", "27.90", "🍣"}});
            criarRestaurante(restauranteRepo, produtoRepo, "Trem de Minas", "Brasileira", 4.2, 25, 40, true, "🍛", new String[][]{
                {"Prato da Casa", "Arroz, feijão, carne e acompanhamento.", "34.90", "🍛"},
                {"Feijão Tropeiro", "Receita mineira tradicional.", "28.90", "🥘"}});
            }
            if (clienteRepo.findByEmailIgnoreCase("demo@fastdelivery.com").isEmpty()) {
                Cliente c = new Cliente(); c.setNome("Cliente Demo"); c.setTelefone("(81) 99999-0000"); c.setEmail("demo@fastdelivery.com"); c.setSenha(sha256("123456")); clienteRepo.save(c);
            }
        };
    }

    private String sha256(String valor) {
        try { return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(valor.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }

    private void criarRestaurante(RestauranteRepository rr, ProdutoRepository pr, String nome, String categoria, double nota,
                                  int min, int max, boolean gratis, String icone, String[][] produtos) {
        Restaurante r = new Restaurante(); r.setNome(nome); r.setCategoria(categoria); r.setAvaliacao(nota); r.setTempoMin(min); r.setTempoMax(max); r.setEntregaGratis(gratis); r.setIcone(icone);
        r = rr.save(r);
        for (String[] p : produtos) {
            Produto prod = new Produto(); prod.setRestaurante(r); prod.setNome(p[0]); prod.setDescricao(p[1]); prod.setPreco(Double.valueOf(p[2])); prod.setIcone(p[3]); pr.save(prod);
        }
    }
}
