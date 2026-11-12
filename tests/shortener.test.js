const { generateCode, isValidUrl, isValidCode, ALPHABET } = require('../src/shortener');

describe('generateCode', () => {
  test('gera código com o tamanho padrão de 6 caracteres', () => {
    expect(generateCode()).toHaveLength(6);
  });

  test('respeita o tamanho informado', () => {
    expect(generateCode(10)).toHaveLength(10);
  });

  test('usa apenas caracteres do alfabeto permitido', () => {
    const code = generateCode(200);
    for (const char of code) {
      expect(ALPHABET).toContain(char);
    }
  });

  test('gera códigos diferentes em chamadas seguidas', () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateCode()));
    expect(codes.size).toBe(1000);
  });
});

describe('isValidUrl', () => {
  test.each([
    'https://exemplo.com',
    'http://exemplo.com/caminho?busca=1#ancora',
    'https://sub.dominio.com.br:8080/a/b',
  ])('aceita %s', (url) => {
    expect(isValidUrl(url)).toBe(true);
  });

  test.each([
    '',
    'exemplo.com',
    'ftp://exemplo.com',
    'javascript:alert(1)',
    'não é url',
    null,
    undefined,
    42,
  ])('rejeita %p', (url) => {
    expect(isValidUrl(url)).toBe(false);
  });

  test('rejeita URL muito longa', () => {
    expect(isValidUrl(`https://exemplo.com/${'a'.repeat(2100)}`)).toBe(false);
  });
});

describe('isValidCode', () => {
  test.each(['abc', 'meu-link', 'Link_2026', 'a'.repeat(32)])('aceita %s', (code) => {
    expect(isValidCode(code)).toBe(true);
  });

  test.each(['ab', 'a'.repeat(33), 'com espaço', 'acentuação', 'a/b', null])('rejeita %p', (code) => {
    expect(isValidCode(code)).toBe(false);
  });

  test.each(['api', 'health', 'API'])('rejeita palavra reservada %s', (code) => {
    expect(isValidCode(code)).toBe(false);
  });
});
