import { useEffect, useState } from "react";
import { clientesApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";
import Aside from "../aside/aside";

import "./clientes.scss"

export default function Clientes() {
  const [carregando, setCarregando] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      try {
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
          <header>
            <div className="info_user">
              <i class="fa-solid fa-user-group"></i>
              <div className="titulo">
                <h1>Usuários</h1>
                <p>Gerencie as contas cadastradas no sistema e seus respectivos perfis.</p>

              </div>
              
              
            
            </div>
          </header>
          <div className="sub">
            <div className="clientescad">
              <i class="fa-solid fa-user-group"></i> 
              <h1>Usuários</h1>
              
            </div>
          </div>
          <div className="pesquisa">

          </div>
          <div className="usuarios">

          </div>
        </main>
    </div>
  );
}