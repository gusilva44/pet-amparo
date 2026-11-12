import "./cadastroPet.scss";
import { useState } from "react";
import { animaisApi } from "../../services/api";
import { mensagemErroApi } from "../../utils/api";
import { lerImagem } from "../../utils/imagem";

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

export default function CadastroPet({ onSaved, pet, onCancel }) {
  const [dados, setDados] = useState(() => pet ? {
    nome: pet.nome || "", especie: pet.especie || "", raca: pet.raca || "",
    rga: pet.rga || "", idade: String(pet.idade ?? ""), sexo: pet.sexo || "",
    porte: pet.porte || "", foto: pet.foto || "",
    e_vacinado: pet.e_vacinado === true || Number(pet.e_vacinado) === 1,
  } : dadosIniciais);
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroFoto, setErroFoto] = useState("");

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function selecionarFoto(event) {
    setErroFoto("");
    try {
      atualizar("foto", await lerImagem(event.target.files?.[0], 5));
    } catch (error) {
      event.target.value = "";
      setErroFoto(error.message);
    }
  }

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      const dadosPet = {
        ...dados,
        idade: Number(dados.idade),
        foto: dados.foto || null,
      };
      if (pet) await animaisApi.atualizar(pet.id_animal, dadosPet);
      else await animaisApi.cadastrar(dadosPet);
      if (!pet) setDados(dadosIniciais);
      setMensagem(pet ? "Pet atualizado com sucesso!" : "Pet cadastrado com sucesso!");
      await onSaved?.();
    } catch (error) {
      setMensagem(mensagemErroApi(error));
    } finally {
      setSalvando(false);
    }
  }

  function formatarRGA(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 9);

    return numeros
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return (
    <details className="cadastro-pet" open={Boolean(pet)}>
      {!pet && <summary>+ Adicionar um novo pet</summary>}
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
          <select
            required
            value={dados.especie}
            onChange={(event) => atualizar("especie", event.target.value)}
          >
            <option value="">Selecione</option>
            <option value="gato">Gato</option>
            <option value="cão">Cão</option>
          </select>
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
            type="text"
            maxLength={7}
            value={dados.rga}
            onChange={(e) =>
              atualizar("rga", e.target.value)
            }
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
        <label className="pet-foto-campo seletor-imagem">
          Foto do pet (opcional)
          <input className="input-imagem-oculto" type="file" accept="image/png,image/jpeg,image/webp" onChange={selecionarFoto} />
          <span className="botao-escolher-imagem">Escolher imagem</span>
          {erroFoto && <span className="erro-foto" role="alert">{erroFoto}</span>}
        </label>
        {dados.foto && <img className="pet-foto-previa" src={dados.foto} alt="Prévia da foto do pet" />}
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
          {salvando ? "Salvando..." : pet ? "Salvar alterações" : "Salvar pet"}
        </button>
        {pet && <button type="button" className="botao-secundario" onClick={onCancel}>Cancelar</button>}
      </form>
    </details>
  );
}
