package Nhom.VI.MoneyCare.service.Impl;

// import thư viện
import Nhom.VI.MoneyCare.entity.Category;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CurrentUserService currentUserService) {
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
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
    public Category createCategory(Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().isBlank()) {
            throw new BadRequestException("Ten danh muc khong duoc de trong");
        }
        if (category.getUserId() == null || !currentUserService.isAdmin()) {
            category.setUserId(currentUserService.getUserId());
        }
        validateParentCategory(category.getParentCategoryId(), null);
        if (category.getType() == null || category.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            throw new BadRequestException("Danh muc chi duoc co loai THU hoac CHI");
        }
        category.setId(null);
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category newData) {
        Category existing = getOwnedCategoryById(id);
        existing.setCategoryName(newData.getCategoryName());
        if (newData.getType() == null || newData.getType() == Nhom.VI.MoneyCare.entity.CategoryType.CHUYEN_TIEN) {
            throw new BadRequestException("Danh muc chi duoc co loai THU hoac CHI");
        }
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
    public void deleteCategory(Long id) {
        Category existing = getOwnedCategoryById(id);
        categoryRepository.delete(existing);
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
