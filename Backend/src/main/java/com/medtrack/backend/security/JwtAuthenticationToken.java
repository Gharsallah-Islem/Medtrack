package com.medtrack.backend.security;


import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {
    private final String token;
    private final String username;

    public JwtAuthenticationToken(String token, String username, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.token = token;
        this.username = username;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return username; // Return the username as the principal
    }
}