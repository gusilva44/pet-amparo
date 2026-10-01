-- Active: 1790850489930@@127.0.0.1@3306
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