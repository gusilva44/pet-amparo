-- Active: 1790850489930@@127.0.0.1@3306
-- BANCO DE DADOS PET-AMPARO
-- =========================================================

CREATE DATABASE IF NOT EXISTS pet_amparo;

USE pet_amparo;


-- =========================================================
-- 1. USUÁRIOS
-- Responsável pela autenticação do sistema
-- =========================================================

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

    endereco VARCHAR(150) NOT NULL,

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


-- =========================================================
-- 3. VETERINÁRIOS
-- Dados dos veterinários do sistema
-- =========================================================

CREATE TABLE veterinarios (
    id_veterinario INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL UNIQUE,

    nome VARCHAR(150) NOT NULL,

    crmv VARCHAR(30) NOT NULL UNIQUE,

    especialidade VARCHAR(150),

    unidade VARCHAR(100) NOT NULL,

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


-- =========================================================
-- 4. ANIMAIS
-- Cada animal pertence a um cliente
-- =========================================================

CREATE TABLE animais (
    id_animal INT AUTO_INCREMENT PRIMARY KEY,

    id_cliente INT NOT NULL,

    nome VARCHAR(150) NOT NULL,

    especie VARCHAR(150) NOT NULL,

    raca VARCHAR(150) NOT NULL,

    rga VARCHAR(20) NOT NULL UNIQUE,

    idade INT NOT NULL,

    sexo ENUM('M', 'F') NOT NULL,

    porte VARCHAR(30) NOT NULL,

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
        ON UPDATE CASCADE
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


-- =========================================================
-- 6. HORÁRIOS DOS VETERINÁRIOS
-- Define quando cada veterinário atende
--
-- dia_semana:
-- 1 = Segunda
-- 2 = Terça
-- 3 = Quarta
-- 4 = Quinta
-- 5 = Sexta
-- 6 = Sábado
-- 7 = Domingo
-- =========================================================

CREATE TABLE horarios_veterinarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,

    id_veterinario INT NOT NULL,

    dia_semana TINYINT NOT NULL,

    hora_inicio TIME NOT NULL,

    hora_fim TIME NOT NULL,

    unidade VARCHAR(100) NOT NULL,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_horario_veterinario
        FOREIGN KEY (id_veterinario)
        REFERENCES veterinarios(id_veterinario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_dia_semana
        CHECK (dia_semana BETWEEN 1 AND 7),

    CONSTRAINT chk_horario
        CHECK (hora_inicio < hora_fim)
);


-- =========================================================
-- 7. AGENDAMENTOS
-- Guarda o intervalo completo do atendimento
-- =========================================================

CREATE TABLE agendamentos (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY,

    id_cliente INT NOT NULL,

    id_animal INT NOT NULL,

    id_veterinario INT NOT NULL,

    id_servico INT NOT NULL,

    unidade VARCHAR(100) NOT NULL,

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

    CONSTRAINT fk_agendamento_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_agendamento_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_agendamento_veterinario
        FOREIGN KEY (id_veterinario)
        REFERENCES veterinarios(id_veterinario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_agendamento_servico
        FOREIGN KEY (id_servico)
        REFERENCES servicos(id_servico)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_intervalo_agendamento
        CHECK (inicio < fim)
);


-- =========================================================
-- 8. MEDICAMENTOS
-- Base para carteira de medicação
-- =========================================================

CREATE TABLE medicamentos (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    descricao VARCHAR(255),

    ativo BOOLEAN NOT NULL DEFAULT TRUE
);


-- =========================================================
-- 9. CARTEIRA DE MEDICAÇÃO
-- Registra medicamentos receitados para cada animal
-- =========================================================

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
        ON UPDATE CASCADE
);

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

INSERT INTO veterinarios
(
    id_usuario,
    nome,
    crmv,
    especialidade,
    unidade,
    telefone
)
VALUES
(
    2,
    'Mariana Oliveira',
    'CRMV-SP-12345',
    'Clínica Geral',
    'Unidade Centro',
    '11999990001'
),
(
    3,
    'Carlos Mendes',
    'CRMV-SP-54321',
    'Cirurgia Veterinária',
    'Unidade Norte',
    '11999990002'
);

