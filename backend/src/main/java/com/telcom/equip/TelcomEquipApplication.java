package com.telcom.equip;

import com.telcom.equip.entity.AdminSetting;
import com.telcom.equip.repository.AdminSettingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class TelcomEquipApplication {

    public static void main(String[] args) {
        SpringApplication.run(TelcomEquipApplication.class, args);
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner initAdminPassword(AdminSettingRepository adminSettingRepository,
                                                BCryptPasswordEncoder encoder) {
        return args -> {
            if (adminSettingRepository.findBySettingKey("admin_password").isEmpty()) {
                AdminSetting setting = new AdminSetting();
                setting.setSettingKey("admin_password");
                setting.setSettingValue(encoder.encode("admin1234"));
                adminSettingRepository.save(setting);
            }
        };
    }
}
