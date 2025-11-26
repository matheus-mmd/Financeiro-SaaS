import mockRepository from '../repositories/mockRepository';

class ExpenseService {
  async getAll() {
    const expenses = await mockRepository.findAll('expenses');
    return expenses.map(exp => mockRepository.enrichWithCategory(exp));
  }

  async getById(id) {
    const expense = await mockRepository.findById('expenses', id);
    return expense ? mockRepository.enrichWithCategory(expense) : null;
  }

  async create(data, userId) {
    const expenseData = {
      user_id: userId,
      categories_id: data.categoriesId,
      title: data.title,
      amount: data.amount,
      date: data.date,
    };
    const newExpense = await mockRepository.create('expenses', expenseData);
    return mockRepository.enrichWithCategory(newExpense);
  }

  async update(id, data) {
    const updateData = {
      categories_id: data.categoriesId,
      title: data.title,
      amount: data.amount,
      date: data.date,
    };
    const updated = await mockRepository.update('expenses', id, updateData);
    return mockRepository.enrichWithCategory(updated);
  }

  async delete(id) {
    return mockRepository.delete('expenses', id);
  }
}

export const expenseService = new ExpenseService();
export default expenseService;