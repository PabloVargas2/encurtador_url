// Armazenamento em memória. Os dados se perdem quando a aplicação reinicia.
//
// Os métodos são assíncronos de propósito: assim, trocar este arquivo por um
// armazenamento com banco de dados (PostgreSQL, DynamoDB etc.) não exige
// mudanças no restante do código.
function createMemoryStore() {
  const links = new Map();

  return {
    async get(code) {
      return links.get(code) || null;
    },

    async has(code) {
      return links.has(code);
    },

    async save(link) {
      links.set(link.code, { ...link });
      return { ...link };
    },

    async incrementClicks(code) {
      const link = links.get(code);
      if (!link) return null;
      link.clicks += 1;
      return { ...link };
    },
  };
}

module.exports = { createMemoryStore };
