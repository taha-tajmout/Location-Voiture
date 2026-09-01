package com.mehdiluxury.config;

import com.mehdiluxury.model.AdminUser;
import com.mehdiluxury.model.SiteSettings;
import com.mehdiluxury.model.Vehicle;
import com.mehdiluxury.model.VehicleType;
import com.mehdiluxury.repo.AdminUserRepository;
import com.mehdiluxury.repo.SiteSettingsRepository;
import com.mehdiluxury.repo.VehicleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Cree au premier demarrage : le compte admin, les parametres du site
 * et quelques vehicules d'exemple (supprimables depuis le tableau de bord).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final String UNSPLASH = "https://images.unsplash.com/photo-";
    private static final String IMG_OPTIONS = "?auto=format&fit=crop&w=1200&q=80";

    private final VehicleRepository vehicles;
    private final SiteSettingsRepository settings;
    private final AdminUserRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public DataSeeder(VehicleRepository vehicles,
                      SiteSettingsRepository settings,
                      AdminUserRepository admins,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.admin.username}") String adminUsername,
                      @Value("${app.admin.password}") String adminPassword) {
        this.vehicles = vehicles;
        this.settings = settings;
        this.admins = admins;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedSettings();
        seedVehicles();
    }

    private void seedAdmin() {
        if (admins.count() > 0) {
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername(adminUsername);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setDisplayName("Mehdi Luxury Cars");
        admins.save(admin);
        System.out.println();
        System.out.println("=========================================================");
        System.out.println(" Compte administrateur cree");
        System.out.println("   Identifiant : " + adminUsername);
        System.out.println("   Mot de passe : " + adminPassword);
        System.out.println("   Connexion    : http://localhost:5173/admin/login");
        System.out.println("=========================================================");
        System.out.println();
    }

    private void seedSettings() {
        if (settings.existsById(1L)) {
            return;
        }
        SiteSettings s = new SiteSettings();
        s.setInstagram("https://www.instagram.com/mehdi.luxury.car");
        s.setTiktok("https://www.tiktok.com/@mehdi.luxury.car");
        s.setEmail("contact@mehdiluxurycars.ma");
        s.setAddress("Casablanca, Maroc");
        s.setHeroImageUrl(UNSPLASH + "1503376780353-7e6692767b70" + IMG_OPTIONS);
        settings.save(s);
    }

    private void seedVehicles() {
        if (vehicles.count() > 0) {
            return;
        }
        vehicles.saveAll(List.of(
                car("Mercedes Classe A", "Mercedes", "Berline", 800, 4900, 17000, 10000,
                        "1618843479313-40f8afb4b4d8", 2023, "Automatique", "Diesel", 5, 5, true,
                        "Berline compacte premium, ideale pour la ville comme pour les longs trajets."),
                car("Golf 8 GTI", "Volkswagen", "Sportive", 700, 4200, 15000, 8000,
                        "1617814076367-b759c7d7e738", 2022, "Automatique", "Essence", 5, 5, true,
                        "La reference des compactes sportives, confort et sensations."),
                car("Range Rover Evoque", "Land Rover", "SUV", 1200, 7500, 26000, 15000,
                        "1606664515524-ed2f786a0bd6", 2023, "Automatique", "Diesel", 5, 5, true,
                        "SUV de luxe au design marquant, parfait pour vos deplacements."),
                car("Porsche 911 Carrera", "Porsche", "Sport", 3500, 21000, 70000, 40000,
                        "1503376780353-7e6692767b70", 2022, "Automatique", "Essence", 4, 2, true,
                        "Une legende. Location a la journee pour occasions speciales et shootings."),
                car("Dacia Duster", "Dacia", "SUV", 350, 2100, 7000, 4000,
                        "1568605117036-5fe5e7bab0b7", 2023, "Manuelle", "Diesel", 5, 5, false,
                        "Le meilleur rapport qualite-prix de la flotte, robuste et economique."),
                car("BMW Serie 3", "BMW", "Berline", 900, 5500, 19000, 12000,
                        "1555215695-3004980ad54e", 2023, "Automatique", "Diesel", 5, 4, false,
                        "Berline dynamique, finition haut de gamme et boite automatique."),

                moto("Yamaha MT-07", "Yamaha", "Roadster", 450, 2700, 9000, 6000,
                        "1558981806-ec527fa84c39", 2023, "689 cc", true,
                        "Roadster nerveux et facile a prendre en main. Casques fournis."),
                moto("Honda PCX 125", "Honda", "Scooter", 200, 1200, 3800, 2500,
                        "1568772585407-9361f9bf3a87", 2024, "125 cc", true,
                        "Scooter urbain economique, permis A1 ou equivalent."),
                moto("Kawasaki Z900", "Kawasaki", "Roadster", 600, 3600, 12000, 8000,
                        "1449426468159-d96dbf08f19f", 2023, "948 cc", false,
                        "Pour les pilotes experimentes : puissance et style agressif."),
                moto("SYM Jet 14", "SYM", "Scooter", 150, 900, 3000, 2000,
                        "1571068316344-75bc76f77890", 2024, "125 cc", false,
                        "Solution simple et economique pour circuler en ville.")
        ));
    }

    private Vehicle car(String name, String brand, String category, double day, double week, double month,
                        double deposit, String photoId, int year, String transmission, String fuel,
                        int seats, int doors, boolean featured, String description) {
        Vehicle v = base(name, brand, category, day, week, month, deposit, photoId, year, featured, description);
        v.setType(VehicleType.CAR);
        v.setTransmission(transmission);
        v.setFuel(fuel);
        v.setSeats(seats);
        v.setDoors(doors);
        return v;
    }

    private Vehicle moto(String name, String brand, String category, double day, double week, double month,
                         double deposit, String photoId, int year, String engine, boolean featured,
                         String description) {
        Vehicle v = base(name, brand, category, day, week, month, deposit, photoId, year, featured, description);
        v.setType(VehicleType.MOTO);
        v.setEngine(engine);
        v.setFuel("Essence");
        return v;
    }

    private Vehicle base(String name, String brand, String category, double day, double week, double month,
                         double deposit, String photoId, int year, boolean featured, String description) {
        Vehicle v = new Vehicle();
        v.setName(name);
        v.setBrand(brand);
        v.setCategory(category);
        v.setPricePerDay(day);
        v.setPricePerWeek(week);
        v.setPricePerMonth(month);
        v.setDeposit(deposit);
        v.setImageUrl(UNSPLASH + photoId + IMG_OPTIONS);
        v.setYear(year);
        v.setFeatured(featured);
        v.setAvailable(true);
        v.setDescription(description);
        return v;
    }
}
