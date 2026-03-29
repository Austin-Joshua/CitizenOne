const { JsonCollectionRepository } = require('./JsonCollectionRepository');

class ActivityRepository extends JsonCollectionRepository {
  constructor() {
    super('activities');
  }

  async record(partial) {
    const rows = await this.findAll();
    const entry = {
      ...partial,
      id: partial.id || this.nextId('act', rows),
    };
    rows.unshift(entry);
    await this.saveAll(rows);
    return entry;
  }
}

module.exports = { ActivityRepository };
