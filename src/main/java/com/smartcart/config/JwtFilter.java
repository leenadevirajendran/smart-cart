package com.smartcart.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    //JwtUtil is injected - we need to validate and read tokens
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException{

        //Step-1 : Read the Authorization header from the request
        String authHeader = request.getHeader("Authorization");
        //Step-2 : Check, if it starts with "Bearer"
        //If not, skip this filter and return to the request.
        if(authHeader==null|| !authHeader.startsWith("Bearer")){
            filterChain.doFilter(request,response);
            return;
        }
        //Step-3 : Extract the actual token(remove "Bearer" prefix)
        String token = authHeader.substring(7);

        //Step-4 :  Validate the Token
        if(jwtUtil.isTokenValid(token)){
            //Step-5 :  Extract Email and Role from the Token
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
        //Step-6 :  Create an Authentication object with the role
        // ROLE_ prefix is required by Spring security
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_"+role))
            );
        //Step-7 : Tell Spring security this user is authenticated
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        //Step-8 : Continue to the next filter/Controller
        filterChain.doFilter(request,response);

    }
}
