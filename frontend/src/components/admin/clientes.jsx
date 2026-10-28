import { useEffect, useState } from "react";
import { clientesApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";
import Aside from "../aside/aside";

import "./clientes.scss"

const cards = [
  {
    id: 1,
    titulo: "Clientes",
    valor: 142,
    icone: "fa-solid fa-user",
    cor: "#084A38",
    fundo: "#D3F0E2"
  }, 
  {
    id: 2,
    titulo: "Veterinários",
    valor: 28,
    icone: "fa-solid fa-stethoscope",
    cor: "#084A38",
    fundo: "#D3F0E2"
  }, 
  {
    id: 3,
    titulo: "Administradores",
    valor: 3,
    icone: "fa-solid fa-shield-halved",
    cor: "#FC8C10",
    fundo: "#FEE5C9"
  }, 
  {
    id: 4,
    titulo: "Inativados",
    valor: 5,
    icone: "fa-solid fa-ban",
    cor: "#E53D46",
    fundo: "#FED9DA"
  }
]

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
            {cards.map((card, key) => (
              <div className="card" key={key}>
                <div className="ico"><i style={{ color: `${card.cor}`, backgroundColor: `${card.fundo}`}} className={card.icone}></i></div>
                  <div className="text">
                    <p>{card.titulo}</p>
                    <h2 style={{ color: `${card.cor}`}}>{card.valor}</h2>
                  </div>
              </div>
            ))}
          </div>
          <div className="pesquisa">

          </div>
          <div className="usuarios">

          </div>
        </main>
    </div>
  );
}