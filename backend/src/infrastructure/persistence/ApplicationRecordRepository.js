const { JsonCollectionRepository } = require('./JsonCollectionRepository');

class ApplicationRecordRepository extends JsonCollectionRepository {
  constructor() {
    super('applications');
  }

  async findById(id) {
    const rows = await this.findAll();
    return rows.find((a) => a.id === id) || null;
  }

  async replaceById(id, nextRow) {
    const rows = await this.findAll();
    const idx = rows.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    rows[idx] = nextRow;
    await this.saveAll(rows);
    return nextRow;
  }

  async prepend(row) {
    const rows = await this.findAll();
    rows.unshift(row);
    await this.saveAll(rows);
    return row;
  }

  async findDuplicateForUser(userId, type, targetId) {
    const rows = await this.findAll();
    return rows.find((a) => a.userId === userId && a.type === type && a.targetId === targetId) || null;
  }
}

module.exports = { ApplicationRecordRepository };
