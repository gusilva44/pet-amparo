import { useEffect, useState } from "react";
import { clientesApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";
import Aside from "../aside/aside";

export default function Clientes() {
  const [carregando, setCarregando] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      try {
        // A rota administrativa retorna a lista na propriedade resultado.
        const resposta = await clientesApi.listar();
        if (ativo) setClientes(resposta.resultado || []);
      } catch (error) {
        if (ativo) setMensagem(mensagemErroApi(error));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarClientes();
    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return <p>Carregando clientes...</p>;
  }

  return (

    <div className="content">
        <Aside />
        <main className="clientes-page">
          <h1>Clientes</h1>
          {mensagem && <p role="alert">{mensagem}</p>}
          {!mensagem && clientes.length === 0 && <p>Nenhum cliente encontrado.</p>}
          <ul>
            {clientes.map((cliente) => (
              <li className="cliente" key={cliente.id_cliente}>
                <strong>{cliente.nome}</strong>
                <span>{cliente.email}</span>
              </li>
            ))}
          </ul>
        </main>
    </div>
  );
}