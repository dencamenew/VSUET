package ru.practice.teststation.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.practice.teststation.model.RedisSession;
import ru.practice.teststation.model.enums.StatusInSession;
import ru.practice.teststation.repository.RedisSessionRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final RedisSessionRepository redisSessionRepository;

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response, 
                                FilterChain filterChain) 
                                throws ServletException, IOException {
        
        String sessionIdHeader = request.getHeader("X-Session-Id");
        
        if (sessionIdHeader != null) {
            try {
                Long sessionId = Long.parseLong(sessionIdHeader);
                RedisSession redisSession = redisSessionRepository.findById(sessionId).orElse(null);
                
                if (redisSession != null && redisSession.getStatus() == StatusInSession.ACTIVE) {
                    
                   
                    redisSession.setExistedAt(LocalDateTime.now());
                    redisSessionRepository.save(redisSession);
                    
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                        redisSession.getId(),
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + redisSession.getRole()))
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        
        filterChain.doFilter(request, response);
    }
}