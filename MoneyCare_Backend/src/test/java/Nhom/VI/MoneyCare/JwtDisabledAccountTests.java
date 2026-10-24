package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertFalse;

import Nhom.VI.MoneyCare.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

class JwtDisabledAccountTests {
    @Test
    void rejectsPreviouslyIssuedTokenWhenAccountIsDisabled() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "0123456789abcdef0123456789abcdef");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 60_000L);
        UserDetails activeUser = User.withUsername("user@example.test")
                .password("not-used")
                .authorities("ROLE_USER")
                .build();
        UserDetails disabledUser = User.withUsername("user@example.test")
                .password("not-used")
                .authorities("ROLE_USER")
                .disabled(true)
                .build();

        String token = jwtService.generateToken(activeUser);

        assertFalse(jwtService.isTokenValid(token, disabledUser));
    }
}
