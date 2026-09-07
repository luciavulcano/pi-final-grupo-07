package br.com.fastdelivery.repository;
import br.com.fastdelivery.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PedidoRepository extends JpaRepository<Pedido, Long> { }
