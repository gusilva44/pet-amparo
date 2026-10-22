import "./cadastroPet.scss";
import { useState } from "react";
import { animaisApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";

const dadosIniciais = {
  nome: "",
  especie: "",
  raca: "",
  rga: "",
  idade: "",
  sexo: "",
  porte: "",
  foto: "",
  e_vacinado: false,
};

export default function CadastroPet({ onSaved }) {
  const [dados, setDados] = useState(dadosIniciais);
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await animaisApi.cadastrar({
        ...dados,
        idade: Number(dados.idade),
        foto: dados.foto || null,
      });
      setDados(dadosIniciais);
      setMensagem("Pet cadastrado com sucesso!");
      await onSaved?.();
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <details className="cadastro-pet">
      <summary>+ Adicionar um novo pet</summary>
      <form className="form-cadastro-pet" onSubmit={salvar}>
        <label>
          Nome do pet
          <input
            required
            value={dados.nome}
            onChange={(event) => atualizar("nome", event.target.value)}
          />
        </label>
        <label>
          Espécie
          <input
            required
            placeholder="Ex.: cão ou gato"
            value={dados.especie}
            onChange={(event) => atualizar("especie", event.target.value)}
          />
        </label>
        <label>
          Raça
          <input
            required
            value={dados.raca}
            onChange={(event) => atualizar("raca", event.target.value)}
          />
        </label>
        <label>
          RGA
          <input
            required
            value={dados.rga}
            onChange={(event) => atualizar("rga", event.target.value)}
          />
        </label>
        <label>
          Idade
          <input
            type="number"
            min="0"
            max="30"
            step="1"
            required
            value={dados.idade}
            onChange={(event) => atualizar("idade", event.target.value)}
          />
        </label>
        <label>
          Sexo
          <select
            required
            value={dados.sexo}
            onChange={(event) => atualizar("sexo", event.target.value)}
          >
            <option value="">Selecione</option>
            <option value="F">Fêmea</option>
            <option value="M">Macho</option>
          </select>
        </label>
        <label>
          Porte
          <select
            required
            value={dados.porte}
            onChange={(event) => atualizar("porte", event.target.value)}
          >
            <option value="">Selecione</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
            <option value="nao_informado">Não informado</option>
          </select>
        </label>
        <label>
          Foto (URL, opcional)
          <input
            type="url"
            value={dados.foto}
            onChange={(event) => atualizar("foto", event.target.value)}
          />
        </label>
        <label className="pet-vacinado">
          <input
            type="checkbox"
            checked={dados.e_vacinado}
            onChange={(event) => atualizar("e_vacinado", event.target.checked)}
          />{" "}
          Pet vacinado
        </label>
        {mensagem && (
          <p className="mensagem-pet" role="status">
            {mensagem}
          </p>
        )}
        <button type="submit" className="botao-principal" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar pet"}
        </button>
      </form>
    </details>
  );
}
