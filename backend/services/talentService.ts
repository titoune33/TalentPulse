import Talent from '../models/Talent';

class TalentService {
  async createTalent(data: {
    name: string;
    email: string;
    skills: string[];
    level: number;
  }) {
    const talent = new Talent({
      ...data,
      status: 'active',
    });
    await talent.save();
    return talent;
  }

  async getAllTalents() {
    return Talent.find().sort({ createdAt: -1 });
  }

  async getTalentById(id: string) {
    return Talent.findById(id);
  }

  async updateTalent(id: string, data: Partial<{
    name: string;
    email: string;
    skills: string[];
    level: number;
    status: string;
  }>) {
    return Talent.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTalent(id: string) {
    return Talent.findByIdAndDelete(id);
  }

  async searchTalents(query: string) {
    return Talent.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } },
      ],
    });
  }
}

export default new TalentService();
