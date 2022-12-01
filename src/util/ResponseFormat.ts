export interface ResponseResult<D> {
  data: D;
  status: number;
  message: string;
}

export class ResponseFormat {
  static create<D>({
    data,
    status,
    message,
  }: ResponseResult<D>): ResponseResult<D> {
    return {
      status,
      data,
      message,
    };
  }

  static success<D>(data: D, message = 'success') {
    return ResponseFormat.create({
      data,
      message,
      status: 200,
    });
  }

  static error(message = '服务有误', status = 500) {
    return ResponseFormat.create({
      data: '',
      message,
      status,
    });
  }
}
