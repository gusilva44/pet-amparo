CREATE DATABASE IF NOT EXISTS pet_amparo;

USE pet_amparo;

-- =====================================================
-- 1. USUARIOS
-- Autenticação e controle de acesso
-- =====================================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,

    tipo ENUM(
        'cliente',
        'veterinario',
        'admin'
    ) NOT NULL DEFAULT 'cliente',

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. CLIENTES
-- Dados pessoais dos usuários que utilizam o sistema
-- =========================================================

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,

    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(30) NOT NULL UNIQUE,
    cpf VARCHAR(20) NOT NULL UNIQUE,
    endereco VARCHAR(255) NOT NULL,
    
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =====================================================
-- 3. VETERINARIOS
-- =====================================================

CREATE TABLE veterinarios (
    id_veterinario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,

    nome VARCHAR(150) NOT NULL,
    crmv VARCHAR(30) NOT NULL UNIQUE,
    especialidade VARCHAR(150),
    telefone VARCHAR(30),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_veterinario_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =====================================================
-- 4. UNIDADES
-- =====================================================

CREATE TABLE unidades (
    id_unidade INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(255),

    cep VARCHAR(9),
    endereco VARCHAR(150) NOT NULL,
    numero VARCHAR(10),
    complemento TEXT,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL DEFAULT 'SP',

    telefone VARCHAR(30),
    email VARCHAR(150),

    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================================
-- 5. SERVIÇOS
-- Cada serviço possui uma duração
-- =========================================================

CREATE TABLE servicos (
    id_servico INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    duracao_minutos INT NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_duracao_servico
        CHECK (duracao_minutos > 0)
);


-- =====================================================
-- 6. UNIDADES_SERVICOS
-- Serviços disponíveis em cada unidade
-- =====================================================

CREATE TABLE unidades_servicos (
    id_unidade INT NOT NULL,
    id_servico INT NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id_unidade, id_servico),

    CONSTRAINT fk_unidade_servico_unidade
        FOREIGN KEY (id_unidade)
        REFERENCES unidades(id_unidade)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_unidade_servico_servico
        FOREIGN KEY (id_servico)
        REFERENCES servicos(id_servico)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- =====================================================
-- 7. VETERINARIOS_UNIDADES
-- Permite que um veterinário trabalhe em várias unidades
-- =====================================================

CREATE TABLE veterinarios_unidades (
    id_veterinario INT NOT NULL,
    id_unidade INT NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_veterinario, id_unidade),

    CONSTRAINT fk_vet_unidade_veterinario
        FOREIGN KEY (id_veterinario)
        REFERENCES veterinarios(id_veterinario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_vet_unidade_unidade
        FOREIGN KEY (id_unidade)
        REFERENCES unidades(id_unidade)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- =====================================================
-- 8. HORARIOS_VETERINARIOS
--
-- dia_semana:
-- 1 = Segunda-feira
-- 2 = Terça-feira
-- 3 = Quarta-feira
-- 4 = Quinta-feira
-- 5 = Sexta-feira
-- 6 = Sábado
-- 7 = Domingo
-- =====================================================

CREATE TABLE horarios_veterinarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,

    id_veterinario INT NOT NULL,
    id_unidade INT NOT NULL,

    dia_semana TINYINT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_horario_veterinario_unidade
        FOREIGN KEY (id_veterinario, id_unidade)
        REFERENCES veterinarios_unidades(
            id_veterinario,
            id_unidade
        )
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_horario_dia
        CHECK (dia_semana BETWEEN 1 AND 7),

    CONSTRAINT chk_horario_intervalo
        CHECK (hora_inicio < hora_fim)
);

CREATE INDEX idx_horarios_unidade_dia
    ON horarios_veterinarios (
        id_unidade,
        dia_semana,
        hora_inicio
    );


-- =====================================================
-- 9. ANIMAIS
-- Cada animal pertence a um cliente
-- =====================================================

CREATE TABLE animais (
    id_animal INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    especie VARCHAR(100) NOT NULL,
    raca VARCHAR(150),
    rga VARCHAR(30) UNIQUE,
    idade int,
    sexo ENUM(
        'M',
        'F',
        'desconhecido'
    ) NOT NULL DEFAULT 'desconhecido',
    porte ENUM(
        'pequeno',
        'medio',
        'grande',
        'nao_informado'
    ) NOT NULL DEFAULT 'nao_informado',
    foto VARCHAR(255),
    e_vacinado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_animal_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT uq_animal_cliente
        UNIQUE (id_animal, id_cliente)
);

-- =====================================================
-- 10. AGENDAMENTOS
-- =====================================================

CREATE TABLE agendamentos (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY,

    id_cliente INT NOT NULL,
    id_animal INT NOT NULL,
    id_veterinario INT NOT NULL,
    id_unidade INT NOT NULL,
    id_servico INT NOT NULL,

    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,

    status ENUM(
        'agendado',
        'confirmado',
        'em_atendimento',
        'concluido',
        'cancelado'
    ) NOT NULL DEFAULT 'agendado',

    observacao VARCHAR(500),

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_agendamento_animal_cliente
        FOREIGN KEY (id_animal, id_cliente)
        REFERENCES animais(id_animal, id_cliente)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_agendamento_veterinario_unidade
        FOREIGN KEY (id_veterinario, id_unidade)
        REFERENCES veterinarios_unidades(
            id_veterinario,
            id_unidade
        )
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_agendamento_unidade_servico
        FOREIGN KEY (id_unidade, id_servico)
        REFERENCES unidades_servicos(
            id_unidade,
            id_servico
        )
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_agendamento_intervalo
        CHECK (inicio < fim)
);

CREATE INDEX idx_agendamentos_veterinario_periodo
    ON agendamentos (id_veterinario, inicio, fim);

CREATE INDEX idx_agendamentos_unidade_periodo
    ON agendamentos (id_unidade, inicio, fim);

CREATE INDEX idx_agendamentos_cliente_inicio
    ON agendamentos (id_cliente, inicio);

CREATE INDEX idx_agendamentos_animal
    ON agendamentos (id_animal);

-- =====================================================
-- 11. MEDICAMENTOS
-- =====================================================

CREATE TABLE medicamentos (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(255),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 12. CARTEIRAS_MEDICACAO
-- Registra medicamentos prescritos para os animais
-- =====================================================

CREATE TABLE carteiras_medicacao (
    id_carteira INT AUTO_INCREMENT PRIMARY KEY,

    id_animal INT NOT NULL,
    id_veterinario INT,

    id_medicamento INT NOT NULL,

    dosagem VARCHAR(100) NOT NULL,
    frequencia VARCHAR(100) NOT NULL,

    data_inicio DATE NOT NULL,
    data_fim DATE,

    observacao VARCHAR(500),

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_carteira_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_carteira_veterinario
        FOREIGN KEY (id_veterinario)
        REFERENCES veterinarios(id_veterinario)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_carteira_medicamento
        FOREIGN KEY (id_medicamento)
        REFERENCES medicamentos(id_medicamento)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_carteira_datas
        CHECK (
            data_fim IS NULL
            OR data_fim >= data_inicio
        )
);

CREATE INDEX idx_carteira_animal
    ON carteiras_medicacao (id_animal, data_inicio);

INSERT INTO servicos
(nome, descricao, duracao_minutos)
VALUES
(
    'Consulta veterinária',
    'Consulta clínica geral',
    45
),
(
    'Vacinação',
    'Aplicação de vacina',
    20
),
(
    'Exame de sangue',
    'Coleta de sangue para análise',
    15
),
(
    'Exame de imagem',
    'Exame de imagem veterinário',
    30
),
(
	'Microchipagem',
	'Implementação de chip restreador',
	15
),
(
	'Medicamentos',
	'Receber medicamentos intravenosos',
	45
);

INSERT INTO unidades (
    id_unidade,
    nome,
    descricao,
    cep,
    endereco,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    telefone,
    email,
    latitude,
    longitude,
    ativo,
    criado_em,
    atualizado_em
) VALUES
(
    1,
    'Unidade Leste I — Tatuapé',
    'Atendimento veterinário gratuito para cães e gatos, com consultas clínicas, cirurgias, exames laboratoriais, internação e oito especialidades.',
    'a',
    'Avenida Salim Farah Maluf',
    NULL,
    'Esquina com a Rua Ulisses Cruz, lado par',
    'Tatuapé',
    'São Paulo',
    'SP',
    '(11) 4323-8502',
    NULL,
    NULL,
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    2,
    'Unidade Leste II — Cão Caramelo',
    'Atendimento veterinário gratuito para cães e gatos, com consultas clínicas, cirurgias, exames laboratoriais, internação e oito especialidades, incluindo cardiologia, neurologia',
    NULL,
    'Avenida Nordestina',
    '225',
    'Esquina com Rua Daniel Bernardo, 107',
    'São Miguel Paulista',
    'São Paulo',
    'SP',
    '(11) 2030-3720',
    NULL,
    NULL,
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    3,
    'Unidade Sul — Jurubatuba',
    'Atendimento veterinário gratuito, com consultas clínicas, cirurgias, exames laboratoriais, internação e oito especialidades veterinárias.',
    NULL,
    'Rua Agostino Togneri',
    '153',
    NULL,
    'Jurubatuba',
    'São Paulo',
    'SP',
    '3396-6100',
    NULL,
    NULL,
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    4,
    'Unidade Norte — Casa Verde',
    'Atendimento veterinário gratuito para cães e gatos, com consultas clínicas, cirurgias, exames laboratoriais, internação e oito especialidades',
    NULL,
    'Rua Atílio Piffer',
    '687',
    NULL,
    'Casa Verde',
    'São Paulo',
    'SP',
    '(11) 3787-1960',
    NULL,
    NULL,
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    5,
    'Unidade Oeste — Butantã',
    'Atendimento veterinário gratuito, com consultas clínicas, cirurgias, exames laboratoriais, internação e oito especialidades. Atende urgências e emergências durante o funcionamento.',
    NULL,
    'Avenida Professor Orlando Marques de Paiva',
    '87',
    'Dentro da USP',
    'Butantã',
    'São Paulo',
    'SP',
    '(11) 97031-2672',
    NULL,
    NULL,
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);