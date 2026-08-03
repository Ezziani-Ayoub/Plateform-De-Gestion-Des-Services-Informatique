package com.pgsi.config;

import com.pgsi.entity.ERole;
import com.pgsi.entity.Equipment;
import com.pgsi.entity.EquipmentStatus;
import com.pgsi.entity.Role;
import com.pgsi.entity.Ticket;
import com.pgsi.entity.TicketCategory;
import com.pgsi.entity.TicketPriority;
import com.pgsi.entity.TicketStatus;
import com.pgsi.entity.User;
import com.pgsi.repository.EquipmentRepository;
import com.pgsi.repository.RoleRepository;
import com.pgsi.repository.TicketRepository;
import com.pgsi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, EquipmentRepository equipmentRepository, TicketRepository ticketRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Checking & Initializing PGSI seed data...");

        // 1. Roles
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_USER).build()));
        Role techRole = roleRepository.findByName(ERole.ROLE_TECHNICIAN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_TECHNICIAN).build()));
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).build()));

        // 2. Admin User
        User adminUser;
        if (!userRepository.existsByUsername("admin")) {
            adminUser = User.builder()
                    .username("admin")
                    .email("admin@pgsi.ma")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Administrateur Système")
                    .enabled(true)
                    .roles(Set.of(adminRole, techRole, userRole))
                    .build();
            adminUser = userRepository.save(adminUser);
            log.info("Created default admin user: admin / admin123");
        } else {
            adminUser = userRepository.findByUsername("admin").get();
        }

        // 3. Technician User
        User techUser;
        if (!userRepository.existsByUsername("tech")) {
            techUser = User.builder()
                    .username("tech")
                    .email("tech@pgsi.ma")
                    .password(passwordEncoder.encode("tech123"))
                    .fullName("Technicien Support")
                    .enabled(true)
                    .roles(Set.of(techRole, userRole))
                    .build();
            techUser = userRepository.save(techUser);
            log.info("Created default technician user: tech / tech123");
        } else {
            techUser = userRepository.findByUsername("tech").get();
        }

        // 4. Employee User
        User empUser;
        if (!userRepository.existsByUsername("employee")) {
            empUser = User.builder()
                    .username("employee")
                    .email("employee@pgsi.ma")
                    .password(passwordEncoder.encode("emp123"))
                    .fullName("Karim Employee")
                    .enabled(true)
                    .roles(Set.of(userRole))
                    .build();
            empUser = userRepository.save(empUser);
            log.info("Created default employee user: employee / emp123");
        } else {
            empUser = userRepository.findByUsername("employee").get();
        }

        // 5. Sample Equipment
        if (equipmentRepository.count() == 0) {
            equipmentRepository.save(Equipment.builder()
                    .name("MacBook Pro M3 Max")
                    .serialNumber("SN-APPLE-883912")
                    .category("LAPTOP")
                    .status(EquipmentStatus.IN_USE)
                    .location("Bureau 304 - DSI")
                    .purchaseDate(LocalDate.now().minusMonths(4))
                    .description("Poste de travail Haute Performance pour lead dev")
                    .assignedTo(adminUser)
                    .build());

            equipmentRepository.save(Equipment.builder()
                    .name("Dell Latitude 5540")
                    .serialNumber("SN-DELL-901123")
                    .category("LAPTOP")
                    .status(EquipmentStatus.AVAILABLE)
                    .location("Stock Central DSI")
                    .purchaseDate(LocalDate.now().minusMonths(2))
                    .description("PC Portable pour nouvel arrivant")
                    .assignedTo(empUser)
                    .build());

            equipmentRepository.save(Equipment.builder()
                    .name("Serveur PowerEdge R760")
                    .serialNumber("SN-SRV-2024-001")
                    .category("SERVER")
                    .status(EquipmentStatus.MAINTENANCE)
                    .location("Salle Serveur 1")
                    .purchaseDate(LocalDate.now().minusYears(1))
                    .description("Serveur de virtualisation ESXi en maintenance préventive")
                    .build());

            equipmentRepository.save(Equipment.builder()
                    .name("Switch Cisco Catalyst 9300")
                    .serialNumber("SN-CSCO-445129")
                    .category("NETWORK")
                    .status(EquipmentStatus.IN_USE)
                    .location("Baie Réseau Étage 2")
                    .purchaseDate(LocalDate.now().minusMonths(8))
                    .description("Switch Stackable 48 ports PoE+")
                    .build());

            equipmentRepository.save(Equipment.builder()
                    .name("Imprimante HP LaserJet Enterprise")
                    .serialNumber("SN-HP-300129")
                    .category("PRINTER")
                    .status(EquipmentStatus.RETIRED)
                    .location("Magasin Rebut")
                    .purchaseDate(LocalDate.now().minusYears(5))
                    .description("Matériel obsolète réformé")
                    .build());

            log.info("Seeded 5 sample equipment items.");
        }

        // 6. Sample Support Tickets
        if (ticketRepository.count() == 0) {
            ticketRepository.save(Ticket.builder()
                    .title("Écran noir au démarrage du PC Dell")
                    .description("Mon PC Dell Latitude 5540 ne s'allume plus depuis ce matin, voyant batterie clignote orange.")
                    .category(TicketCategory.HARDWARE)
                    .priority(TicketPriority.HIGH)
                    .status(TicketStatus.OPEN)
                    .createdBy(empUser)
                    .build());

            ticketRepository.save(Ticket.builder()
                    .title("Demande de licence Microsoft Office & VPN")
                    .description("Besoin d'activer l'accès VPN distant et la suite Office 365 pour travail à domicile.")
                    .category(TicketCategory.ACCESS_RIGHTS)
                    .priority(TicketPriority.MEDIUM)
                    .status(TicketStatus.IN_PROGRESS)
                    .createdBy(empUser)
                    .assignedTo(techUser)
                    .resolutionNotes("Accès VPN configuré, en attente d'activation de la licence.")
                    .build());

            log.info("Seeded sample IT support tickets.");
        }
    }
}
