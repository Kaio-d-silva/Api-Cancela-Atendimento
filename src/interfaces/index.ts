export interface Controller {
  handle: (httpRequest: HttpRequest) => Promise<HttpResponse>;
}
export interface HttpRequest {
  body: any;
  params: any;
  pathParameters: any;
  queryStringParameters: any;
}
export interface HttpResponse {
  statusCode: number;
  body: any;
}
