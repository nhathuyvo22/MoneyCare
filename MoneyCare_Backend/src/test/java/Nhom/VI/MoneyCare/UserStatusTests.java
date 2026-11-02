package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.User;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.RoleRepository;
import Nhom.VI.MoneyCare.repository.UserRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.Impl.UserServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserStatusTests {
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private CurrentUserService currentUserService;
    @InjectMocks private UserServiceImpl userService;

    @Test
    void adminCanReactivateLockedUser() {
        User lockedUser = user(12L, "LOCKED");
        when(userRepository.findById(12L)).thenReturn(Optional.of(lockedUser));
        when(userRepository.save(lockedUser)).thenReturn(lockedUser);

        User updated = userService.updateUserStatus(12L, "ACTIVE");

        assertEquals("ACTIVE", updated.getStatus());
        verify(userRepository).save(lockedUser);
    }

    @Test
    void adminCannotLockTheirOwnAccount() {
        User admin = user(1L, "ACTIVE");
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(currentUserService.getUserId()).thenReturn(1L);

        assertThrows(BadRequestException.class, () -> userService.updateUserStatus(1L, "LOCKED"));

        verify(userRepository, never()).save(admin);
    }

    @Test
    void statusEndpointRejectsUnsupportedStatuses() {
        assertThrows(BadRequestException.class, () -> userService.updateUserStatus(12L, "PENDING"));
        verify(userRepository, never()).findById(12L);
    }

    private User user(Long id, String status) {
        User user = new User();
        user.setId(id);
        user.setStatus(status);
        return user;
    }
}
