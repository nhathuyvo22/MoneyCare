package Nhom.VI.MoneyCare.entity;

// import thư viện
import java.math.BigDecimal;

// Lớp phụ trợ, KHÔNG có @Entity vì không map trực tiếp với bảng CSDL nào (chỉ là đối tượng
// gói kết quả tính toán để trả về cho client).
// Dùng để gói kết quả tính toán "Đã chi / Còn lại" của một Budget, dựa trên các Transaction liên quan.
public class BudgetSummary {

    private Budget budget;
    private BigDecimal spentAmount;     // Tổng số tiền đã chi trong khoảng start_date - end_date
    private BigDecimal remainingAmount; // amount - spentAmount

    public BudgetSummary(Budget budget, BigDecimal spentAmount) {
        this.budget = budget;
        this.spentAmount = spentAmount;
        this.remainingAmount = budget.getAmount().subtract(spentAmount);
    }

    public Budget getBudget() {
        return budget;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    // Kiểm tra đã chi vượt ngân sách hay chưa
    public boolean isOverBudget() {
        return remainingAmount.signum() < 0;
    }
}
