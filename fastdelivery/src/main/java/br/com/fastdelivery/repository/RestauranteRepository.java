package br.com.fastdelivery.repository;
import br.com.fastdelivery.model.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RestauranteRepository extends JpaRepository<Restaurante, Long> {
    List<Restaurante> findByNomeContainingIgnoreCaseOrCategoriaContainingIgnoreCase(String nome, String categoria);
}
