package br.com.fastdelivery.repository;
import br.com.fastdelivery.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    boolean existsByPedidoId(Long pedidoId);
}
