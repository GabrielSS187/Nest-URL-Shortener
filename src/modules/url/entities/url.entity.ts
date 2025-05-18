export class UrlEntity {
  constructor(
    public id: number,
    public shortCode: string,
    public destination: string,
    public userId: number | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}
}
