plugins {
    java
    id("org.springframework.boot") version "3.4.3"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.telcom"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // SQLite
    implementation("org.xerial:sqlite-jdbc:3.45.3.0")
    implementation("org.hibernate.orm:hibernate-community-dialects:6.6.4.Final")

    // EXIF parsing
    implementation("com.drewnoakes:metadata-extractor:2.19.0")

    // Excel export
    implementation("org.apache.poi:poi-ooxml:5.2.5")

    // BCrypt for admin password
    implementation("org.springframework.security:spring-security-crypto")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
