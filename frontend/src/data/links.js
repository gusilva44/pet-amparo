const links = {
    cliente: [
        {
            id: 1,
            caminho: '/',
            texto: 'Início',
            icone: 'fa-regular fa-house'
        },
        {
            id: 2,
            caminho: '/meuspets',
            texto: 'Meus Pets',
            icone: 'fa-solid fa-paw'
        },
        {
            id: 3,
            caminho: '/agendamentos',
            texto: 'Agendamentos',
            icone: 'fa-regular fa-calendar'
        }
    ],

    admin: [
        {
            id: 1,
            caminho: '/visao',
            texto: 'Visão Geral',
            icone: 'fa-regular fa-house'
        },
        {
            id: 2,
            caminho: '/unidades',
            texto: 'Unidades',
            icone: 'fa-regular fa-building'
        },
        {
            id: 3,
            caminho: '/servicos',
            texto: 'Serviços',
            icone: 'fa-solid fa-stethoscope'
        },
        {
            id: 4,
            caminho: '/veterinarios',
            texto: 'Veterinários',
            icone: 'fa-solid fa-user-doctor'
        },
        {
            id: 5,
            caminho: '/usuarios',
            texto: 'Usuários',
            icone: 'fa-regular fa-user'
        },
        {
            id: 6,
            caminho: '/relatorios',
            texto: 'Relatórios',
            icone: 'fa-solid fa-file-lines'
        }
    ],

    veterinario: [
        {
            id: 1,
            caminho: '/admveterinario',
            texto: 'Atendimentos',
            icone: 'fa-solid fa-clipboard-list'
        },
        {
            id: 2,
            caminho: '/admveterinario?aba=agenda',
            texto: 'Agenda do mês',
            icone: 'fa-regular fa-calendar-days'
        },
        {
            id: 3,
            caminho: '/admveterinario?aba=disponibilidade',
            texto: 'Disponibilidade',
            icone: 'fa-regular fa-clock'
        }
    ]
};

export default links;
