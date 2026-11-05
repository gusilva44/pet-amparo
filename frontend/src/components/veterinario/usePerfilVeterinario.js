import { useEffect, useState } from "react";
import { authApi } from "../../services/api";

export default function usePerfilVeterinario() {
    const [nome, setNome] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const resposta = await authApi.usuarioAtual();
                const usuario = resposta?.usuario;

                if (ativo) setNome(usuario?.nome || usuario?.email || "");
            } catch {
                if (ativo) setNome("");
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, []);

    return nome;
}
