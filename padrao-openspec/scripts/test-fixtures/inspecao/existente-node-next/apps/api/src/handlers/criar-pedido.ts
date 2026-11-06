export async function criarPedido(dados: { cliente: string }) {
  return { status: 'criado', cliente: dados.cliente };
}
