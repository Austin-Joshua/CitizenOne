const { JsonCollectionRepository } = require('./JsonCollectionRepository');

class ServiceRequestRepository extends JsonCollectionRepository {
  constructor() {
    super('serviceRequests');
  }

  async findById(id) {
    const rows = await this.findAll();
    return rows.find((r) => r.id === id) || null;
  }

  async replaceById(id, nextRow) {
    const rows = await this.findAll();
    const idx = rows.findIndex((r) => r.id === id);
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
}

module.exports = { ServiceRequestRepository };
