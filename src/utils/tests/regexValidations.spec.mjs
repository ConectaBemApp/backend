import testEmail from "../testEmailSyntax.mjs";

describe('validarEmail', () => {
  it('deve retornar true para um email válido', () => {
    expect(testEmail('teste@exemplo.com')).toBe(true);
  });

  it('deve retornar false para um email sem "@"', () => {
    expect(testEmail('testeexemplo.com')).toBe(false);
  });

  it('deve retornar false para um email sem domínio', () => {
    expect(testEmail('teste@')).toBe(false);
  });

  it('deve retornar false para um email com espaços', () => {
    expect(testEmail('teste @exemplo.com')).toBe(false);
  });

  it('deve retornar false para um email sem TLD', () => {
    expect(testEmail('teste@exemplo')).toBe(false);
  });

  it('deve retornar false para um email com múltiplos "@"', () => {
    expect(testEmail('teste@@exemplo.com')).toBe(false);
  });
});
