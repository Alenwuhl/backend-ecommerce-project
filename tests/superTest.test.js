import { expect } from 'chai';
import request from 'supertest';
import app from '../src/server.js';

describe('API Integración Completa - Pruebas Detalladas', () => {

  describe('Usuarios', () => {
    it('Inicio de sesión de usuario', async () => {
      const userCredentials = {
        email: "testuser@example.com",
        password: "password"
      };
      const response = await request(app)
        .post('/api/users/login')
        .send(userCredentials)
        .expect(302);
      
      // Verifica que la redirección ocurra a una ruta específica luego del login
      expect(response.headers.location).to.equal('/products');
    });
  });

  describe('Productos', () => {
    it('Obtener todos los productos', async () => {
      const response = await request(app).get('/api/products').expect(200);
      
      // Verifica que la respuesta sea un array
      expect(response.body).to.be.an('array');
      
      // Verifica que el primer producto tenga una estructura esperada
      if (response.body.length > 0) {
        expect(response.body[0]).to.include.keys(['title', 'price', 'description, stock, code']);
      }
    });
  });

  describe('Carritos', () => {
    it('Listar todos los carritos', async () => {
      const response = await request(app).get('/api/carts').expect(200);
      
      // Verifica que la respuesta sea un array
      expect(response.body).to.be.an('array');
      
      // Verifica que el primer carrito tenga una estructura esperada
      if (response.body.length > 0) {
        expect(response.body[0]).to.include.keys(['products', 'totalPrice']);
        expect(response.body[0].products).to.be.an('array');
      }
    });
  });
});
