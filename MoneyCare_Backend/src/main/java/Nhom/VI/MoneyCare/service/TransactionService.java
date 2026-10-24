package Nhom.VI.MoneyCare.service;

// import thư viện
import Nhom.VI.MoneyCare.entity.Transaction;

import java.util.List;

public interface TransactionService {

    List<Transaction> getAllTransactions();

    List<Transaction> getTransactionsByUserId(Long userId);

    Transaction getTransactionById(Long id);

    Transaction createTransaction(Transaction transaction);

    Transaction updateTransaction(Long id, Transaction transaction);

    void deleteTransaction(Long id);
}
