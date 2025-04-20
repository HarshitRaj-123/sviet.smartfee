export class CRDT {
  constructor(id) {
    this.id = id
    this.clock = new Map()
    this.value = null
  }

  update(value, replicaId) {
    const timestamp = this.getClock(replicaId) + 1
    this.setClock(replicaId, timestamp)
    
    if (!this.value || this.value.timestamp < timestamp) {
      this.value = { value, timestamp, replicaId }
    }
    return this
  }

  merge(other) {
    // Merge vector clocks
    for (const [rid, time] of other.clock) {
      this.setClock(rid, Math.max(this.getClock(rid), time))
    }

    // Merge values based on timestamp
    if (other.value && (!this.value || other.value.timestamp > this.value.timestamp)) {
      this.value = other.value
    }
    return this
  }

  getClock(replicaId) {
    return this.clock.get(replicaId) || 0
  }

  setClock(replicaId, time) {
    this.clock.set(replicaId, time)
  }
}