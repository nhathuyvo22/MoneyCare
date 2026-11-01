package Nhom.VI.MoneyCare.controller;

// import thư viện
import Nhom.VI.MoneyCare.entity.User;
import Nhom.VI.MoneyCare.service.UserService;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

// Controller: Cung cấp RESTful API quản lý người dùng (bảng users, qua JPA)
@RestController
@RequestMapping("/api/users")
public class UserController {

    // Goi Service (interface) xu ly du lieu, Spring tu tiem UserServiceImpl vao day
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // Xem danh sach (GET) - http://localhost:8080/api/users
    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // Xem chi tiet theo id (GET) - CO AP DUNG HATEOAS
    // http://localhost:8080/api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<User>> getUserById(@PathVariable Long id) {
        User user = service.getUserById(id);
        EntityModel<User> model = EntityModel.of(user,
                linkTo(methodOn(UserController.class).getUserById(id)).withSelfRel(),
                linkTo(methodOn(UserController.class).getAllUsers()).withRel("all-users")
        );
        return ResponseEntity.ok(model);
    }

    // Them moi (POST) - http://localhost:8080/api/users
    @PostMapping
    public User addUser(@RequestBody User user) {
        return service.createUser(user);
    }

    // Cap nhat (PUT) - http://localhost:8080/api/users/{id}
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return service.updateUser(id, user);
    }

    // Heartbeat cap nhat trang thai online (POST) - http://localhost:8080/api/users/heartbeat
    @PostMapping("/heartbeat")
    public Map<String, Object> heartbeat(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            service.updateHeartbeat(authentication.getName());
        }
        return Map.of("status", "OK", "timestamp", System.currentTimeMillis());
    }

    // Cap nhat rieng trang thai tai khoan (PATCH) - http://localhost:8080/api/users/{id}/status
    @PatchMapping("/{id}/status")
    public User updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body != null ? body.get("status") : null;
        return service.updateUserStatus(id, status);
    }

    // Xoa (DELETE) - http://localhost:8080/api/users/{id}
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return "Xoa thanh cong!";
    }
}
