class Storage {
  constructor() {
    this.length = 0;
  }
  getItem(key) {
    return this[key] || null;
  }
  setItem(key, value) {
    if (!this[key]) {
      this.length++;
    }
    this[key] = value.toString();
  }
  removeItem(key) {
    if (this[key]) {
      this.length--;
    }
    delete this[key];
  }
  clear() {
    Object.keys(this).forEach((key) => delete this[key]);
    this.length = 0;
  }
}

export const localStorageMock = Object.create(new Storage());