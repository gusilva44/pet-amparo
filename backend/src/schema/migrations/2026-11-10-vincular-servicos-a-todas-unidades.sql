INSERT INTO unidades_servicos (id_unidade, id_servico, ativo)
SELECT u.id_unidade, s.id_servico, TRUE
FROM unidades AS u
CROSS JOIN servicos AS s
ON DUPLICATE KEY UPDATE ativo = TRUE;
