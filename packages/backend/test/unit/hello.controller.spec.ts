import { HelloController } from '../../src/hello/hello.controller';

describe('HelloController', () => {
  let controller: HelloController;

  beforeEach(() => {
    controller = new HelloController();
  });

  describe('getHello', () => {
    it('should return { message: "Hello world" }', () => {
      expect(controller.getHello()).toEqual({ message: 'Hello world' });
    });
  });
});
