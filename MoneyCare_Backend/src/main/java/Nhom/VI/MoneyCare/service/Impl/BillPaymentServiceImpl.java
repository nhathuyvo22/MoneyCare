package Nhom.VI.MoneyCare.service.Impl;

import Nhom.VI.MoneyCare.entity.Account;
import Nhom.VI.MoneyCare.entity.Bill;
import Nhom.VI.MoneyCare.entity.BillPayment;
import Nhom.VI.MoneyCare.entity.CategoryType;
import Nhom.VI.MoneyCare.entity.Transaction;
import Nhom.VI.MoneyCare.exception.BadRequestException;
import Nhom.VI.MoneyCare.repository.AccountRepository;
import Nhom.VI.MoneyCare.repository.BillPaymentRepository;
import Nhom.VI.MoneyCare.repository.BillRepository;
import Nhom.VI.MoneyCare.repository.TransactionRepository;
import Nhom.VI.MoneyCare.security.CurrentUserService;
import Nhom.VI.MoneyCare.security.CrudOwnershipService;
import Nhom.VI.MoneyCare.service.BillPaymentService;
import java.time.LocalDateTime;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BillPaymentServiceImpl extends AbstractCrudService<BillPayment> implements BillPaymentService {
    private final BillPaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public BillPaymentServiceImpl(BillPaymentRepository repository, CurrentUserService currentUserService,
                                  CrudOwnershipService ownershipService, BillRepository billRepository,
                                  AccountRepository accountRepository, TransactionRepository transactionRepository) {
        super(repository, currentUserService, ownershipService);
        this.paymentRepository = repository;
        this.billRepository = billRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    @Transactional
    public BillPayment create(BillPayment payment) {
        if (payment.getBillId() == null || payment.getAccountId() == null) {
            throw new BadRequestException("Can chon hoa don va tai khoan thanh toan");
        }

        Long currentUserId = currentUserService.getUserId();
        Bill bill = billRepository.findById(payment.getBillId())
                .filter(item -> currentUserService.isAdmin() || Objects.equals(item.getUserId(), currentUserId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay hoa don"));
        if ("PAID".equalsIgnoreCase(bill.getStatus())) {
            throw new BadRequestException("Hoa don nay da duoc thanh toan");
        }

        Account account = accountRepository.findById(payment.getAccountId())
                .filter(item -> Objects.equals(item.getUserId(), bill.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tai khoan thanh toan khong ton tai"));
        if (bill.getExpectedAmount() == null || bill.getExpectedAmount().signum() <= 0) {
            throw new BadRequestException("So tien hoa don khong hop le");
        }
        if (account.getBalance().compareTo(bill.getExpectedAmount()) < 0) {
            throw new BadRequestException("So du tai khoan khong du de thanh toan hoa don");
        }

        LocalDateTime paymentDate = payment.getPaymentDate() != null ? payment.getPaymentDate() : LocalDateTime.now();
        Transaction transaction = new Transaction();
        transaction.setAccountId(account.getId());
        transaction.setUserId(bill.getUserId());
        transaction.setType(CategoryType.EXPENSE);
        transaction.setAmount(bill.getExpectedAmount());
        transaction.setTitle("Thanh toan hoa don: " + bill.getName());
        transaction.setDescription(payment.getNote() != null ? payment.getNote() : bill.getDescription());
        transaction.setTransactionDate(paymentDate);
        transaction.setCreatedAt(LocalDateTime.now());
        Transaction savedTransaction = transactionRepository.save(transaction);

        account.adjustBalance(bill.getExpectedAmount().negate());
        accountRepository.save(account);

        bill.setStatus("PAID");
        billRepository.save(bill);

        payment.setId(null);
        payment.setAmount(bill.getExpectedAmount());
        payment.setPaymentDate(paymentDate);
        payment.setTransactionId(savedTransaction.getId());
        return paymentRepository.save(payment);
    }
}
