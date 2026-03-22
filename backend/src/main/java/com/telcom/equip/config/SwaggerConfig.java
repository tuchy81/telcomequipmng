package com.telcom.equip.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("네트워크 전산장비 실사점검 시스템 API")
                        .description("실사 관리, 자산 관리, 점검 등록/조회, 사진 업로드, 지도 마커 등 전체 API")
                        .version("v1.0.0"));
    }
}
