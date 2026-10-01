-- Active: 1790878550305@@127.0.0.1@3306@pet_amparo
create database pet_amparo;
use pet_amparo;

create table clientes (
	id_cliente int auto_increment primary key, 
	nome varchar(150) not null,
    data_nascimento date not null, 
    telefone varchar(30) unique not null,
    cpf varchar(20) unique not null, 
    email varchar(150) unique not null,
	endereco varchar(150) not null
    );

create table animais(
	id_animal int auto_increment primary key, 
	nome varchar (150) not null,
	especie varchar (150) not null, 
	raca varchar (150) not null, 
	rga varchar(20) unique not null, 
	idade int not null, 
	sexo char(1) not null,
	porte varchar (30) not null,
	foto varchar(255) not null, 
	e_vacinado boolean not null, 
	id_cliente int,
	foreign key (id_cliente) references clientes(id_cliente)
	);
    
create table agendamentos(
	id_agendamentos int auto_increment primary key, 
	id_cliente int, 
	id_animal int, 
	servico varchar(100) not null, 
	unidade varchar(50) not null, 
	horario time not null, 
	dia date not null, 

	foreign key (id_cliente) references clientes(id_cliente),
	foreign key (id_animal) references animais(id_animal)
);

INSERT INTO clientes
(nome, data_nascimento, telefone, cpf, email, endereco)
VALUES
('Gustavo Silva', '2008-05-14', '11987654321', '12345678901', 'gustavo@email.com', 'Rua das Flores, 100'),
('Ana Souza', '1995-08-22', '11987654322', '23456789012', 'ana@email.com', 'Rua São Paulo, 250'),
('Carlos Oliveira', '1987-03-10', '11987654323', '34567890123', 'carlos@email.com', 'Avenida Brasil, 500'),
('Mariana Santos', '2001-11-30', '11987654324', '45678901234', 'mariana@email.com', 'Rua das Palmeiras, 80'),
('João Pereira', '1978-06-17', '11987654325', '56789012345', 'joao@email.com', 'Rua do Comércio, 120'),
('Beatriz Lima', '1999-01-25', '11987654326', '67890123456', 'beatriz@email.com', 'Rua das Acácias, 45'),
('Lucas Martins', '1992-09-13', '11987654327', '78901234567', 'lucas@email.com', 'Avenida Central, 900'),
('Fernanda Alves', '1985-12-05', '11987654328', '89012345678', 'fernanda@email.com', 'Rua Bela Vista, 320'),
('Rafael Costa', '1997-04-19', '11987654329', '90123456789', 'rafael@email.com', 'Rua das Orquídeas, 150'),
('Juliana Rocha', '1990-07-28', '11987654330', '01234567890', 'juliana@email.com', 'Avenida Paulista, 700');

INSERT INTO animais
(nome, especie, raca, rga, idade, sexo, porte, foto, e_vacinado, id_cliente)
VALUES
('Thor', 'Cachorro', 'Golden Retriever', 'RGA000001', 5, 'M', 'Grande', 'thor.jpg', true, 1),
('Luna', 'Cachorro', 'Shih-tzu', 'RGA000002', 3, 'F', 'Pequeno', 'luna.jpg', true, 2),
('Mingau', 'Gato', 'Siamês', 'RGA000003', 2, 'M', 'Pequeno', 'mingau.jpg', true, 3),
('Mel', 'Cachorro', 'Poodle', 'RGA000004', 7, 'F', 'Pequeno', 'mel.jpg', false, 4),
('Bob', 'Cachorro', 'Labrador', 'RGA000005', 4, 'M', 'Grande', 'bob.jpg', true, 5),
('Nina', 'Gato', 'Persa', 'RGA000006', 6, 'F', 'Pequeno', 'nina.jpg', true, 6),
('Max', 'Cachorro', 'Pastor Alemão', 'RGA000007', 8, 'M', 'Grande', 'max.jpg', false, 7),
('Amora', 'Cachorro', 'Pinscher', 'RGA000008', 2, 'F', 'Pequeno', 'amora.jpg', true, 8),
('Simba', 'Gato', 'Maine Coon', 'RGA000009', 5, 'M', 'Grande', 'simba.jpg', true, 9),
('Belinha', 'Cachorro', 'Beagle', 'RGA000010', 3, 'F', 'Médio', 'belinha.jpg', false, 10);

INSERT INTO agendamentos
(id_cliente, id_animal, servico, unidade, horario, dia)
VALUES
(1, 1, 'Consulta veterinária', 'Unidade Centro', '08:30:00', '2026-10-05'),
(2, 2, 'Vacinação', 'Unidade Norte', '09:00:00', '2026-10-06'),
(3, 3, 'Consulta veterinária', 'Unidade Sul', '10:30:00', '2026-10-07'),
(4, 4, 'Exame de sangue', 'Unidade Centro', '13:00:00', '2026-10-08'),
(5, 5, 'Consulta veterinária', 'Unidade Leste', '14:30:00', '2026-10-09'),
(6, 6, 'Vacinação', 'Unidade Oeste', '08:00:00', '2026-10-10'),
(7, 7, 'Exame de imagem', 'Unidade Centro', '11:00:00', '2026-10-12'),
(8, 8, 'Consulta veterinária', 'Unidade Norte', '15:00:00', '2026-10-13'),
(9, 9, 'Consulta veterinária', 'Unidade Sul', '09:30:00', '2026-10-14'),
(10, 10, 'Vacinação', 'Unidade Leste', '16:00:00', '2026-10-15');