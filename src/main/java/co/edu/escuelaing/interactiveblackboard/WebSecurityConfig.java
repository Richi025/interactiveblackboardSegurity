package co.edu.escuelaing.interactiveblackboard;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    // Inyectar los valores desde application.properties
    @Value("${user1.username}")
    private String user1Username;

    @Value("${user1.password}")
    private String user1Password;

    @Value("${user2.username}")
    private String user2Username;

    @Value("${user2.password}")
    private String user2Password;

    @Value("${user3.username}")
    private String user3Username;

    @Value("${user3.password}")
    private String user3Password;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests((requests) -> requests
                .requestMatchers("/", "/login", "/auth/ticket").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin((form) -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout((logout) -> logout.permitAll());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user1 = User.withDefaultPasswordEncoder()
            .username(user1Username)
            .password(user1Password)
            .roles("USER")
            .build();

        UserDetails user2 = User.withDefaultPasswordEncoder()
            .username(user2Username)
            .password(user2Password)
            .roles("USER")
            .build();

        UserDetails user3 = User.withDefaultPasswordEncoder()
            .username(user3Username)
            .password(user3Password)
            .roles("USER")
            .build();

        return new InMemoryUserDetailsManager(user1, user2, user3);
    }
}
