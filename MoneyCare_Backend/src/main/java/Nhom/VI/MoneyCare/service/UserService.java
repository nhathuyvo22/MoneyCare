package Nhom.VI.MoneyCare.service;

// import thư viện
import Nhom.VI.MoneyCare.entity.User;

import java.util.List;

// Interface khai báo các chức năng nghiệp vụ của User (không cần @Service vì interface
// chỉ là "hợp đồng" - bản thân nó không thể tạo instance, lớp Impl triển khai nó mới cần @Service)
public interface UserService {

    List<User> getAllUsers();

    User getUserById(Long id);

    User createUser(User user);

    User updateUser(Long id, User user);

    void deleteUser(Long id);
}
