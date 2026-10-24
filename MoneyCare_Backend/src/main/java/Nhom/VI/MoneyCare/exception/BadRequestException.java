package Nhom.VI.MoneyCare.exception;

// Exception tự định nghĩa, ném ra khi dữ liệu client gửi lên không hợp lệ
// (ví dụ: tên trống, số tiền âm, FK không tồn tại...)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
