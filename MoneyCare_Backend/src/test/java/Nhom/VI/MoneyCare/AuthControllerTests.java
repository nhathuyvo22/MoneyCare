package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.controller.AuthController;
import Nhom.VI.MoneyCare.repository.UserRepository;
import Nhom.VI.MoneyCare.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthControllerTests {
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private UserRepository userRepository;
    @InjectMocks private AuthController authController;

    @Test
    void disabledAccountGetsSpecificLockedResponse() {
        when(authenticationManager.authenticate(
                org.mockito.ArgumentMatchers.any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new DisabledException("Account is disabled"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authController.login(new AuthController.LoginRequest("locked@example.test", "password")));

        assertEquals(423, exception.getStatusCode().value());
        verify(authenticationManager).authenticate(
                org.mockito.ArgumentMatchers.any(UsernamePasswordAuthenticationToken.class));
    }
}
