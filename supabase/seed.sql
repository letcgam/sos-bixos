INSERT INTO public.universidade (nome)
VALUES ('Fatec');

INSERT INTO public.campi (universidade_id, nome, cidade, estado, "endereço")
SELECT id, 'Fatec Campinas', 'Campinas', 'SP', 'Av. Cônego Antônio Roccato, 593 - Jardim Santa Monica, Campinas - SP, 13082-015'
FROM public.universidade
WHERE nome = 'Fatec';

INSERT INTO public.curso (camp_id, nome, sigla, descricao)
SELECT campi.id, cursos.nome, cursos.sigla, cursos.descricao
FROM public.campi AS campi
CROSS JOIN (VALUES
	('Análise e Desenvolvimento de Sistemas', 'ADS', 'Desenvolvimento de software, engenharia de sistemas e soluções tecnológicas inovadoras para o mercado global.'),
	('Gestão Empresarial', 'GE', 'Foco em estratégia, processos, pessoas e tomada de decisão para liderança em organizações modernas.'),
	('Gestão de Energia', 'GEEE', 'Especialização em eficiência energética, sustentabilidade e viabilidade técnica para o setor de energia.'),
	('Gestão da T.I.', 'GTI', 'Governança, infraestrutura e soluções digitais integradas ao negócio e à transformação tecnológica.'),
	('Processos Químicos', 'PQ', 'Otimização industrial, controle de qualidade e sustentabilidade aplicados à tecnologia química industrial.'),
	('Logística', 'LOG', 'Gestão estratégica de cadeias de suprimentos, transporte, armazenagem e operações globais.')
) AS cursos(nome, sigla, descricao)
WHERE campi.nome = 'Fatec Campinas';

-- 1. Certifique-se de que a extensão para criptografia de senha está ativa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Defina os UUIDs estáticos para que as referências fiquem fixas no seed
DO $$
DECLARE
    user_admin_id UUID := 'a1111111-1111-1111-1111-111111111111';
    user_calouro_id UUID := 'b2222222-2222-2222-2222-222222222222';
    user_veterano_id UUID := 'c3333333-3333-3333-3333-333333333333';
BEGIN

    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token )
    VALUES
    ('00000000-0000-0000-0000-000000000000', user_admin_id,     'authenticated', 'authenticated', 'admin@email.com',    extensions.crypt('123456', extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"], "role": "admin"}', '{"nome": "Administrador"}'::jsonb, NOW(), NOW(), '', '', '', '' ),
    ('00000000-0000-0000-0000-000000000000', user_calouro_id,   'authenticated', 'authenticated', 'calouro@email.com',  extensions.crypt('123456', extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}',                  '{"nome": "Calouro"}'::jsonb,       NOW(), NOW(), '', '', '', '' ),
    ('00000000-0000-0000-0000-000000000000', user_veterano_id,  'authenticated', 'authenticated', 'veterano@email.com', extensions.crypt('123456', extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}',                  '{"nome": "Veterano"}'::jsonb,      NOW(), NOW(), '', '', '', '' );

    -- IMPORTANTE: Você também precisa inserir o ID gerado na tabela auth.identities
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    SELECT gen_random_uuid(), users.id::text, id, format('{"sub":"%s","email":"%s"}', id, email)::jsonb, 'email', NOW(), NOW(), NOW()
    FROM auth.users;

    -- C. Inserir os perfis correspondentes na tabela public.profiles
    INSERT INTO public.perfil (id, nome, funcao, campi_id, curso_id, ano_ingresso)
    VALUES 
        (user_admin_id,    'Admin',    'administrador'::public.papel_pessoa, 1, 1, 2026),
        (user_calouro_id,  'Calouro',  'aluno'::public.papel_pessoa,         1, 2, 2026),
        (user_veterano_id, 'Veterano', 'aluno'::public.papel_pessoa,         1, 3, 2026);

END $$;