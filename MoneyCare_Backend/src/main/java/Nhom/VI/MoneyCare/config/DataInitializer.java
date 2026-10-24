
package Nhom.VI.MoneyCare.config;

import Nhom.VI.MoneyCare.entity.AccountType;
import Nhom.VI.MoneyCare.entity.Category;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.entity.Role;
import Nhom.VI.MoneyCare.repository.AccountTypeRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final CategoryRepository categoryRepository;

    public DataInitializer(RoleRepository roleRepository, AccountTypeRepository accountTypeRepository,
                           CategoryRepository categoryRepository) {
        this.roleRepository = roleRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {

        // Ensure baseline authorization and lookup data exist.
        roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("USER");
                    newRole.setDescription("Nguoi dung thong thuong");
                    return roleRepository.save(newRole);
                });

        accountTypeRepository
                .findByName("TIEN_MAT")
                .orElseGet(() -> {
                    AccountType newType = new AccountType();
                    newType.setName("TIEN_MAT");
                    newType.setDescription("Tai khoan tien mat");
                    return accountTypeRepository.save(newType);
                });

        if (categoryRepository.findByUserId(null).isEmpty()) {
            categoryRepository.save(new Category(null, null, "Luong", CategoryType.INCOME, "money", "green"));
            categoryRepository.save(new Category(null, null, "An uong", CategoryType.EXPENSE, "food", "red"));
        }
    }
}
