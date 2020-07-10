export class <%= classify(name) %>Config {
  server = 'http://localhost:<%= serverPort %>/';
  api = `${this.server}<%= api %>/`;
}
