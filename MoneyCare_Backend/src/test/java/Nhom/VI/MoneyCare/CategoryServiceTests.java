package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import Nhom.VI.MoneyCare.entity.Category;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.BudgetDetailRepository;
import Nhom.VI.MoneyCare.repository.BudgetRepository;
import Nhom.VI.MoneyCare.repository.CategoryRepository;
import Nhom.VI.MoneyCare.repository.RecurringTransactionRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.service.Impl.CategoryServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTests {
    @Mock private CategoryRepository categoryRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private TransactionRepository transactionRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private BudgetDetailRepository budgetDetailRepository;
    @Mock private RecurringTransactionRepository recurringTransactionRepository;

    private CategoryServiceImpl categoryService;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryServiceImpl(
                categoryRepository,
                currentUserService,
                transactionRepository,
                budgetRepository,
                budgetDetailRepository,
                recurringTransactionRepository);
    }

    @Test
    void rejectsDuplicateNameForSameOwnerAndTypeIgnoringCase() {
        Category existing = category("Lương", CategoryType.INCOME, 5L);
        Category request = category("  lƯƠNG  ", CategoryType.INCOME, null);
        when(currentUserService.getUserId()).thenReturn(5L);
        when(categoryRepository.findByUserId(5L)).thenReturn(List.of(existing));

        assertThrows(BadRequestException.class, () -> categoryService.createCategory(request));

        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void allowsSameNameForDifferentCategoryType() {
        Category existing = category("Lương", CategoryType.INCOME, 5L);
        Category request = category("Lương", CategoryType.EXPENSE, null);
        when(currentUserService.getUserId()).thenReturn(5L);
        when(categoryRepository.findByUserId(5L)).thenReturn(List.of(existing));
        when(categoryRepository.save(request)).thenReturn(request);

        Category created = categoryService.createCategory(request);

        assertEquals(CategoryType.EXPENSE, created.getType());
        assertEquals(5L, created.getUserId());
    }

    @Test
    void deactivatesCategoryInsteadOfDeletingWhenItIsUsedByTransactions() {
        Category existing = category("Ăn uống", CategoryType.EXPENSE, 5L);
        existing.setId(8L);
        when(currentUserService.isAdmin()).thenReturn(true);
        when(categoryRepository.findById(8L)).thenReturn(Optional.of(existing));
        when(transactionRepository.existsByCategoryId(8L)).thenReturn(true);

        boolean deactivated = categoryService.deleteCategory(8L);

        assertTrue(deactivated);
        assertEquals("INACTIVE", existing.getStatus());
        verify(categoryRepository).save(existing);
        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void deletesCategoryWhenItHasNoReferences() {
        Category existing = category("Đi lại", CategoryType.EXPENSE, 5L);
        existing.setId(9L);
        when(currentUserService.isAdmin()).thenReturn(true);
        when(categoryRepository.findById(9L)).thenReturn(Optional.of(existing));

        boolean deactivated = categoryService.deleteCategory(9L);

        assertEquals(false, deactivated);
        verify(categoryRepository).delete(existing);
    }

    private Category category(String name, CategoryType type, Long userId) {
        Category category = new Category();
        category.setCategoryName(name);
        category.setType(type);
        category.setUserId(userId);
        category.setStatus("ACTIVE");
        return category;
    }
}
