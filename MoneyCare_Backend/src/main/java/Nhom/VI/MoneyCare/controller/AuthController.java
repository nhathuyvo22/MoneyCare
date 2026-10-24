package Nhom.VI.MoneyCare.controller;

import Nhom.VI.MoneyCare.entity.User;
import Nhom.VI.MoneyCare.repository.UserRepository;
import Nhom.VI.MoneyCare.security.JwtService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /** Dang nhap bang email/mat khau, tra ve JWT access token. */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        if (request == null || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email va mat khau khong duoc de trong");
        }
        final Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim(), request.password()));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoac mat khau khong dung / tai khoan bi khoa");
        }
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tai khoan khong hop le"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("accessToken", jwtService.generateToken(principal));
        result.put("tokenType", "Bearer");
        result.put("expiresIn", jwtService.getExpirationSeconds());
        result.put("user", safeUser(user, authentication));
        return result;
    }

    /** Tra ve thong tin tai khoan dang duoc xac thuc boi JWT. */
    @GetMapping("/me")
    public Map<String, Object> currentUser(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung"));
        return safeUser(user, authentication);
    }

    private Map<String, Object> safeUser(User user, Authentication authentication) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("fullName", user.getFullName());
        result.put("email", user.getEmail());
        result.put("roleId", user.getRoleId());
        result.put("status", user.getStatus());
        result.put("authorities", authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority()).toList());
        return result;
    }

    public record LoginRequest(String email, String password) { }
}
