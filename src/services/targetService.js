import mockRepository from '../repositories/mockRepository';

class TargetService {
  async getAll() {
    return mockRepository.findAll('targets');
  }

  async getById(id) {
    return mockRepository.findById('targets', id);
  }

  async create(data, userId) {
    const targetData = {
      user_id: userId,
      title: data.title,
      goal: data.goal,
      progress: data.progress || 0,
      status: data.status || 'in_progress',
      date: data.date,
    };
    return mockRepository.create('targets', targetData);
  }

  async update(id, data) {
    const updateData = {
      title: data.title,
      goal: data.goal,
      progress: data.progress,
      status: data.status,
      date: data.date,
    };
    return mockRepository.update('targets', id, updateData);
  }

  async delete(id) {
    return mockRepository.delete('targets', id);
  }
}

export const targetService = new TargetService();
export default targetService;