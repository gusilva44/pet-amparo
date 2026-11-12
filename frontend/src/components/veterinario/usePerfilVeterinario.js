import { useEffect, useState } from "react";
import { veterinariosApi } from "../../services/api";

export default function usePerfilVeterinario() {
    const [nome, setNome] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const resposta = await veterinariosApi.meuPerfil();
                if (ativo) setNome(resposta?.perfil?.nome || "");
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
