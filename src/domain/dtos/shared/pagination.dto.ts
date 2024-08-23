export class PaginationDTO {
  constructor(public page: number, public limit: number) {}

  static create(page: number, limit: number): [string?, PaginationDTO?] {
    if (isNaN(page) || isNaN(limit)) return ["Page and limit must be numbers"];
    if (page <= 0 || limit <= 0)
      return ["Page and limit must be greater than 0"];

    return [undefined, new PaginationDTO(page, limit)];
  }
}
