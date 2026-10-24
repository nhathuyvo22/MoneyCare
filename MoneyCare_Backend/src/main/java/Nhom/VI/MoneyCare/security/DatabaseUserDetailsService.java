package Nhom.VI.MoneyCare.security;

import Nhom.VI.MoneyCare.entity.Role;
import Nhom.VI.MoneyCare.entity.User;
import Nhom.VI.MoneyCare.repository.RoleRepository;
import Nhom.VI.MoneyCare.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public DatabaseUserDetailsService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + email));

        Role role = roleRepository.findById(user.getRoleId())
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản chưa được gán vai trò hợp lệ"));

        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + role.getName().toUpperCase())
                .disabled(!"ACTIVE".equalsIgnoreCase(user.getStatus()))
                .build();
    }
}
