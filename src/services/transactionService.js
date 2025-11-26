import mockRepository from '../repositories/mockRepository';

class TransactionService {
  async getAll() {
    const transactions = await mockRepository.findAll('transactions');
    return transactions.map(txn => mockRepository.enrichWithTransactionType(txn));
  }

  async getById(id) {
    const transaction = await mockRepository.findById('transactions', id);
    return transaction ? mockRepository.enrichWithTransactionType(transaction) : null;
  }

  async create(data, userId) {
    const transactionData = {
      user_id: userId,
      transaction_types_id: data.transactionTypesid,
      date: data.date,
      description: data.description,
      amount: data.amount,
    };
    const newTransaction = await mockRepository.create('transactions', transactionData);
    return mockRepository.enrichWithTransactionType(newTransaction);
  }

  async update(id, data) {
    const updateData = {
      transaction_types_id: data.transactionTypesid,
      date: data.date,
      description: data.description,
      amount: data.amount,
    };
    const updated = await mockRepository.update('transactions', id, updateData);
    return mockRepository.enrichWithTransactionType(updated);
  }

  async delete(id) {
    return mockRepository.delete('transactions', id);
  }
}

export const transactionService = new TransactionService();
export default transactionService;