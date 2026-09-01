package com.mehdiluxury.model;

import jakarta.persistence.*;

/**
 * Parametres du site modifiables par l'admin : numeros de reservation,
 * reseaux sociaux, textes de la page d'accueil.
 * Une seule ligne en base (id = 1).
 */
@Entity
@Table(name = "site_settings")
public class SiteSettings {

    @Id
    private Long id = 1L;

    private String siteName = "Mehdi Luxury Cars";

    /** Numeros de reservation (WhatsApp + appel). */
    private String phone1 = "0661536755";
    private String phone2 = "0645424295";

    /** Indicatif pays utilise pour construire les liens WhatsApp. */
    private String countryCode = "212";

    private String email;
    private String address;
    private String city = "Maroc";

    private String instagram;
    private String tiktok;
    private String facebook;

    @Column(length = 1000)
    private String whatsappMessage = "Bonjour Mehdi Luxury Cars, je souhaite reserver un vehicule.";

    private String heroTitle = "Louez l'exception";

    @Column(length = 1000)
    private String heroSubtitle = "Voitures et motos de luxe a la location. Reservation immediate par WhatsApp.";

    @Column(length = 1000)
    private String heroImageUrl;

    @Column(length = 4000)
    private String aboutText = "Mehdi Luxury Cars met a votre disposition une flotte de voitures et de motos "
            + "soigneusement entretenues. Reservation simple, tarifs clairs, livraison possible.";

    private String openingHours = "Tous les jours : 08h00 - 22h00";

    /** Bandeau affiche en haut du site (promo, message...). */
    private String announcement;
    private boolean announcementActive = false;

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }

    public String getPhone1() { return phone1; }
    public void setPhone1(String phone1) { this.phone1 = phone1; }

    public String getPhone2() { return phone2; }
    public void setPhone2(String phone2) { this.phone2 = phone2; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getTiktok() { return tiktok; }
    public void setTiktok(String tiktok) { this.tiktok = tiktok; }

    public String getFacebook() { return facebook; }
    public void setFacebook(String facebook) { this.facebook = facebook; }

    public String getWhatsappMessage() { return whatsappMessage; }
    public void setWhatsappMessage(String whatsappMessage) { this.whatsappMessage = whatsappMessage; }

    public String getHeroTitle() { return heroTitle; }
    public void setHeroTitle(String heroTitle) { this.heroTitle = heroTitle; }

    public String getHeroSubtitle() { return heroSubtitle; }
    public void setHeroSubtitle(String heroSubtitle) { this.heroSubtitle = heroSubtitle; }

    public String getHeroImageUrl() { return heroImageUrl; }
    public void setHeroImageUrl(String heroImageUrl) { this.heroImageUrl = heroImageUrl; }

    public String getAboutText() { return aboutText; }
    public void setAboutText(String aboutText) { this.aboutText = aboutText; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getAnnouncement() { return announcement; }
    public void setAnnouncement(String announcement) { this.announcement = announcement; }

    public boolean isAnnouncementActive() { return announcementActive; }
    public void setAnnouncementActive(boolean announcementActive) { this.announcementActive = announcementActive; }
}
