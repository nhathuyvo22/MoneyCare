package Nhom.VI.MoneyCare.exception;

import java.time.LocalDateTime;

// Record dùng để định dạng JSON trả về cho client khi có lỗi xảy ra
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
