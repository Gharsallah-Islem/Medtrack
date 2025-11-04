package com.medtrack.backend.config;

import com.medtrack.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/doctors").hasAnyAuthority("patient", "doctor") 
                        .requestMatchers("/api/users/me/**").hasAnyAuthority("patient", "doctor")
                        .requestMatchers("/api/users/patients").hasAnyAuthority("patient", "doctor")
                        
                        .requestMatchers("/api/users/**").hasAuthority("admin")
                        // Changed to hasAuthority
                        .requestMatchers("/api/medications/**").hasAnyAuthority("patient", "doctor") // Changed to hasAnyAuthority
                        .requestMatchers("/api/reports/**").hasAnyAuthority("patient", "doctor")
                        .requestMatchers("/api/reports/files/**").hasRole("doctor") // Changed to hasAnyAuthority
                        .requestMatchers("/api/appointments/**").hasAnyAuthority("patient", "doctor") // Changed to hasAnyAuthority
                        .requestMatchers("/api/availability/**").hasAnyAuthority("patient","doctor") // Changed to hasAuthority
                        .requestMatchers("/api/chat/**").hasAnyAuthority("patient", "doctor") // Changed to hasAnyAuthority
                        .requestMatchers("/api/notifications/**").hasAnyAuthority("patient", "doctor") // Changed to hasAnyAuthority
                        .requestMatchers("/api/ratings/**").hasAnyAuthority("patient", "doctor") // Changed to hasAuthority
                        .requestMatchers("/api/statistics/**").hasAnyAuthority("patient", "doctor","admin") // Changed to hasAuthority
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}