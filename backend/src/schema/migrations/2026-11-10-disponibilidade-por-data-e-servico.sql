ALTER TABLE horarios_veterinarios
    ADD COLUMN data_disponivel DATE NULL;

CREATE TABLE horarios_veterinarios_servicos (
    id_horario INT NOT NULL,
    id_servico INT NOT NULL,
    PRIMARY KEY (id_horario, id_servico),
    CONSTRAINT fk_horario_servico_horario FOREIGN KEY (id_horario)
        REFERENCES horarios_veterinarios(id_horario) ON DELETE CASCADE,
    CONSTRAINT fk_horario_servico_servico FOREIGN KEY (id_servico)
        REFERENCES servicos(id_servico) ON DELETE RESTRICT
);

CREATE INDEX idx_horarios_data_unidade_vet
    ON horarios_veterinarios (id_veterinario, id_unidade, data_disponivel);
