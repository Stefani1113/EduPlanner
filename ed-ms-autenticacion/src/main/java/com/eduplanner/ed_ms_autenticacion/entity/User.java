package eduplanner.ed_ms_autenticacion.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer idUser;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "surnames", nullable = false, length = 100)
    private String surnames;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "document", nullable = false, unique = true, length = 30)
    private String document;

    @Column(name = "document_type", nullable = false, length = 20)
    private String documentType;

    @Column(name = "phoneNumber", length = 20)
    private String phoneNumber;

    @Column(name = "birthdate")
    private LocalDate birthdate;

    @Column(name = "state")
    private Boolean state = true;

    @Column(name = "creationDate", updatable = false)
    private LocalDateTime creationDate = LocalDateTime.now();

    @Column(name = "last_access")
    private LocalDateTime lassAccess;

    @Column(name = "id_role", nullable = false)
    private Integer idRole;
}
