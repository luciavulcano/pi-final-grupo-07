package br.com.fastdelivery.repository;
import br.com.fastdelivery.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByRestauranteId(Long restauranteId);
}
