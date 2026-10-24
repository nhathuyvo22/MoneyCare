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
        return buildResponse(HttpStatus.CONFLICT, "Du lieu vi pham rang buoc (vi du: trung email)", request);
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
