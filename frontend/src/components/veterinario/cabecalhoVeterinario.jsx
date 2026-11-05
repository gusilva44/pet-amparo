export default function CabecalhoVeterinario({ nome, pendentes, total }) {
    const iniciais = String(nome || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
        .join("");

    return (
        <header className="cabecalho-veterinario">
            <div className="identificacao">
                <div className="avatar-veterinario" aria-hidden="true">
                    {iniciais || <i className="fa-solid fa-user-doctor"></i>}
                </div>

                <div>
                    <h1>{nome || "Área do veterinário"}</h1>
                    <p>Acompanhe os atendimentos e a agenda do mês.</p>
                </div>
            </div>

            <div className="numero-atendimentos">
                <strong>{pendentes}</strong>
                <span>
                    {pendentes === 1 ? "atendimento pendente" : "atendimentos pendentes"}
                    {" · "}
                    {total} no total
                </span>
            </div>
        </header>
    );
}
