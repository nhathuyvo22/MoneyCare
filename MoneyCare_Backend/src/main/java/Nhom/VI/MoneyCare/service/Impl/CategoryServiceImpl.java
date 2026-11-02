package Nhom.VI.MoneyCare.service.Impl;

// import thư viện
import Nhom.VI.MoneyCare.entity.Category;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.BudgetDetailRepository;
import Nhom.VI.MoneyCare.repository.BudgetRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.RecurringTransactionRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final BudgetDetailRepository budgetDetailRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CurrentUserService currentUserService,
                               TransactionRepository transactionRepository, BudgetRepository budgetRepository,
                               BudgetDetailRepository budgetDetailRepository,
                               RecurringTransactionRepository recurringTransactionRepository) {
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.budgetDetailRepository = budgetDetailRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        if (currentUserService.isAdmin()) {
            return categoryRepository.findAll();
        }
        Long userId = currentUserService.getUserId();
        List<Category> categories = new java.util.ArrayList<>(categoryRepository.findByUserId(null));
        categories.addAll(categoryRepository.findByUserId(userId));
        return categories;
    }

    @Override
    public Category getCategoryById(Long id) {
        if (currentUserService.isAdmin()) {
            return categoryRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Khong tim thay Category"));
        }
        Long userId = currentUserService.getUserId();
        return categoryRepository.findById(id)
                .filter(category -> category.getUserId() == null || category.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Khong tim thay Category"));
    }

    @Override
    @Transactional
    public Category createCategory(Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().isBlank()) {
            throw new BadRequestException("Ten danh muc khong duoc de trong");
        }
        category.setCategoryName(category.getCategoryName().trim());
        if (category.getUserId() == null || !currentUserService.isAdmin()) {
            category.setUserId(currentUserService.getUserId());
        }
        if (category.getType() == null || category.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            throw new BadRequestException("Danh muc chi duoc co loai THU hoac CHI");
        }
        ensureUniqueName(category.getCategoryName(), category.getType(), category.getUserId(), null);
        validateParentCategory(category.getParentCategoryId(), null);
        category.setId(null);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(Long id, Category newData) {
        Category existing = getOwnedCategoryById(id);
        if (newData.getCategoryName() == null || newData.getCategoryName().isBlank()) {
            throw new BadRequestException("Ten danh muc khong duoc de trong");
        }
        if (newData.getType() == null || newData.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            throw new BadRequestException("Danh muc chi duoc co loai THU hoac CHI");
        }
        String categoryName = newData.getCategoryName().trim();
        ensureUniqueName(categoryName, newData.getType(), existing.getUserId(), id);
        existing.setCategoryName(categoryName);
        existing.setType(newData.getType());
        existing.setIcon(newData.getIcon());
        existing.setColor(newData.getColor());
        existing.setParentCategoryId(newData.getParentCategoryId());
        validateParentCategory(newData.getParentCategoryId(), id);
        existing.setDescription(newData.getDescription());
        if (newData.getStatus() != null) existing.setStatus(newData.getStatus());
        return categoryRepository.save(existing);
    }

    @Override
    @Transactional
    public boolean deleteCategory(Long id) {
        Category existing = getOwnedCategoryById(id);
        if (isReferenced(existing.getId())) {
            existing.setStatus("INACTIVE");
            categoryRepository.save(existing);
            return true;
        }
        categoryRepository.delete(existing);
        return false;
    }

    private void ensureUniqueName(String name, CategoryType type, Long userId, Long ignoredCategoryId) {
        boolean duplicate = categoryRepository.findByUserId(userId).stream()
                .anyMatch(existing -> (ignoredCategoryId == null || !Objects.equals(existing.getId(), ignoredCategoryId))
                        && existing.getType() == type
                        && existing.getCategoryName() != null
                        && existing.getCategoryName().trim().equalsIgnoreCase(name));
        if (duplicate) {
            throw new BadRequestException("Danh muc \"" + name + "\" da ton tai cho loai nay");
        }
    }

    private boolean isReferenced(Long categoryId) {
        return transactionRepository.existsByCategoryId(categoryId)
                || budgetRepository.existsByCategoryId(categoryId)
                || budgetDetailRepository.existsByCategoryId(categoryId)
                || recurringTransactionRepository.existsByCategoryId(categoryId)
                || categoryRepository.existsByParentCategoryId(categoryId);
    }

    private Category getOwnedCategoryById(Long id) {
        if (currentUserService.isAdmin()) {
            return categoryRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay Category"));
        }
        return categoryRepository.findByIdAndUserId(id, currentUserService.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay Category"));
    }

    private void validateParentCategory(Long parentCategoryId, Long categoryId) {
        if (parentCategoryId != null && parentCategoryId.equals(categoryId)) {
            throw new BadRequestException("Danh muc cha khong hop le");
        }
        if (parentCategoryId != null) {
            getCategoryById(parentCategoryId);
        }
    }
}
