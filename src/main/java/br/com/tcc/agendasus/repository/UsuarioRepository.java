package br.com.tcc.agendasus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.tcc.agendasus.model.entity.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByCpf(String cpf);
    Optional<Usuario> findByResetToken(String resetToken);
}