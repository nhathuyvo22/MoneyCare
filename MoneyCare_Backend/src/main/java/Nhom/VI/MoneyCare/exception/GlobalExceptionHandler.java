package Nhom.VI.MoneyCare.exception;

// import thư viện
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

// @RestControllerAdvice: bắt (xử lý tập trung) các lỗi/ngoại lệ xảy ra ở TẤT CẢ Controller
// trong ứng dụng, tránh phải viết try-catch lặp lại ở từng Controller
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Bắt lỗi khi dữ liệu không hợp lệ (tên trống, số tiền âm, FK không tồn tại...)
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    // Bắt lỗi khi không tìm thấy bản ghi theo id (ResponseStatusException ném từ Service)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        return buildResponse(status, exception.getReason(), request);
    }

    // Bắt lỗi khi JSON gửi lên sai định dạng (thiếu dấu ngoặc, sai kiểu dữ liệu...)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequestBody(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Du lieu gui len khong hop le", request);
    }

    // Bắt lỗi vi phạm ràng buộc CSDL (VD: email bị trùng do cột unique)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        String detail = extractConstraintDetail(exception);
        return buildResponse(HttpStatus.CONFLICT, detail, request);
    }

    /**
     * Phân tích root cause của DataIntegrityViolationException để trả message rõ ràng hơn.
     */
    private String extractConstraintDetail(DataIntegrityViolationException ex) {
        String rootMsg = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : (ex.getMessage() != null ? ex.getMessage() : "");
        String lower = rootMsg.toLowerCase();

        // Trùng giá trị UNIQUE (VD: Duplicate entry 'xxx' for key 'email')
        if (lower.contains("duplicate entry") || lower.contains("unique")) {
            if (lower.contains("email")) return "Email da ton tai trong he thong";
            if (lower.contains("ten_vai_tro")) return "Ten vai tro da ton tai";
            if (lower.contains("ten_loai")) return "Ten loai tai khoan da ton tai";
            if (lower.contains("ten_phuong_thuc")) return "Ten phuong thuc da ton tai";
            // Trả tên key nếu biết
            return "Du lieu bi trung (vi pham rang buoc UNIQUE): " + rootMsg;
        }

        // Vi phạm NOT NULL
        if (lower.contains("cannot be null") || lower.contains("null")) {
            return "Thieu truong bat buoc: " + rootMsg;
        }

        // Vi phạm Foreign Key
        if (lower.contains("foreign key") || lower.contains("fk_") || lower.contains("cannot add or update a child row")) {
            return "Du lieu tham chieu khong hop le (khoa ngoai): " + rootMsg;
        }

        // Vi phạm CHECK constraint
        if (lower.contains("check constraint")) {
            return "Du lieu khong thoa rang buoc kiem tra: " + rootMsg;
        }

        return "Du lieu vi pham rang buoc CSDL: " + rootMsg;
    }

    // Bắt lỗi chung khi không truy cập được CSDL (mất kết nối MySQL...)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(
            DataAccessException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the truy cap duoc du lieu", request);
    }

    // Hàm dùng chung để tạo ra phần thân JSON trả lời lỗi
    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(response);
    }
}
