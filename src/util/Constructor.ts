export class ObjectConstructor<T extends object> {
  constructor(params?: Partial<T>) {
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}
