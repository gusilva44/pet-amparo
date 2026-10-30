import './index.scss';
import { useEffect, useState } from 'react';
import { unidadesApi } from '../../../services/api';
import { unidades } from '../../../data/unidades';

export default function UnidadesRecentes() {
    const [carregando, setCarregando] = useState(true);
    const [error, setError] = useState(false);
    const [dados, setDados] = useState([]);

    useEffect(() => {

        async function buscarUnidades() {
            try {
                const resposta = await unidadesApi.listar();

                const unidades = resposta.resultado || resposta.data?.resultado;

                setDados(unidades);
                setError(false);

            } catch (error) {
                setError(true);
            } finally {
                setCarregando(false);
            }
        }

        buscarUnidades();
    }, []);

    if (error) {
        return (
            <div className="carregando">
                <h1>Erro ao carregar as unidades</h1>
            </div>
        );
    }

    if (carregando) {
        return (
            <div className="carregando">
                <h1>Carregando dados</h1>
            </div>
        );
    }

    return (
        <div className="lista-unidades">

            <div className="coluna">

                {dados.map((u) => (
                    <div className="nome-unidade" key={u.id_unidade}>
                        <img src={unidades.find((item) => item.id === u.id_unidade)?.img} alt="Foto Unidade" />
                    </div>
                ))}
            </div>
            
            <div className="coluna">
                <h4>Nome da unidade</h4>

                {dados.map((u) => (
                    <div className="nome-unidade" key={u.id_unidade}>
                        <span>{u.nome}</span>
                    </div>
                ))}
            </div>

            <div className="coluna">
                <h4>Endereço</h4>

                {dados.map((u) => (
                    <div className="item" key={u.id_unidade}>
                        {u.endereco}, {u.numero || 'S/N'} - {u.bairro}
                    </div>
                ))}
            </div>

            <div className="coluna">
                <h4>Telefone</h4>

                {dados.map((u) => (
                    <div className="item" key={u.id_unidade}>
                        {u.telefone || 'Não informado'}
                    </div>
                ))}
            </div>

            <div className="coluna">
                <h4>Serviços</h4>

                {dados.map((u) => (
                    <div className="item" key={u.id_unidade}>
                        {u.descricao}
                    </div>
                ))}
            </div>

            <div className="coluna">
                <h4>Status</h4>

                {dados.map((u) => (
                    <div className="item" key={u.id_unidade}>
                        {u.ativo ? 'Ativa' : 'Inativa'}
                    </div>
                ))}
            </div>

            <div className="coluna">
                <h4 className="acoes-titulo">Ações</h4>

                {dados.map((u) => (
                    <div className="acoes-unidade" key={u.id_unidade}>

                    </div>
                ))}
            </div>

        </div>
    );
}
