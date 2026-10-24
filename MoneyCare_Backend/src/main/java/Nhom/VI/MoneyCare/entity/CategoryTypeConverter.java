package Nhom.VI.MoneyCare.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CategoryTypeConverter implements AttributeConverter<CategoryType, String> {
    @Override
    public String convertToDatabaseColumn(CategoryType value) {
        if (value == null) return null;
        return switch (value) {
            case INCOME -> "THU";
            case EXPENSE -> "CHI";
            case CHUYEN_TIEN -> "CHUYEN_TIEN";
        };
    }
    @Override
    public CategoryType convertToEntityAttribute(String value) {
        if (value == null) return null;
        return switch (value) {
            case "THU", "INCOME" -> CategoryType.INCOME;
            case "CHI", "EXPENSE" -> CategoryType.EXPENSE;
            case "CHUYEN_TIEN" -> CategoryType.CHUYEN_TIEN;
            default -> throw new IllegalArgumentException("Loai giao dich khong hop le: " + value);
        };
    }
}
