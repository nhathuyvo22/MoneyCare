package Nhom.VI.MoneyCare.service.Impl;

// import thư viện
import Nhom.VI.MoneyCare.entity.User;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.UserRepository;
import Nhom.VI.MoneyCare.repository.RoleRepository;
import Nhom.VI.MoneyCare.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

// @Service: đánh dấu đây là Bean tầng xử lý nghiệp vụ (Business Logic), Spring tự tạo 1 instance
// và tiêm (Autowired) vào Controller cần dùng
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay User co id = " + id));
    }

    @Override
    public User createUser(User user) {
        validateUser(user);
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new BadRequestException("Email da ton tai!");
        }
        user.setId(null); // dam bao luon tao moi, JPA se tu sinh id (AUTO_INCREMENT)
        // Dang ky cong khai luon duoc gan USER; khong tin roleId/status do client gui len.
        user.setRoleId(roleRepository.findByName("USER")
                .orElseThrow(() -> new BadRequestException("Chua cau hinh vai tro USER")).getId());
        user.setStatus("ACTIVE");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user); // save() KHONG co id -> Hibernate sinh INSERT
    }

    @Override
    public User updateUser(Long id, User newData) {
        User existing = getUserById(id); // neu khong thay se tu nem 404
        existing.setFullName(newData.getFullName());
        existing.setEmail(newData.getEmail());
        if (newData.getPassword() != null && !newData.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(newData.getPassword()));
        }
        existing.setPhone(newData.getPhone());
        existing.setBirthDate(newData.getBirthDate());
        existing.setGender(newData.getGender());
        if (newData.getRoleId() != null) {
            if (roleRepository.findById(newData.getRoleId()).isEmpty()) throw new BadRequestException("Vai tro khong ton tai");
            existing.setRoleId(newData.getRoleId());
        }
        if (newData.getStatus() != null) existing.setStatus(newData.getStatus());
        existing.setAvatar(newData.getAvatar());
        existing.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(existing); // save() CO id -> Hibernate sinh UPDATE
    }

    @Override
    public void deleteUser(Long id) {
        User existing = getUserById(id);
        userRepository.delete(existing);
    }

    private void validateUser(User user) {
        if (user == null || user.getFullName() == null || user.getFullName().isBlank()) {
            throw new BadRequestException("Ho ten khong duoc de trong");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new BadRequestException("Mat khau khong duoc de trong");
        }
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new BadRequestException("Email khong hop le");
        }
    }
}
