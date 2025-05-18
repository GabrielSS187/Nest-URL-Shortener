export class AccessLogEntity {
  constructor(
    public id: number,
    public urlId: number,
    public accessedAt: Date,
  ) {}
}
